"use client";

import { useState } from "react";
import { AgreementItem, ItemStatus, SoftAskDecision } from "@/lib/types";
import CategoryBadge from "./CategoryBadge";

interface Props {
  item: AgreementItem;
  status: ItemStatus;
  viewingAs: "A" | "B";
  orgA: string;
  orgB: string;
  onConfirm: () => void;
  onSaveEdit: (newText: string) => void;
  onSoftAskDecision: (decision: SoftAskDecision) => void;
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
}: Props) {
  const locked = status.aConfirmed && status.bConfirmed;
  const myConfirmed = viewingAs === "A" ? status.aConfirmed : status.bConfirmed;
  const myVersion = (viewingAs === "A" ? item.side_a_version : item.side_b_version) ?? item.text;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(myVersion);

  const borderTint =
    item.category === "agreed"
      ? "border-l-emerald-400"
      : item.category === "mismatch"
      ? "border-l-amber-400"
      : item.category === "one_sided"
      ? "border-l-sky-400"
      : "border-l-violet-400";

  return (
    <div
      className={`rounded-xl border border-ink/10 border-l-4 bg-white p-5 shadow-sm ${borderTint} ${
        locked ? "opacity-90" : ""
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <CategoryBadge category={item.category} />
        {locked ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            <LockIcon /> Countersigned
          </span>
        ) : (
          <span className="text-xs text-ink/40">
            {status.aConfirmed ? `${orgA} ✓` : `${orgA} pending`} &middot;{" "}
            {status.bConfirmed ? `${orgB} ✓` : `${orgB} pending`}
          </span>
        )}
      </div>

      <p className="mb-3 text-sm font-medium leading-relaxed text-ink">{item.text}</p>

      {item.category === "mismatch" ? (
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-ink/[0.03] p-3">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/40">{orgA} said</div>
            <div className="text-sm text-ink/80">{item.side_a_version ?? "—"}</div>
          </div>
          <div className="rounded-lg bg-ink/[0.03] p-3">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/40">{orgB} said</div>
            <div className="text-sm text-ink/80">{item.side_b_version ?? "—"}</div>
          </div>
        </div>
      ) : item.category === "one_sided" ? (
        <div className="mb-3 rounded-lg bg-ink/[0.03] p-3 text-sm text-ink/80">
          Only recorded by {item.side_a_version ? orgA : orgB}:{" "}
          {item.side_a_version ?? item.side_b_version}
        </div>
      ) : null}

      {item.category === "soft_ask" && item.clarification_question && (
        <div className="mb-3 rounded-lg bg-violet-50 p-3">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-700/70">
            Raised as a question
          </div>
          <div className="mb-3 text-sm italic text-violet-900">&ldquo;{item.clarification_question}&rdquo;</div>
          <div className="flex gap-2">
            <button
              onClick={() => onSoftAskDecision("request")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                status.softAskDecision === "request"
                  ? "bg-violet-700 text-white"
                  : "border border-violet-300 text-violet-700 hover:bg-violet-100"
              }`}
            >
              It&apos;s a request
            </button>
            <button
              onClick={() => onSoftAskDecision("question")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                status.softAskDecision === "question"
                  ? "bg-ink text-white"
                  : "border border-ink/20 text-ink/70 hover:bg-ink/5"
              }`}
            >
              Just asking
            </button>
          </div>
        </div>
      )}

      {(item.owner || item.due_date) && (
        <div className="mb-3 flex flex-wrap gap-3 text-xs text-ink/50">
          {item.owner && <span>Owner: {item.owner}</span>}
          {item.due_date && <span>Due: {item.due_date}</span>}
        </div>
      )}

      {!locked && editing && (
        <div className="mt-3 border-t border-ink/10 pt-3">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">
            Your version ({viewingAs === "A" ? orgA : orgB})
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="mb-2 h-20 w-full resize-none rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-ink/40 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                onSaveEdit(draft);
                setEditing(false);
              }}
              className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white hover:bg-ink/90"
            >
              Save
            </button>
            <button
              onClick={() => {
                setDraft(myVersion);
                setEditing(false);
              }}
              className="rounded-full border border-ink/15 px-4 py-1.5 text-xs font-semibold text-ink/70 hover:bg-ink/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!locked && !editing && (
        <div className="mt-3 flex gap-2 border-t border-ink/10 pt-3">
          <button
            onClick={onConfirm}
            disabled={myConfirmed}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              myConfirmed
                ? "cursor-default bg-emerald-100 text-emerald-700"
                : "bg-ink text-white hover:bg-ink/90"
            }`}
          >
            {myConfirmed ? "You confirmed" : "Confirm"}
          </button>
          <button
            onClick={() => {
              setDraft(myVersion);
              setEditing(true);
            }}
            className="rounded-full border border-ink/15 px-4 py-1.5 text-xs font-semibold text-ink/70 hover:bg-ink/5"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
