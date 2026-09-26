import { NextRequest, NextResponse } from "next/server";
import { createRoom, listRooms } from "@/lib/rooms";
import { roomsEnabled } from "@/lib/redis";
import { AgreementItem, ItemStatus } from "@/lib/types";
import { summarizePartnership } from "@/lib/partnerships";
import { SAMPLE_PARTNERSHIPS } from "@/lib/sampleData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CreateRoomBody {
  orgA: string;
  orgB: string;
  transcript: string;
  items: AgreementItem[];
  statuses: Record<string, ItemStatus>;
}

export async function POST(req: NextRequest) {
  if (!roomsEnabled()) {
    return NextResponse.json(
      { error: "Shared rooms aren't configured on this deployment." },
      { status: 503 }
    );
  }

  let body: CreateRoomBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { orgA, orgB, transcript, items, statuses } = body;

  if (!orgA?.trim() || !orgB?.trim() || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Missing room data" }, { status: 400 });
  }

  const room = await createRoom({
    orgA: orgA.trim(),
    orgB: orgB.trim(),
    transcript: transcript || "",
    items,
    statuses: statuses || {},
  });

  if (!room) {
    return NextResponse.json({ error: "Could not create room" }, { status: 500 });
  }

  return NextResponse.json({ id: room.id, tokenA: room.tokens.A, tokenB: room.tokens.B });
}

export async function GET() {
  const liveRooms = await listRooms();

  const live = liveRooms
    .map((room) =>
      summarizePartnership(room, { isSample: false, roomUrl: `/room/${room.id}?key=${room.tokens.A}` })
    )
    .sort((a, b) => (b.lastActivityAt ?? 0) - (a.lastActivityAt ?? 0));

  const samples = SAMPLE_PARTNERSHIPS.map((p) => summarizePartnership(p, { isSample: true, roomUrl: null }));

  return NextResponse.json({ partnerships: [...live, ...samples] });
}
