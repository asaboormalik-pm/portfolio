import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireOwner } from "@/lib/dal";
import { deleteCaseStudy } from "../../../actions";
import { CaseStudyForm } from "../case-study-form";
import { Suspense } from "react";
import { ConsoleLoading } from "../../../loading-state";

export default function EditCaseStudy(props: PageProps<"/console/case-studies/[id]">) {
  return (
    <Suspense fallback={<ConsoleLoading />}>
      <EditCaseStudyContent {...props} />
    </Suspense>
  );
}

async function EditCaseStudyContent({ params, searchParams }: PageProps<"/console/case-studies/[id]">) {
  const { tenantId } = await requireOwner();
  const { id } = await params;
  const { created } = await searchParams;
  const isNew = id === "new";

  const [study, sections, tags, links] = await Promise.all([
    isNew
      ? null
      : db.query.caseStudies.findFirst({ where: and(eq(schema.caseStudies.id, id), eq(schema.caseStudies.tenantId, tenantId)) }).catch(() => undefined),
    db.query.caseStudySections.findMany({ where: eq(schema.caseStudySections.tenantId, tenantId), orderBy: asc(schema.caseStudySections.position) }),
    db.query.skillTags.findMany({ where: eq(schema.skillTags.tenantId, tenantId), orderBy: asc(schema.skillTags.label) }),
    isNew ? [] : db.select().from(schema.caseStudyTags).where(eq(schema.caseStudyTags.caseStudyId, id)).catch(() => []),
  ]);
  if (!isNew && !study) notFound();

  return (
    <>
      <p className="eyebrow">
        <Link href="/console/case-studies" style={{ textDecoration: "none" }}>
          ← Case studies
        </Link>
      </p>
      <h1>{study ? study.title : "New case study"}</h1>
      {created && <p className="form-status form-status--ok">Created.</p>}
      {study?.published && (
        <p className="console__lede">
          Live at{" "}
          <Link href={`/work#${study.slug}`} style={{ color: "var(--amber-deep)" }}>
            /work#{study.slug}
          </Link>
        </p>
      )}
      <CaseStudyForm
        study={study ? { ...study, tagIds: links.map((l) => l.tagId) } : null}
        sections={sections.map((s) => ({ id: s.id, label: s.label }))}
        tags={tags.map((t) => ({ id: t.id, label: t.label, retired: t.retired }))}
      />
      {study && (
        <details style={{ marginTop: 48 }}>
          <summary className="eyebrow" style={{ cursor: "pointer" }}>
            Danger zone
          </summary>
          <form action={deleteCaseStudy.bind(null, study.id)} style={{ marginTop: 14 }}>
            <button className="btn btn--danger btn--small">Delete this case study permanently</button>
          </form>
        </details>
      )}
    </>
  );
}
