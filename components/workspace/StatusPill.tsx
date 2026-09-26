import { PartnershipStatus } from "@/lib/partnerships";

const STYLES: Record<PartnershipStatus, { label: string; classes: string }> = {
  countersigned: { label: "Countersigned", classes: "bg-sage-bg text-sage border-sage-border" },
  needs_attention: { label: "Needs attention", classes: "bg-crimson/10 text-crimson border-crimson/25" },
  awaiting: { label: "Awaiting signatures", classes: "bg-slate-bg text-slate border-slate-border" },
};

export default function StatusPill({ status }: { status: PartnershipStatus }) {
  const s = STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${s.classes}`}
    >
      {s.label}
    </span>
  );
}
