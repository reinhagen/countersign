"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function SealIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#B8975A" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4.5" stroke="#B8975A" strokeWidth="1.2" />
      <path d="M12 3.5V6M12 18V20.5M3.5 12H6M18 12H20.5" stroke="#B8975A" strokeWidth="1.2" />
    </svg>
  );
}

function PartnershipsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7.5" y="10" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CommitmentsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M4 6.5h16M4 12h16M4 17.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18.5 15.5l1.2 1.2 2.3-2.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7v5l3.2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NewCallIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 4.5h3.2l1.3 4-2 1.6a11 11 0 0 0 6.4 6.4l1.6-2 4 1.3V19a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 3.5 6.1 1.5 1.5 0 0 1 5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 6.5h16M4 12h16M4 17.5h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/workspace", label: "Partnerships", icon: PartnershipsIcon, exact: true },
  { href: "/workspace/commitments", label: "Commitments", icon: CommitmentsIcon, exact: false },
  { href: "/workspace/activity", label: "Activity", icon: ActivityIcon, exact: false },
];

export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const navLinks = (onNavigate?: () => void) => (
    <>
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-navy text-white" : "text-navy/70 hover:bg-navy/5"
            }`}
          >
            <Icon />
            {label}
          </Link>
        );
      })}
      <div className="my-2 border-t border-navy/10" />
      <Link
        href="/call"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg border border-gold/40 px-3 py-2.5 text-sm font-semibold text-gold-dark transition hover:bg-gold/10"
      >
        <NewCallIcon />
        New call
      </Link>
    </>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Mobile top bar */}
      <div className="no-print flex items-center justify-between border-b border-gold/25 bg-ivory px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <SealIcon />
          <span className="font-serif text-base font-semibold tracking-wide text-navy">Countersign</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-navy/70 hover:bg-navy/5"
        >
          <MenuIcon />
        </button>
      </div>

      {open && (
        <div
          className="no-print fixed inset-0 z-40 bg-navy/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`no-print fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-navy/10 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <SealIcon />
            <span className="font-serif text-lg font-semibold tracking-wide text-navy">Countersign</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-navy/50 hover:bg-navy/5 lg:hidden"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-5 pb-4">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-navy/10 bg-navy/[0.03] px-3 py-2.5 text-left"
          >
            <span>
              <span className="tracking-caps block text-[10px] font-semibold text-navy/40">Workspace</span>
              <span className="text-sm font-semibold text-navy">Wildframe Media</span>
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-navy/40">
              <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">{navLinks(() => setOpen(false))}</nav>

        <div className="px-5 py-5 text-[11px] text-navy/30">Countersign &middot; demo workspace</div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
