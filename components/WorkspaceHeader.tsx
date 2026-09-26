"use client";

interface Props {
  orgA: string;
  orgB: string;
  viewingAs: "A" | "B";
  onSetViewingAs: (v: "A" | "B") => void;
  tab: "board" | "commitments";
  onSetTab: (t: "board" | "commitments") => void;
  commitmentsCount: number;
  onBack: () => void;
  demoMode?: boolean;
}

export default function WorkspaceHeader({
  orgA,
  orgB,
  viewingAs,
  onSetViewingAs,
  tab,
  onSetTab,
  commitmentsCount,
  onBack,
  demoMode,
}: Props) {
  return (
    <div className="mb-8">
      {demoMode && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-border bg-amber-bg px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber">
          Demo mode (both sides on one screen)
        </div>
      )}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <button onClick={onBack} className="mb-2 text-xs font-medium text-navy/40 hover:text-navy/70">
            &larr; Back to call
          </button>
          <h1 className="font-serif text-2xl font-semibold tracking-wide text-navy">
            {orgA} <span className="text-gold">&times;</span> {orgB}
          </h1>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-navy/10 bg-white p-1 shadow-hairline">
          <button
            onClick={() => onSetViewingAs("A")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              viewingAs === "A" ? "bg-navy text-white" : "text-navy/60 hover:text-navy"
            }`}
          >
            Viewing as {orgA}
          </button>
          <button
            onClick={() => onSetViewingAs("B")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              viewingAs === "B" ? "bg-gold text-white" : "text-navy/60 hover:text-navy"
            }`}
          >
            Viewing as {orgB}
          </button>
        </div>
      </div>

      <div className="flex gap-6 border-b border-gold/25">
        <button
          onClick={() => onSetTab("board")}
          className={`relative pb-3 text-sm font-semibold tracking-wide transition ${
            tab === "board" ? "text-navy" : "text-navy/40 hover:text-navy/70"
          }`}
        >
          Agreement board
          {tab === "board" && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold" />}
        </button>
        <button
          onClick={() => onSetTab("commitments")}
          className={`relative pb-3 text-sm font-semibold tracking-wide transition ${
            tab === "commitments" ? "text-navy" : "text-navy/40 hover:text-navy/70"
          }`}
        >
          My commitments &middot; {commitmentsCount}
          {tab === "commitments" && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold" />}
        </button>
      </div>
    </div>
  );
}
