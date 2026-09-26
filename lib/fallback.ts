import { AgreementItem, BriefResult } from "./types";

export function fallbackReconcile(): AgreementItem[] {
  return [
    {
      id: "item-1",
      text: "Aurel logo appears as a 5-second bumper at the open and close of every episode.",
      category: "agreed",
      side_a_version: null,
      side_b_version: null,
      owner: null,
      due_date: null,
    },
    {
      id: "item-2",
      text: "Aurel receives one round of brand-safety notes per episode before final cut.",
      category: "agreed",
      side_a_version: null,
      side_b_version: null,
      owner: null,
      due_date: null,
    },
    {
      id: "item-3",
      text: "Payment is 50% deposit upfront and 50% on final delivery, deposit wired within 10 business days of signing.",
      category: "agreed",
      side_a_version: null,
      side_b_version: null,
      owner: null,
      due_date: null,
    },
    {
      id: "item-4",
      text: "Timing for delivering the first cut of Episode 1.",
      category: "ambiguous",
      side_a_version: "Wildframe said the first cut would be ready \"sometime in March\" — could mean any point in the month.",
      side_b_version: "Aurel understood this to mean before the Basel show, i.e. the first week of March.",
      owner: "Wildframe production",
      due_date: null,
    },
    {
      id: "item-5",
      text: "Total sponsorship value for the Season 3 series.",
      category: "ambiguous",
      side_a_version: "Wildframe referenced \"around one-eighty\" — likely $180,000.",
      side_b_version: "Aurel referenced \"roughly one-sixty-five\" — likely CHF 165,000, an unconfirmed currency and conversion.",
      owner: null,
      due_date: null,
    },
    {
      id: "item-6",
      text: "Three extra behind-the-scenes clips for Aurel's social channels at no additional cost.",
      category: "one_sided",
      side_a_version: "Wildframe offered three extra behind-the-scenes clips for Aurel's socials at no additional cost.",
      side_b_version: null,
      owner: "Wildframe",
      due_date: null,
    },
    {
      id: "item-7",
      text: "Featuring the new Aurel Chrono model on-camera in at least one episode.",
      category: "soft_ask",
      side_a_version: null,
      side_b_version: "Aurel asked about featuring the new Chrono model on camera; Wildframe said they'd take it back to the team, no commitment made.",
      owner: null,
      due_date: null,
      clarification_question: "Would it be possible to consider featuring our new Chrono model on camera in at least one episode?",
      raised_by: "B",
    },
    {
      id: "item-8",
      text: "An early look at the trailer before it goes public.",
      category: "soft_ask",
      side_a_version: null,
      side_b_version: "Aurel asked for an early look at the trailer before it's public; Wildframe said they'd look into it, no commitment made.",
      owner: null,
      due_date: null,
      clarification_question: "Could we possibly get an early look at the trailer before it goes public?",
      raised_by: "B",
    },
  ];
}

export interface BriefCommitment {
  text: string;
  ownerLabel: string;
  dueDate: string | null;
}

export function fallbackBrief(orgA: string, orgB: string, commitments: BriefCommitment[] = []): BriefResult {
  const commitmentsSection =
    commitments.length > 0
      ? `\n\nCOMMITMENTS\n${commitments
          .map((c) => `- ${c.ownerLabel} owes: ${c.text}${c.dueDate ? ` (due ${c.dueDate})` : ""}`)
          .join("\n")}`
      : "";

  return {
    brief: `Team Brief: ${orgA} x ${orgB} Partnership

DECISIONS
- ${orgB}'s logo runs as a 5-second bumper at the open and close of every episode.
- ${orgB} gets one round of brand-safety notes per episode before the cut is finalized.
- Payment is 50% deposit upfront, 50% on final delivery. Deposit is wired within 10 business days of contract signing.

OPEN ITEMS TO RESOLVE
- First-cut delivery timing: ${orgA} said "sometime in March," which ${orgB} understood to mean the first week of March, ahead of the Basel show. Needs one confirmed date.
- Sponsorship value: ${orgA} referenced "around $180,000"; ${orgB} referenced "roughly CHF 165,000." Needs a single agreed figure and currency before invoicing.

OPEN REQUESTS (NOT YET COMMITMENTS)
- ${orgB} asked about featuring the new Chrono model on-camera in at least one episode. Needs a yes/no from ${orgA} production.
- ${orgB} asked for an early look at the trailer before it goes public. Needs a yes/no from ${orgA}.

NOTED BUT UNCONFIRMED
- ${orgA} offered three extra behind-the-scenes clips for ${orgB}'s social channels at no additional cost; ${orgB} did not acknowledge this on the call.

NEXT STEPS
- Align on one confirmed delivery date for the first cut.
- Agree on the sponsorship figure and currency this week.
- ${orgA} to respond to the Chrono model and early trailer access requests.
- Confirm whether the extra behind-the-scenes clips are part of the deal.${commitmentsSection}`,
  };
}
