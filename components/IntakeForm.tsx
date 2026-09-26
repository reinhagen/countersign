"use client";

import { useState } from "react";
import { DEMO_NOTES_A, DEMO_NOTES_B, DEMO_ORG_A, DEMO_ORG_B } from "@/lib/demo";

interface Props {
  orgA: string;
  orgB: string;
  notesA: string;
  notesB: string;
  loading: boolean;
  error: string | null;
  onChange: (fields: { orgA?: string; orgB?: string; notesA?: string; notesB?: string }) => void;
  onLoadDemo: () => void;
  onReconcile: () => void;
}

export default function IntakeForm({
  orgA,
  orgB,
  notesA,
  notesB,
  loading,
  error,
  onChange,
  onLoadDemo,
  onReconcile,
}: Props) {
  const canReconcile = notesA.trim().length > 0 && notesB.trim().length > 0 && !loading;

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <header className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-1.5 text-sm font-medium text-ink/70 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Countersign
        </div>
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          A neutral record of what was actually agreed.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink/60">
          After a partnership call, both sides write their own notes. Countersign reconciles
          them into one shared board&mdash;surfacing what matches, what conflicts, and what was
          only ever a soft ask&mdash;so nothing gets lost between two sets of memory.
        </p>
      </header>

      <div className="mb-6 flex justify-center">
        <button
          onClick={onLoadDemo}
          className="rounded-full border border-ink/15 bg-white px-5 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-ink/30 hover:shadow"
        >
          Load demo: Wildframe Media &times; Aurel Watches
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink/50">
            Side A &mdash; organization name
          </label>
          <input
            value={orgA}
            onChange={(e) => onChange({ orgA: e.target.value })}
            placeholder="e.g. Wildframe Media"
            className="mb-4 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-ink/40 focus:outline-none"
          />
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink/50">
            Side A notes
          </label>
          <textarea
            value={notesA}
            onChange={(e) => onChange({ notesA: e.target.value })}
            placeholder="Paste or write Side A's notes from the call..."
            className="h-64 w-full resize-none rounded-lg border border-ink/15 px-3 py-2 text-sm leading-relaxed focus:border-ink/40 focus:outline-none"
          />
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink/50">
            Side B &mdash; organization name
          </label>
          <input
            value={orgB}
            onChange={(e) => onChange({ orgB: e.target.value })}
            placeholder="e.g. Aurel Watches"
            className="mb-4 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-ink/40 focus:outline-none"
          />
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink/50">
            Side B notes
          </label>
          <textarea
            value={notesB}
            onChange={(e) => onChange({ notesB: e.target.value })}
            placeholder="Paste or write Side B's notes from the call..."
            className="h-64 w-full resize-none rounded-lg border border-ink/15 px-3 py-2 text-sm leading-relaxed focus:border-ink/40 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={onReconcile}
          disabled={!canReconcile}
          className="rounded-full bg-ink px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/30"
        >
          {loading ? "Reconciling notes…" : "Reconcile"}
        </button>
      </div>
    </div>
  );
}

export function demoDefaults() {
  return { orgA: DEMO_ORG_A, orgB: DEMO_ORG_B, notesA: DEMO_NOTES_A, notesB: DEMO_NOTES_B };
}
