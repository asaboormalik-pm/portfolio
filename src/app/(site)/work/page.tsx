import type { Metadata } from "next";
import { getCaseStudyLibrary, getTenant } from "@/lib/content";
import { CaseStudyBrowser } from "./case-study-browser";

export const metadata: Metadata = { title: "Work" };

// STAR-M case study library (PRD §5.2).
export default async function WorkPage() {
  const tenant = await getTenant();
  const { sections, total } = await getCaseStudyLibrary(tenant.id);

  return (
    <main className="wrap">
      <div className="page-head">
        <p className="section-label">Proof of work · {total} case studies</p>
        <h1>The work</h1>
        <p>Metrics up front; open any case for the full Situation, Task, Action and Result. Filter by skill to find the evidence for a specific claim.</p>
      </div>
      <CaseStudyBrowser sections={sections} />
    </main>
  );
}
