import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "../actions";

export const metadata: Metadata = { title: "Console", robots: { index: false } };

// Navigating into the console from the public site may block on the session check;
// navigations between console pages stream behind loading.tsx.
export const instant = false;

const nav = [
  { href: "/console", label: "Overview" },
  { href: "/console/case-studies", label: "Case studies" },
  { href: "/console/sections", label: "Sections" },
  { href: "/console/tags", label: "Skills taxonomy" },
  { href: "/console/methodology", label: "Methodology" },
  { href: "/console/estimator", label: "Estimator" },
  { href: "/console/profile", label: "Profile & branding" },
  { href: "/console/submissions", label: "Enquiries" },
];

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="console">
      <aside className="console__side">
        <Link href="/console" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          Console
        </Link>
        <span className="eyebrow">
          <Link href="/" style={{ textDecoration: "none" }}>
            View site ↗
          </Link>
        </span>
        <nav aria-label="Console">
          {nav.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button className="btn btn--ghost btn--small" type="submit">
            Sign out
          </button>
        </form>
      </aside>
      <main className="console__main">{children}</main>
    </div>
  );
}
