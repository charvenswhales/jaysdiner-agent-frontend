"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/config";

function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = value;
    startRef.current = null;
    let raf: number;

    function step(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(fromRef.current + (target - fromRef.current) * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

function money(n: number): string {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

export default function WalletCard({ token }: { token: string | null }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const displayed = useCountUp(balance ?? 0);

  const fetchBalance = async (isRefresh = false) => {
    if (!token) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/connect/monei/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not load balance");
      const data = await res.json();
      setBalance(data.naira_balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#0A2418] p-5 text-white shadow-[0_8px_24px_rgba(18,53,38,0.25)]">
      {/* soft glows, not literal decoration the user reads — purely atmospheric */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-8 h-32 w-32 rounded-full bg-teal/25 blur-2xl" />

      <div className="relative flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/60">
          Monei wallet
        </p>
        <button
          type="button"
          onClick={() => fetchBalance(true)}
          disabled={refreshing || loading}
          aria-label="Refresh balance"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 disabled:opacity-50"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 14 14"
            fill="none"
            className={refreshing ? "animate-spin" : ""}
          >
            <path
              d="M12.25 7A5.25 5.25 0 1 1 10.5 3.06M12.25 1.75V4.9h-3.15"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="relative mt-3">
        {loading ? (
          <div className="h-9 w-40 animate-pulse rounded-md bg-white/15" />
        ) : error ? (
          <p className="text-[13px] text-white/70">{error}</p>
        ) : (
          <p className="font-mono text-[30px] font-semibold tracking-tight">{money(displayed)}</p>
        )}
      </div>

      <p className="relative mt-1 text-[11.5px] text-white/50">Available balance</p>
    </div>
  );
}