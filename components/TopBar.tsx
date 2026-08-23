import Image from "next/image";
import Link from "next/link";
import type { AuthUser } from "@/lib/useAuth";

export default function TopBar({ user }: { user: AuthUser }) {
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
      <Link
        href="/profile"
        aria-label="View profile"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-soft text-[13px] font-semibold text-ink-soft transition-colors hover:bg-primary hover:text-white"
      >
        {initial}
      </Link>
    </header>
  );
}