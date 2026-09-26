export type Category = "agreed" | "ambiguous" | "one_sided" | "soft_ask";

export type Side = "A" | "B";

export interface AgreementItem {
  id: string;
  text: string;
  category: Category;
  side_a_version: string | null;
  side_b_version: string | null;
  owner: string | null;
  due_date: string | null;
  clarification_question?: string | null;
  /** For soft_ask items: which side voiced the ask. */
  raised_by?: Side | null;
}

export interface ReconcileResult {
  items: AgreementItem[];
}

export type SoftAskDecision = "request" | "question" | null;

export interface ItemStatus {
  aConfirmed: boolean;
  bConfirmed: boolean;
  aText: string;
  bText: string;
  softAskDecision?: SoftAskDecision;
  /** Set once a soft ask is marked "It's a request": the side who owes it. */
  commitmentOwner?: Side | null;
  commitmentDueDate?: string | null;
  done?: boolean;
}

export interface BriefResult {
  brief: string;
}
