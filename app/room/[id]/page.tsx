"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import RoomView from "@/components/room/RoomView";
import RoomError from "@/components/room/RoomError";

function RoomPageInner() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const key = searchParams.get("key");

  if (!params.id || !key) {
    return <RoomError message="This link is missing its signing key. Ask your partner to resend the invite." />;
  }

  return <RoomView roomId={params.id} roomKey={key} />;
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-6 py-20 text-center text-sm text-navy/40">Loading…</div>}>
      <RoomPageInner />
    </Suspense>
  );
}
