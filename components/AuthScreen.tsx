"use client";

import { useState } from "react";
import Image from "next/image";

export default function AuthScreen({
  onLogin,
  onRegister,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, fullName: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await onLogin(email, password);
      } else {
        await onRegister(email, password, fullName);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="relative h-9 w-9 overflow-hidden rounded-full">
            <Image src="/monei-logo.webp" alt="Monei" fill className="object-cover" />
          </div>
          <span className="text-[17px] font-semibold text-ink">Jay&apos;s Diner</span>
          <span className="text-ink-faint">·</span>
          <span className="text-[13px] font-medium text-ink-soft">powered by Monei</span>
        </div>

        <div className="rounded-2xl border border-soft bg-surface p-6">
          <div className="mb-6 flex gap-1 rounded-full bg-surface-soft p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 rounded-full py-2 text-[13.5px] font-medium transition-colors ${
                mode === "login" ? "bg-surface text-ink shadow-sm" : "text-ink-faint"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 rounded-full py-2 text-[13.5px] font-medium transition-colors ${
                mode === "register" ? "bg-surface text-ink shadow-sm" : "text-ink-faint"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === "register" && (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                autoComplete="name"
                className="rounded-xl border border-soft bg-bg px-4 py-[11px] text-[14px] text-ink outline-none placeholder:text-ink-faint focus:border-primary"
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              className="rounded-xl border border-soft bg-bg px-4 py-[11px] text-[14px] text-ink outline-none placeholder:text-ink-faint focus:border-primary"
            />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="rounded-xl border border-soft bg-bg px-4 py-[11px] text-[14px] text-ink outline-none placeholder:text-ink-faint focus:border-primary"
            />

            {error && <p className="text-[12.5px] text-coral">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded-xl bg-primary py-[11px] text-[14px] font-medium text-white transition-opacity disabled:opacity-50"
            >
              {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[12px] text-ink-faint">
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            className="font-medium text-primary underline underline-offset-2"
          >
            {mode === "login" ? "Create an account" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}