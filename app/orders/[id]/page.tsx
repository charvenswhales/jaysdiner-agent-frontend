"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useOrderDetail } from "@/lib/useOrders";

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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetailPage() {
  const auth = useAuth();
  const params = useParams();
  const orderId = params.id as string;
  const { order, loading, notFound } = useOrderDetail(auth.token, orderId);
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.replace("/");
    }
  }, [auth.loading, auth.user, router]);

  if (auth.loading || !auth.user || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <p className="text-[13px] text-ink-faint">Loading…</p>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-bg">
        <p className="text-[13px] text-ink-faint">Order not found.</p>
        <Link href="/orders" className="text-[13px] font-medium text-primary underline underline-offset-2">
          Back to order history
        </Link>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[order.status] || { bg: "bg-surface-soft", text: "text-ink-soft" };

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between border-b border-soft px-8 py-5">
        <Link
          href="/orders"
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
          Back to order history
        </Link>
      </header>

      <main className="mx-auto max-w-[560px] px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="font-mono text-[15px] text-ink">
              #{order.order_identifier || order.id.slice(0, 8)}
            </p>
            <p className="text-[12.5px] text-ink-faint">{formatDate(order.created_at)}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[12px] font-medium capitalize ${statusStyle.bg} ${statusStyle.text}`}
          >
            {order.status}
          </span>
        </div>

        <h2 className="mb-3 text-[14px] font-semibold text-ink">Items</h2>
        <div className="mb-8 flex flex-col gap-2.5">
          {order.items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-soft bg-surface p-3"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-soft">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-ink">{item.name}</p>
                {item.notes && <p className="text-[12px] text-ink-faint">{item.notes}</p>}
              </div>
              {typeof item.line_price_ngn === "number" && (
                <p className="font-mono text-[13px] text-primary">{money(item.line_price_ngn)}</p>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-soft px-1 pt-3">
            <span className="text-[13px] font-medium text-ink-soft">Total</span>
            <span className="font-mono text-[15px] font-semibold text-ink">{money(order.total_ngn)}</span>
          </div>
        </div>

        {order.checkout_info && (
          <>
            <h2 className="mb-3 text-[14px] font-semibold text-ink">Checkout info used</h2>
            <div className="mb-8 rounded-xl border border-soft bg-surface p-4">
              <dl className="flex flex-col gap-2 text-[13px]">
                <Row label="Name" value={order.checkout_info.full_name} />
                <Row label="Phone" value={order.checkout_info.phone} />
                <Row label="Email" value={order.checkout_info.email} />
                <Row
                  label="Delivery"
                  value={
                    order.checkout_info.delivery_or_pickup
                      ? order.checkout_info.delivery_or_pickup.charAt(0).toUpperCase() +
                        order.checkout_info.delivery_or_pickup.slice(1)
                      : undefined
                  }
                />
                <Row label="Address" value={order.checkout_info.address} />
                <Row label="Area" value={order.checkout_info.area} />
              </dl>
            </div>
          </>
        )}

        {order.payment_details && (
          <>
            <h2 className="mb-3 text-[14px] font-semibold text-ink">Payment details</h2>
            <div className="rounded-xl border border-soft bg-surface p-4">
              <dl className="flex flex-col gap-2 text-[13px]">
                <Row label="Bank" value={order.payment_details.bank_name} />
                <Row label="Account number" value={order.payment_details.account_number} mono />
                <Row
                  label="Amount"
                  value={
                    typeof order.payment_details.amount_ngn === "number"
                      ? money(order.payment_details.amount_ngn)
                      : undefined
                  }
                  mono
                />
                <Row label="Reference" value={order.payment_details.reference} mono />
              </dl>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-faint">{label}</dt>
      <dd className={`text-ink ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}