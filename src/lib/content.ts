// Public, cached reads. Everything is keyed by tenant; console mutations call
// updateTag(tenantTag(id)) so edits go live without a deploy (PRD §5.6).
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";

export const tenantTag = (tenantId: string) => `tenant:${tenantId}`;

// Phase 1 serves one tenant per deployment. Phase 2 resolves this from the subdomain (PRD §6.1).
export function currentTenantSlug() {
  return process.env.TENANT_SLUG ?? "abdul-saboor";
}

export async function getTenant() {
  "use cache";
  cacheLife("days");
  const slug = currentTenantSlug();
  const tenant = await db.query.tenants.findFirst({ where: eq(schema.tenants.slug, slug) });
  if (!tenant) throw new Error(`Tenant "${slug}" not found — run npm run db:seed`);
  cacheTag(tenantTag(tenant.id));
  return tenant;
}

export type Tenant = Awaited<ReturnType<typeof getTenant>>;

export async function getCaseStudyLibrary(tenantId: string) {
  "use cache";
  cacheLife("days");
  cacheTag(tenantTag(tenantId));

  const [sections, studies, links] = await Promise.all([
    db.query.caseStudySections.findMany({
      where: eq(schema.caseStudySections.tenantId, tenantId),
      orderBy: asc(schema.caseStudySections.position),
    }),
    db.query.caseStudies.findMany({
      where: and(eq(schema.caseStudies.tenantId, tenantId), eq(schema.caseStudies.published, true)),
      orderBy: asc(schema.caseStudies.position),
    }),
    db
      .select({ caseStudyId: schema.caseStudyTags.caseStudyId, label: schema.skillTags.label })
      .from(schema.caseStudyTags)
      .innerJoin(schema.skillTags, eq(schema.skillTags.id, schema.caseStudyTags.tagId))
      .where(and(eq(schema.skillTags.tenantId, tenantId), eq(schema.skillTags.retired, false))),
  ]);

  const tagsByStudy = new Map<string, string[]>();
  for (const l of links) tagsByStudy.set(l.caseStudyId, [...(tagsByStudy.get(l.caseStudyId) ?? []), l.label]);

  const cards = studies.map((s) => ({
    id: s.id,
    slug: s.slug,
    sectionId: s.sectionId,
    code: s.code,
    title: s.title,
    hook: s.hook,
    context: s.context,
    location: s.location,
    locationFlag: s.locationFlag,
    situation: s.situation,
    task: s.task,
    action: s.action,
    result: s.result,
    metrics: s.metrics,
    tags: tagsByStudy.get(s.id) ?? [],
  }));

  return {
    sections: sections
      .map((sec) => ({ ...sec, studies: cards.filter((c) => c.sectionId === sec.id) }))
      .concat(
        // Case studies whose section was deleted still show, at the end.
        cards.some((c) => !c.sectionId)
          ? [{ id: "unsorted", tenantId, label: "More work", shortLabel: "More", blurb: "", position: 999, studies: cards.filter((c) => !c.sectionId) }]
          : [],
      )
      .filter((sec) => sec.studies.length > 0),
    total: cards.length,
  };
}

export type CaseStudyCard = Awaited<ReturnType<typeof getCaseStudyLibrary>>["sections"][number]["studies"][number];

export async function getEstimatorConfig(tenantId: string) {
  "use cache";
  cacheLife("days");
  cacheTag(tenantTag(tenantId));
  return (await db.query.estimatorConfigs.findFirst({ where: eq(schema.estimatorConfigs.tenantId, tenantId) })) ?? null;
}
