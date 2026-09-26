import { NextResponse } from "next/server";
import { roomsEnabled } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ roomsEnabled: roomsEnabled() });
}
