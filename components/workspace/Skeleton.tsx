export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-navy/10 ${className}`} />;
}

export function PartnershipCardSkeleton() {
  return (
    <div className="rounded-lg border border-navy/10 bg-white p-5 shadow-hairline">
      <div className="mb-4 flex items-center gap-3">
        <SkeletonBlock className="h-10 w-10 rounded-full" />
        <SkeletonBlock className="h-4 w-32" />
      </div>
      <SkeletonBlock className="mb-2 h-1.5 w-full rounded-full" />
      <SkeletonBlock className="mb-4 h-3 w-24" />
      <SkeletonBlock className="mb-1.5 h-3 w-3/4" />
      <SkeletonBlock className="h-3 w-1/2" />
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="rounded-lg border border-navy/10 bg-white p-4 shadow-hairline">
      <SkeletonBlock className="mb-2 h-3 w-1/3" />
      <SkeletonBlock className="h-4 w-3/4" />
    </div>
  );
}
