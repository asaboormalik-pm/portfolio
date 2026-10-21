import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireOwner } from "@/lib/dal";
import { deleteSection, saveSection } from "../../actions";
import { ActionForm } from "../../ui";
import { Suspense } from "react";
import { ConsoleLoading } from "../../loading-state";

type Section = { id: string; label: string; shortLabel: string; blurb: string; position: number };

function SectionFields({ s }: { s?: Section }) {
  return (
    <>
      <div className="grid-2">
        <label className="field">
          <span>Label</span>
          <input type="text" name="label" defaultValue={s?.label} required />
        </label>
        <label className="field">
          <span>Order</span>
          <input type="number" name="position" defaultValue={s?.position ?? 0} />
        </label>
      </div>
      <label className="field">
        <span>Blurb</span>
        <textarea name="blurb" rows={2} defaultValue={s?.blurb} />
      </label>
      <input type="hidden" name="shortLabel" defaultValue={s?.shortLabel} />
    </>
  );
}

export default function SectionsPage() {
  return (
    <Suspense fallback={<ConsoleLoading />}>
      <SectionsPageContent />
    </Suspense>
  );
}

async function SectionsPageContent() {
  const { tenantId } = await requireOwner();
  const sections = await db.query.caseStudySections.findMany({
    where: eq(schema.caseStudySections.tenantId, tenantId),
    orderBy: asc(schema.caseStudySections.position),
  });

  return (
    <>
      <h1>Sections</h1>
      <p className="console__lede">How the public library groups case studies. Deleting a section keeps its case studies; they move to “More work”.</p>
      {sections.map((s) => (
        <div className="panel" key={s.id} style={{ marginBottom: 16 }}>
          <ActionForm action={saveSection.bind(null, s.id)}>
            <SectionFields s={s} />
          </ActionForm>
          <form action={deleteSection.bind(null, s.id)} style={{ marginTop: 10 }}>
            <button className="btn btn--danger btn--small">Delete section</button>
          </form>
        </div>
      ))}
      <h2>Add a section</h2>
      <div className="panel">
        <ActionForm action={saveSection.bind(null, null)} submitLabel="Add section">
          <SectionFields />
        </ActionForm>
      </div>
    </>
  );
}
