"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  orgA: string;
  orgB: string;
  linkA: string;
  linkB: string;
  onContinue: () => void;
}

export default function InvitePanel({ orgA, orgB, linkA, linkB, onContinue }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold-dark shadow-hairline">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 12.5l2.6 2.6L16.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Room created
        </div>
        <h1 className="mb-3 font-serif text-3xl font-semibold tracking-wide text-navy">Invite your partner</h1>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-navy/60">
          Each link can only sign for its own side. No account needed. Save these links now &mdash; they won&apos;t
          be shown again.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <InviteLinkCard label={`Your link (${orgA})`} orgLabel={orgA} link={linkA} accent="navy" />
        <InviteLinkCard label={`Partner's link (${orgB})`} orgLabel={orgB} link={linkB} accent="gold" />
      </div>

      <div className="mt-10 flex justify-center">
        <button
          onClick={onContinue}
          className="rounded-lg bg-navy px-10 py-3.5 font-serif text-base font-semibold tracking-wide text-white shadow-hairline transition hover:bg-navy-light"
        >
          Continue to my room
        </button>
      </div>
    </div>
  );
}

function InviteLinkCard({
  label,
  orgLabel,
  link,
  accent,
}: {
  label: string;
  orgLabel: string;
  link: string;
  accent: "navy" | "gold";
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const ring = accent === "gold" ? "border-gold/40" : "border-navy/15";

  return (
    <div className={`rounded-lg border ${ring} bg-white p-6 text-center shadow-hairline`}>
      <div className="tracking-caps mb-4 text-[11px] font-semibold text-navy/45">{label}</div>
      <div className="mb-4 flex justify-center rounded-lg bg-white p-3">
        <QRCodeSVG value={link} size={140} fgColor="#0B1F3A" bgColor="#FFFFFF" />
      </div>
      <p className="mb-4 break-all rounded-lg bg-navy/[0.03] px-3 py-2 text-xs text-navy/60">{link}</p>
      <button
        onClick={handleCopy}
        className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
          accent === "gold" ? "bg-gold hover:bg-gold-dark" : "bg-navy hover:bg-navy-light"
        }`}
      >
        {copied ? "Copied!" : `Copy ${orgLabel}'s link`}
      </button>
    </div>
  );
}
