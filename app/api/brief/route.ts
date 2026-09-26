import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fallbackBrief } from "@/lib/fallback";
import { AgreementItem } from "@/lib/types";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are Countersign, a neutral assistant that writes plain-language team briefs from a reconciled list of partnership agreement items. Write a clear, concise brief for working teams on both sides. Structure it with these sections, using plain text headings (no markdown symbols):

DECISIONS - firm commitments both sides confirmed.
OPEN ITEMS TO RESOLVE - mismatches or one-sided items that still need resolution.
OPEN REQUESTS - soft asks that are not yet commitments.
OWNERS - named owners/points of contact, if any.
NEXT STEPS - a short actionable list.

Keep it factual and neutral. Do not invent information beyond what is given. Output plain text only, no markdown formatting.`;

interface BriefBody {
  orgA: string;
  orgB: string;
  items: AgreementItem[];
}

export async function POST(req: NextRequest) {
  let body: BriefBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { orgA, orgB, items } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Items are required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ brief: fallbackBrief(orgA || "Side A", orgB || "Side B").brief, source: "fallback" });
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
          content: `Side A: ${orgA || "Side A"}\nSide B: ${orgB || "Side B"}\n\nReconciled items (JSON):\n${JSON.stringify(items, null, 2)}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && textBlock.type === "text" ? textBlock.text.trim() : "";

    if (!raw) {
      return NextResponse.json({ brief: fallbackBrief(orgA || "Side A", orgB || "Side B").brief, source: "fallback" });
    }

    return NextResponse.json({ brief: raw, source: "anthropic" });
  } catch (err) {
    console.error("Brief API error", err);
    return NextResponse.json({ brief: fallbackBrief(orgA || "Side A", orgB || "Side B").brief, source: "fallback" });
  }
}
