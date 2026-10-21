import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "For recruiters" };

// Placeholder until Phase 1b ships the Recruiter Portal (PRD §5.4).
export default function RecruitersPage() {
  return (
    <main className="wrap">
      <div className="page-head">
        <p className="section-label">For recruiters &amp; hiring managers</p>
        <h1>Recruiter portal</h1>
        <p>
          Coming next: paste a job description and get a qualitative, evidence-linked match — each requirement mapped to the case study that demonstrates
          it, with gaps stated plainly.
        </p>
      </div>
      <section className="note-card" style={{ marginTop: 36 }}>
        <p className="section-label">In the meantime</p>
        <p>
          Every case study is filterable by skill, which covers most of what the match tool will do. If you have a specific role in mind,{" "}
          <Link href="/consulting#contact">send it over</Link> and I&apos;ll reply directly.
        </p>
      </section>
      <div className="form-actions" style={{ marginTop: 28 }}>
        <Link className="btn" href="/work">
          Browse the work
        </Link>
      </div>
    </main>
  );
}
