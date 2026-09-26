import { NextResponse } from "next/server";
import { listRooms } from "@/lib/rooms";
import { collectCommitments, sortCommitments } from "@/lib/partnerships";
import { SAMPLE_PARTNERSHIPS } from "@/lib/sampleData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const liveRooms = await listRooms();

  const liveCommitments = liveRooms.flatMap((room) =>
    collectCommitments(room, { isSample: false, roomUrl: `/room/${room.id}?key=${room.tokens.A}` })
  );

  const sampleCommitments = SAMPLE_PARTNERSHIPS.flatMap((p) =>
    collectCommitments(p, { isSample: true, roomUrl: null })
  );

  return NextResponse.json({ commitments: sortCommitments([...liveCommitments, ...sampleCommitments]) });
}
