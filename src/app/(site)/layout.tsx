import Link from "next/link";
import { getTenant } from "@/lib/content";
import { SiteNav } from "./site-nav";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenant();
  return (
    <>
      <SiteNav name={tenant.name} />
      {children}
      <footer className="foot">
        <div>
          <p className="foot__nm">{tenant.name}</p>
          {tenant.footNote && <p className="foot__note">{tenant.footNote}</p>}
        </div>
        <div className="foot__links">
          <Link href="/consulting#contact">Get in touch</Link>
          <a href={`mailto:${tenant.contactEmail}`}>Email</a>
          {tenant.links.map((l) => (
            <a key={l.url} href={l.url} rel="me noopener">
              {l.label}
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}
