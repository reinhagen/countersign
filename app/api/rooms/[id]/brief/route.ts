import { NextRequest, NextResponse } from "next/server";
import { getRoom, saveRoom, sideForToken } from "@/lib/rooms";
import { generateBriefText } from "@/lib/brief";
import { effectiveDueDate, effectiveOwnerLabel, isLocked } from "@/lib/itemStatus";
import { BriefCommitment } from "@/lib/fallback";
import { ActivityEntry } from "@/lib/types";

export const runtime = "nodejs";

interface BriefBody {
  key: string;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let body: BriefBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const room = await getRoom(params.id);
  if (!room) {
    return NextResponse.json({ error: "This room doesn't exist or has expired." }, { status: 404 });
  }

  const side = sideForToken(room, body.key);
  if (!side) {
    return NextResponse.json({ error: "This link isn't valid for this room." }, { status: 403 });
  }

  const resolvedItems = room.items.map((item) => ({
    ...item,
    text: room.statuses[item.id]?.aText ?? item.text,
  }));

  const commitments: BriefCommitment[] = [];
  for (const item of room.items) {
    const status = room.statuses[item.id];
    if (!status || !isLocked(status)) continue;
    const ownerLabel = effectiveOwnerLabel(item, status, room.orgA, room.orgB);
    if (!ownerLabel) continue;
    commitments.push({ text: item.text, ownerLabel, dueDate: effectiveDueDate(item, status) });
  }

  const result = await generateBriefText(room.orgA, room.orgB, resolvedItems, commitments);

  room.brief = result.brief;
  const entry: ActivityEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    side,
    action: "generated_brief",
    timestamp: Date.now(),
  };
  room.activity.push(entry);
  await saveRoom(room);

  return NextResponse.json({ brief: result.brief });
}
