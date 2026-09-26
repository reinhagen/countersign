"use client";

interface Props {
  orgA: string;
  orgB: string;
  itemCount: number;
  creating: boolean;
  error: string | null;
  onCreateRoom: () => void;
  onUseDemoMode: () => void;
  showDemoFallback: boolean;
}

export default function CreateRoomScreen({
  orgA,
  orgB,
  itemCount,
  creating,
  error,
  onCreateRoom,
  onUseDemoMode,
  showDemoFallback,
}: Props) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold-dark shadow-hairline">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8 12.5l2.6 2.6L16.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Analysis complete
      </div>
      <h1 className="mb-3 font-serif text-3xl font-semibold tracking-wide text-navy">
        {orgA} <span className="text-gold">&times;</span> {orgB}
      </h1>
      <p className="mx-auto mb-10 max-w-lg text-sm leading-relaxed text-navy/60">
        Countersign found {itemCount} item{itemCount === 1 ? "" : "s"} to reconcile. Create a shared room so each
        side can review and sign from their own device &mdash; no account needed.
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-amber-border bg-amber-bg px-4 py-3 text-sm text-amber">
          {error}
        </div>
      )}

      <button
        onClick={onCreateRoom}
        disabled={creating}
        className="rounded-lg bg-navy px-10 py-3.5 font-serif text-base font-semibold tracking-wide text-white shadow-hairline transition hover:bg-navy-light disabled:cursor-not-allowed disabled:bg-navy/25"
      >
        {creating ? "Creating room…" : "Create shared room"}
      </button>

      {showDemoFallback && (
        <div className="mt-8 border-t border-gold/20 pt-6">
          <button
            onClick={onUseDemoMode}
            className="text-sm font-medium text-navy/55 underline decoration-gold/40 underline-offset-4 hover:text-navy"
          >
            Demo mode (both sides on one screen) instead
          </button>
        </div>
      )}
    </div>
  );
}
