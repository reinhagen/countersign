"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ActivityEntry, Side } from "@/lib/types";
import { describeActivity } from "@/lib/activityDescribe";
import { formatDateTime } from "@/lib/format";
import { RowSkeleton } from "./Skeleton";

interface WorkspaceActivityEntry extends ActivityEntry {
  partnershipName: string;
  orgA: string;
  orgB: string;
  roomUrl: string | null;
  isSample: boolean;
}

export default function ActivityPage() {
  const [activity, setActivity] = useState<WorkspaceActivityEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/activity")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setActivity(data.activity ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load activity.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold tracking-wide text-navy">Activity</h1>
        <p className="mt-1 text-sm text-navy/50">Every signature, edit, and note across all of your partnerships.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-amber-border bg-amber-bg px-4 py-3 text-sm text-amber">
          {error}
        </div>
      )}

      {!error && activity === null && (
        <div className="space-y-3">
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      )}

      {activity !== null && activity.length === 0 && (
        <div className="rounded-lg border border-dashed border-navy/15 px-6 py-16 text-center">
          <p className="mb-2 font-serif text-lg font-semibold text-navy">No activity yet</p>
          <p className="text-sm text-navy/50">Once a partnership gets going, every action will show up here.</p>
        </div>
      )}

      {activity !== null && activity.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-navy/10 bg-white shadow-hairline">
          <ul>
            {activity.map((entry) => {
              const orgName = (entry.side as Side) === "A" ? entry.orgA : entry.orgB;
              const dotColor = entry.side === "A" ? "bg-navy" : "bg-gold";
              const row = (
                <li className="flex items-start gap-3 border-b border-navy/5 px-5 py-3.5 transition last:border-0 hover:bg-navy/[0.02]">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} />
                  <div className="min-w-0 flex-1">
                    <p className="tracking-caps text-[10px] font-semibold text-navy/35">{entry.partnershipName}</p>
                    <p className="text-sm text-navy/80">{describeActivity(entry, orgName)}</p>
                    <p className="text-xs text-navy/40">{formatDateTime(entry.timestamp)}</p>
                  </div>
                </li>
              );
              return entry.roomUrl ? (
                <Link key={entry.id} href={entry.roomUrl} className="block">
                  {row}
                </Link>
              ) : (
                <div key={entry.id}>{row}</div>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
