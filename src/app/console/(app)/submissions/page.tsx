import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireOwner } from "@/lib/dal";
import { formatMoney } from "@/lib/estimate";
import { Suspense } from "react";
import { ConsoleLoading } from "../../loading-state";

export default function SubmissionsPage() {
  return (
    <Suspense fallback={<ConsoleLoading />}>
      <SubmissionsPageContent />
    </Suspense>
  );
}

async function SubmissionsPageContent() {
  const { tenantId } = await requireOwner();
  const rows = await db.query.contactSubmissions.findMany({
    where: eq(schema.contactSubmissions.tenantId, tenantId),
    orderBy: desc(schema.contactSubmissions.createdAt),
    limit: 200,
  });

  return (
    <>
      <h1>Enquiries</h1>
      <p className="console__lede">Contact-form submissions with the estimator selection the visitor sent, if any. Newest first.</p>
      {rows.length === 0 ? (
        <p className="console__lede">None yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>From</th>
                <th>Estimate</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="num">{r.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                  <td>
                    {r.name}
                    <br />
                    <a href={`mailto:${r.email}`} style={{ color: "var(--amber-deep)" }}>
                      {r.email}
                    </a>
                    {r.company && <div className="eyebrow">{r.company}</div>}
                  </td>
                  <td>
                    {r.estimatorSelection ? (
                      <>
                        {r.estimatorSelection.engagementType} · {r.estimatorSelection.scope} · {r.estimatorSelection.timeline}
                        <br />
                        <span className="num">
                          {formatMoney(r.estimatorSelection.low, r.estimatorSelection.currency)}–{formatMoney(r.estimatorSelection.high, r.estimatorSelection.currency)}
                        </span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ whiteSpace: "pre-wrap", maxWidth: 420 }}>{r.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
