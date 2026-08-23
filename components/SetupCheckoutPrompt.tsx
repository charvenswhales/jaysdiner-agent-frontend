"use client";

import { useState } from "react";
import type { CheckoutProfileInput } from "@/lib/useProfiles";

const EMPTY_FORM: CheckoutProfileInput = {
  label: "Home",
  full_name: "",
  phone: "",
  address: "",
  area: "",
  delivery_or_pickup: "delivery",
};

const AREAS = ["Chevron", "Osapa", "Ikate", "Lekki Phase 1", "Victoria Island", "Ikoyi"];

export default function SetupCheckoutPrompt({
  onSave,
  onSkip,
}: {
  onSave: (input: CheckoutProfileInput) => Promise<void>;
  onSkip: () => void;
}) {
  const [form, setForm] = useState<CheckoutProfileInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-6" onClick={onSkip}>
      <div
        className="w-full max-w-[420px] rounded-2xl border border-soft bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-amber">
          Agentic commerce
        </p>
        <h2 className="mb-1.5 text-[17px] font-semibold text-ink">Set up your checkout info</h2>
        <p className="mb-5 text-[13px] leading-relaxed text-ink-soft">
          Save your delivery details once, and the agent will use them
          automatically every time you order. No need to retype your address
          mid-conversation.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="Full name"
            className="rounded-xl border border-soft bg-bg px-4 py-[10px] text-[14px] text-ink outline-none placeholder:text-ink-faint focus:border-primary"
          />
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone number"
            className="rounded-xl border border-soft bg-bg px-4 py-[10px] text-[14px] text-ink outline-none placeholder:text-ink-faint focus:border-primary"
          />
          <select
            value={form.delivery_or_pickup}
            onChange={(e) => setForm({ ...form, delivery_or_pickup: e.target.value })}
            className="rounded-xl border border-soft bg-bg px-4 py-[10px] text-[14px] text-ink outline-none focus:border-primary"
          >
            <option value="delivery">Delivery</option>
            <option value="takeaway">Takeaway</option>
          </select>
          {form.delivery_or_pickup === "delivery" && (
            <>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Address"
                className="rounded-xl border border-soft bg-bg px-4 py-[10px] text-[14px] text-ink outline-none placeholder:text-ink-faint focus:border-primary"
              />
              <select
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="rounded-xl border border-soft bg-bg px-4 py-[10px] text-[14px] text-ink outline-none focus:border-primary"
              >
                <option value="">Select area</option>
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </>
          )}

          {error && <p className="text-[12.5px] text-coral">{error}</p>}

          <div className="mt-1 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-primary py-[10px] text-[13.5px] font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save and continue"}
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="rounded-xl border border-soft px-4 py-[10px] text-[13.5px] font-medium text-ink-soft"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}