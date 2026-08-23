import type { ActivityChip } from "@/lib/useAgentChat";

const TOOL_COLOR: Record<string, { bg: string; text: string }> = {
  get_full_menu: { bg: "bg-amber-bg", text: "text-amber" },
  check_items_available: { bg: "bg-amber-bg", text: "text-amber" },
  check_item_options: { bg: "bg-blue-bg", text: "text-blue" },
  add_items_to_cart_tool: { bg: "bg-teal-bg", text: "text-teal" },
  place_order_tool: { bg: "bg-coral-bg", text: "text-coral" },
  get_transfer_details_tool: { bg: "bg-teal-bg", text: "text-teal" },
};

export default function ActivityChips({ chips }: { chips: ActivityChip[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => {
        const color = TOOL_COLOR[chip.tool] || { bg: "bg-surface-soft", text: "text-ink-soft" };
        return (
          <span
            key={chip.id}
            className={`animate-chip-in flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[12px] font-medium ${color.bg} ${color.text}`}
          >
            {chip.status === "pending" ? (
              <span className="h-[6px] w-[6px] animate-pulse-soft rounded-full bg-current" />
            ) : chip.status === "done" ? (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 6.2L4.8 8.5L9.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M3 3L9 9M9 3L3 9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {chip.label}
          </span>
        );
      })}
    </div>
  );
}