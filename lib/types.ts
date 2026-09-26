export type Category = "agreed" | "ambiguous" | "one_sided" | "soft_ask";

export interface AgreementItem {
  id: string;
  text: string;
  category: Category;
  side_a_version: string | null;
  side_b_version: string | null;
  owner: string | null;
  due_date: string | null;
  clarification_question?: string | null;
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
}

export interface BriefResult {
  brief: string;
}
