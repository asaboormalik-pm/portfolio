import { asc, count, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireOwner } from "@/lib/dal";
import { deleteTag, saveTag } from "../../actions";
import { ActionForm } from "../../ui";
import { Suspense } from "react";
import { ConsoleLoading } from "../../loading-state";

export default function TagsPage() {
  return (
    <Suspense fallback={<ConsoleLoading />}>
      <TagsPageContent />
    </Suspense>
  );
}

async function TagsPageContent() {
  const { tenantId } = await requireOwner();
  const t = schema.skillTags;
  const tags = await db
    .select({ id: t.id, label: t.label, category: t.category, retired: t.retired, uses: count(schema.caseStudyTags.caseStudyId) })
    .from(t)
    .leftJoin(schema.caseStudyTags, eq(schema.caseStudyTags.tagId, t.id))
    .where(eq(t.tenantId, tenantId))
    .groupBy(t.id)
    .orderBy(asc(t.category), asc(t.label));

  return (
    <>
      <h1>Skills taxonomy</h1>
      <p className="console__lede">
        The tag vocabulary the JD match tool will map requirements onto. Retire a tag to hide it publicly without losing history; categories group
        related skills.
      </p>
      <div className="panel" style={{ marginBottom: 28 }}>
        <ActionForm action={saveTag.bind(null, null)} submitLabel="Add tag" className="inline-form">
          <input type="text" name="label" placeholder="New tag" required aria-label="Tag label" />
          <input type="text" name="category" placeholder="Category" aria-label="Category" />
        </ActionForm>
      </div>
      <div className="panel">
        {tags.map((tag) => (
          <div key={tag.id} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <ActionForm action={saveTag.bind(null, tag.id)} className="inline-form" submitLabel="Save">
              <input type="text" name="label" defaultValue={tag.label} required aria-label="Tag label" />
              <input type="text" name="category" defaultValue={tag.category} aria-label="Category" />
              <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13, color: "var(--slate)" }}>
                <input type="checkbox" name="retired" defaultChecked={tag.retired} /> Retired
              </label>
              <span className="pill">{tag.uses} uses</span>
            </ActionForm>
            {tag.uses === 0 && (
              <form action={deleteTag.bind(null, tag.id)}>
                <button className="btn btn--danger btn--small" aria-label={`Delete ${tag.label}`}>
                  Delete
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
