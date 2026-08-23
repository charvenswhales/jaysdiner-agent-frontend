import Image from "next/image";
import type { MenuItemData } from "@/lib/useAgentChat";

function money(n: number): string {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

export default function ProductGrid({
  items,
  onSelect,
  disabled,
}: {
  items: MenuItemData[];
  onSelect: (text: string) => void;
  disabled?: boolean;
}) {
  const hasMore = items.length > 6;
  // Two rows only make sense once there are enough items to actually fill
  // both. With 1 to 3 items, forcing grid-rows-2 reserves a whole empty
  // second row that just shows as dead space underneath.
  const rowsClass = items.length <= 3 ? "grid-rows-1" : "grid-rows-2";

  const handleActivate = (name: string) => {
    if (disabled) return;
    onSelect(`I'd like to order the ${name}`);
  };

  return (
    <div className="max-w-[600px]">
      <div
        className={`grid grid-flow-col ${rowsClass} auto-cols-[176px] gap-3 overflow-x-auto scroll-smooth pb-1 pr-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      >
        {items.map((item, i) => (
          <div
            key={item.name + i}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            onClick={() => handleActivate(item.name)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleActivate(item.name);
              }
            }}
            className={`animate-card-in group snap-start overflow-hidden rounded-2xl border border-soft bg-surface transition-shadow hover:shadow-[0_2px_10px_rgba(22,22,26,0.08)] ${
              disabled ? "pointer-events-none opacity-60" : "cursor-pointer"
            }`}
            style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-soft">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  sizes="176px"
                  className="object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                  unoptimized
                />
              ) : null}
            </div>
            <div className="px-3 pb-3 pt-2.5">
              <p className="mb-1 text-[13px] font-medium leading-tight text-ink">{item.name}</p>
              <div className="flex items-center justify-between">
                <p className="font-mono text-[12.5px] text-primary">{money(item.price_ngn)}</p>
                <span className="text-[11px] font-medium text-ink-faint opacity-0 transition-opacity group-hover:opacity-100">
                  Select
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <p className="mt-1.5 flex items-center gap-1 text-[12px] text-ink-faint">
          Scroll for {items.length - 6} more
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M4 2.5L7.5 6L4 9.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </p>
      )}
    </div>
  );
}