"use client";

import { Side } from "@/lib/types";
import { orgInitials } from "@/lib/format";

interface Props {
  mySide: Side;
  myOrgName: string;
}

export default function RoomBanner({ mySide, myOrgName }: Props) {
  const isGold = mySide === "B";
  return (
    <div className={`no-print ${isGold ? "bg-gold" : "bg-navy"} text-white`}>
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white/40 text-xs font-bold tracking-wide`}
        >
          {orgInitials(myOrgName)}
        </span>
        <span className="text-sm font-medium tracking-wide">
          You are signing as <span className="font-serif text-base">{myOrgName}</span>
        </span>
      </div>
    </div>
  );
}
