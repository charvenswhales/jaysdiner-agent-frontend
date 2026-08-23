function money(n: number): string {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

export function ConfirmPrompt({
  resolved,
  onConfirm,
  onDecline,
}: {
  resolved: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}) {
  if (resolved) return null;
  return (
    <div className="max-w-[320px] rounded-2xl border border-soft bg-amber-bg px-5 py-4">
      <p className="mb-3 text-[13px] font-medium text-amber">Confirm to place this order</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded-full bg-primary px-4 py-[9px] text-[13.5px] font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Yes, place it
        </button>
        <button
          type="button"
          onClick={onDecline}
          className="flex-1 rounded-full border border-soft bg-surface px-4 py-[9px] text-[13.5px] font-medium text-ink-soft"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

export function OrderPlacedCard({
  orderIdentifier,
  totalNgn,
  paymentMethod,
}: {
  orderIdentifier: string;
  totalNgn: number;
  paymentMethod: string;
}) {
  return (
    <div className="max-w-[420px] animate-card-in rounded-2xl border border-soft bg-teal-bg px-5 py-4">
      <p className="mb-1.5 text-[13px] font-medium text-teal">Order confirmed</p>
      <p className="mb-1 font-mono text-lg text-ink">#{orderIdentifier}</p>
      <p className="text-[13px] text-ink-soft">
        {money(totalNgn)} · {paymentMethod} pending
      </p>
    </div>
  );
}

export function OrderFailedCard({ message }: { message: string }) {
  return (
    <div className="max-w-[420px] animate-card-in rounded-2xl border border-soft bg-coral-bg px-5 py-4">
      <p className="mb-1.5 text-[13px] font-medium text-coral">Order failed</p>
      <p className="text-[13px] text-ink-soft">{message}</p>
    </div>
  );
}