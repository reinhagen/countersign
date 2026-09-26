import { NextRequest, NextResponse } from "next/server";
import { createRoom } from "@/lib/rooms";
import { roomsEnabled } from "@/lib/redis";
import { AgreementItem, ItemStatus } from "@/lib/types";

export const runtime = "nodejs";

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
