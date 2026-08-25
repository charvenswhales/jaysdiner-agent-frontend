import Image from "next/image";
import Link from "next/link";
import type { AuthUser } from "@/lib/useAuth";

export default function TopBar({
  user,
  onNewChat,
}: {
  user: AuthUser;
  onNewChat: () => void;
}) {
  const initial = (user.full_name || user.email).charAt(0).toUpperCase();

  return (
    <header className="flex shrink-0 items-center justify-between px-8 py-5">
      <div className="flex items-center gap-2.5">
        <div className="relative h-8 w-8 overflow-hidden rounded-full">
          <Image src="/monei-logo.webp" alt="Monei" fill className="object-cover" />
        </div>
        <span className="text-[16px] font-semibold text-ink">Jay&apos;s Diner</span>
        <span className="text-ink-faint">·</span>
        <span className="text-[13px] font-medium text-ink-soft">powered by Monei</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onNewChat}
          className="flex items-center gap-1.5 rounded-full border border-soft px-3.5 py-[7px] text-[13px] font-medium text-ink-soft transition-colors hover:border-primary hover:text-primary"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 3.5V12.5M3.5 8H12.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          New chat
        </button>
        <Link
          href="/profile"
          aria-label="View profile"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-soft text-[13px] font-semibold text-ink-soft transition-colors hover:bg-primary hover:text-white"
        >
          {initial}
        </Link>
      </div>
    </header>
  );
}