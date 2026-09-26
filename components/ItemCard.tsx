"use client";

import { useState } from "react";
import { AgreementItem, ItemStatus, SoftAskDecision } from "@/lib/types";
import { isLocked, isDiverged, effectiveOwnerLabel, effectiveDueDate } from "@/lib/itemStatus";
import CategoryBadge from "./CategoryBadge";
import StatusSeal from "./StatusSeal";

interface Props {
  item: AgreementItem;
  status: ItemStatus;
  viewingAs: "A" | "B";
  orgA: string;
  orgB: string;
  onConfirm: () => void;
  onSaveEdit: (newText: string) => void;
  onSoftAskDecision: (decision: SoftAskDecision) => void;
  onSetCommitmentDueDate: (dueDate: string) => void;
}

export default function ItemCard({
  item,
  status,
  viewingAs,
  orgA,
  orgB,
  onConfirm,
  onSaveEdit,
  onSoftAskDecision,
  onSetCommitmentDueDate,
}: Props) {
  const locked = isLocked(status);
  const diverged = isDiverged(status);
  const myConfirmed = viewingAs === "A" ? status.aConfirmed : status.bConfirmed;
  const myText = viewingAs === "A" ? status.aText : status.bText;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(myText);

  const owner = effectiveOwnerLabel(item, status, orgA, orgB);
  const dueDate = effectiveDueDate(item, status);

  const borderTint = diverged
    ? "border-l-amber"
    : item.category === "one_sided"
    ? "border-l-slate"
    : item.category === "soft_ask"
    ? "border-l-plum"
    : "border-l-sage";

  return (
    <div
      className={`rounded-lg border border-navy/10 border-l-[3px] bg-white p-5 shadow-hairline transition-shadow hover:shadow-card ${borderTint} ${
        locked ? "relative" : ""
      }`}
    >
      {locked && (
        <div className="pointer-events-none absolute right-4 top-4 flex animate-seal-in items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold-dark">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 12.5l2.6 2.6L16.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Countersigned
        </div>
      )}

      <div className="mb-3 flex items-start justify-between gap-3">
        <CategoryBadge category={item.category} />
        <div className="flex items-center gap-3">
          <StatusSeal label={orgA} signed={status.aConfirmed} accent="navy" />
          <StatusSeal label={orgB} signed={status.bConfirmed} accent="gold" />
        </div>
      </div>

      <p className="mb-3 text-sm font-medium leading-relaxed text-navy">{item.text}</p>

      {diverged ? (
        <div className="mb-3">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber">
            {item.category === "ambiguous" && !status.aConfirmed && !status.bConfirmed
              ? "Two possible interpretations"
              : "Mismatch — needs resolution"}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-navy/[0.03] p-3">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-navy/40">{orgA} version</div>
              <div className="text-sm text-navy/80">{status.aText}</div>
            </div>
            <div className="rounded-lg bg-navy/[0.03] p-3">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-navy/40">{orgB} version</div>
              <div className="text-sm text-navy/80">{status.bText}</div>
            </div>
          </div>
        </div>
      ) : null}

      {item.category === "one_sided" && (
        <div className="mb-3 rounded-lg bg-slate-bg p-3 text-sm text-slate">
          Only voiced by {item.side_a_version ? orgA : orgB} on the call — the other side did not respond to it.
        </div>
      )}

      {item.category === "soft_ask" && item.clarification_question && (
        <div className="mb-3 rounded-lg bg-plum-bg p-3">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-plum">Raised as a question</div>
          <div className="mb-3 text-sm italic text-navy/80">&ldquo;{item.clarification_question}&rdquo;</div>
          <div className="mb-2 flex gap-2">
            <button
              onClick={() => onSoftAskDecision("request")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                status.softAskDecision === "request"
                  ? "bg-plum text-white"
                  : "border border-plum/40 text-plum hover:bg-plum/10"
              }`}
            >
              It&apos;s a request
            </button>
            <button
              onClick={() => onSoftAskDecision("question")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                status.softAskDecision === "question"
                  ? "bg-navy text-white"
                  : "border border-navy/20 text-navy/70 hover:bg-navy/5"
              }`}
            >
              Just asking
            </button>
          </div>
          {status.softAskDecision === "request" && (
            <div className="flex flex-wrap items-center gap-2 border-t border-plum/15 pt-2 text-xs text-navy/60">
              <span>
                Owner: <span className="font-medium text-navy">{owner ?? "Unassigned"}</span>
              </span>
              <label className="flex items-center gap-1.5">
                <span>Due date:</span>
                <input
                  type="text"
                  value={status.commitmentDueDate ?? ""}
                  onChange={(e) => onSetCommitmentDueDate(e.target.value)}
                  placeholder="optional"
                  className="w-32 rounded border border-navy/15 px-2 py-1 text-xs focus:border-gold focus:outline-none"
                />
              </label>
            </div>
          )}
        </div>
      )}

      {(owner || dueDate) && !(item.category === "soft_ask" && status.softAskDecision === "request") && (
        <div className="mb-3 flex flex-wrap gap-3 text-xs text-navy/50">
          {owner && <span>Owner: {owner}</span>}
          {dueDate && <span>Due: {dueDate}</span>}
        </div>
      )}

      {!locked && editing && (
        <div className="mt-3 border-t border-gold/20 pt-3">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-navy/40">
            Your version ({viewingAs === "A" ? orgA : orgB})
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="mb-2 h-20 w-full resize-none rounded-lg border border-navy/15 px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                onSaveEdit(draft);
                setEditing(false);
              }}
              className="rounded-full bg-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-navy-light"
            >
              Save
            </button>
            <button
              onClick={() => {
                setDraft(myText);
                setEditing(false);
              }}
              className="rounded-full border border-navy/15 px-4 py-1.5 text-xs font-semibold text-navy/70 hover:bg-navy/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!locked && !editing && (
        <div className="mt-3 flex gap-2 border-t border-gold/20 pt-3">
          <button
            onClick={onConfirm}
            disabled={myConfirmed}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              myConfirmed
                ? "cursor-default bg-sage-bg text-sage"
                : "bg-navy text-white hover:bg-navy-light"
            }`}
          >
            {myConfirmed ? "You confirmed" : "Confirm"}
          </button>
          <button
            onClick={() => {
              setDraft(myText);
              setEditing(true);
            }}
            className="rounded-full border border-navy/15 px-4 py-1.5 text-xs font-semibold text-navy/70 hover:bg-navy/5"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}
