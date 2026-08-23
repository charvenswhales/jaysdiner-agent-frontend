"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { TimelineItem } from "@/lib/useAgentChat";
import ProductGrid from "./ProductGrid";
import ActivityChips from "./ActivityChips";
import FoodShowcase from "./FoodShowcase";
import { ConfirmPrompt, OrderFailedCard, OrderPlacedCard } from "./OrderCards";
import { MoneiPaymentCard } from "./MoneiPaymentCard";

import ThinkingIndicator from "./ThinkingIndicator";

const TEXT_SUGGESTIONS = ["What's on the menu tonight?", "Do you have anything spicy?"];

export default function ChatPane({
  timeline,
  isStreaming,
  awaitingFirstResponse,
  token,
  moneiConnected,
  onSend,
  onConfirm,
  onDecline,
  onTransferPaid,
  onConnectMonei,
}: {
  timeline: TimelineItem[];
  isStreaming: boolean;
  awaitingFirstResponse: boolean;
  token: string | null;
  moneiConnected: boolean;
  onSend: (text: string) => void;
  onConfirm: (id: string) => void;
  onDecline: (id: string) => void;
  onTransferPaid: (id: string) => void;
  onConnectMonei: () => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [timeline]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[680px] px-6 pb-4 pt-10">
          {timeline.length === 0 && (
            <div className="mb-10 flex flex-col items-center pt-4 text-center">
              <div className="relative mb-5 flex h-20 w-20 items-center justify-center">
                <span className="absolute inset-0 animate-glow-soft rounded-full bg-coral-bg blur-xl" />
                <div className="relative h-14 w-auto">
                  <Image
                    src="/jays-diner-logo.png"
                    alt="Jay's Diner"
                    width={140}
                    height={56}
                    className="h-14 w-auto object-contain"
                    priority
                  />
                </div>
              </div>

              <h1 className="mb-2.5 text-[34px] font-semibold leading-[1.15] tracking-tight text-ink max-md:text-[26px]">
                What are you craving today?
              </h1>
              <p className="mb-8 max-w-[440px] text-[15px] leading-relaxed text-ink-soft">
                Tell the agent what you want. It checks the real menu, builds
                your cart, confirms with you, and places the order.
              </p>

              <div className="w-full">
                <FoodShowcase onSelect={onSend} />
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {TEXT_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSend(s)}
                    className="rounded-full border border-soft bg-surface px-4 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:border-primary hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-5 pb-4">
            {timeline.map((item) => (
              <TimelineRow
                key={item.id}
                item={item}
                isStreaming={isStreaming}
                token={token}
                moneiConnected={moneiConnected}
                onConnectMonei={onConnectMonei}
                onSend={onSend}
                onConfirm={() => onConfirm(item.id)}
                onDecline={() => onDecline(item.id)}
                onTransferPaid={() => onTransferPaid(item.id)}
              />
            ))}
            {awaitingFirstResponse && <ThinkingIndicator />}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-[680px] items-center gap-2 rounded-full border border-soft bg-surface px-2 py-2 shadow-[0_1px_2px_rgba(22,22,26,0.04)] transition-shadow focus-within:shadow-[0_0_0_3px_rgba(15,110,86,0.12)]"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Order me 2 buffalo tenders and a vanilla shake…"
            autoComplete="off"
            className="flex-1 bg-transparent px-3 py-2 text-[14.5px] text-ink outline-none placeholder:text-ink-faint"
          />
          <button
            type="submit"
            disabled={isStreaming}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-transform active:scale-[0.92] disabled:opacity-40"
          >
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 9H16M16 9L10 3M16 9L10 15"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

function TimelineRow({
  item,
  isStreaming,
  token,
  moneiConnected,
  onSend,
  onConfirm,
  onDecline,
  onTransferPaid,
  onConnectMonei,
}: {
  item: TimelineItem;
  isStreaming: boolean;
  token: string | null;
  moneiConnected: boolean;
  onSend: (text: string) => void;
  onConfirm: () => void;
  onDecline: () => void;
  onTransferPaid: () => void;
  onConnectMonei: () => void;
}) {
  if (item.kind === "user") {
    return (
      <div className="flex animate-msg-in justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-ink px-4 py-[10px] text-[14.5px] leading-relaxed text-white">
          {item.text}
        </div>
      </div>
    );
  }

  if (item.kind === "activity") {
    return <ActivityChips chips={item.chips} />;
  }

  if (item.kind === "agent") {
    return (
      <div className="max-w-[85%] animate-msg-in text-[15px] leading-relaxed text-ink">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-2.5 last:mb-0">{children}</p>,
            h1: ({ children }) => (
              <h3 className="mb-2 mt-3.5 text-[15px] font-semibold first:mt-0">{children}</h3>
            ),
            h2: ({ children }) => (
              <h3 className="mb-2 mt-3.5 text-[15px] font-semibold first:mt-0">{children}</h3>
            ),
            h3: ({ children }) => (
              <h3 className="mb-2 mt-3.5 text-[15px] font-semibold first:mt-0">{children}</h3>
            ),
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            ul: ({ children }) => <ul className="mb-2.5 ml-4 list-disc space-y-1">{children}</ul>,
            ol: ({ children }) => (
              <ol className="mb-2.5 ml-4 list-decimal space-y-1">{children}</ol>
            ),
            li: ({ children }) => <li className="pl-0.5">{children}</li>,
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                {children}
              </a>
            ),
            code: ({ children }) => (
              <code className="rounded bg-surface-soft px-1.5 py-0.5 font-mono text-[13px]">
                {children}
              </code>
            ),
          }}
        >
          {item.text}
        </ReactMarkdown>
        {item.streaming && (
          <span className="ml-0.5 inline-block h-[15px] w-[7px] translate-y-[2px] animate-blink bg-primary align-middle" />
        )}
      </div>
    );
  }

  if (item.kind === "products") {
    return <ProductGrid items={item.items} onSelect={onSend} disabled={isStreaming} />;
  }

  if (item.kind === "unmatched") {
    return (
      <div>
        {item.names.map((n) => (
          <p key={n} className="text-[12.5px] text-coral">
            &quot;{n}&quot; is not on the menu
          </p>
        ))}
      </div>
    );
  }

  if (item.kind === "confirm") {
    return <ConfirmPrompt resolved={item.resolved} onConfirm={onConfirm} onDecline={onDecline} />;
  }

  if (item.kind === "order_placed") {
    return (
      <OrderPlacedCard
        orderIdentifier={item.orderIdentifier}
        totalNgn={item.totalNgn}
        paymentMethod={item.paymentMethod}
      />
    );
  }

  if (item.kind === "order_failed") {
    return <OrderFailedCard message={item.message} />;
  }

  if (item.kind === "transfer_details") {
    return (
      <MoneiPaymentCard
        amountNgn={item.amountNgn}
        orderId={item.orderId}
        paid={item.paid}
        moneiConnected={moneiConnected}
        token={token}
        onConnectMonei={onConnectMonei}
        onPaid={onTransferPaid}
      />
    );
  }

  return null;
}