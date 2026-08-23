"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useProfiles } from "@/lib/useProfiles";
import { useMoneiConnection } from "@/lib/useMoneiConnection";
import WalletCard from "@/components/WalletCard";
import ProfileAddresses from "@/components/ProfileAddresses";

const RETURN_BANNERS: Record<string, { text: string; tone: "teal" | "coral" | "amber" }> = {
  connected: { text: "Monei wallet connected.", tone: "teal" },
  denied: { text: "Monei connection was cancelled.", tone: "amber" },
  partial: {
    text: "Connected, but payout permission wasn't granted. Reconnect and approve wallet:withdraw to pay directly.",
    tone: "amber",
  },
  error: { text: "Something went wrong connecting Monei. Try again.", tone: "coral" },
};

const BANNER_CLASSES: Record<string, string> = {
  teal: "bg-teal-bg text-teal",
  coral: "bg-coral-bg text-coral",
  amber: "bg-amber-bg text-amber",
};

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-bg">
          <p className="text-[13px] text-ink-faint">Loading…</p>
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}

function ProfilePageContent() {
  const auth = useAuth();
  const profiles = useProfiles(auth.token);
  const monei = useMoneiConnection(auth.token);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [banner, setBanner] = useState<{ text: string; tone: string } | null>(null);

  // Not logged in (and not still checking) — bounce back to the chat page,
  // which itself shows the login screen when there's no session.
  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.replace("/");
    }
  }, [auth.loading, auth.user, router]);

  // Handle the ?monei=connected|denied|partial|error return from the
  // OAuth callback redirect, then strip it from the URL so refreshing
  // doesn't re-show the banner.
  useEffect(() => {
    const result = searchParams.get("monei");
    if (result && RETURN_BANNERS[result]) {
      setBanner(RETURN_BANNERS[result]);
      monei.refresh();
      router.replace("/profile");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (auth.loading || !auth.user) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <p className="text-[13px] text-ink-faint">Loading…</p>
      </div>
    );
  }

  const initial = (auth.user.full_name || auth.user.email).charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between border-b border-soft px-8 py-5">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:text-primary"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3L5 8L10 13"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to chat
        </Link>
        <button
          type="button"
          onClick={auth.logout}
          className="text-[12.5px] font-medium text-ink-faint underline underline-offset-2 hover:text-coral"
        >
          Log out
        </button>
      </header>

      <main className="mx-auto max-w-[560px] px-6 py-10">
        {banner && (
          <div className={`mb-6 rounded-xl px-4 py-3 text-[13px] font-medium ${BANNER_CLASSES[banner.tone]}`}>
            {banner.text}
          </div>
        )}

        <div className="mb-9 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-[20px] font-semibold text-white">
            {initial}
          </div>
          <div>
            <p className="text-[17px] font-semibold text-ink">
              {auth.user.full_name || "No name set"}
            </p>
            <p className="text-[13px] text-ink-soft">{auth.user.email}</p>
          </div>
        </div>

        <h2 className="mb-3 text-[14px] font-semibold text-ink">Monei wallet</h2>
        <div className="mb-9">
          {monei.loading ? (
            <div className="h-[120px] animate-pulse rounded-2xl bg-surface-soft" />
          ) : monei.status.connected ? (
            <>
              <WalletCard token={auth.token} />
              <button
                type="button"
                onClick={() => monei.disconnect()}
                className="mt-2 text-[12px] font-medium text-ink-faint underline underline-offset-2 hover:text-coral"
              >
                Disconnect
              </button>
            </>
          ) : (
            <div className="rounded-xl border border-soft bg-surface p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13.5px] font-medium text-ink">Not connected</p>
                  <p className="text-[12px] text-ink-faint">
                    Connect your wallet to pay for orders directly, no manual bank transfer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => monei.connect()}
                  className="shrink-0 rounded-full bg-primary px-4 py-[8px] text-[12.5px] font-medium text-white"
                >
                  Connect
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-ink">Saved addresses</h2>
          <Link
            href="/orders"
            className="text-[12.5px] font-medium text-primary underline underline-offset-2"
          >
            View order history
          </Link>
        </div>
        <ProfileAddresses
          profiles={profiles.profiles}
          onCreate={profiles.create}
          onUpdate={profiles.update}
          onDelete={profiles.remove}
          onSetDefault={profiles.setDefault}
        />
      </main>
    </div>
  );
}