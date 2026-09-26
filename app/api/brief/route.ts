import { NextRequest, NextResponse } from "next/server";
import { generateBriefText } from "@/lib/brief";
import { BriefCommitment } from "@/lib/fallback";
import { AgreementItem } from "@/lib/types";

export const runtime = "nodejs";

interface BriefBody {
  orgA: string;
  orgB: string;
  items: AgreementItem[];
  commitments?: BriefCommitment[];
}

export async function POST(req: NextRequest) {
  let body: BriefBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { orgA, orgB, items, commitments = [] } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Items are required" }, { status: 400 });
  }

  const result = await generateBriefText(orgA || "Side A", orgB || "Side B", items, commitments);
  return NextResponse.json(result);
}
