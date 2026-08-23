"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "./config";

const TOKEN_KEY = "jaysdiner_auth_token";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
}

async function parseErrorDetail(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return data.detail || fallback;
  } catch {
    return fallback;
  }
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (tok: string): Promise<AuthUser> => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${tok}` },
    });
    if (!res.ok) throw new Error("Session expired");
    return res.json();
  }, []);

  // On first load, try to resume a session from a previously stored token.
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!stored) {
      setLoading(false);
      return;
    }
    fetchMe(stored)
      .then((u) => {
        setToken(stored);
        setUser(u);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setLoading(false));
  }, [fetchMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await parseErrorDetail(res, "Login failed"));
      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
      setUser(await fetchMe(data.access_token));
    },
    [fetchMe]
  );

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName || undefined }),
      });
      if (!res.ok) throw new Error(await parseErrorDetail(res, "Registration failed"));
      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
      setUser(await fetchMe(data.access_token));
    },
    [fetchMe]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return { token, user, loading, login, register, logout };
}