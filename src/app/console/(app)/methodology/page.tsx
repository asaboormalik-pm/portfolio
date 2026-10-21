import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireOwner } from "@/lib/dal";
import { saveMethodology } from "../../actions";
import { ActionForm, RowsEditor } from "../../ui";

export default async function MethodologyPage() {
  const { tenantId } = await requireOwner();
  const doc = await db.query.methodologyDocs.findFirst({ where: eq(schema.methodologyDocs.tenantId, tenantId) });

  return (
    <>
      <h1>Methodology</h1>
      <p className="console__lede">
        How you work a product problem, step by step. The AI agent&apos;s simulation mode follows this framework, so write it the way you&apos;d explain it
        to someone shadowing you. Not public on its own.
      </p>
      <ActionForm action={saveMethodology}>
        <div className="field">
          <span>Framework steps</span>
        </div>
        <RowsEditor
          name="frameworkSteps"
          addLabel="Add step"
          columns={[
            { key: "title", label: "Step", width: "1fr" },
            { key: "description", label: "What you do and why", type: "textarea", width: "2.4fr" },
          ]}
          initial={doc?.frameworkSteps ?? []}
        />
        <label className="field">
          <span>Tone guidelines</span>
          <textarea name="toneGuidelines" rows={4} defaultValue={doc?.toneGuidelines} placeholder="e.g. Direct, plain English, numbers before adjectives…" />
        </label>
        <label className="field">
          <span>Boundaries</span>
          <textarea name="boundaries" rows={5} defaultValue={doc?.boundaries.join("\n")} />
          <small>One rule per line. The agent refuses anything these exclude.</small>
        </label>
      </ActionForm>
    </>
  );
}
