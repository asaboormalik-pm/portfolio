import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireOwner } from "@/lib/dal";
import { moveCaseStudy, setCaseStudyPublished } from "../../actions";
import { Suspense } from "react";
import { ConsoleLoading } from "../../loading-state";

export default function CaseStudiesList() {
  return (
    <Suspense fallback={<ConsoleLoading />}>
      <CaseStudiesListContent />
    </Suspense>
  );
}

async function CaseStudiesListContent() {
  const { tenantId } = await requireOwner();
  const [studies, sections] = await Promise.all([
    db.query.caseStudies.findMany({ where: eq(schema.caseStudies.tenantId, tenantId), orderBy: asc(schema.caseStudies.position) }),
    db.query.caseStudySections.findMany({ where: eq(schema.caseStudySections.tenantId, tenantId) }),
  ]);
  const sectionName = new Map(sections.map((s) => [s.id, s.label]));

  return (
    <>
      <h1>Case studies</h1>
      <p className="console__lede">
        STAR-M entries, in display order. These are the grounding data for the public library, the JD match tool and the agent — keep metrics honest.
      </p>
      <p>
        <Link className="btn" href="/console/case-studies/new">
          + New case study
        </Link>
      </p>
      <div className="table-wrap" style={{ marginTop: 20 }}>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Section</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {studies.map((s, i) => (
              <tr key={s.id}>
                <td className="num">{i + 1}</td>
                <td>
                  <Link href={`/console/case-studies/${s.id}`}>{s.title}</Link>
                  <div className="eyebrow" style={{ marginTop: 4 }}>
                    {s.code}
                    {!s.hook && " · no hook"}
                  </div>
                </td>
                <td>{(s.sectionId && sectionName.get(s.sectionId)) || "—"}</td>
                <td>
                  <span className={`pill${s.published ? "" : " pill--warn"}`}>{s.published ? "Published" : "Draft"}</span>
                </td>
                <td>
                  <div className="row-actions">
                    <form action={moveCaseStudy.bind(null, s.id, "up")}>
                      <button className="btn btn--ghost btn--small" disabled={i === 0} aria-label={`Move ${s.title} up`}>
                        ↑
                      </button>
                    </form>
                    <form action={moveCaseStudy.bind(null, s.id, "down")}>
                      <button className="btn btn--ghost btn--small" disabled={i === studies.length - 1} aria-label={`Move ${s.title} down`}>
                        ↓
                      </button>
                    </form>
                    <form action={setCaseStudyPublished.bind(null, s.id, !s.published)}>
                      <button className="btn btn--ghost btn--small">{s.published ? "Unpublish" : "Publish"}</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
