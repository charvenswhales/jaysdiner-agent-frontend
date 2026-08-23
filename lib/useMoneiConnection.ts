"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "./config";

export interface MoneiStatus {
  connected: boolean;
  scopes?: string[];
  expires_at?: string;
}

export function useMoneiConnection(token: string | null) {
  const [status, setStatus] = useState<MoneiStatus>({ connected: false });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!token) {
      setStatus({ connected: false });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/connect/monei/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setStatus(await res.json());
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const connect = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/connect/monei/authorize`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Could not start Monei connection");
    const { authorize_url } = await res.json();
    window.location.href = authorize_url;
  }, [token]);

  const disconnect = useCallback(async () => {
    if (!token) return;
    await fetch(`${API_BASE}/connect/monei/disconnect`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await refresh();
  }, [token, refresh]);

  return { status, loading, connect, disconnect, refresh };
}