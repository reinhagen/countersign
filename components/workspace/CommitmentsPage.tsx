"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CommitmentRow } from "@/lib/partnerships";
import { RowSkeleton } from "./Skeleton";

export default function CommitmentsPage() {
  const [commitments, setCommitments] = useState<CommitmentRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/commitments")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setCommitments(data.commitments ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load commitments.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const weOwe = commitments?.filter((c) => c.direction === "we_owe") ?? [];
  const waitingOnThem = commitments?.filter((c) => c.direction === "waiting_on_them") ?? [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold tracking-wide text-navy">Commitments</h1>
        <p className="mt-1 text-sm text-navy/50">Every open commitment across all of your partnerships.</p>
      </div>

      {error && (
        <div className="mb-8 rounded-lg border border-amber-border bg-amber-bg px-4 py-3 text-sm text-amber">
          {error}
        </div>
      )}

      <div className="space-y-10">
        <Section title="We owe" subtitle="Commitments Wildframe Media is responsible for" loading={!commitments} rows={weOwe} />
        <Section
          title="Waiting on them"
          subtitle="Commitments the other side is responsible for"
          loading={!commitments}
          rows={waitingOnThem}
        />
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  loading,
  rows,
}: {
  title: string;
  subtitle: string;
  loading: boolean;
  rows: CommitmentRow[];
}) {
  return (
    <div>
      <h2 className="font-serif text-lg font-semibold tracking-wide text-navy">{title}</h2>
      <p className="tracking-caps mb-3 text-[11px] text-navy/40">{subtitle}</p>
      <div className="space-y-3">
        {loading ? (
          <>
            <RowSkeleton />
            <RowSkeleton />
          </>
        ) : rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-navy/15 px-4 py-3 text-sm text-navy/40">
            Nothing here right now.
          </p>
        ) : (
          rows.map((row, i) => <CommitmentRowCard key={`${row.partnershipId}-${i}`} row={row} />)
        )}
      </div>
    </div>
  );
}

function CommitmentRowCard({ row }: { row: CommitmentRow }) {
  const body = (
    <div
      className={`flex items-start justify-between gap-4 rounded-lg border border-navy/10 bg-white px-4 py-3 shadow-hairline transition ${
        row.roomUrl ? "hover:shadow-card" : ""
      } ${row.done ? "opacity-50" : ""}`}
    >
      <div>
        <p className="tracking-caps mb-1 text-[10px] font-semibold text-navy/40">{row.partnershipName}</p>
        <p className={`text-sm text-navy ${row.done ? "line-through" : ""}`}>{row.text}</p>
      </div>
      {row.dueDate && (
        <span
          className={`shrink-0 whitespace-nowrap text-xs font-medium ${
            row.overdue ? "text-crimson" : "text-navy/50"
          }`}
        >
          {row.overdue ? "Overdue — " : "Due "}
          {row.dueDate}
        </span>
      )}
    </div>
  );

  if (!row.roomUrl) return body;
  return (
    <Link href={row.roomUrl} className="block">
      {body}
    </Link>
  );
}
