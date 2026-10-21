import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireOwner } from "@/lib/dal";
import { saveEstimator } from "../../actions";
import { ActionForm, RowsEditor } from "../../ui";
import { Suspense } from "react";
import { ConsoleLoading } from "../../loading-state";

export default function EstimatorPage() {
  return (
    <Suspense fallback={<ConsoleLoading />}>
      <EstimatorPageContent />
    </Suspense>
  );
}

async function EstimatorPageContent() {
  const { tenantId } = await requireOwner();
  const c = await db.query.estimatorConfigs.findFirst({ where: eq(schema.estimatorConfigs.tenantId, tenantId) });

  return (
    <>
      <h1>Estimator</h1>
      <p className="console__lede">
        Range = weekly rate (low–high) × scope multiplier × weeks, rounded to the nearest 500. Visitors only ever see a range. While unpublished, the
        consulting page shows the contact form alone.
      </p>
      <ActionForm action={saveEstimator}>
        <div className="grid-2">
          <label className="field">
            <span>Currency</span>
            <input type="text" name="currency" defaultValue={c?.currency ?? "EUR"} maxLength={3} />
          </label>
          <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 22 }}>
            <input type="checkbox" name="published" defaultChecked={c?.published ?? false} />
            <small>Show the estimator on the consulting page</small>
          </label>
        </div>

        <h2>Engagement types</h2>
        <RowsEditor
          name="engagementTypes"
          addLabel="Add engagement type"
          columns={[
            { key: "key", label: "Key", width: "0.7fr" },
            { key: "label", label: "Label", width: "1fr" },
            { key: "description", label: "Description", width: "1.8fr" },
            { key: "weeklyLow", label: "Weekly low", type: "number", width: "0.8fr" },
            { key: "weeklyHigh", label: "Weekly high", type: "number", width: "0.8fr" },
          ]}
          initial={c?.engagementTypes ?? []}
        />

        <h2>Scope options</h2>
        <RowsEditor
          name="scopeOptions"
          addLabel="Add scope option"
          columns={[
            { key: "key", label: "Key", width: "0.7fr" },
            { key: "label", label: "Label", width: "1fr" },
            { key: "description", label: "Description", width: "1.8fr" },
            { key: "multiplier", label: "Multiplier", type: "number", step: "0.05", width: "0.7fr" },
          ]}
          initial={c?.scopeOptions ?? []}
        />

        <h2>Timeline options</h2>
        <RowsEditor
          name="timelineOptions"
          addLabel="Add timeline"
          columns={[
            { key: "key", label: "Key", width: "0.7fr" },
            { key: "label", label: "Label", width: "1.4fr" },
            { key: "weeks", label: "Weeks", type: "number", width: "0.7fr" },
          ]}
          initial={c?.timelineOptions ?? []}
        />

        <label className="field">
          <span>Disclaimer</span>
          <textarea name="disclaimer" rows={3} defaultValue={c?.disclaimer} />
        </label>
      </ActionForm>
    </>
  );
}
