"use client";

import { AgreementItem, ItemStatus, Side } from "@/lib/types";
import { effectiveDueDate, effectiveOwnerSide, isConfirmedBy, isLocked, otherSide } from "@/lib/itemStatus";
import CategoryBadge from "../CategoryBadge";

interface Props {
  items: AgreementItem[];
  statuses: Record<string, ItemStatus>;
  mySide: Side;
  orgA: string;
  orgB: string;
  onConfirm: (id: string) => void;
  onToggleDone: (id: string) => void;
}

interface Row {
  item: AgreementItem;
  status: ItemStatus;
}

function sortByDueDate(rows: Row[]): Row[] {
  return [...rows].sort((a, b) => {
    const da = effectiveDueDate(a.item, a.status);
    const db = effectiveDueDate(b.item, b.status);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    const pa = Date.parse(da);
    const pb = Date.parse(db);
    if (!isNaN(pa) && !isNaN(pb)) return pa - pb;
    return da.localeCompare(db);
  });
}

export default function RoomCommitments({ items, statuses, mySide, orgA, orgB, onConfirm, onToggleDone }: Props) {
  const rows: Row[] = items.map((item) => ({ item, status: statuses[item.id] }));
  const myOrgName = mySide === "A" ? orgA : orgB;
  const otherOrgName = mySide === "A" ? orgB : orgA;

  const owe = sortByDueDate(
    rows.filter(
      ({ item, status }) => status && isLocked(status) && effectiveOwnerSide(item, status, orgA, orgB) === mySide
    )
  );
  const waitingOn = sortByDueDate(
    rows.filter(
      ({ item, status }) =>
        status && isLocked(status) && effectiveOwnerSide(item, status, orgA, orgB) === otherSide(mySide)
    )
  );
  const needsSignature = rows.filter(({ status }) => status && !isLocked(status) && !isConfirmedBy(status, mySide));

  return (
    <div className="space-y-10">
      <Section title={`${myOrgName} owes`} subtitle="Countersigned commitments your side is responsible for">
        {owe.length === 0 ? (
          <EmptyRow text="Nothing owed yet." />
        ) : (
          owe.map(({ item, status }) => (
            <CommitmentRow
              key={item.id}
              item={item}
              status={status}
              showCheckbox
              onToggleDone={() => onToggleDone(item.id)}
            />
          ))
        )}
      </Section>

      <Section title={`Waiting on ${otherOrgName}`} subtitle="Countersigned commitments the other side is responsible for">
        {waitingOn.length === 0 ? (
          <EmptyRow text="Nothing pending from the other side." />
        ) : (
          waitingOn.map(({ item, status }) => <CommitmentRow key={item.id} item={item} status={status} />)
        )}
      </Section>

      <Section title={`Needs ${myOrgName}'s signature`} subtitle="Items your side hasn't confirmed yet">
        {needsSignature.length === 0 ? (
          <EmptyRow text="Everything is signed on your side." />
        ) : (
          needsSignature.map(({ item }) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-navy/10 bg-white px-4 py-3 shadow-hairline"
            >
              <div className="flex items-center gap-3">
                <CategoryBadge category={item.category} />
                <span className="text-sm text-navy">{item.text}</span>
              </div>
              <button
                onClick={() => onConfirm(item.id)}
                className="rounded-full bg-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-navy-light"
              >
                Sign as {myOrgName}
              </button>
            </div>
          ))
        )}
      </Section>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-lg font-semibold tracking-wide text-navy">{title}</h2>
      <p className="tracking-caps mb-3 text-[11px] text-navy/40">{subtitle}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-navy/15 px-4 py-3 text-sm text-navy/40">{text}</p>;
}

function CommitmentRow({
  item,
  status,
  showCheckbox,
  onToggleDone,
}: {
  item: AgreementItem;
  status: ItemStatus;
  showCheckbox?: boolean;
  onToggleDone?: () => void;
}) {
  const dueDate = effectiveDueDate(item, status);
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-navy/10 bg-white px-4 py-3 shadow-hairline ${
        status.done ? "opacity-50" : ""
      }`}
    >
      {showCheckbox && (
        <input
          type="checkbox"
          checked={Boolean(status.done)}
          onChange={onToggleDone}
          className="mt-1 h-4 w-4 shrink-0 accent-gold"
        />
      )}
      <div className="flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <CategoryBadge category={item.category} />
          {dueDate && <span className="text-xs text-navy/50">Due {dueDate}</span>}
        </div>
        <p className={`text-sm text-navy ${status.done ? "line-through" : ""}`}>{item.text}</p>
      </div>
    </div>
  );
}
