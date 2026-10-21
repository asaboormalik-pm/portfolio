// Seeds the single Phase 1 tenant. Run: npm run db:seed  (add -- --reset to wipe and reseed)
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import * as schema from "./schema";
import { seedSections } from "./seed-data";
import { slugify } from "../lib/slug";

const { DATABASE_URL = "", TENANT_SLUG = "abdul-saboor", OWNER_EMAIL = "", OWNER_PASSWORD = "" } = process.env;
if (!DATABASE_URL || !OWNER_EMAIL || !OWNER_PASSWORD) {
  console.error("DATABASE_URL, OWNER_EMAIL and OWNER_PASSWORD must be set (see .env.example).");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client, { schema });

async function main() {
  const existing = await db.query.tenants.findFirst({ where: eq(schema.tenants.slug, TENANT_SLUG) });
  if (existing) {
    if (!process.argv.includes("--reset")) {
      console.log(`Tenant "${TENANT_SLUG}" already exists — nothing to do. Pass --reset to wipe and reseed.`);
      return;
    }
    await db.delete(schema.tenants).where(eq(schema.tenants.id, existing.id));
  }

  const [tenant] = await db
    .insert(schema.tenants)
    .values({
      slug: TENANT_SLUG,
      name: "Abdul Saboor",
      roleLine: "Product Leader - Supply Chain & Fulfilment Tech, AI Product & Engineering",
      headline: "Six supply chains, built from zero. None of them broke *at scale*.",
      subhead:
        "Marketplace inventory engines, omni-channel warehouse systems and last-mile platforms shipped across 11+ countries — engineered against on-time-in-full, not vanity velocity.",
      bio: "Fourteen projects, four countries, one continuous problem: getting the right item to the right person on time, at a cost the business can carry. Every project here sits somewhere on the path an order takes from **a promise made at checkout** to **a box at the door** — so that is how they are filed, by stage of the order rather than by the company that paid for them.",
      readingNote:
        "Employers are described by category, not name. Architecture diagrams, internal documents and unlaunched roadmap are not reproduced anywhere on this page. What is here is the problem, the reasoning, and the result — which is the part worth discussing anyway.\n\nFigures are either already public or stated as the design target they were. Happy to go deeper in conversation on anything below.",
      contactEmail: OWNER_EMAIL,
      links: [
        { label: "LinkedIn", url: "https://www.linkedin.com/in/abdulsaboor-thepm/" },
        { label: "GitHub", url: "https://github.com/asaboormalik-pm" },
      ],
      footNote:
        "Berlin, Germany. Fourteen projects across meal-kit fulfillment, marketplace inventory, grocery last mile and omnichannel retail. Details of any of them, gladly, in conversation.",
      location: "Berlin, Germany",
      locationFlag: "🇩🇪",
      // Every figure here is stated elsewhere in the seeded content — no new claims.
      highlights: [
        { value: "10+", label: "years in product" },
        { value: "11+", label: "countries shipped to" },
        { value: "80+", label: "sites rolled out" },
        { value: "99.5%", label: "in full, on time" },
        { value: "3", label: "continents, one platform" },
        { value: "4", label: "countries worked in" },
      ],
      themeConfig: {},
    })
    .returning();

  await db.insert(schema.users).values({
    tenantId: tenant.id,
    email: OWNER_EMAIL.toLowerCase(),
    passwordHash: await bcrypt.hash(OWNER_PASSWORD, 12),
  });

  const tagLabels = [...new Set(seedSections.flatMap((s) => s.projects.flatMap((p) => p.tags)))];
  const tags = await db
    .insert(schema.skillTags)
    .values(tagLabels.map((label) => ({ tenantId: tenant.id, label })))
    .returning();
  const tagId = new Map(tags.map((t) => [t.label, t.id]));

  let position = 0;
  for (const [i, section] of seedSections.entries()) {
    const [row] = await db
      .insert(schema.caseStudySections)
      .values({ tenantId: tenant.id, label: section.label, shortLabel: section.shortLabel, blurb: section.blurb, position: i })
      .returning();
    for (const p of section.projects) {
      const [cs] = await db
        .insert(schema.caseStudies)
        .values({
          tenantId: tenant.id,
          sectionId: row.id,
          slug: slugify(p.title),
          code: p.code,
          title: p.title,
          context: p.context,
          situation: p.situation,
          task: p.task,
          action: [...p.action],
          result: p.result,
          metrics: p.metrics.map((m) => ({ ...m })),
          position: position++,
        })
        .returning();
      await db.insert(schema.caseStudyTags).values(p.tags.map((t) => ({ caseStudyId: cs.id, tagId: tagId.get(t)! })));
    }
  }

  // Draft outline from PRD §5.5 — the owner rewrites this in the console.
  await db.insert(schema.methodologyDocs).values({
    tenantId: tenant.id,
    frameworkSteps: [
      { title: "Clarify the problem", description: "Draft — describe how you pin down what is actually being asked." },
      { title: "Identify the users", description: "Draft" },
      { title: "Define success metrics", description: "Draft" },
      { title: "Explore options", description: "Draft" },
      { title: "De-risk", description: "Draft" },
      { title: "Sequence the work", description: "Draft" },
    ],
    toneGuidelines: "",
    boundaries: [
      "Never invent achievements, figures or employers that are not in the case studies.",
      "Do not negotiate salary or rates on the owner's behalf.",
      "Do not give personal, legal or medical opinions.",
    ],
  });

  // Placeholder pricing; unpublished until the owner sets real numbers in the console.
  await db.insert(schema.estimatorConfigs).values({
    tenantId: tenant.id,
    currency: "EUR",
    published: false,
    engagementTypes: [
      { key: "advisory", label: "Advisory", description: "A few hours a week of sparring and review.", weeklyLow: 1000, weeklyHigh: 2000 },
      { key: "embedded", label: "Embedded", description: "Working inside your team as interim product lead.", weeklyLow: 4000, weeklyHigh: 6000 },
      { key: "project", label: "Project-based", description: "A defined deliverable with a fixed end.", weeklyLow: 3000, weeklyHigh: 5000 },
    ],
    scopeOptions: [
      { key: "discovery", label: "Discovery only", description: "Understand the problem and the options.", multiplier: 0.8 },
      { key: "strategy", label: "Strategy", description: "Discovery plus a costed, sequenced plan.", multiplier: 1 },
      { key: "lifecycle", label: "Full lifecycle", description: "Strategy through delivery and rollout.", multiplier: 1.25 },
    ],
    timelineOptions: [
      { key: "2w", label: "2 weeks", weeks: 2 },
      { key: "6w", label: "6 weeks", weeks: 6 },
      { key: "12w", label: "3 months", weeks: 12 },
      { key: "24w", label: "6 months", weeks: 24 },
    ],
    disclaimer:
      "This is a directional range, not a quote. Real scoping happens on a call, and the final number depends on what we find there.",
  });

  console.log(`Seeded tenant "${TENANT_SLUG}" with ${position} case studies and ${tags.length} tags.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => client.end());
