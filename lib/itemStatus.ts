import { AgreementItem, ItemStatus } from "./types";

export function initialStatusFor(item: AgreementItem): ItemStatus {
  const aText = (item.category === "ambiguous" ? item.side_a_version : null) ?? item.text;
  const bText = (item.category === "ambiguous" ? item.side_b_version : null) ?? item.text;
  return { aConfirmed: false, bConfirmed: false, aText, bText, softAskDecision: null };
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
