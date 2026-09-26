import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fallbackReconcile } from "@/lib/fallback";
import { parseReconcileJson } from "@/lib/validate";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are Countersign, a neutral agreement-reconciliation assistant. Two organizations each submit their own notes from the same partnership call. Your job is to compare the two sets of notes and produce a single, neutral list of discrete items.

For each distinct point discussed, classify it into exactly one category:
- "agreed": both sides recorded the same commitment, with no meaningful conflict.
- "mismatch": both sides recorded the same topic but with different, conflicting specifics (e.g. different dates, amounts, or terms).
- "one_sided": only one side's notes mention this item at all.
- "soft_ask": a request phrased as a question or hesitant ask ("would it be possible...", "could we possibly...") that has not been agreed to as a firm commitment.

Respond with ONLY a JSON array (no prose, no markdown fences). Each element must be an object with exactly these fields:
{
  "id": string (unique slug, e.g. "item-1"),
  "text": string (a short neutral description of the item),
  "category": "agreed" | "mismatch" | "one_sided" | "soft_ask",
  "side_a_version": string or null (how side A described it, null if not mentioned by side A),
  "side_b_version": string or null (how side B described it, null if not mentioned by side B),
  "owner": string or null (a named owner/point of contact if mentioned),
  "due_date": string or null (a date if one was mentioned),
  "clarification_question": string or null (only for soft_ask items: the actual question being asked; null otherwise)
}

Be thorough: capture every commitment, discrepancy, and open ask you can find. Do not invent information that is not present in the notes.`;

interface ReconcileBody {
  orgA: string;
  orgB: string;
  notesA: string;
  notesB: string;
}

export async function POST(req: NextRequest) {
  let body: ReconcileBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { orgA, orgB, notesA, notesB } = body;

  if (!notesA?.trim() || !notesB?.trim()) {
    return NextResponse.json({ error: "Both sides' notes are required" }, { status: 400 });
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
          content: `Side A: ${orgA || "Side A"}\nNotes:\n${notesA}\n\nSide B: ${orgB || "Side B"}\nNotes:\n${notesB}`,
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
