"use client";

import { AgreementItem, ItemStatus, SoftAskDecision } from "@/lib/types";
import ItemCard from "./ItemCard";

interface Props {
  items: AgreementItem[];
  statuses: Record<string, ItemStatus>;
  viewingAs: "A" | "B";
  orgA: string;
  orgB: string;
  onSetViewingAs: (v: "A" | "B") => void;
  onConfirm: (id: string) => void;
  onSaveEdit: (id: string, newText: string) => void;
  onSoftAskDecision: (id: string, decision: SoftAskDecision) => void;
  onGenerateBrief: () => void;
  briefLoading: boolean;
  onBack: () => void;
}

const CATEGORY_ORDER: AgreementItem["category"][] = ["agreed", "mismatch", "one_sided", "soft_ask"];
const CATEGORY_TITLES: Record<AgreementItem["category"], string> = {
  agreed: "Agreed",
  mismatch: "Mismatches",
  one_sided: "One-sided",
  soft_ask: "Soft asks",
};

export default function AgreementBoard({
  items,
  statuses,
  viewingAs,
  orgA,
  orgB,
  onSetViewingAs,
  onConfirm,
  onSaveEdit,
  onSoftAskDecision,
  onGenerateBrief,
  briefLoading,
  onBack,
}: Props) {
  const lockedCount = items.filter((i) => statuses[i.id]?.aConfirmed && statuses[i.id]?.bConfirmed).length;
  const allLocked = lockedCount === items.length && items.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <button onClick={onBack} className="mb-2 text-xs font-medium text-ink/40 hover:text-ink/70">
            &larr; Back to notes
          </button>
          <h1 className="font-serif text-2xl font-semibold text-ink">
            {orgA} <span className="text-ink/30">&times;</span> {orgB}
          </h1>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-ink/10 bg-white p-1 shadow-sm">
          <button
            onClick={() => onSetViewingAs("A")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              viewingAs === "A" ? "bg-ink text-white" : "text-ink/60 hover:text-ink"
            }`}
          >
            Viewing as {orgA}
          </button>
          <button
            onClick={() => onSetViewingAs("B")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              viewingAs === "B" ? "bg-ink text-white" : "text-ink/60 hover:text-ink"
            }`}
          >
            Viewing as {orgB}
          </button>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex-1 min-w-[220px]">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-ink/70">
              {lockedCount} of {items.length} items countersigned
            </span>
            <span className="text-ink/40">{items.length > 0 ? Math.round((lockedCount / items.length) * 100) : 0}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${items.length > 0 ? (lockedCount / items.length) * 100 : 0}%` }}
            />
          </div>
        </div>
        <button
          onClick={onGenerateBrief}
          disabled={!allLocked || briefLoading}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/25"
        >
          {briefLoading ? "Generating brief…" : "Generate team brief"}
        </button>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        if (catItems.length === 0) return null;
        return (
          <div key={cat} className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">
              {CATEGORY_TITLES[cat]} ({catItems.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {catItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  status={
                    statuses[item.id] ?? { aConfirmed: false, bConfirmed: false, softAskDecision: null }
                  }
                  viewingAs={viewingAs}
                  orgA={orgA}
                  orgB={orgB}
                  onConfirm={() => onConfirm(item.id)}
                  onSaveEdit={(text) => onSaveEdit(item.id, text)}
                  onSoftAskDecision={(decision) => onSoftAskDecision(item.id, decision)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
