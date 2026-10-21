"use server";

// Owner Console mutations (PRD §5.6). Every action re-checks the session via requireOwner()
// and scopes writes to the owner's tenant, then expires that tenant's public cache.
import { and, asc, desc, eq, gt, lt } from "drizzle-orm";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/db";
import { availabilityOptions, themeColorKeys } from "@/db/schema";
import { requireOwner } from "@/lib/dal";
import { tenantTag } from "@/lib/content";
import { slugify } from "@/lib/slug";
import { signOut } from "@/auth";
import type { FormState } from "./ui";

const json = <T extends z.ZodType>(inner: T) =>
  z.string().transform((s, ctx) => {
    try {
      return JSON.parse(s);
    } catch {
      ctx.addIssue({ code: "custom", message: "Malformed list data." });
      return z.NEVER;
    }
  }).pipe(inner);

const text = (max = 5000) => z.string().trim().max(max).default("");
const checkbox = z.preprocess((v) => v === "on" || v === "true", z.boolean());
const lines = z.string().transform((s) => s.split("\n").map((l) => l.trim()).filter(Boolean));

function fail(error: z.ZodError): FormState {
  const issue = error.issues[0];
  return { ok: false, message: `${issue.path.join(".") || "Form"}: ${issue.message}` };
}

const isUniqueViolation = (e: unknown) => {
  const err = e as { code?: string; cause?: { code?: string } };
  return err?.code === "23505" || err?.cause?.code === "23505";
};

function done(tenantId: string, message = "Saved — live on the site."): FormState {
  updateTag(tenantTag(tenantId));
  return { ok: true, message };
}

// ---------- profile & branding ----------

const hex = z.union([z.literal(""), z.string().regex(/^#[0-9a-fA-F]{6}$/, "Colours must be #RRGGBB")]);
const profileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  roleLine: text(200),
  headline: text(300),
  subhead: text(600),
  bio: text(3000),
  readingNote: text(3000),
  contactEmail: z.email(),
  footNote: text(600),
  location: text(80),
  locationFlag: text(8),
  availability: z.enum(availabilityOptions),
  links: json(z.array(z.object({ label: z.string().trim().min(1), url: z.url() }))),
  highlights: json(z.array(z.object({ value: z.string().trim().min(1), label: z.string().trim().min(1) })).max(6, "at most 6 highlights")),
  photo: z.union([z.literal(""), z.url()]).default(""),
  photoAlt: text(300),
  introVideoUrl: z.union([z.literal(""), z.url()]).default(""),
  ...Object.fromEntries(themeColorKeys.map((k) => [`color_${k}`, hex])),
});

export async function saveProfile(_: FormState, formData: FormData): Promise<FormState> {
  const { tenantId } = await requireOwner();
  const p = profileSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return fail(p.error);
  const d = p.data as z.infer<typeof profileSchema> & Record<string, string>;
  const colors = Object.fromEntries(themeColorKeys.map((k) => [k, d[`color_${k}`]]).filter(([, v]) => v));
  await db
    .update(schema.tenants)
    .set({
      name: d.name,
      roleLine: d.roleLine,
      headline: d.headline,
      subhead: d.subhead,
      bio: d.bio,
      readingNote: d.readingNote,
      contactEmail: d.contactEmail,
      footNote: d.footNote,
      location: d.location,
      locationFlag: d.locationFlag,
      availability: d.availability,
      links: d.links,
      highlights: d.highlights,
      themeConfig: {
        photo: d.photo || undefined,
        photoAlt: d.photoAlt || undefined,
        introVideoUrl: d.introVideoUrl || undefined,
        colors,
      },
      updatedAt: new Date(),
    })
    .where(eq(schema.tenants.id, tenantId));
  return done(tenantId);
}

// ---------- case studies ----------

const caseStudySchema = z.object({
  title: z.string().trim().min(1, "required").max(200),
  slug: text(120),
  code: text(60),
  context: text(300),
  location: text(80),
  locationFlag: text(8),
  hook: text(300),
  sectionId: z.string().default(""),
  situation: text(),
  task: text(),
  action: lines,
  result: text(),
  metrics: json(z.array(z.object({ value: z.string().trim().min(1), label: z.string().trim(), signal: z.boolean().optional() }))),
  newTags: z.string().default(""),
  published: checkbox,
});

export async function saveCaseStudy(id: string | null, _: FormState, formData: FormData): Promise<FormState> {
  const { tenantId } = await requireOwner();
  const p = caseStudySchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return fail(p.error);
  const d = p.data;

  const [sections, tags] = await Promise.all([
    db.select({ id: schema.caseStudySections.id }).from(schema.caseStudySections).where(eq(schema.caseStudySections.tenantId, tenantId)),
    db.select({ id: schema.skillTags.id, label: schema.skillTags.label }).from(schema.skillTags).where(eq(schema.skillTags.tenantId, tenantId)),
  ]);
  const sectionId = sections.some((s) => s.id === d.sectionId) ? d.sectionId : null;
  const ownTagIds = new Set(tags.map((t) => t.id));
  const tagIds = formData.getAll("tagIds").map(String).filter((t) => ownTagIds.has(t));

  // Free-text new tags become taxonomy entries (or reuse an existing label).
  const byLabel = new Map(tags.map((t) => [t.label.toLowerCase(), t.id]));
  for (const label of d.newTags.split(",").map((t) => t.trim()).filter(Boolean)) {
    const existing = byLabel.get(label.toLowerCase());
    if (existing) tagIds.push(existing);
    else {
      const [row] = await db.insert(schema.skillTags).values({ tenantId, label }).returning({ id: schema.skillTags.id });
      byLabel.set(label.toLowerCase(), row.id);
      tagIds.push(row.id);
    }
  }

  const values = {
    title: d.title,
    slug: slugify(d.slug || d.title),
    code: d.code,
    context: d.context,
    location: d.location,
    locationFlag: d.locationFlag,
    hook: d.hook,
    sectionId,
    situation: d.situation,
    task: d.task,
    action: d.action,
    result: d.result,
    metrics: d.metrics.map((m) => ({ value: m.value, label: m.label, ...(m.signal ? { signal: true } : {}) })),
    published: d.published,
    updatedAt: new Date(),
  };

  let savedId = id;
  try {
    if (id) {
      const updated = await db
        .update(schema.caseStudies)
        .set(values)
        .where(and(eq(schema.caseStudies.id, id), eq(schema.caseStudies.tenantId, tenantId)))
        .returning({ id: schema.caseStudies.id });
      if (!updated.length) return { ok: false, message: "Case study not found." };
    } else {
      const [last] = await db
        .select({ position: schema.caseStudies.position })
        .from(schema.caseStudies)
        .where(eq(schema.caseStudies.tenantId, tenantId))
        .orderBy(desc(schema.caseStudies.position))
        .limit(1);
      const [row] = await db
        .insert(schema.caseStudies)
        .values({ ...values, tenantId, position: (last?.position ?? -1) + 1 })
        .returning({ id: schema.caseStudies.id });
      savedId = row.id;
    }
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, message: `Another case study already uses the slug "${values.slug}".` };
    throw e;
  }

  await db.delete(schema.caseStudyTags).where(eq(schema.caseStudyTags.caseStudyId, savedId!));
  const unique = [...new Set(tagIds)];
  if (unique.length) await db.insert(schema.caseStudyTags).values(unique.map((tagId) => ({ caseStudyId: savedId!, tagId })));

  updateTag(tenantTag(tenantId));
  if (!id) redirect(`/console/case-studies/${savedId}?created=1`);
  return { ok: true, message: d.published ? "Saved — live on the site." : "Saved as draft (not published)." };
}

export async function moveCaseStudy(id: string, direction: "up" | "down") {
  const { tenantId } = await requireOwner();
  const t = schema.caseStudies;
  const current = await db.query.caseStudies.findFirst({ where: and(eq(t.id, id), eq(t.tenantId, tenantId)) });
  if (!current) return;
  const neighbour = await db.query.caseStudies.findFirst({
    where: and(eq(t.tenantId, tenantId), direction === "up" ? lt(t.position, current.position) : gt(t.position, current.position)),
    orderBy: direction === "up" ? desc(t.position) : asc(t.position),
  });
  if (!neighbour) return;
  await db.transaction(async (tx) => {
    await tx.update(t).set({ position: neighbour.position }).where(eq(t.id, current.id));
    await tx.update(t).set({ position: current.position }).where(eq(t.id, neighbour.id));
  });
  updateTag(tenantTag(tenantId));
}

export async function setCaseStudyPublished(id: string, published: boolean) {
  const { tenantId } = await requireOwner();
  await db
    .update(schema.caseStudies)
    .set({ published, updatedAt: new Date() })
    .where(and(eq(schema.caseStudies.id, id), eq(schema.caseStudies.tenantId, tenantId)));
  updateTag(tenantTag(tenantId));
}

export async function deleteCaseStudy(id: string) {
  const { tenantId } = await requireOwner();
  await db.delete(schema.caseStudies).where(and(eq(schema.caseStudies.id, id), eq(schema.caseStudies.tenantId, tenantId)));
  updateTag(tenantTag(tenantId));
  redirect("/console/case-studies");
}

// ---------- sections ----------

const sectionSchema = z.object({
  label: z.string().trim().min(1, "required").max(120),
  shortLabel: text(60),
  blurb: text(600),
  position: z.coerce.number().int().default(0),
});

export async function saveSection(id: string | null, _: FormState, formData: FormData): Promise<FormState> {
  const { tenantId } = await requireOwner();
  const p = sectionSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return fail(p.error);
  if (id) {
    await db
      .update(schema.caseStudySections)
      .set(p.data)
      .where(and(eq(schema.caseStudySections.id, id), eq(schema.caseStudySections.tenantId, tenantId)));
  } else {
    await db.insert(schema.caseStudySections).values({ ...p.data, tenantId });
  }
  return done(tenantId);
}

export async function deleteSection(id: string) {
  const { tenantId } = await requireOwner();
  await db.delete(schema.caseStudySections).where(and(eq(schema.caseStudySections.id, id), eq(schema.caseStudySections.tenantId, tenantId)));
  updateTag(tenantTag(tenantId));
}

// ---------- skills taxonomy ----------

const tagSchema = z.object({
  label: z.string().trim().min(1, "required").max(80),
  category: z.string().trim().max(80).transform((s) => s || "General"),
  retired: checkbox,
});

export async function saveTag(id: string | null, _: FormState, formData: FormData): Promise<FormState> {
  const { tenantId } = await requireOwner();
  const p = tagSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return fail(p.error);
  try {
    if (id) {
      await db
        .update(schema.skillTags)
        .set(p.data)
        .where(and(eq(schema.skillTags.id, id), eq(schema.skillTags.tenantId, tenantId)));
    } else {
      await db.insert(schema.skillTags).values({ ...p.data, tenantId });
    }
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, message: `"${p.data.label}" already exists.` };
    throw e;
  }
  return done(tenantId, "Saved.");
}

export async function deleteTag(id: string) {
  const { tenantId } = await requireOwner();
  await db.delete(schema.skillTags).where(and(eq(schema.skillTags.id, id), eq(schema.skillTags.tenantId, tenantId)));
  updateTag(tenantTag(tenantId));
}

// ---------- methodology (grounds the AI agent's simulation mode, PRD §5.5) ----------

const methodologySchema = z.object({
  frameworkSteps: json(z.array(z.object({ title: z.string().trim().min(1, "each step needs a title"), description: z.string().trim() }))),
  toneGuidelines: text(5000),
  boundaries: lines,
});

export async function saveMethodology(_: FormState, formData: FormData): Promise<FormState> {
  const { tenantId } = await requireOwner();
  const p = methodologySchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return fail(p.error);
  await db
    .insert(schema.methodologyDocs)
    .values({ tenantId, ...p.data })
    .onConflictDoUpdate({ target: schema.methodologyDocs.tenantId, set: { ...p.data, updatedAt: new Date() } });
  return done(tenantId, "Saved.");
}

// ---------- estimator config (PRD §5.3) ----------

const key = z.string().trim().min(1).max(40);
const estimatorSchema = z.object({
  currency: z.string().trim().toUpperCase().length(3, "use a 3-letter currency code"),
  disclaimer: text(1000),
  published: checkbox,
  engagementTypes: json(
    z
      .array(
        z
          .object({ key, label: z.string().trim().min(1), description: z.string().trim(), weeklyLow: z.number().nonnegative(), weeklyHigh: z.number().nonnegative() })
          .refine((e) => e.weeklyHigh >= e.weeklyLow, "weekly high must be ≥ weekly low"),
      )
      .min(1),
  ),
  scopeOptions: json(z.array(z.object({ key, label: z.string().trim().min(1), description: z.string().trim(), multiplier: z.number().positive() })).min(1)),
  timelineOptions: json(z.array(z.object({ key, label: z.string().trim().min(1), weeks: z.number().positive() })).min(1)),
});

export async function saveEstimator(_: FormState, formData: FormData): Promise<FormState> {
  const { tenantId } = await requireOwner();
  const p = estimatorSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return fail(p.error);
  for (const list of [p.data.engagementTypes, p.data.scopeOptions, p.data.timelineOptions]) {
    if (new Set(list.map((o) => o.key)).size !== list.length) return { ok: false, message: "Keys must be unique within each list." };
  }
  await db
    .insert(schema.estimatorConfigs)
    .values({ tenantId, ...p.data })
    .onConflictDoUpdate({ target: schema.estimatorConfigs.tenantId, set: { ...p.data, updatedAt: new Date() } });
  return done(tenantId, p.data.published ? "Saved — estimator is live." : "Saved — estimator hidden from the site.");
}

// ---------- session ----------

export async function logout() {
  await signOut({ redirectTo: "/console/login" });
}

