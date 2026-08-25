"use client";

import { useCallback, useRef, useState } from "react";
import { API_BASE } from "./config";

const CONVO_KEY = "jaysdiner_conversation_id";

export const TOOL_LABELS: Record<string, string> = {
  get_full_menu: "Checking the menu",
  check_items_available: "Checking availability",
  check_item_options: "Checking options",
  add_items_to_cart_tool: "Updating cart",
  place_order_tool: "Placing order",
  get_transfer_details_tool: "Fetching payment details",
};

export interface MenuItemData {
  name: string;
  price_ngn: number;
  image_url?: string | null;
}

export interface MatchedItemData {
  requested_name: string;
  matched: boolean;
  matched_name?: string | null;
  price_ngn?: number | null;
  image_url?: string | null;
}

export interface ActivityChip {
  id: string;
  tool: string;
  label: string;
  status: "pending" | "done" | "error";
}

export type TimelineItem =
  | { kind: "user"; id: string; text: string }
  | { kind: "agent"; id: string; text: string; streaming: boolean }
  | { kind: "activity"; id: string; chips: ActivityChip[] }
  | { kind: "products"; id: string; items: MenuItemData[] }
  | { kind: "unmatched"; id: string; names: string[] }
  | { kind: "confirm"; id: string; resolved: boolean }
  | {
      kind: "order_placed";
      id: string;
      orderIdentifier: string;
      totalNgn: number;
      paymentMethod: string;
    }
  | { kind: "order_failed"; id: string; message: string }
  | {
      kind: "transfer_details";
      id: string;
      bankName: string;
      accountNumber: string;
      amountNgn: number;
      reference?: string | null;
      orderId?: string | null;
      paid: boolean;
    };

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `item-${idCounter}-${Date.now()}`;
}

export function useAgentChat(token: string | null, onUnauthorized?: () => void) {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  // True from the moment a message is sent until the first real sign of
  // life comes back (a tool starting, or the reply's first token). Drives
  // the in-chat "thinking" indicator, nothing in the top bar anymore.
  const [awaitingFirstResponse, setAwaitingFirstResponse] = useState(false);
  const conversationIdRef = useRef<string | null>(
    typeof window !== "undefined" ? localStorage.getItem(CONVO_KEY) : null
  );

  const updateLastAgentText = useCallback(
    (updater: (text: string) => string, done = false) => {
      setTimeline((prev) => {
        const copy = [...prev];
        for (let i = copy.length - 1; i >= 0; i--) {
          const item = copy[i];
          if (item.kind === "agent") {
            copy[i] = { ...item, text: updater(item.text), streaming: !done };
            break;
          }
        }
        return copy;
      });
    },
    []
  );

  const resolveConfirmPrompt = useCallback((id: string) => {
    setTimeline((prev) =>
      prev.map((item) =>
        item.kind === "confirm" && item.id === id ? { ...item, resolved: true } : item
      )
    );
  }, []);

  const markTransferPaid = useCallback((id: string) => {
    setTimeline((prev) =>
      prev.map((item) =>
        item.kind === "transfer_details" && item.id === id ? { ...item, paid: true } : item
      )
    );
  }, []);

  const newConversation = useCallback(() => {
    conversationIdRef.current = null;
    localStorage.removeItem(CONVO_KEY);
    setTimeline([]);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setIsStreaming(true);
      setAwaitingFirstResponse(true);
      setTimeline((prev) => [...prev, { kind: "user", id: nextId(), text: trimmed }]);

      let agentStarted = false;
      let activityItemId: string | null = null;
      let pendingConfirmationFlag = false;
      let firstResponseSeen = false;

      const markFirstResponseSeen = () => {
        if (!firstResponseSeen) {
          firstResponseSeen = true;
          setAwaitingFirstResponse(false);
        }
      };

      try {
        const response = await fetch(`${API_BASE}/chat/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            conversation_id: conversationIdRef.current,
            message: trimmed,
          }),
        });

        if (response.status === 401) {
          onUnauthorized?.();
          markFirstResponseSeen();
          setTimeline((prev) => [
            ...prev,
            {
              kind: "agent",
              id: nextId(),
              text: "Your session expired. Please log in again.",
              streaming: false,
            },
          ]);
          return;
        }

        if (!response.body) throw new Error("No response body from API");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            if (!part.startsWith("data: ")) continue;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const event: any = JSON.parse(part.slice(6));

            if (event.type === "start") {
              conversationIdRef.current = event.conversation_id;
              localStorage.setItem(CONVO_KEY, event.conversation_id);
            } else if (event.type === "tool_start") {
              markFirstResponseSeen();
              const label = TOOL_LABELS[event.tool] || event.tool;
              const chipId = nextId();

              if (!activityItemId) {
                activityItemId = nextId();
                const capturedId = activityItemId;
                setTimeline((prev) => [
                  ...prev,
                  {
                    kind: "activity",
                    id: capturedId,
                    chips: [{ id: chipId, tool: event.tool, label, status: "pending" }],
                  },
                ]);
              } else {
                const capturedId = activityItemId;
                setTimeline((prev) =>
                  prev.map((item) =>
                    item.kind === "activity" && item.id === capturedId
                      ? {
                          ...item,
                          chips: [
                            ...item.chips,
                            { id: chipId, tool: event.tool, label, status: "pending" },
                          ],
                        }
                      : item
                  )
                );
              }
            } else if (event.type === "tool_end") {
              const output = event.output;
              const tool: string = event.tool;
              const capturedId = activityItemId;

              setTimeline((prev) =>
                prev.map((item) => {
                  if (item.kind !== "activity" || item.id !== capturedId) return item;
                  const chips = [...item.chips];
                  for (let i = chips.length - 1; i >= 0; i--) {
                    if (chips[i].tool === tool && chips[i].status === "pending") {
                      chips[i] = { ...chips[i], status: "done" };
                      break;
                    }
                  }
                  return { ...item, chips };
                })
              );

              if (tool === "get_full_menu" && output?.items) {
                const items: MenuItemData[] = output.items;
                setTimeline((prev) => [
                  ...prev,
                  { kind: "products", id: nextId(), items },
                ]);
              } else if (tool === "check_items_available" && output?.matches) {
                const matches: MatchedItemData[] = output.matches;
                const matched = matches.filter((m) => m.matched);
                const unmatched = matches.filter((m) => !m.matched);
                if (matched.length) {
                  setTimeline((prev) => [
                    ...prev,
                    {
                      kind: "products",
                      id: nextId(),
                      items: matched.map((m) => ({
                        name: m.matched_name || m.requested_name,
                        price_ngn: m.price_ngn || 0,
                        image_url: m.image_url,
                      })),
                    },
                  ]);
                }
                if (unmatched.length) {
                  setTimeline((prev) => [
                    ...prev,
                    {
                      kind: "unmatched",
                      id: nextId(),
                      names: unmatched.map((m) => m.requested_name),
                    },
                  ]);
                }
              } else if (tool === "place_order_tool" && output?.status) {
                if (output.status === "needs_confirmation") {
                  pendingConfirmationFlag = true;
                } else if (output.status === "placed") {
                  setTimeline((prev) => [
                    ...prev,
                    {
                      kind: "order_placed",
                      id: nextId(),
                      orderIdentifier: output.order_identifier,
                      totalNgn: output.total_ngn,
                      paymentMethod: output.payment_method,
                    },
                  ]);
                } else if (output.status === "failed") {
                  setTimeline((prev) => [
                    ...prev,
                    { kind: "order_failed", id: nextId(), message: output.message },
                  ]);
                }
              } else if (tool === "get_transfer_details_tool" && output?.status === "success") {
                setTimeline((prev) => [
                  ...prev,
                  {
                    kind: "transfer_details",
                    id: nextId(),
                    bankName: output.bank_name,
                    accountNumber: output.account_number,
                    amountNgn: output.amount_ngn,
                    reference: output.reference,
                    orderId: output.order_id,
                    paid: false,
                  },
                ]);
              }
            } else if (event.type === "text_delta") {
              markFirstResponseSeen();
              if (!agentStarted) {
                agentStarted = true;
                setTimeline((prev) => [
                  ...prev,
                  { kind: "agent", id: nextId(), text: "", streaming: true },
                ]);
              }
              updateLastAgentText((t) => t + event.content);
            } else if (event.type === "error") {
              markFirstResponseSeen();
              if (!agentStarted) {
                agentStarted = true;
                setTimeline((prev) => [
                  ...prev,
                  { kind: "agent", id: nextId(), text: "", streaming: true },
                ]);
              }
              updateLastAgentText((t) => t + "\n\nSomething went wrong: " + event.message, true);
            } else if (event.type === "done") {
              if (agentStarted) updateLastAgentText((t) => t, true);
              if (pendingConfirmationFlag) {
                setTimeline((prev) => [
                  ...prev,
                  { kind: "confirm", id: nextId(), resolved: false },
                ]);
              }
            }
          }
        }
      } catch {
        markFirstResponseSeen();
        setTimeline((prev) => [
          ...prev,
          {
            kind: "agent",
            id: nextId(),
            text: `Couldn't reach the agent. Is the API running on ${API_BASE}?`,
            streaming: false,
          },
        ]);
      } finally {
        setIsStreaming(false);
        setAwaitingFirstResponse(false);
      }
    },
    [isStreaming, updateLastAgentText, token, onUnauthorized]
  );

  return {
    timeline,
    isStreaming,
    awaitingFirstResponse,
    sendMessage,
    resolveConfirmPrompt,
    markTransferPaid,
    newConversation,
  };
}