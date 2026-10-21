import type { Metadata } from "next";
import { getEstimatorConfig, getTenant } from "@/lib/content";
import { ConsultForm } from "./consult-form";

export const metadata: Metadata = { title: "Consulting" };

// Consultation estimator + contact form (PRD §5.3).
export default async function ConsultingPage() {
  const tenant = await getTenant();
  const config = await getEstimatorConfig(tenant.id);
  const estimator =
    config?.published && config.engagementTypes.length && config.scopeOptions.length && config.timelineOptions.length
      ? {
          currency: config.currency,
          engagementTypes: config.engagementTypes,
          scopeOptions: config.scopeOptions,
          timelineOptions: config.timelineOptions,
          disclaimer: config.disclaimer,
        }
      : null;

  return (
    <main className="wrap">
      <div className="page-head">
        <p className="section-label">Consulting</p>
        <h1>Work together</h1>
        <p>
          {estimator
            ? "Shape the engagement on the left to see a directional range, then send a note. Your selections travel with the message, so the first call can start from specifics."
            : "Tell me what you're working on and I'll reply by email. Pricing is scoped on a short call."}
        </p>
      </div>
      <ConsultForm estimator={estimator} />
    </main>
  );
}
