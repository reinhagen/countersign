import { Category } from "@/lib/types";

const STYLES: Record<Category, { label: string; classes: string }> = {
  agreed: { label: "Agreed", classes: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  ambiguous: { label: "Ambiguous", classes: "bg-amber-50 text-amber-800 border-amber-200" },
  one_sided: { label: "One-sided", classes: "bg-sky-50 text-sky-800 border-sky-200" },
  soft_ask: { label: "Soft ask", classes: "bg-violet-50 text-violet-800 border-violet-200" },
};

export default function CategoryBadge({ category }: { category: Category }) {
  const s = STYLES[category];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.classes}`}>
      {s.label}
    </span>
  );
}
