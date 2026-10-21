import Link from "next/link";
import type { Availability } from "@/db/schema";
import { getCaseStudyLibrary, getTenant } from "@/lib/content";
import { Inline, Paragraphs } from "@/components/inline";
import { CaseFiles } from "./case-files";

const availabilityLabel: Record<Exclude<Availability, "hidden">, string> = {
  open: "Open to work",
  exploring: "Exploring options",
  closed: "Not looking",
};

// Short glyphs for the round social buttons; anything unknown falls back to its initials.
function socialGlyph(label: string) {
  const l = label.toLowerCase();
  if (l.includes("linkedin")) return { text: "in", cls: "li" };
  if (l.includes("github")) return { text: "</>", cls: "gh" };
  if (l.includes("adplist")) return { text: "AL", cls: "adp" };
  return { text: label.slice(0, 2), cls: "" };
}

const stickerIcons = [
  <path key="a" d="M4 4h16v16H4zM4 9h16M9 4v16" />,
  <path key="b" d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7" />,
  <path key="c" d="M12 4a8 8 0 100 16 8 8 0 000-16zM9 12l2 2 4-4" />,
  <path key="d" d="M3 6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 9h18" />,
  <path key="e" d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5z" />,
  <path key="f" d="M12 8v4l3 3M12 3a9 9 0 100 18 9 9 0 000-18z" />,
  <path key="g" d="M4 19V5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2zM15 3v5h5" />,
];
const stickerTones = ["pine", "", "marigold", "", "rose", "", ""];
const stickerStroke = ["var(--pine)", "var(--ink)", "var(--marigold)", "var(--ink)", "var(--rose)", "var(--ink)", "var(--ink)"];

// Landing + visitor segmentation (PRD §5.1).
export default async function Home() {
  const tenant = await getTenant();
  const { sections, total } = await getCaseStudyLibrary(tenant.id);
  const studies = sections.flatMap((s) => s.studies);
  const { photo, photoAlt, introVideoUrl } = tenant.themeConfig;
  const initials = tenant.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  // Case-file count is computed so it never drifts from the library.
  const stickers = [...tenant.highlights];
  stickers.splice(1, 0, { value: String(total), label: "case files" });

  const journeys = [
    {
      href: "/recruiters",
      name: "I'm hiring",
      desc: "Check fit against a specific role, with every claim linked to the case study behind it.",
      go: "Recruiter portal",
    },
    {
      href: "/consulting",
      name: "I need consulting help",
      desc: "Pick an engagement shape and get a directional range before we talk.",
      go: "Estimate & contact",
    },
    {
      href: "/work",
      name: "I'm exploring",
      desc: `${total} case studies, Situation → Task → Action → Result, numbers up front.`,
      go: "Browse the work",
    },
  ];

  return (
    <main>
      <header className="hero">
        <div className="hero-top">
          <div className="hero-copy">
            <div className="eyebrow-pill">
              <span className="dot" />
              Evidence-based portfolio, not a resume
            </div>
            <h1>
              <Inline text={tenant.headline} />
            </h1>
            {tenant.roleLine && <p className="hero-role">{tenant.roleLine}</p>}
            <p>{tenant.subhead}</p>
            <a href="#files" className="hero-cta">
              Browse the case files &rarr;
            </a>
          </div>

          <div>
            <div className="intro-media">
              {photo ? (
                // Owner-supplied URL (any host), so a plain img rather than next/image.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={photoAlt || tenant.name} />
              ) : (
                <span className="intro-monogram" aria-hidden="true">
                  {initials}
                </span>
              )}
              {introVideoUrl && (
                <a href={introVideoUrl} className="video-link-pill" rel="noopener">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch the intro
                </a>
              )}
            </div>
            <div className="identity-block">
              <div className="identity-top">
                {tenant.availability !== "hidden" && (
                  <span className={`status-pill ${tenant.availability}`}>
                    <span className="status-dot" />
                    {availabilityLabel[tenant.availability]}
                  </span>
                )}
                {tenant.location && (
                  <span className="location-tag">
                    {tenant.locationFlag && <span className="flag">{tenant.locationFlag}</span>}
                    {tenant.location}
                  </span>
                )}
              </div>
              <div className="social-row">
                {tenant.links.map((l) => {
                  const g = socialGlyph(l.label);
                  return (
                    <a key={l.url} href={l.url} className={`social-btn ${g.cls}`} aria-label={l.label} rel="me noopener">
                      {g.text}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {stickers.length > 0 && (
          <div className="pile-wrap">
            <ul className="pile" aria-label="At a glance" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {stickers.slice(0, 7).map((h, i) => (
                <li key={h.label} className={`sticker s${i + 1} ${stickerTones[i]}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={stickerStroke[i]} strokeWidth="1.8" aria-hidden="true">
                    {stickerIcons[i]}
                  </svg>
                  <span className="num">{h.value}</span>
                  <span className="lbl">{h.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <section className="section" id="journeys" aria-labelledby="journeys-title" style={{ paddingTop: 40 }}>
        <div className="section-inner section-head">
          <div>
            <p className="section-label">Pick where you&apos;re starting from</p>
            <h2 id="journeys-title">What brings you here?</h2>
          </div>
        </div>
        <div className="journeys">
          {journeys.map((j, i) => (
            <Link key={j.href} href={j.href} className="journey">
              <span className="journey__no">0{i + 1}</span>
              <span className="journey__nm">{j.name}</span>
              <p className="journey__desc">{j.desc}</p>
              <span className="journey__go">{j.go} &rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section" id="files" aria-labelledby="files-title" style={{ paddingTop: 0 }}>
        <div className="section-inner section-head">
          <div>
            <p className="section-label">Case files</p>
            <h2 id="files-title">
              {total} problems, {total} receipts
            </h2>
          </div>
          <p className="note">Drag sideways or use the arrows — each file opens into the full Situation → Task → Action → Result writeup.</p>
        </div>
        <CaseFiles
          files={studies.map((s) => {
            const metric = s.metrics.find((m) => !m.signal) ?? s.metrics[0];
            return {
              slug: s.slug,
              title: s.title,
              hook: s.hook || s.task,
              tags: s.tags.slice(0, 2),
              metric: metric ? { value: metric.value, label: metric.label } : null,
              location: s.location,
              locationFlag: s.locationFlag,
            };
          })}
        />
      </section>

      {(tenant.bio || tenant.readingNote) && (
        <section className="section" aria-labelledby="read-title" style={{ paddingTop: 0 }}>
          <div className="section-inner">
            <p className="section-label">How to read this</p>
            <h2 id="read-title" className="visually-hidden">
              How to read this
            </h2>
            <Paragraphs text={tenant.bio} className="lede" />
            {tenant.readingNote && (
              <div className="note-card" style={{ marginTop: 28 }}>
                <Paragraphs text={tenant.readingNote} />
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
