import { AgreementItem, ItemStatus, ActivityEntry } from "./types";

/**
 * Two clearly fictional past partnerships, seeded so the workspace never
 * looks empty in a fresh demo. They are never written to Redis and have no
 * signing tokens — cards for them are informational only, not clickable
 * into a live room.
 */
export interface SamplePartnership {
  id: string;
  orgA: string;
  orgB: string;
  items: AgreementItem[];
  statuses: Record<string, ItemStatus>;
  activity: ActivityEntry[];
  createdAt: number;
  isSample: true;
}

const WF = "Wildframe Media";

function ts(iso: string): number {
  return new Date(iso).getTime();
}

function lockedStatus(text: string, aAt: string, bAt: string): ItemStatus {
  return {
    aConfirmed: true,
    bConfirmed: true,
    aText: text,
    bText: text,
    softAskDecision: null,
    commitmentOwner: null,
    commitmentDueDate: null,
    done: false,
    aSignedAt: ts(aAt),
    bSignedAt: ts(bAt),
  };
}

// --- Northpeak Outdoors: fully countersigned ---

const northpeakItems: AgreementItem[] = [
  {
    id: "np-1",
    text: "Northpeak logo appears in the pre-roll and end card of every episode.",
    category: "agreed",
    side_a_version: null,
    side_b_version: null,
    owner: null,
    due_date: null,
  },
  {
    id: "np-2",
    text: "Northpeak receives first right of refusal on Season 4 sponsorship.",
    category: "agreed",
    side_a_version: null,
    side_b_version: null,
    owner: null,
    due_date: null,
  },
  {
    id: "np-3",
    text: "Payment is a flat $45,000 fee, paid net-30 after final delivery.",
    category: "agreed",
    side_a_version: null,
    side_b_version: null,
    owner: null,
    due_date: null,
  },
  {
    id: "np-4",
    text: "Wildframe offered two bonus unboxing clips for Northpeak's own channel at no additional cost.",
    category: "one_sided",
    side_a_version: "Wildframe offered two bonus unboxing clips at no additional cost.",
    side_b_version: null,
    owner: "Wildframe Media",
    due_date: null,
  },
  {
    id: "np-5",
    text: "Provide raw B-roll footage from the shoot for Northpeak's internal archive.",
    category: "soft_ask",
    side_a_version: null,
    side_b_version: "Northpeak asked for raw B-roll footage for their internal archive.",
    owner: null,
    due_date: null,
    clarification_question: "Would it be possible to get the raw B-roll footage for our internal archive?",
    raised_by: "B",
  },
];

const northpeakStatuses: Record<string, ItemStatus> = {
  "np-1": lockedStatus(northpeakItems[0].text, "2026-09-11T14:02:00", "2026-09-11T16:40:00"),
  "np-2": lockedStatus(northpeakItems[1].text, "2026-09-11T14:03:00", "2026-09-11T16:41:00"),
  "np-3": lockedStatus(northpeakItems[2].text, "2026-09-11T14:04:00", "2026-09-11T16:42:00"),
  "np-4": lockedStatus(northpeakItems[3].text, "2026-09-11T14:05:00", "2026-09-11T16:43:00"),
  "np-5": {
    ...lockedStatus(northpeakItems[4].text, "2026-09-12T09:15:00", "2026-09-12T09:40:00"),
    softAskDecision: "request",
    commitmentOwner: "A",
    commitmentDueDate: "Sep 10, 2026",
    done: true,
  },
};

const northpeakActivity: ActivityEntry[] = [
  { id: "np-a1", side: "A", action: "room_created", timestamp: ts("2026-09-11T14:00:00") },
  { id: "np-a2", side: "B", action: "signed", itemId: "np-1", itemText: northpeakItems[0].text, timestamp: ts("2026-09-11T16:40:00") },
  { id: "np-a3", side: "B", action: "marked_request", itemId: "np-5", itemText: northpeakItems[4].text, timestamp: ts("2026-09-12T09:10:00") },
  { id: "np-a4", side: "A", action: "toggled_done", itemId: "np-5", itemText: northpeakItems[4].text, timestamp: ts("2026-09-12T09:45:00") },
  { id: "np-a5", side: "B", action: "signed", itemId: "np-5", itemText: northpeakItems[4].text, timestamp: ts("2026-09-12T09:40:00") },
];

// --- Halden Air: 2 items need attention ---

const haldenItems: AgreementItem[] = [
  {
    id: "ha-1",
    text: "Halden Air logo appears on the podcast's episode thumbnail.",
    category: "agreed",
    side_a_version: null,
    side_b_version: null,
    owner: null,
    due_date: null,
  },
  {
    id: "ha-2",
    text: "Wildframe provides quarterly performance reports to Halden Air's marketing team.",
    category: "agreed",
    side_a_version: null,
    side_b_version: null,
    owner: null,
    due_date: null,
  },
  {
    id: "ha-3",
    text: "Timing for the co-branded launch campaign.",
    category: "ambiguous",
    side_a_version: "Wildframe said \"early Q4\" — could mean any point from October through November.",
    side_b_version: "Halden Air understood this to mean before Thanksgiving, i.e. mid-to-late November.",
    owner: null,
    due_date: null,
  },
  {
    id: "ha-4",
    text: "Halden offered to feature Wildframe's podcast in their in-flight entertainment guide.",
    category: "one_sided",
    side_a_version: null,
    side_b_version: "Halden Air offered to feature the podcast in their in-flight entertainment guide.",
    owner: "Halden Air",
    due_date: null,
  },
  {
    id: "ha-5",
    text: "Featuring Halden Air's new route announcement in a dedicated episode.",
    category: "soft_ask",
    side_a_version: null,
    side_b_version: "Halden Air asked for a dedicated episode featuring their new route announcement.",
    owner: null,
    due_date: null,
    clarification_question: "Would it be possible to dedicate an episode to our new route announcement?",
    raised_by: "B",
  },
  {
    id: "ha-6",
    text: "Halden Air to deliver co-branded promo assets for the launch.",
    category: "soft_ask",
    side_a_version: null,
    side_b_version: "Wildframe asked Halden Air to deliver co-branded promo assets for the launch.",
    owner: null,
    due_date: null,
    clarification_question: "Could Halden Air put together co-branded promo assets for the launch?",
    raised_by: "A",
  },
  {
    id: "ha-7",
    text: "Send Halden Air the finalized episode audio for their in-flight entertainment system.",
    category: "soft_ask",
    side_a_version: null,
    side_b_version: "Halden Air asked for the finalized episode audio for their in-flight system.",
    owner: null,
    due_date: null,
    clarification_question: "Would it be possible to send over the finalized episode audio for our in-flight system?",
    raised_by: "B",
  },
];

const haldenStatuses: Record<string, ItemStatus> = {
  "ha-1": lockedStatus(haldenItems[0].text, "2026-09-18T11:00:00", "2026-09-18T13:20:00"),
  "ha-2": lockedStatus(haldenItems[1].text, "2026-09-18T11:01:00", "2026-09-18T13:21:00"),
  "ha-3": {
    aConfirmed: true,
    bConfirmed: false,
    aText: haldenItems[2].side_a_version as string,
    bText: haldenItems[2].side_b_version as string,
    softAskDecision: null,
    commitmentOwner: null,
    commitmentDueDate: null,
    done: false,
    aSignedAt: ts("2026-09-18T11:05:00"),
    bSignedAt: null,
  },
  "ha-4": {
    aConfirmed: false,
    bConfirmed: false,
    aText: haldenItems[3].text,
    bText: haldenItems[3].text,
    softAskDecision: null,
    commitmentOwner: null,
    commitmentDueDate: null,
    done: false,
    aSignedAt: null,
    bSignedAt: null,
  },
  "ha-5": {
    aConfirmed: false,
    bConfirmed: true,
    aText: "We can look into a dedicated episode, but it would need to slot in after the Northpeak season wrap.",
    bText: haldenItems[4].text,
    softAskDecision: "request",
    commitmentOwner: "A",
    commitmentDueDate: "Sep 20, 2026",
    done: false,
    aSignedAt: null,
    bSignedAt: ts("2026-09-24T10:12:00"),
  },
  "ha-6": {
    ...lockedStatus(haldenItems[5].text, "2026-09-19T09:00:00", "2026-09-19T09:30:00"),
    softAskDecision: "request",
    commitmentOwner: "B",
    commitmentDueDate: "Oct 15, 2026",
  },
  "ha-7": {
    ...lockedStatus(haldenItems[6].text, "2026-09-19T14:00:00", "2026-09-19T14:20:00"),
    softAskDecision: "request",
    commitmentOwner: "A",
    commitmentDueDate: "Sep 22, 2026",
  },
};

const haldenActivity: ActivityEntry[] = [
  { id: "ha-a1", side: "A", action: "room_created", timestamp: ts("2026-09-18T11:00:00") },
  { id: "ha-a2", side: "B", action: "signed", itemId: "ha-1", itemText: haldenItems[0].text, timestamp: ts("2026-09-18T13:20:00") },
  { id: "ha-a3", side: "A", action: "signed", itemId: "ha-3", itemText: haldenItems[2].text, timestamp: ts("2026-09-18T11:05:00") },
  { id: "ha-a4", side: "B", action: "marked_request", itemId: "ha-5", itemText: haldenItems[4].text, timestamp: ts("2026-09-22T15:00:00") },
  { id: "ha-a5", side: "A", action: "edited", itemId: "ha-5", itemText: haldenItems[4].text, timestamp: ts("2026-09-23T08:30:00") },
  { id: "ha-a6", side: "B", action: "signed", itemId: "ha-5", itemText: haldenItems[4].text, timestamp: ts("2026-09-24T10:12:00") },
  { id: "ha-a7", side: "B", action: "signed", itemId: "ha-6", itemText: haldenItems[5].text, timestamp: ts("2026-09-19T09:30:00") },
  { id: "ha-a8", side: "B", action: "signed", itemId: "ha-7", itemText: haldenItems[6].text, timestamp: ts("2026-09-19T14:20:00") },
];

export const SAMPLE_PARTNERSHIPS: SamplePartnership[] = [
  {
    id: "sample-northpeak",
    orgA: WF,
    orgB: "Northpeak Outdoors",
    items: northpeakItems,
    statuses: northpeakStatuses,
    activity: northpeakActivity,
    createdAt: ts("2026-09-11T14:00:00"),
    isSample: true,
  },
  {
    id: "sample-halden",
    orgA: WF,
    orgB: "Halden Air",
    items: haldenItems,
    statuses: haldenStatuses,
    activity: haldenActivity,
    createdAt: ts("2026-09-18T11:00:00"),
    isSample: true,
  },
];
