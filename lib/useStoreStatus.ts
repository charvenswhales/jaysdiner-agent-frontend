"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "./config";

export interface StoreStatus {
  accepting_orders: boolean;
  status_note: string | null;
}

export function useStoreStatus() {
  const [status, setStatus] = useState<StoreStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = () => {
      fetch(`${API_BASE}/store-status`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data) setStatus(data);
        })
        .catch(() => {});
    };

    fetchStatus();
    // Store hours flip at fixed times of day, 12pm and 5am, and someone
    // could easily have the tab open across one of those moments, so
    // this checks again periodically instead of only once on load.
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return status;
}