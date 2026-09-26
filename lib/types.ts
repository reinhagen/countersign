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
  /** Epoch ms when each side last signed; cleared when that side's text is edited. */
  aSignedAt?: number | null;
  bSignedAt?: number | null;
  /** Set once either side has proposed a single clarified version of a divergent item. */
  proposedBy?: Side | null;
}

export interface BriefResult {
  brief: string;
}

export type ActivityAction =
  | "room_created"
  | "signed"
  | "edited"
  | "marked_request"
  | "marked_question"
  | "set_due_date"
  | "toggled_done"
  | "generated_brief";

export interface ActivityEntry {
  id: string;
  side: Side;
  action: ActivityAction;
  itemId?: string;
  itemText?: string;
  detail?: string;
  timestamp: number;
}

export interface RoomData {
  id: string;
  orgA: string;
  orgB: string;
  transcript: string;
  items: AgreementItem[];
  statuses: Record<string, ItemStatus>;
  activity: ActivityEntry[];
  brief: string | null;
  createdAt: number;
  tokens: { A: string; B: string };
}

/** What a room-scoped API response exposes to a caller identified by their key — never the tokens. */
export interface RoomView {
  side: Side;
  orgA: string;
  orgB: string;
  items: AgreementItem[];
  statuses: Record<string, ItemStatus>;
  activity: ActivityEntry[];
  brief: string | null;
}
