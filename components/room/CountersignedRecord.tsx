"use client";

import { useState } from "react";
import { AgreementItem, ItemStatus } from "@/lib/types";
import { effectiveDueDate, effectiveOwnerLabel, hasProposal, signedAtFor } from "@/lib/itemStatus";
import { formatDateTime } from "@/lib/format";
import CategoryBadge from "../CategoryBadge";

interface Props {
  orgA: string;
  orgB: string;
  items: AgreementItem[];
  statuses: Record<string, ItemStatus>;
  brief: string | null;
  briefLoading: boolean;
  onGenerateBrief: () => void;
}

export default function CountersignedRecord({
  orgA,
  orgB,
  items,
  statuses,
  brief,
  briefLoading,
  onGenerateBrief,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!brief) return;
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const commitments = items
    .map((item) => {
      const status = statuses[item.id];
      if (!status) return null;
      const ownerLabel = effectiveOwnerLabel(item, status, orgA, orgB);
      const dueDate = effectiveDueDate(item, status);
      if (!ownerLabel) return null;
      return { item, ownerLabel, dueDate };
    })
    .filter((c): c is { item: AgreementItem; ownerLabel: string; dueDate: string | null } => c !== null);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold-dark shadow-hairline">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 12.5l2.6 2.6L16.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Fully countersigned
        </div>
        <button
          onClick={() => window.print()}
          className="rounded-lg border border-navy/15 px-4 py-2 text-sm font-semibold text-navy/70 hover:bg-navy/5"
        >
          Download PDF
        </button>
      </div>

      <div id="record-print-area" className="rounded-lg border border-navy/10 bg-white p-10 shadow-hairline">
        <div className="mb-8 text-center">
          <p className="tracking-caps mb-2 text-xs font-semibold text-gold-dark">Countersigned Record</p>
          <h1 className="font-serif text-3xl font-semibold tracking-wide text-navy">
            {orgA} <span className="text-gold">&times;</span> {orgB}
          </h1>
          <p className="mt-2 text-xs text-navy/40">Generated {formatDateTime(Date.now())}</p>
        </div>

        <div className="space-y-5">
          {items.map((item, idx) => {
            const status = statuses[item.id];
            const aAt = status ? signedAtFor(status, "A") : null;
            const bAt = status ? signedAtFor(status, "B") : null;
            return (
              <div key={item.id} className="border-b border-navy/10 pb-5 last:border-0">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-xs font-medium text-navy/30">#{idx + 1}</span>
                  <CategoryBadge category={item.category} />
                </div>
                <p className="mb-1 text-sm font-medium text-navy">{status ? status.aText : item.text}</p>
                {status && hasProposal(status) && (
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gold-dark">
                    Resolved from ambiguity
                  </p>
                )}
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-navy/50">
                  <span>
                    {orgA} signed {aAt ? formatDateTime(aAt) : "—"}
                  </span>
                  <span>
                    {orgB} signed {bAt ? formatDateTime(bAt) : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {commitments.length > 0 && (
          <div className="mt-8 border-t border-gold/20 pt-6">
            <h2 className="tracking-caps mb-3 text-xs font-semibold text-navy/45">Commitments</h2>
            <ul className="space-y-2">
              {commitments.map(({ item, ownerLabel, dueDate }) => (
                <li key={item.id} className="text-sm text-navy/80">
                  <span className="font-medium text-navy">{ownerLabel}</span> owes: {item.text}
                  {dueDate ? ` (due ${dueDate})` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="no-print mt-8">
        <h2 className="mb-3 font-serif text-lg font-semibold tracking-wide text-navy">Team brief</h2>
        {brief ? (
          <div className="rounded-lg border border-navy/10 bg-white p-6 shadow-hairline">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-navy/85">{brief}</pre>
            <button
              onClick={handleCopy}
              className="mt-4 rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy-light"
            >
              {copied ? "Copied!" : "Copy brief"}
            </button>
          </div>
        ) : (
          <button
            onClick={onGenerateBrief}
            disabled={briefLoading}
            className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white shadow-hairline transition hover:bg-navy-light disabled:cursor-not-allowed disabled:bg-navy/25"
          >
            {briefLoading ? "Generating brief…" : "Generate team brief"}
          </button>
        )}
      </div>
    </div>
  );
}
