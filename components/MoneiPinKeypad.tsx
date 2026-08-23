"use client";

import { useState } from "react";
import Image from "next/image";
import { API_BASE } from "@/lib/config";

const PIN_LENGTH = 4;

function money(n: number): string {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

export default function MoneiPinKeypad({
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
  const [shake, setShake] = useState(false);
  const [isInsufficientFunds, setIsInsufficientFunds] = useState(false);

  const submitPin = async (fullPin: string) => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/connect/monei/pay-order/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ transaction_pin: fullPin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail = data.detail;
        const errorCode = typeof detail === "object" && detail ? detail.error_code : undefined;
        const message =
          (typeof detail === "object" && detail ? detail.message : detail) || "Payment failed";
        setError(message);
        setPin("");
        // Only shake for an actual wrong PIN — a business-logic error like
        // insufficient funds isn't a typo, and shaking would wrongly imply
        // "try typing it again" when the fix is topping up the wallet.
        if (errorCode === "invalid_pin") {
          setShake(true);
          setTimeout(() => setShake(false), 400);
        }
        setIsInsufficientFunds(errorCode === "insufficient_funds");
        return;
      }
      onPaid();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPin("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDigit = (d: string) => {
    if (submitting || pin.length >= PIN_LENGTH) return;
    const next = pin + d;
    setPin(next);
    setError(null);
    setIsInsufficientFunds(false);
    if (next.length === PIN_LENGTH) {
      submitPin(next);
    }
  };

  const handleBackspace = () => {
    if (submitting) return;
    setPin((p) => p.slice(0, -1));
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "backspace"];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-6"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-[340px] rounded-[28px] bg-monei-navy-deep px-6 py-8 ${
          shake ? "animate-shake" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex flex-col items-center">
          <div className="relative mb-3 h-9 w-9 overflow-hidden rounded-full">
            <Image src="/monei-logo.webp" alt="Monei" fill className="object-cover" />
          </div>
          <p className="text-[14.5px] font-medium text-white">Enter your Monei PIN</p>
          <p className="mt-1 font-mono text-[13px] text-white/50">{money(amountNgn)}</p>
        </div>

        <div className="mb-8 flex items-center justify-center gap-4">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <span
              key={i}
              className={`h-3.5 w-3.5 rounded-full border transition-colors ${
                i < pin.length ? "border-white bg-white" : "border-white/30 bg-transparent"
              }`}
            />
          ))}
        </div>

        {error && (
          <p
            className={`mb-4 text-center text-[12.5px] ${
              isInsufficientFunds ? "text-[#F2B84B]" : "text-coral"
            }`}
          >
            {error}
          </p>
        )}
        {submitting && !error && (
          <p className="mb-4 text-center text-[12.5px] text-white/50">Paying…</p>
        )}

        <div className="grid grid-cols-3 gap-3">
          {keys.map((k, i) => {
            if (k === "") return <div key={i} />;
            if (k === "backspace") {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={handleBackspace}
                  disabled={submitting}
                  className="flex h-16 w-16 items-center justify-center justify-self-center rounded-full text-white/70 transition-colors active:bg-white/10 disabled:opacity-40"
                  aria-label="Delete digit"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 6L4 12l5 6h11a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H9Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11 10l4 4m0-4l-4 4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              );
            }
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleDigit(k)}
                disabled={submitting}
                className="flex h-16 w-16 items-center justify-center justify-self-center rounded-full bg-white/10 text-[24px] font-medium text-white transition-colors active:bg-white/25 disabled:opacity-40"
              >
                {k}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="mt-7 w-full text-center text-[13px] font-medium text-white/50 disabled:opacity-40"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}