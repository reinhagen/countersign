import { NextRequest, NextResponse } from "next/server";
import { getRoom, sideForToken } from "@/lib/rooms";
import { RoomView } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const key = req.nextUrl.searchParams.get("key");
  const room = await getRoom(params.id);

  if (!room) {
    return NextResponse.json({ error: "This room doesn't exist or has expired." }, { status: 404 });
  }

  const side = sideForToken(room, key);
  if (!side) {
    return NextResponse.json({ error: "This link isn't valid for this room." }, { status: 403 });
  }

  const view: RoomView = {
    side,
    orgA: room.orgA,
    orgB: room.orgB,
    items: room.items,
    statuses: room.statuses,
    activity: room.activity,
    brief: room.brief,
  };

  return NextResponse.json(view);
}
