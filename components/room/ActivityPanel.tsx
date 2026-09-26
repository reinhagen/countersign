"use client";

import { ActivityEntry, Side } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { describeActivity } from "@/lib/activityDescribe";

interface Props {
  activity: ActivityEntry[];
  orgA: string;
  orgB: string;
}

export default function ActivityPanel({ activity, orgA, orgB }: Props) {
  const sorted = [...activity].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="rounded-lg border border-navy/10 bg-white shadow-hairline">
      <div className="border-b border-gold/20 px-5 py-3">
        <h2 className="font-serif text-base font-semibold tracking-wide text-navy">Activity</h2>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {sorted.length === 0 ? (
          <p className="px-5 py-6 text-sm text-navy/40">No activity yet.</p>
        ) : (
          <ul>
            {sorted.map((entry) => {
              const orgName = (entry.side as Side) === "A" ? orgA : orgB;
              const dotColor = entry.side === "A" ? "bg-navy" : "bg-gold";
              return (
                <li key={entry.id} className="flex items-start gap-3 border-b border-navy/5 px-5 py-3 last:border-0">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} />
                  <div className="flex-1">
                    <p className="text-sm text-navy/80">{describeActivity(entry, orgName)}</p>
                    <p className="text-xs text-navy/40">{formatDateTime(entry.timestamp)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
