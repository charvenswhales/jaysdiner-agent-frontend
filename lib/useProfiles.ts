"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "./config";

export interface CheckoutProfile {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address: string | null;
  area: string | null;
  delivery_or_pickup: string;
  is_default: boolean;
}

export interface CheckoutProfileInput {
  label: string;
  full_name: string;
  phone: string;
  address: string;
  area: string;
  delivery_or_pickup: string;
}

export function useProfiles(token: string | null) {
  const [profiles, setProfiles] = useState<CheckoutProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const authHeaders = useCallback(
    (): Record<string, string> => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const refresh = useCallback(async () => {
    if (!token) {
      setProfiles([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/profiles`, { headers: authHeaders() });
      if (res.ok) setProfiles(await res.json());
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: CheckoutProfileInput) => {
      const res = await fetch(`${API_BASE}/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Could not save address");
      await refresh();
    },
    [authHeaders, refresh]
  );

  const update = useCallback(
    async (id: string, input: Partial<CheckoutProfileInput>) => {
      const res = await fetch(`${API_BASE}/profiles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Could not update address");
      await refresh();
    },
    [authHeaders, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      const res = await fetch(`${API_BASE}/profiles/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Could not delete address");
      await refresh();
    },
    [authHeaders, refresh]
  );

  const setDefault = useCallback(
    async (id: string) => {
      const res = await fetch(`${API_BASE}/profiles/${id}/set-default`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Could not set default address");
      await refresh();
    },
    [authHeaders, refresh]
  );

  return { profiles, loading, create, update, remove, setDefault, refresh };
}