import { NextResponse } from "next/server";
import { listRooms } from "@/lib/rooms";
import { SAMPLE_PARTNERSHIPS } from "@/lib/sampleData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ENTRIES = 100;

export async function GET() {
  const liveRooms = await listRooms();

  const liveEntries = liveRooms.flatMap((room) =>
    room.activity.map((entry) => ({
      ...entry,
      partnershipName: room.orgB,
      orgA: room.orgA,
      orgB: room.orgB,
      roomUrl: `/room/${room.id}?key=${room.tokens.A}`,
      isSample: false,
    }))
  );

  const sampleEntries = SAMPLE_PARTNERSHIPS.flatMap((p) =>
    p.activity.map((entry) => ({
      ...entry,
      partnershipName: p.orgB,
      orgA: p.orgA,
      orgB: p.orgB,
      roomUrl: null,
      isSample: true,
    }))
  );

  const all = [...liveEntries, ...sampleEntries].sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_ENTRIES);

  return NextResponse.json({ activity: all });
}
