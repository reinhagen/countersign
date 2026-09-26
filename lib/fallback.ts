import { AgreementItem, BriefResult } from "./types";

export function fallbackReconcile(): AgreementItem[] {
  return [
    {
      id: "item-1",
      text: "Aurel logo appears as a 5-second bumper at the open and close of every episode.",
      category: "agreed",
      side_a_version: "5-second bumper, open and close, every episode.",
      side_b_version: "Logo at open and close of each episode, 5 seconds each.",
      owner: "Priya (Wildframe)",
      due_date: null,
    },
    {
      id: "item-2",
      text: "Aurel receives one round of brand-safety notes per episode before final cut.",
      category: "agreed",
      side_a_version: "Aurel gets one round of brand-safety notes per episode.",
      side_b_version: "We get one round of brand-safety feedback per episode before it's final.",
      owner: "Wildframe editorial",
      due_date: null,
    },
    {
      id: "item-3",
      text: "Payment is 50% deposit upfront and 50% on final delivery, deposit wired within 10 business days of signing.",
      category: "agreed",
      side_a_version: "50% upfront, 50% on final delivery; deposit within 10 business days of contract signing.",
      side_b_version: "50% deposit upfront, 50% on delivery; deposit wired within 10 business days of signing.",
      owner: "Finance (both sides)",
      due_date: null,
    },
    {
      id: "item-4",
      text: "Total sponsorship value for the Season 3 series.",
      category: "mismatch",
      side_a_version: "$180,000 total sponsorship value.",
      side_b_version: "CHF 165,000, pending FX conversion.",
      owner: null,
      due_date: null,
    },
    {
      id: "item-5",
      text: "Deadline for delivering Episode 1's first cut for review.",
      category: "mismatch",
      side_a_version: "First cut delivered for review by October 15.",
      side_b_version: "Expecting first cut by October 30, to allow time for internal legal review.",
      owner: "Priya (Wildframe)",
      due_date: null,
    },
    {
      id: "item-6",
      text: "Aurel's legal/compliance sign-off on Swiss import disclosure language, required before the final cut can lock.",
      category: "one_sided",
      side_a_version: "Wildframe needs Aurel's legal/compliance sign-off on Swiss import disclosure language before locking the final cut.",
      side_b_version: null,
      owner: "Aurel legal (Zurich)",
      due_date: null,
    },
    {
      id: "item-7",
      text: "Featuring the new Aurel Chrono model on-camera in at least one episode.",
      category: "soft_ask",
      side_a_version: "Aurel asked about featuring the new Chrono model on-camera; noted as an open ask, no commitment made.",
      side_b_version: "We raised featuring the new Chrono model on camera in at least one episode; still open.",
      owner: null,
      due_date: null,
      clarification_question: "Would it be possible to consider featuring the new Aurel Chrono model on-camera in at least one episode?",
    },
    {
      id: "item-8",
      text: "Extra social clips for Aurel's Instagram beyond the trailer.",
      category: "soft_ask",
      side_a_version: "Aurel asked for a few extra social clips beyond the trailer; Wildframe said they'd consider it, not agreed.",
      side_b_version: "We asked for a few extra social clips for our Instagram beyond the trailer; still open.",
      owner: null,
      due_date: null,
      clarification_question: "Could we possibly get a few extra social clips for Aurel's Instagram, beyond the trailer?",
    },
  ];
}

export function fallbackBrief(orgA: string, orgB: string): BriefResult {
  return {
    brief: `Team Brief: ${orgA} x ${orgB} Partnership

DECISIONS
- ${orgB}'s logo runs as a 5-second bumper at the open and close of every episode.
- ${orgB} gets one round of brand-safety notes per episode before the cut is finalized.
- Payment is 50% deposit upfront, 50% on final delivery. Deposit is wired within 10 business days of contract signing.

OPEN ITEMS TO RESOLVE
- Sponsorship value: ${orgA} has this at $180,000; ${orgB} has it at CHF 165,000. Needs a single agreed figure and currency before invoicing.
- Episode 1 review deadline: ${orgA} committed to October 15; ${orgB} is expecting October 30 for internal legal review. Needs one confirmed date.
- ${orgB}'s legal/compliance sign-off on Swiss import disclosure language is required before ${orgA} can lock the final cut — not yet scheduled or confirmed by ${orgB}.

OPEN REQUESTS (NOT YET COMMITMENTS)
- ${orgB} asked about featuring the new Chrono model on-camera in at least one episode. Needs a yes/no from ${orgA} production.
- ${orgB} asked for a few extra social clips for Instagram beyond the trailer. Needs a yes/no from ${orgA}.

OWNERS
- Priya (${orgA} producer): delivery timeline and cut approvals.
- Elena Baumann (${orgB} Marketing Director): sponsorship point of contact.

NEXT STEPS
- Align on sponsorship figure and currency this week.
- Confirm one Episode 1 review date.
- ${orgB} legal to confirm timeline for Swiss import disclosure sign-off.
- ${orgA} to respond to the Chrono model and extra social clips requests.`,
  };
}
