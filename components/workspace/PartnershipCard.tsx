import Link from "next/link";
import { PartnershipSummary } from "@/lib/partnerships";
import { orgInitials, formatDateTime } from "@/lib/format";
import StatusPill from "./StatusPill";

export default function PartnershipCard({ partnership }: { partnership: PartnershipSummary }) {
  const pct =
    partnership.itemsTotal > 0 ? Math.round((partnership.itemsLocked / partnership.itemsTotal) * 100) : 0;

  const content = (
    <div
      className={`rounded-lg border border-navy/10 bg-white p-5 shadow-hairline transition ${
        partnership.roomUrl ? "hover:shadow-card" : ""
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-xs font-bold tracking-wide text-gold-dark">
            {orgInitials(partnership.partnerName)}
          </span>
          <div>
            <h3 className="font-serif text-base font-semibold tracking-wide text-navy">{partnership.partnerName}</h3>
            {partnership.isSample && <p className="text-[11px] text-navy/35">Sample partnership</p>}
          </div>
        </div>
        <StatusPill status={partnership.status} />
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-navy/50">
          <span>
            {partnership.itemsLocked} of {partnership.itemsTotal} items signed
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
          <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="space-y-1.5 border-t border-navy/10 pt-3 text-xs text-navy/55">
        <p>
          <span className="font-medium text-navy/70">Next due: </span>
          {partnership.nextDue ? (
            <span className={partnership.nextDue.overdue ? "font-medium text-crimson" : ""}>
              {partnership.nextDue.text} &mdash; {partnership.nextDue.dueDate}
            </span>
          ) : (
            <span className="text-navy/35">Nothing outstanding</span>
          )}
        </p>
        <p>
          <span className="font-medium text-navy/70">Last activity: </span>
          {partnership.lastActivityAt ? formatDateTime(partnership.lastActivityAt) : "—"}
        </p>
      </div>
    </div>
  );

  if (!partnership.roomUrl) {
    return <div>{content}</div>;
  }

  return (
    <Link href={partnership.roomUrl} className="block">
      {content}
    </Link>
  );
}
