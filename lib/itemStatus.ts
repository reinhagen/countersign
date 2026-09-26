import { ActivityEntry, AgreementItem, ItemStatus, Side, SoftAskDecision } from "./types";

export function initialStatusFor(item: AgreementItem): ItemStatus {
  const aText = (item.category === "ambiguous" ? item.side_a_version : null) ?? item.text;
  const bText = (item.category === "ambiguous" ? item.side_b_version : null) ?? item.text;
  return {
    aConfirmed: false,
    bConfirmed: false,
    aText,
    bText,
    softAskDecision: null,
    commitmentOwner: null,
    commitmentDueDate: null,
    done: false,
    aSignedAt: null,
    bSignedAt: null,
    proposedBy: null,
  };
}

export function textsMatch(status: ItemStatus): boolean {
  return status.aText.trim() === status.bText.trim();
}

export function isLocked(status: ItemStatus): boolean {
  return status.aConfirmed && status.bConfirmed && textsMatch(status);
}

export function isDiverged(status: ItemStatus): boolean {
  return !textsMatch(status);
}

export function otherSide(side: Side): Side {
  return side === "A" ? "B" : "A";
}

export function isConfirmedBy(status: ItemStatus, side: Side): boolean {
  return side === "A" ? status.aConfirmed : status.bConfirmed;
}

export function signedAtFor(status: ItemStatus, side: Side): number | null {
  return (side === "A" ? status.aSignedAt : status.bSignedAt) ?? null;
}

/** True once either side has proposed a single clarified version for a divergent item. */
export function hasProposal(status: ItemStatus): boolean {
  return Boolean(status.proposedBy);
}

// --- Pure mutators, shared between the local demo-mode reducer and the room action API ---

export function applyConfirm(status: ItemStatus, side: Side): ItemStatus {
  const now = Date.now();
  return {
    ...status,
    aConfirmed: side === "A" ? true : status.aConfirmed,
    bConfirmed: side === "B" ? true : status.bConfirmed,
    aSignedAt: side === "A" ? now : status.aSignedAt,
    bSignedAt: side === "B" ? now : status.bSignedAt,
  };
}

/**
 * Editing always proposes a single clarified version for BOTH sides — this is
 * how a two-version (ambiguous, or any other) mismatch gets resolved. The
 * proposer is auto-signed; the other side's prior signature is cleared so
 * they can review and either sign as-is or counter-propose.
 */
export function applyEdit(status: ItemStatus, side: Side, newText: string): ItemStatus {
  const now = Date.now();
  return {
    ...status,
    aText: newText,
    bText: newText,
    aConfirmed: side === "A",
    bConfirmed: side === "B",
    aSignedAt: side === "A" ? now : null,
    bSignedAt: side === "B" ? now : null,
    proposedBy: side,
  };
}

/**
 * One-time repair for rooms saved before the propose/accept flow existed,
 * where both sides could independently sign two different versions of the
 * same item and it would never lock. Only fires for genuinely *stuck* items
 * — at least one side already signed under the old broken logic — not for a
 * freshly reconciled ambiguous item that's simply awaiting its first
 * proposal (that's normal, expected divergence, not a bug to repair).
 * Treats whichever side has the most recent activity for this item
 * (preferring an explicit edit) as the proposer, and adopts their text as
 * the single proposed version.
 */
export function migrateStatusIfDiverged(
  status: ItemStatus,
  activity: ActivityEntry[],
  itemId: string
): ItemStatus {
  const stuck = isDiverged(status) && !status.proposedBy && (status.aConfirmed || status.bConfirmed);
  if (!stuck) return status;

  const forItem = activity.filter((e) => e.itemId === itemId);
  const editEntries = forItem.filter((e) => e.action === "edited").sort((a, b) => b.timestamp - a.timestamp);
  const anyEntries = [...forItem].sort((a, b) => b.timestamp - a.timestamp);

  const side: Side = editEntries[0]?.side ?? anyEntries[0]?.side ?? "A";
  const proposedText = side === "A" ? status.aText : status.bText;
  return applyEdit(status, side, proposedText);
}

export function applySoftAskDecision(
  status: ItemStatus,
  decision: SoftAskDecision,
  raisedBy: Side | null | undefined
): ItemStatus {
  const commitmentOwner = decision === "request" && raisedBy ? otherSide(raisedBy) : null;
  return { ...status, softAskDecision: decision, commitmentOwner };
}

export function applySetCommitmentDueDate(status: ItemStatus, dueDate: string): ItemStatus {
  return { ...status, commitmentDueDate: dueDate || null };
}

export function applyToggleDone(status: ItemStatus): ItemStatus {
  return { ...status, done: !status.done };
}

/** Best-effort match of a free-text owner string (e.g. "Priya (Wildframe)") to a side. */
export function ownerSideFromText(ownerText: string | null | undefined, orgA: string, orgB: string): Side | null {
  if (!ownerText) return null;
  const lower = ownerText.toLowerCase();
  const a = orgA.trim().toLowerCase();
  const b = orgB.trim().toLowerCase();
  if (a && lower.includes(a)) return "A";
  if (b && lower.includes(b)) return "B";
  return null;
}

/** The side responsible for an item: an explicit commitment owner wins, else inferred from the owner text. */
export function effectiveOwnerSide(item: AgreementItem, status: ItemStatus, orgA: string, orgB: string): Side | null {
  if (status.commitmentOwner) return status.commitmentOwner;
  return ownerSideFromText(item.owner, orgA, orgB);
}

export function effectiveDueDate(item: AgreementItem, status: ItemStatus): string | null {
  return status.commitmentDueDate ?? item.due_date ?? null;
}

export function commitmentsCount(
  items: AgreementItem[],
  statuses: Record<string, ItemStatus>,
  viewingAs: Side,
  orgA: string,
  orgB: string
): number {
  let count = 0;
  for (const item of items) {
    const status = statuses[item.id];
    if (!status) continue;
    if (isLocked(status)) {
      const side = effectiveOwnerSide(item, status, orgA, orgB);
      if (side === viewingAs || side === otherSide(viewingAs)) count++;
    } else if (!isConfirmedBy(status, viewingAs)) {
      count++;
    }
  }
  return count;
}

export function effectiveOwnerLabel(
  item: AgreementItem,
  status: ItemStatus,
  orgA: string,
  orgB: string
): string | null {
  if (status.commitmentOwner) return status.commitmentOwner === "A" ? orgA : orgB;
  return item.owner;
}
