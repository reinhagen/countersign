"use client";

import { AgreementItem, ItemStatus, SoftAskDecision } from "@/lib/types";
import { initialStatusFor, isLocked } from "@/lib/itemStatus";
import ItemCard from "./ItemCard";

interface Props {
  items: AgreementItem[];
  statuses: Record<string, ItemStatus>;
  viewingAs: "A" | "B";
  orgA: string;
  orgB: string;
  onConfirm: (id: string) => void;
  onSaveEdit: (id: string, newText: string) => void;
  onSoftAskDecision: (id: string, decision: SoftAskDecision) => void;
  onSetCommitmentDueDate: (id: string, dueDate: string) => void;
  onGenerateBrief: () => void;
  briefLoading: boolean;
}

const CATEGORY_ORDER: AgreementItem["category"][] = ["agreed", "ambiguous", "one_sided", "soft_ask"];
const CATEGORY_TITLES: Record<AgreementItem["category"], string> = {
  agreed: "Agreed",
  ambiguous: "Ambiguous",
  one_sided: "One-sided",
  soft_ask: "Soft asks",
};

export default function AgreementBoard({
  items,
  statuses,
  viewingAs,
  orgA,
  orgB,
  onConfirm,
  onSaveEdit,
  onSoftAskDecision,
  onSetCommitmentDueDate,
  onGenerateBrief,
  briefLoading,
}: Props) {
  const lockedCount = items.filter((i) => statuses[i.id] && isLocked(statuses[i.id])).length;
  const allLocked = lockedCount === items.length && items.length > 0;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-navy/10 bg-white p-5 shadow-hairline">
        <div className="min-w-[220px] flex-1">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-navy/70">
              {lockedCount} of {items.length} items countersigned
            </span>
            <span className="text-navy/40">{items.length > 0 ? Math.round((lockedCount / items.length) * 100) : 0}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
            <div
              className="h-full rounded-full bg-gold transition-all duration-500"
              style={{ width: `${items.length > 0 ? (lockedCount / items.length) * 100 : 0}%` }}
            />
          </div>
        </div>
        <button
          onClick={onGenerateBrief}
          disabled={!allLocked || briefLoading}
          className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white shadow-hairline transition hover:bg-navy-light disabled:cursor-not-allowed disabled:bg-navy/25"
        >
          {briefLoading ? "Generating brief…" : "Generate team brief"}
        </button>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        if (catItems.length === 0) return null;
        return (
          <div key={cat} className="mb-8">
            <h2 className="tracking-caps mb-3 text-xs font-semibold text-navy/45">
              {CATEGORY_TITLES[cat]} ({catItems.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {catItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  status={statuses[item.id] ?? initialStatusFor(item)}
                  viewingAs={viewingAs}
                  orgA={orgA}
                  orgB={orgB}
                  onConfirm={() => onConfirm(item.id)}
                  onSaveEdit={(text) => onSaveEdit(item.id, text)}
                  onSoftAskDecision={(decision) => onSoftAskDecision(item.id, decision)}
                  onSetCommitmentDueDate={(dueDate) => onSetCommitmentDueDate(item.id, dueDate)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
