"use server";

import { and, count, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import type { EstimatorSelection } from "@/db/schema";
import { getEstimatorConfig, getTenant } from "@/lib/content";
import { estimateRange, formatMoney } from "@/lib/estimate";
import { notifyOwner } from "@/lib/notify";

export type ContactState = { ok: boolean; message: string } | null;

const contact = z.object({
  name: z.string().trim().min(1, "Please add your name.").max(120),
  email: z.email("That email doesn't look right.").max(200),
  company: z.string().trim().max(160).default(""),
  message: z.string().trim().min(10, "A sentence or two about what you need, please.").max(5000),
  engagementType: z.string().max(40).optional(),
  scope: z.string().max(40).optional(),
  timeline: z.string().max(40).optional(),
});

const PER_EMAIL_PER_HOUR = 3;

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Honeypot: real visitors never see or fill this field.
  if (formData.get("website")) return { ok: true, message: "Thanks — I'll be in touch." };

  const parsed = contact.safeParse(Object.fromEntries([...formData].filter(([, v]) => v !== "")));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const input = parsed.data;
  const email = input.email.toLowerCase();

  const tenant = await getTenant();

  const [{ recent }] = await db
    .select({ recent: count() })
    .from(schema.contactSubmissions)
    .where(
      and(
        eq(schema.contactSubmissions.tenantId, tenant.id),
        eq(schema.contactSubmissions.email, email),
        gt(schema.contactSubmissions.createdAt, new Date(Date.now() - 60 * 60 * 1000)),
      ),
    );
  if (recent >= PER_EMAIL_PER_HOUR) return { ok: false, message: "You've sent a few messages already — I'll reply to those first." };

  // Recompute the range server-side; never trust numbers posted from the browser.
  let selection: EstimatorSelection | null = null;
  const config = await getEstimatorConfig(tenant.id);
  if (config?.published && input.engagementType && input.scope && input.timeline) {
    const range = estimateRange(config, input.engagementType, input.scope, input.timeline);
    if (range)
      selection = { engagementType: input.engagementType, scope: input.scope, timeline: input.timeline, ...range, currency: config.currency };
  }

  await db.insert(schema.contactSubmissions).values({
    tenantId: tenant.id,
    name: input.name,
    email,
    company: input.company,
    message: input.message,
    estimatorSelection: selection,
  });

  const lines = [
    `From: ${input.name} <${email}>${input.company ? ` — ${input.company}` : ""}`,
    selection
      ? `Estimator: ${selection.engagementType} / ${selection.scope} / ${selection.timeline} → ${formatMoney(selection.low, selection.currency)}–${formatMoney(selection.high, selection.currency)}`
      : "Estimator: not used",
    "",
    input.message,
  ];
  await notifyOwner(tenant.contactEmail, `New consulting enquiry from ${input.name}`, lines.join("\n"));

  return { ok: true, message: "Thanks — your note is in. I'll reply by email, usually within two working days." };
}
