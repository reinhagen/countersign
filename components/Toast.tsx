export interface ToastMessage {
  id: number;
  text: string;
  tone?: "navy" | "gold";
}

export default function ToastStack({ toasts }: { toasts: ToastMessage[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="no-print pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-toast-in rounded-lg border px-5 py-2.5 text-sm font-medium shadow-lift ${
            t.tone === "gold"
              ? "border-gold/40 bg-gold text-white"
              : "border-navy/20 bg-navy text-white"
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
