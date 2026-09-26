interface Props {
  label: string;
  signed: boolean;
  accent?: "navy" | "gold";
}

export default function StatusSeal({ label, signed, accent = "navy" }: Props) {
  const ring = accent === "gold" ? "border-gold text-gold" : "border-navy text-navy";
  return (
    <span className="inline-flex items-center gap-1.5" title={`${label}: ${signed ? "signed" : "pending"}`}>
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
          signed ? `${ring} bg-current/10 ${accent === "gold" ? "animate-seal-in" : ""}` : "border-navy/25 text-navy/25"
        }`}
      >
        {signed && (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" className={accent === "gold" ? "text-gold" : "text-navy"}>
            <path d="M4 12.5L9.5 18L20 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-[11px] font-medium uppercase tracking-wide text-navy/50">{label}</span>
    </span>
  );
}
