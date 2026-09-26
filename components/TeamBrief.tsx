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
      <button onClick={onBack} className="mb-6 text-xs font-medium text-ink/40 hover:text-ink/70">
        &larr; Back to board
      </button>

      <div className="mb-6 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-1.5 text-sm font-medium text-ink/70 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Fully countersigned
        </div>
        <h1 className="font-serif text-3xl font-semibold text-ink">
          Team brief: {orgA} &times; {orgB}
        </h1>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink/85">{brief}</pre>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleCopy}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ink/90"
        >
          {copied ? "Copied!" : "Copy brief"}
        </button>
      </div>
    </div>
  );
}
