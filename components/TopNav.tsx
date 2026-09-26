function SealIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#B8975A" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4.5" stroke="#B8975A" strokeWidth="1.2" />
      <path d="M12 3.5V6M12 18V20.5M3.5 12H6M18 12H20.5" stroke="#B8975A" strokeWidth="1.2" />
    </svg>
  );
}

export default function TopNav() {
  return (
    <div className="border-b border-gold/25 bg-ivory">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-4">
        <SealIcon />
        <span className="font-serif text-lg font-semibold tracking-wide text-navy">Countersign</span>
      </div>
    </div>
  );
}
