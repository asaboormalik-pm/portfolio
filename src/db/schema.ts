// Tenant-aware schema (PRD §7.2, §8). Every content table carries tenant_id,
// even though Phase 1 seeds exactly one tenant.
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const themeColorKeys = ["canvas", "ink", "inkSoft", "pine", "marigold", "rose"] as const;
export type ThemeColorKey = (typeof themeColorKeys)[number];

export type ThemeConfig = {
  colors?: Partial<Record<ThemeColorKey, string>>;
  photo?: string;
  photoAlt?: string;
  introVideoUrl?: string;
};

export const availabilityOptions = ["hidden", "open", "exploring", "closed"] as const;
export type Availability = (typeof availabilityOptions)[number];

// Headline numbers shown as the landing-page "sticker pile".
export type Highlight = { value: string; label: string };

export type ProfileLink = { label: string; url: string };

export type Metric = { value: string; label: string; signal?: boolean };

export type FrameworkStep = { title: string; description: string };

export type EngagementType = {
  key: string;
  label: string;
  description: string;
  weeklyLow: number;
  weeklyHigh: number;
};
export type ScopeOption = { key: string; label: string; description: string; multiplier: number };
export type TimelineOption = { key: string; label: string; weeks: number };

export type EstimatorSelection = {
  engagementType: string;
  scope: string;
  timeline: string;
  low: number;
  high: number;
  currency: string;
};

const id = () => uuid("id").primaryKey().defaultRandom();
const tenantId = () =>
  uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" });
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const tenants = pgTable(
  "tenants",
  {
    id: id(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    roleLine: text("role_line").notNull().default(""),
    headline: text("headline").notNull().default(""),
    subhead: text("subhead").notNull().default(""),
    bio: text("bio").notNull().default(""),
    readingNote: text("reading_note").notNull().default(""),
    contactEmail: text("contact_email").notNull(),
    links: jsonb("links").$type<ProfileLink[]>().notNull().default([]),
    footNote: text("foot_note").notNull().default(""),
    location: text("location").notNull().default(""),
    locationFlag: text("location_flag").notNull().default(""),
    availability: text("availability", { enum: availabilityOptions }).notNull().default("hidden"),
    highlights: jsonb("highlights").$type<Highlight[]>().notNull().default([]),
    themeConfig: jsonb("theme_config").$type<ThemeConfig>().notNull().default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("tenants_slug_idx").on(t.slug)],
);

export const users = pgTable(
  "users",
  {
    id: id(),
    tenantId: tenantId(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["owner"] }).notNull().default("owner"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const skillTags = pgTable(
  "skill_tags",
  {
    id: id(),
    tenantId: tenantId(),
    label: text("label").notNull(),
    category: text("category").notNull().default("General"),
    retired: boolean("retired").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("skill_tags_tenant_label_idx").on(t.tenantId, t.label)],
);

// Groups case studies on the public page (e.g. the order-lifecycle stages).
export const caseStudySections = pgTable("case_study_sections", {
  id: id(),
  tenantId: tenantId(),
  label: text("label").notNull(),
  shortLabel: text("short_label").notNull().default(""),
  blurb: text("blurb").notNull().default(""),
  position: integer("position").notNull().default(0),
});

export const caseStudies = pgTable(
  "case_studies",
  {
    id: id(),
    tenantId: tenantId(),
    sectionId: uuid("section_id").references(() => caseStudySections.id, { onDelete: "set null" }),
    slug: text("slug").notNull(),
    code: text("code").notNull().default(""),
    title: text("title").notNull(),
    hook: text("hook").notNull().default(""),
    context: text("context").notNull().default(""),
    location: text("location").notNull().default(""),
    locationFlag: text("location_flag").notNull().default(""),
    situation: text("situation").notNull().default(""),
    task: text("task").notNull().default(""),
    action: jsonb("action").$type<string[]>().notNull().default([]),
    result: text("result").notNull().default(""),
    metrics: jsonb("metrics").$type<Metric[]>().notNull().default([]),
    position: integer("position").notNull().default(0),
    published: boolean("published").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("case_studies_tenant_slug_idx").on(t.tenantId, t.slug)],
);

export const caseStudyTags = pgTable(
  "case_study_tags",
  {
    caseStudyId: uuid("case_study_id")
      .notNull()
      .references(() => caseStudies.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => skillTags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.caseStudyId, t.tagId] })],
);

export const methodologyDocs = pgTable(
  "methodology_docs",
  {
    id: id(),
    tenantId: tenantId(),
    frameworkSteps: jsonb("framework_steps").$type<FrameworkStep[]>().notNull().default([]),
    toneGuidelines: text("tone_guidelines").notNull().default(""),
    boundaries: jsonb("boundaries").$type<string[]>().notNull().default([]),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("methodology_docs_tenant_idx").on(t.tenantId)],
);

export const estimatorConfigs = pgTable(
  "estimator_configs",
  {
    id: id(),
    tenantId: tenantId(),
    currency: text("currency").notNull().default("EUR"),
    engagementTypes: jsonb("engagement_types").$type<EngagementType[]>().notNull().default([]),
    scopeOptions: jsonb("scope_options").$type<ScopeOption[]>().notNull().default([]),
    timelineOptions: jsonb("timeline_options").$type<TimelineOption[]>().notNull().default([]),
    disclaimer: text("disclaimer").notNull().default(""),
    published: boolean("published").notNull().default(false),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("estimator_configs_tenant_idx").on(t.tenantId)],
);

export const contactSubmissions = pgTable("contact_submissions", {
  id: id(),
  tenantId: tenantId(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull().default(""),
  message: text("message").notNull(),
  estimatorSelection: jsonb("estimator_selection").$type<EstimatorSelection | null>(),
  createdAt: createdAt(),
});
