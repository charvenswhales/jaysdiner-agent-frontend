"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useOrders } from "@/lib/useOrders";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  placed: { bg: "bg-amber-bg", text: "text-amber" },
  paid: { bg: "bg-teal-bg", text: "text-teal" },
  failed: { bg: "bg-coral-bg", text: "text-coral" },
};

function money(n: number): string {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrdersPage() {
  const auth = useAuth();
  const { orders, loading } = useOrders(auth.token);
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.replace("/");
    }
  }, [auth.loading, auth.user, router]);

  if (auth.loading || !auth.user) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <p className="text-[13px] text-ink-faint">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between border-b border-soft px-8 py-5">
        <Link
          href="/profile"
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
          Back to profile
        </Link>
      </header>

      <main className="mx-auto max-w-[560px] px-6 py-10">
        <h1 className="mb-6 text-[17px] font-semibold text-ink">Order history</h1>

        {loading && <p className="text-[13px] text-ink-faint">Loading orders…</p>}

        {!loading && orders.length === 0 && (
          <p className="py-8 text-center text-[13px] text-ink-faint">
            No orders yet. Go order something.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const statusStyle = STATUS_STYLES[order.status] || {
              bg: "bg-surface-soft",
              text: "text-ink-soft",
            };
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="rounded-xl border border-soft bg-surface p-4 transition-colors hover:border-primary"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-mono text-[13px] text-ink">
                    #{order.order_identifier || order.id.slice(0, 8)}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-[3px] text-[11px] font-medium capitalize ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="mb-1 text-[12.5px] text-ink-soft">
                  {order.items.map((i) => i.name).join(", ")}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11.5px] text-ink-faint">
                    {formatDate(order.created_at)}
                  </span>
                  <span className="font-mono text-[13.5px] font-medium text-primary">
                    {money(order.total_ngn)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}