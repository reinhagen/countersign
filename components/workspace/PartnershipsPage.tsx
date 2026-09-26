"use client";

import { useEffect, useState } from "react";
import { PartnershipSummary } from "@/lib/partnerships";
import PartnershipCard from "./PartnershipCard";
import { PartnershipCardSkeleton } from "./Skeleton";

export default function PartnershipsPage() {
  const [partnerships, setPartnerships] = useState<PartnershipSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPartnerships(data.partnerships ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load partnerships.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold tracking-wide text-navy">Partnerships</h1>
        <p className="mt-1 text-sm text-navy/50">Every partnership Wildframe Media has reconciled with Countersign.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-border bg-amber-bg px-4 py-3 text-sm text-amber">{error}</div>
      )}

      {!error && partnerships === null && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <PartnershipCardSkeleton key={i} />
          ))}
        </div>
      )}

      {partnerships !== null && partnerships.length === 0 && (
        <div className="rounded-lg border border-dashed border-navy/15 px-6 py-16 text-center">
          <p className="mb-2 font-serif text-lg font-semibold text-navy">No partnerships yet</p>
          <p className="text-sm text-navy/50">Start a call to reconcile your first partnership.</p>
        </div>
      )}

      {partnerships !== null && partnerships.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partnerships.map((p) => (
            <PartnershipCard key={p.id} partnership={p} />
          ))}
        </div>
      )}
    </div>
  );
}
