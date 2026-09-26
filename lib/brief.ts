import Anthropic from "@anthropic-ai/sdk";
import { fallbackBrief, BriefCommitment } from "./fallback";
import { AgreementItem } from "./types";

const SYSTEM_PROMPT = `You are Countersign, a neutral assistant that writes plain-language team briefs from a reconciled list of partnership agreement items. Write a clear, concise brief for working teams on both sides. Structure it with these sections, using plain text headings (no markdown symbols):

DECISIONS - firm commitments both sides confirmed.
OPEN ITEMS TO RESOLVE - ambiguous or one-sided items that still need resolution.
OPEN REQUESTS - soft asks that are not yet commitments.
COMMITMENTS - a list of concrete commitments with an owner and due date, drawn from the "commitments" array provided. For each, state who owes what and when it's due (or "no due date set").
NEXT STEPS - a short actionable list.

Keep it factual and neutral. Do not invent information beyond what is given. Output plain text only, no markdown formatting. Omit a section if it has nothing to report.`;

export interface BriefGenerationResult {
  brief: string;
  source: "anthropic" | "fallback";
}

export async function generateBriefText(
  orgA: string,
  orgB: string,
  items: AgreementItem[],
  commitments: BriefCommitment[]
): Promise<BriefGenerationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { brief: fallbackBrief(orgA, orgB, commitments).brief, source: "fallback" };
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Side A: ${orgA}\nSide B: ${orgB}\n\nReconciled items (JSON):\n${JSON.stringify(
            items,
            null,
            2
          )}\n\nCommitments (JSON):\n${JSON.stringify(commitments, null, 2)}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && textBlock.type === "text" ? textBlock.text.trim() : "";

    if (!raw) {
      return { brief: fallbackBrief(orgA, orgB, commitments).brief, source: "fallback" };
    }

    return { brief: raw, source: "anthropic" };
  } catch (err) {
    console.error("Brief generation error", err);
    return { brief: fallbackBrief(orgA, orgB, commitments).brief, source: "fallback" };
  }
}
