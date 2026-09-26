"use client";

import { ActivityEntry, Side } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

interface Props {
  activity: ActivityEntry[];
  orgA: string;
  orgB: string;
}

function describe(entry: ActivityEntry, orgName: string): string {
  switch (entry.action) {
    case "room_created":
      return "Room created";
    case "signed":
      return `${orgName} signed: ${entry.itemText ?? "an item"}`;
    case "edited":
      return `${orgName} edited: ${entry.itemText ?? "an item"}`;
    case "marked_request":
      return `${orgName} marked as a commitment: ${entry.itemText ?? "an item"}`;
    case "marked_question":
      return `${orgName} left as just a question: ${entry.itemText ?? "an item"}`;
    case "set_due_date":
      return `${orgName} set a due date${entry.detail ? ` (${entry.detail})` : ""}: ${entry.itemText ?? "an item"}`;
    case "toggled_done":
      return `${orgName} checked off: ${entry.itemText ?? "an item"}`;
    case "generated_brief":
      return `${orgName} generated the team brief`;
    default:
      return `${orgName} took an action`;
  }
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
                    <p className="text-sm text-navy/80">{describe(entry, orgName)}</p>
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
