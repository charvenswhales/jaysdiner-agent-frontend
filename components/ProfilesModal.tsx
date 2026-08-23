"use client";

import { useState } from "react";
import type { CheckoutProfile, CheckoutProfileInput } from "@/lib/useProfiles";

const EMPTY_FORM: CheckoutProfileInput = {
  label: "Home",
  full_name: "",
  phone: "",
  address: "",
  area: "",
  delivery_or_pickup: "delivery",
};

const AREAS = ["Chevron", "Osapa", "Ikate", "Lekki Phase 1", "Victoria Island", "Ikoyi"];

export default function ProfilesModal({
  profiles,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  onSetDefault,
}: {
  profiles: CheckoutProfile[];
  onClose: () => void;
  onCreate: (input: CheckoutProfileInput) => Promise<void>;
  onUpdate: (id: string, input: Partial<CheckoutProfileInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CheckoutProfileInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const startCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError(null);
  };

  const startEdit = (p: CheckoutProfile) => {
    setForm({
      label: p.label,
      full_name: p.full_name,
      phone: p.phone,
      address: p.address || "",
      area: p.area || "",
      delivery_or_pickup: p.delivery_or_pickup,
    });
    setEditingId(p.id);
    setShowForm(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (editingId) {
        await onUpdate(editingId, form);
      } else {
        await onCreate(form);
      }
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-6"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-[440px] overflow-y-auto rounded-2xl border border-soft bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-ink">Saved addresses</h2>
          <button type="button" onClick={onClose} className="text-ink-faint hover:text-ink">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M4 4L14 14M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {!showForm && (
          <>
            <div className="flex flex-col gap-2.5">
              {profiles.length === 0 && (
                <p className="py-4 text-center text-[13px] text-ink-faint">
                  No saved addresses yet.
                </p>
              )}
              {profiles.map((p) => (
                <div key={p.id} className="rounded-xl border border-soft bg-bg p-3.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-medium text-ink">{p.label}</span>
                      {p.is_default && (
                        <span className="rounded-full bg-teal-bg px-2 py-[2px] text-[10.5px] font-medium text-teal">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="text-[12px] font-medium text-primary"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(p.id)}
                        className="text-[12px] font-medium text-coral"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-[12.5px] text-ink-soft">
                    {p.full_name} · {p.phone}
                  </p>
                  {p.address && (
                    <p className="text-[12.5px] text-ink-soft">
                      {p.address}
                      {p.area ? `, ${p.area}` : ""}
                    </p>
                  )}
                  {!p.is_default && (
                    <button
                      type="button"
                      onClick={() => onSetDefault(p.id)}
                      className="mt-2 text-[12px] font-medium text-ink-faint underline underline-offset-2"
                    >
                      Set as default
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={startCreate}
              className="mt-4 w-full rounded-xl border border-dashed border-soft py-2.5 text-[13px] font-medium text-ink-soft transition-colors hover:border-primary hover:text-primary"
            >
              + Add new address
            </button>
          </>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              required
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Label (e.g. Home, Office)"
              className="rounded-xl border border-soft bg-bg px-4 py-[10px] text-[14px] text-ink outline-none placeholder:text-ink-faint focus:border-primary"
            />
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
                {submitting ? "Saving…" : editingId ? "Save changes" : "Add address"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-soft px-4 py-[10px] text-[13.5px] font-medium text-ink-soft"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}