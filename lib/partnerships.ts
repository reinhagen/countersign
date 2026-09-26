import { ActivityEntry, AgreementItem, ItemStatus } from "./types";
import { effectiveDueDate, effectiveOwnerLabel, effectiveOwnerSide, isDiverged, isLocked } from "./itemStatus";

export type PartnershipStatus = "countersigned" | "needs_attention" | "awaiting";

export interface PartnershipLike {
  id: string;
  orgA: string;
  orgB: string;
  items: AgreementItem[];
  statuses: Record<string, ItemStatus>;
  activity: ActivityEntry[];
  createdAt: number;
}

export interface NextDue {
  text: string;
  ownerLabel: string;
  dueDate: string;
  overdue: boolean;
}

export interface PartnershipSummary {
  id: string;
  orgA: string;
  orgB: string;
  partnerName: string;
  status: PartnershipStatus;
  itemsLocked: number;
  itemsTotal: number;
  nextDue: NextDue | null;
  lastActivityAt: number | null;
  isSample: boolean;
  roomUrl: string | null;
}

export interface CommitmentRow {
  partnershipId: string;
  partnershipName: string;
  text: string;
  dueDate: string | null;
  overdue: boolean;
  direction: "we_owe" | "waiting_on_them";
  done: boolean;
  roomUrl: string | null;
  isSample: boolean;
}

export function isOverdue(dueDate: string): boolean {
  const parsed = Date.parse(dueDate);
  if (isNaN(parsed)) return false;
  return parsed < Date.now();
}

export function computePartnershipStatus(
  items: AgreementItem[],
  statuses: Record<string, ItemStatus>
): PartnershipStatus {
  if (items.length === 0) return "awaiting";
  const allLocked = items.every((i) => statuses[i.id] && isLocked(statuses[i.id]));
  if (allLocked) return "countersigned";
  const needsAttention = items.some((i) => {
    const s = statuses[i.id];
    return s && isDiverged(s) && (s.aConfirmed || s.bConfirmed);
  });
  return needsAttention ? "needs_attention" : "awaiting";
}

export function nextDueCommitment(
  items: AgreementItem[],
  statuses: Record<string, ItemStatus>,
  orgA: string,
  orgB: string
): NextDue | null {
  const candidates: NextDue[] = [];
  for (const item of items) {
    const status = statuses[item.id];
    if (!status || status.done) continue;
    const dueDate = effectiveDueDate(item, status);
    if (!dueDate) continue;
    const ownerLabel = effectiveOwnerLabel(item, status, orgA, orgB);
    candidates.push({ text: item.text, ownerLabel: ownerLabel ?? "Unassigned", dueDate, overdue: isOverdue(dueDate) });
  }
  candidates.sort((a, b) => {
    const pa = Date.parse(a.dueDate);
    const pb = Date.parse(b.dueDate);
    if (!isNaN(pa) && !isNaN(pb)) return pa - pb;
    return a.dueDate.localeCompare(b.dueDate);
  });
  return candidates[0] ?? null;
}

export function lastActivityAt(activity: ActivityEntry[]): number | null {
  if (activity.length === 0) return null;
  return activity.reduce((max, e) => Math.max(max, e.timestamp), 0);
}

export function summarizePartnership(
  p: PartnershipLike,
  opts: { isSample: boolean; roomUrl: string | null }
): PartnershipSummary {
  const itemsLocked = p.items.filter((i) => p.statuses[i.id] && isLocked(p.statuses[i.id])).length;
  return {
    id: p.id,
    orgA: p.orgA,
    orgB: p.orgB,
    partnerName: p.orgB,
    status: computePartnershipStatus(p.items, p.statuses),
    itemsLocked,
    itemsTotal: p.items.length,
    nextDue: nextDueCommitment(p.items, p.statuses, p.orgA, p.orgB),
    lastActivityAt: lastActivityAt(p.activity),
    isSample: opts.isSample,
    roomUrl: opts.roomUrl,
  };
}

export function collectCommitments(
  p: PartnershipLike,
  opts: { isSample: boolean; roomUrl: string | null }
): CommitmentRow[] {
  const rows: CommitmentRow[] = [];
  for (const item of p.items) {
    const status = p.statuses[item.id];
    if (!status || !isLocked(status)) continue;
    const ownerSide = effectiveOwnerSide(item, status, p.orgA, p.orgB);
    if (!ownerSide) continue;
    const dueDate = effectiveDueDate(item, status);
    rows.push({
      partnershipId: p.id,
      partnershipName: p.orgB,
      text: item.text,
      dueDate,
      overdue: dueDate ? !status.done && isOverdue(dueDate) : false,
      direction: ownerSide === "A" ? "we_owe" : "waiting_on_them",
      done: Boolean(status.done),
      roomUrl: opts.roomUrl,
      isSample: opts.isSample,
    });
  }
  return rows;
}

export function sortCommitments(rows: CommitmentRow[]): CommitmentRow[] {
  return [...rows].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    const pa = Date.parse(a.dueDate);
    const pb = Date.parse(b.dueDate);
    if (!isNaN(pa) && !isNaN(pb)) return pa - pb;
    return a.dueDate.localeCompare(b.dueDate);
  });
}
