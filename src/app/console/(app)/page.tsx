import Link from "next/link";
import { and, count, desc, eq, gt } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireOwner } from "@/lib/dal";

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export default async function ConsoleOverview() {
  const { tenantId } = await requireOwner();
  const cs = schema.caseStudies;
  const since = daysAgo(30);

  const [studies, [{ tags }], [{ enquiries }], methodology, estimator, tenant, recent] = await Promise.all([
    db.select({ hook: cs.hook, published: cs.published, metrics: cs.metrics }).from(cs).where(eq(cs.tenantId, tenantId)),
    db.select({ tags: count() }).from(schema.skillTags).where(and(eq(schema.skillTags.tenantId, tenantId), eq(schema.skillTags.retired, false))),
    db
      .select({ enquiries: count() })
      .from(schema.contactSubmissions)
      .where(and(eq(schema.contactSubmissions.tenantId, tenantId), gt(schema.contactSubmissions.createdAt, since))),
    db.query.methodologyDocs.findFirst({ where: eq(schema.methodologyDocs.tenantId, tenantId) }),
    db.query.estimatorConfigs.findFirst({ where: eq(schema.estimatorConfigs.tenantId, tenantId) }),
    db.query.tenants.findFirst({ where: eq(schema.tenants.id, tenantId) }),
    db.query.contactSubmissions.findMany({
      where: eq(schema.contactSubmissions.tenantId, tenantId),
      orderBy: desc(schema.contactSubmissions.createdAt),
      limit: 5,
    }),
  ]);

  const published = studies.filter((s) => s.published);
  const missingHooks = published.filter((s) => !s.hook.trim()).length;
  const missingMetrics = published.filter((s) => s.metrics.length === 0).length;
  const draftSteps = (methodology?.frameworkSteps ?? []).filter((s) => !s.description.trim() || /^draft\b/i.test(s.description)).length;

  // Content prerequisites checklist (PRD §12).
  const checklist = [
    { done: published.length >= 4, text: `At least 4 published case studies (${published.length} now)`, href: "/console/case-studies" },
    { done: missingHooks === 0, text: missingHooks ? `${missingHooks} case studies have no one-line hook (the task line is shown instead)` : "Every case study has a hook", href: "/console/case-studies" },
    { done: missingMetrics === 0, text: missingMetrics ? `${missingMetrics} case studies have no metrics` : "Every case study has metrics", href: "/console/case-studies" },
    { done: tags > 0, text: `Skills taxonomy (${tags} active tags)`, href: "/console/tags" },
    {
      done: (methodology?.frameworkSteps.length ?? 0) > 0 && draftSteps === 0 && Boolean(methodology?.toneGuidelines.trim()),
      text: draftSteps ? `Methodology: ${draftSteps} framework steps still marked draft` : "Methodology document and tone guidelines",
      href: "/console/methodology",
    },
    { done: Boolean(estimator?.published), text: estimator?.published ? "Estimator pricing is live" : "Estimator has placeholder pricing and is hidden — set real ranges, then publish", href: "/console/estimator" },
    { done: Boolean(tenant?.headline && tenant.bio), text: "Headline, bio and positioning copy", href: "/console/profile" },
    {
      done: tenant?.availability !== "hidden",
      text: tenant?.availability === "hidden" ? "Availability status is hidden on the identity card" : "Availability status is set",
      href: "/console/profile",
    },
    { done: Boolean(tenant?.themeConfig.photo), text: tenant?.themeConfig.photo ? "Photo set" : "No photo — the identity card shows initials", href: "/console/profile" },
  ];

  return (
    <>
      <h1>Overview</h1>
      <p className="console__lede">Everything the public site, the recruiter tools and (later) the AI agent draw from lives here. Saves go live immediately.</p>
      <div className="stats">
        <div>
          <b>{published.length}</b>
          <span>Published case studies</span>
        </div>
        <div>
          <b>{studies.length - published.length}</b>
          <span>Drafts</span>
        </div>
        <div>
          <b>{tags}</b>
          <span>Active skill tags</span>
        </div>
        <div>
          <b>{enquiries}</b>
          <span>Enquiries, last 30 days</span>
        </div>
      </div>

      <h2>Content checklist</h2>
      <ul className="checklist">
        {checklist.map((c) => (
          <li key={c.text} className={c.done ? "is-done" : "is-todo"}>
            <span style={{ flex: 1 }}>{c.text}</span>
            {!c.done && <Link href={c.href}>Fix →</Link>}
          </li>
        ))}
      </ul>

      <h2>Recent enquiries</h2>
      {recent.length === 0 ? (
        <p className="console__lede">None yet.</p>
      ) : (
        <ul className="checklist">
          {recent.map((r) => (
            <li key={r.id}>
              <span style={{ flex: 1 }}>
                <b>{r.name}</b> {r.company && `· ${r.company}`} — {r.message.slice(0, 100)}
                {r.message.length > 100 && "…"}
              </span>
              <span className="pill">{r.createdAt.toISOString().slice(0, 10)}</span>
            </li>
          ))}
        </ul>
      )}
      <p style={{ marginTop: 12 }}>
        <Link href="/console/submissions" className="eyebrow" style={{ color: "var(--amber-deep)" }}>
          All enquiries →
        </Link>
      </p>
    </>
  );
}
