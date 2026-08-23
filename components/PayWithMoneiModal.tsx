"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/config";

export default function PayWithMoneiModal({
  orderId,
  amountNgn,
  token,
  onClose,
  onPaid,
}: {
  orderId: string;
  amountNgn: number;
  token: string | null;
  onClose: () => void;
  onPaid: () => void;
}) {
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const money = (n: number) => "₦" + Math.round(n).toLocaleString("en-NG");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/connect/monei/pay-order/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transaction_pin: pin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Payment failed");
      }
      onPaid();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPin("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-6" onClick={onClose}>
      <div
        className="w-full max-w-[360px] rounded-2xl border border-soft bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-teal">
          Pay with Monei
        </p>
        <h2 className="mb-1.5 text-[17px] font-semibold text-ink">Enter your transaction PIN</h2>
        <p className="mb-5 text-[13px] leading-relaxed text-ink-soft">
          You&apos;re paying {money(amountNgn)} from your Monei wallet. This PIN is sent directly
          and securely to Monei — it&apos;s never seen by the chat.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            inputMode="numeric"
            required
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Transaction PIN"
            className="rounded-xl border border-soft bg-bg px-4 py-[11px] text-center text-[16px] tracking-[0.3em] text-ink outline-none placeholder:tracking-normal placeholder:text-ink-faint focus:border-teal"
          />

          {error && <p className="text-[12.5px] text-coral">{error}</p>}

          <div className="mt-1 flex gap-2">
            <button
              type="submit"
              disabled={submitting || !pin}
              className="flex-1 rounded-xl bg-teal py-[11px] text-[14px] font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Paying…" : `Pay ${money(amountNgn)}`}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-soft px-4 py-[11px] text-[13.5px] font-medium text-ink-soft"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}