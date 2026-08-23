"use client";

import { useState } from "react";
import Image from "next/image";
import MoneiPinKeypad from "./MoneiPinKeypad";

function money(n: number): string {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

export function MoneiPaymentCard({
  amountNgn,
  orderId,
  paid,
  moneiConnected,
  token,
  onConnectMonei,
  onPaid,
}: {
  amountNgn: number;
  orderId?: string | null;
  paid?: boolean;
  moneiConnected: boolean;
  token: string | null;
  onConnectMonei: () => void;
  onPaid: () => void;
}) {
  const [showKeypad, setShowKeypad] = useState(false);

  return (
    <div className="relative max-w-[380px] overflow-hidden rounded-2xl bg-gradient-to-br from-monei-navy to-monei-navy-deep p-5 text-white shadow-[0_10px_30px_rgba(15,32,56,0.35)]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />

      <div className="relative mb-4 flex items-center gap-2.5">
        <div className="relative h-7 w-7 overflow-hidden rounded-full">
          <Image src="/monei-logo.webp" alt="Monei" fill className="object-cover" />
        </div>
        <span className="text-[13px] font-semibold tracking-wide text-white">MONEI</span>
        {paid && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-[3px] text-[11px] font-medium text-white">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 6.2L4.8 8.5L9.5 3.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Paid
          </span>
        )}
      </div>

      <p className="relative mb-1 text-[11px] uppercase tracking-[0.08em] text-white/50">
        Amount due
      </p>
      <p className="relative mb-5 font-mono text-[28px] font-semibold tracking-tight">
        {money(amountNgn)}
      </p>

      {!paid &&
        (moneiConnected && orderId ? (
          <button
            type="button"
            onClick={() => setShowKeypad(true)}
            className="relative w-full rounded-xl bg-white py-[11px] text-[14px] font-semibold text-monei-navy-deep"
          >
            Pay with Monei
          </button>
        ) : (
          <button
            type="button"
            onClick={onConnectMonei}
            className="relative w-full rounded-xl border border-white/25 bg-white/10 py-[11px] text-[13.5px] font-medium text-white"
          >
            Connect Monei to pay
          </button>
        ))}

      <p className="relative mt-3 text-[10.5px] text-white/40">Secured by Monei</p>

      {showKeypad && orderId && (
        <MoneiPinKeypad
          orderId={orderId}
          amountNgn={amountNgn}
          token={token}
          onClose={() => setShowKeypad(false)}
          onPaid={() => {
            setShowKeypad(false);
            onPaid();
          }}
        />
      )}
    </div>
  );
}