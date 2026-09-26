"use client";

import { useState } from "react";

interface Props {
  orgA: string;
  orgB: string;
  brief: string;
  onBack: () => void;
}

export default function TeamBrief({ orgA, orgB, brief, onBack }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <button onClick={onBack} className="mb-6 text-xs font-medium text-navy/40 hover:text-navy/70">
        &larr; Back to board
      </button>

      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold-dark shadow-hairline">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 12.5l2.6 2.6L16.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Fully countersigned
        </div>
        <h1 className="font-serif text-3xl font-semibold tracking-wide text-navy">
          Team brief: {orgA} <span className="text-gold">&times;</span> {orgB}
        </h1>
      </div>

      <div className="rounded-lg border border-navy/10 bg-white p-8 shadow-hairline">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-navy/85">{brief}</pre>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleCopy}
          className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white shadow-hairline transition hover:bg-navy-light"
        >
          {copied ? "Copied!" : "Copy brief"}
        </button>
      </div>
    </div>
  );
}
