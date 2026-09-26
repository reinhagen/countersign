import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fallbackReconcile } from "@/lib/fallback";
import { parseReconcileJson } from "@/lib/validate";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are Countersign, a neutral agreement-reconciliation assistant. You are given a single transcript of a partnership call between two organizations, Side A and Side B. Speakers are not pre-labeled — infer from context (introductions, who represents which company, phrasing like "our logo" or "your team") which lines belong to which organization.

For each distinct point discussed, classify it into exactly one category:
- "agreed": both sides clearly voiced the same commitment, with no meaningful conflict or vagueness.
- "ambiguous": the topic was discussed by both sides, but the language used could reasonably be understood two different ways (e.g. a vague date like "sometime in March" interpreted differently, or a figure given in different units/currencies without an explicit conversion). Capture the two plausible interpretations.
- "one_sided": only one side voiced this commitment or offer; the other side did not acknowledge, confirm, or respond to it in the transcript.
- "soft_ask": a request phrased as a question or hesitant ask ("would it be possible...", "could we possibly...") that was not agreed to as a firm commitment.

Respond with ONLY a JSON array (no prose, no markdown fences). Each element must be an object with exactly these fields:
{
  "id": string (unique slug, e.g. "item-1"),
  "text": string (a short neutral description of the item),
  "category": "agreed" | "ambiguous" | "one_sided" | "soft_ask",
  "side_a_version": string or null (Side A's phrasing/interpretation; for "ambiguous" items, one of the two interpretations; for "one_sided" items where only Side A voiced it, Side A's version; null if not applicable),
  "side_b_version": string or null (Side B's phrasing/interpretation, same rules as above from Side B's perspective; null if not applicable),
  "owner": string or null (a named person or side responsible, if mentioned),
  "due_date": string or null (a date or deadline if one was mentioned),
  "clarification_question": string or null (only for soft_ask items: the exact question being asked; null otherwise)
}

Be thorough: capture every commitment, ambiguity, one-sided offer, and open ask you can find. Do not invent information that is not present in the transcript.`;

interface ReconcileBody {
  orgA: string;
  orgB: string;
  transcript: string;
}

export async function POST(req: NextRequest) {
  let body: ReconcileBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { orgA, orgB, transcript } = body;

  if (!transcript?.trim()) {
    return NextResponse.json({ error: "A transcript is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ items: fallbackReconcile(), source: "fallback" });
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Side A: ${orgA || "Side A"}\nSide B: ${orgB || "Side B"}\n\nTranscript:\n${transcript}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
    const items = parseReconcileJson(raw);

    if (!items) {
      return NextResponse.json({ items: fallbackReconcile(), source: "fallback" });
    }

    return NextResponse.json({ items, source: "anthropic" });
  } catch (err) {
    console.error("Reconcile API error", err);
    return NextResponse.json({ items: fallbackReconcile(), source: "fallback" });
  }
}
