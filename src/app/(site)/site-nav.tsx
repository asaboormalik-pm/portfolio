"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Entry = { eyebrow: string; label: string; desc: string; href?: string };
type Menu = { id: string; label: string; base: string; entries: Entry[] };

// Entries without an href are roadmap items (PRD §13 Phase 1b/1c) shown as "Soon", never as dead links.
const menus: Menu[] = [
  {
    id: "files",
    label: "Case files",
    base: "/work",
    entries: [
      { eyebrow: "Browse", label: "STAR-M case studies", desc: "Every writeup, with method and metrics.", href: "/work" },
      { eyebrow: "Filter", label: "By skill tag", desc: "Find the evidence for a specific claim.", href: "/work#filters" },
      { eyebrow: "Start", label: "Where to begin", desc: "Pick the path that fits why you're here.", href: "/#journeys" },
    ],
  },
  {
    id: "recruiters",
    label: "For recruiters",
    base: "/recruiters",
    entries: [
      { eyebrow: "Match", label: "Paste a job description", desc: "Evidence-linked, gaps included." },
      { eyebrow: "Test", label: "Submit a case study", desc: "Reviewed before it reaches you." },
      { eyebrow: "Now", label: "Recruiter overview", desc: "What's coming, and how to get a fit check today.", href: "/recruiters" },
    ],
  },
  {
    id: "consulting",
    label: "Consulting",
    base: "/consulting",
    entries: [
      { eyebrow: "Scope", label: "Estimate & contact", desc: "A range before you reach out.", href: "/consulting" },
      { eyebrow: "Talk", label: "Send a note", desc: "Real scoping happens live.", href: "/consulting#contact" },
      { eyebrow: "Read", label: "How engagements work", desc: "Advisory, embedded, or project.", href: "/consulting" },
    ],
  },
];

function Column({ e, onNavigate }: { e: Entry; onNavigate: () => void }) {
  return (
    <div className="mega-col">
      <p className="eyebrow">{e.eyebrow}</p>
      {e.href ? (
        <Link href={e.href} onClick={onNavigate}>
          {e.label}
        </Link>
      ) : (
        <span className="soon">
          {e.label}
          <span className="soon-badge">Soon</span>
        </span>
      )}
      <p>{e.desc}</p>
    </div>
  );
}

export function SiteNav({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const close = (e: KeyboardEvent | MouseEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("click", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("click", close);
    };
  }, []);

  const done = () => {
    setOpen(null);
    setSheet(false);
  };

  return (
    <nav className="nav" aria-label="Main" ref={ref}>
      <div className="nav-bar">
        <Link href="/" className="brand" onClick={done}>
          <span className="brand-mark" aria-hidden="true">
            {initials}
          </span>
          {name}
        </Link>
        <div className="nav-items">
          {menus.map((m) => (
            <div
              key={m.id}
              className={`nav-item${open === m.id ? " open" : ""}`}
              onMouseEnter={() => setOpen(m.id)}
              onMouseLeave={() => setOpen(null)}
            >
              <button
                type="button"
                aria-expanded={open === m.id}
                aria-controls={`mega-${m.id}`}
                aria-current={pathname.startsWith(m.base) ? "page" : undefined}
                onClick={() => setOpen((o) => (o === m.id ? null : m.id))}
              >
                {m.label}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div className="mega" id={`mega-${m.id}`}>
                {m.entries.map((e) => (
                  <Column key={e.label} e={e} onNavigate={done} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <Link href="/consulting#contact" className="nav-cta">
          Get in touch
        </Link>
        <button type="button" className="nav-toggle" aria-expanded={sheet} aria-controls="nav-sheet" onClick={() => setSheet((s) => !s)}>
          {sheet ? "Close" : "Menu"}
        </button>
      </div>
      <div className={`nav-sheet${sheet ? " open" : ""}`} id="nav-sheet">
        {menus.map((m) => (
          <div key={m.id}>
            <p className="section-label" style={{ marginTop: 14 }}>
              {m.label}
            </p>
            {m.entries.map((e) => (
              <Column key={e.label} e={e} onNavigate={done} />
            ))}
          </div>
        ))}
        <p style={{ marginTop: 16 }}>
          <Link href="/consulting#contact" className="nav-cta" style={{ display: "inline-block" }} onClick={done}>
            Get in touch
          </Link>
        </p>
      </div>
    </nav>
  );
}
