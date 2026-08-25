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
    <header className="flex shrink-0 items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
        <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full sm:h-8 sm:w-8">
          <Image src="/monei-logo.webp" alt="Monei" fill className="object-cover" />
        </div>
        <span className="whitespace-nowrap text-[13px] font-semibold text-ink sm:text-[16px]">
          Jay&apos;s Diner
        </span>
        <span className="text-ink-faint">·</span>
        <span className="whitespace-nowrap text-[11px] font-medium text-ink-soft sm:text-[13px]">
          powered by Monei
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onNewChat}
          aria-label="New chat"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-soft text-ink-soft transition-colors hover:border-primary hover:text-primary sm:h-auto sm:w-auto sm:gap-1.5 sm:rounded-full sm:px-3.5 sm:py-[7px]"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 3.5V12.5M3.5 8H12.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <span className="hidden text-[13px] font-medium sm:inline">New chat</span>
        </button>
        <Link
          href="/profile"
          aria-label="View profile"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-soft text-[13px] font-semibold text-ink-soft transition-colors hover:bg-primary hover:text-white"
        >
          {initial}
        </Link>
      </div>
    </header>
  );
}