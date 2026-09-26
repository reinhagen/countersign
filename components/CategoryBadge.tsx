import { Category } from "@/lib/types";

const STYLES: Record<Category, { label: string; classes: string }> = {
  agreed: { label: "Agreed", classes: "bg-sage-bg text-sage border-sage-border" },
  ambiguous: { label: "Ambiguous", classes: "bg-amber-bg text-amber border-amber-border" },
  one_sided: { label: "One-sided", classes: "bg-slate-bg text-slate border-slate-border" },
  soft_ask: { label: "Soft ask", classes: "bg-plum-bg text-plum border-plum-border" },
};

export default function CategoryBadge({ category }: { category: Category }) {
  const s = STYLES[category];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${s.classes}`}
    >
      {s.label}
    </span>
  );
}
