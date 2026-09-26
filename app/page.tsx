import Link from "next/link";

function SealIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#B8975A" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4.5" stroke="#B8975A" strokeWidth="1.2" />
      <path d="M12 3.5V6M12 18V20.5M3.5 12H6M18 12H20.5" stroke="#B8975A" strokeWidth="1.2" />
    </svg>
  );
}

const VALUE_POINTS = [
  {
    title: "Listens so no one takes notes",
    body: "Countersign transcribes the call live, so both sides can stay present in the conversation instead of scribbling their own version of it.",
  },
  {
    title: "Catches soft asks and ambiguity",
    body: "A hesitant \"would it be possible to...\" or a vague date like \"sometime in March\" gets flagged before it quietly becomes a dispute.",
  },
  {
    title: "One record both sides sign",
    body: "Each organization reviews and signs from its own device. Nothing is final until both sides agree on the exact same wording.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-gold/25">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <SealIcon />
            <span className="font-serif text-lg font-semibold tracking-wide text-navy">Countersign</span>
          </div>
          <Link
            href="/workspace"
            className="text-sm font-medium text-navy/60 underline decoration-gold/40 underline-offset-4 hover:text-navy"
          >
            Open workspace
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
        <h1 className="mx-auto max-w-3xl font-serif text-4xl font-semibold leading-tight tracking-wide text-navy sm:text-5xl">
          Countersign listens to your partner call and turns it into one record both sides sign.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-navy/60">
          After a partnership call, both sides usually walk away with their own memory of what was said. Countersign
          listens instead, reconciles the call into a neutral list of commitments and open questions, and has each
          organization sign off from its own device &mdash; so nothing is final until both sides agree on the exact
          same wording.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/call?demo=1"
            className="w-full rounded-lg bg-navy px-10 py-3.5 text-center font-serif text-base font-semibold tracking-wide text-white shadow-hairline transition hover:bg-navy-light sm:w-auto"
          >
            Try the demo
          </Link>
          <Link
            href="/workspace"
            className="w-full rounded-lg border border-navy/15 bg-white px-10 py-3.5 text-center font-serif text-base font-semibold tracking-wide text-navy shadow-hairline transition hover:bg-navy/5 sm:w-auto"
          >
            Open workspace
          </Link>
        </div>
      </main>

      <section className="border-t border-gold/20 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-8 sm:grid-cols-3">
            {VALUE_POINTS.map((point) => (
              <div key={point.title}>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
                  <SealIcon size={16} />
                </div>
                <h2 className="mb-2 font-serif text-lg font-semibold tracking-wide text-navy">{point.title}</h2>
                <p className="text-sm leading-relaxed text-navy/60">{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
