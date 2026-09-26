export default function RoomError({ message }: { message: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-border bg-amber-bg text-amber">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
          <path d="M12 8v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="12" cy="16" r="0.9" fill="currentColor" />
        </svg>
      </div>
      <h1 className="mb-2 font-serif text-2xl font-semibold text-navy">This link isn&apos;t working</h1>
      <p className="text-sm leading-relaxed text-navy/60">{message}</p>
    </div>
  );
}
