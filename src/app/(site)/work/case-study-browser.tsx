"use client";

import { useEffect, useMemo, useState } from "react";
import type { CaseStudyCard } from "@/lib/content";

type Section = { id: string; label: string; shortLabel: string; blurb: string; studies: CaseStudyCard[] };

const TOP_TAGS = 16;

export function CaseStudyBrowser({ sections }: { sections: Section[] }) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of sections) for (const c of s.studies) for (const t of c.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [sections]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (c: CaseStudyCard) =>
      activeTags.every((t) => c.tags.includes(t)) &&
      (!q ||
        [c.title, c.hook, c.context, c.situation, c.task, c.result, ...c.action, ...c.tags, ...c.metrics.map((m) => `${m.value} ${m.label}`)]
          .join(" ")
          .toLowerCase()
          .includes(q));
    return sections.map((s) => ({ ...s, studies: s.studies.filter(matches) })).filter((s) => s.studies.length);
  }, [sections, query, activeTags]);

  const shown = filtered.reduce((n, s) => n + s.studies.length, 0);
  const visibleTags = showAllTags ? tagCounts : tagCounts.slice(0, TOP_TAGS);
  const toggleTag = (t: string) => setActiveTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const activeSection = useActiveSection(filtered.map((s) => s.id));

  return (
    <>
      <div className="filters" id="filters">
        <div className="filters__row">
          <label className="visually-hidden" htmlFor="cs-search">
            Search case studies
          </label>
          <input id="cs-search" type="search" placeholder="Search — e.g. warehouse, ATP, build vs buy" value={query} onChange={(e) => setQuery(e.target.value)} />
          <span className="filters__count" aria-live="polite">
            {shown} shown
          </span>
          {(query || activeTags.length > 0) && (
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={() => {
                setQuery("");
                setActiveTags([]);
              }}
            >
              Clear
            </button>
          )}
        </div>
        <ul className="chips" aria-label="Filter by skill">
          {visibleTags.map(([t, n]) => (
            <li key={t}>
              <button type="button" className="chip" aria-pressed={activeTags.includes(t)} onClick={() => toggleTag(t)}>
                {t}
                <span className="chip__n">{n}</span>
              </button>
            </li>
          ))}
          {tagCounts.length > TOP_TAGS && (
            <li>
              <button type="button" className="chip" onClick={() => setShowAllTags((v) => !v)}>
                {showAllTags ? "Fewer" : `All ${tagCounts.length} skills`}
              </button>
            </li>
          )}
        </ul>
      </div>

      {filtered.length === 0 ? (
        <p className="empty">Nothing matches that combination. Try removing a filter.</p>
      ) : (
        <div className="main">
          <nav className="rail" aria-label="Jump to section">
            <ol>
              {filtered.map((s, i) => (
                <li key={s.id} className={activeSection === s.id ? "is-on" : undefined}>
                  <a href={`#section-${s.id}`}>
                    <span className="rail__no">{String(i + 1).padStart(2, "0")}</span>
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div>
            {filtered.map((s, i) => (
              <section className="stage" id={`section-${s.id}`} data-section={s.id} key={s.id}>
                <div className="stage__head">
                  <span className="stage__no">Section {String(i + 1).padStart(2, "0")}</span>
                  <h2 className="stage__nm">{s.label}</h2>
                </div>
                {s.blurb && <p className="stage__sub">{s.blurb}</p>}
                {s.studies.map((c) => (
                  <CaseStudy key={c.id} study={c} onTag={toggleTag} activeTags={activeTags} />
                ))}
              </section>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function CaseStudy({ study: c, onTag, activeTags }: { study: CaseStudyCard; onTag: (t: string) => void; activeTags: string[] }) {
  return (
    <article className="proj" id={c.slug}>
      {c.location && (
        <div className="flag-stamp">
          {c.locationFlag && <span className="flag">{c.locationFlag}</span>}
          <span className="place">{c.location}</span>
        </div>
      )}
      {c.code && <p className="proj__code">{c.code}</p>}
      <h3 className="proj__title">{c.title}</h3>
      {c.context && <p className="proj__meta">{c.context}</p>}
      <p className="proj__hook">{c.hook || c.task}</p>
      {c.metrics.length > 0 && (
        <ul className="metrics">
          {c.metrics.map((m) => (
            <li key={m.value + m.label} className={m.signal ? "signal" : undefined}>
              <span className="metrics__val">{m.value}</span>
              <span className="metrics__lbl">{m.label}</span>
            </li>
          ))}
        </ul>
      )}
      <details className="proj__more">
        <summary>Full case — Situation, Task, Action, Result</summary>
        <dl className="proj__body">
          <dt>Situation</dt>
          <dd>{c.situation}</dd>
          <dt>Task</dt>
          <dd>{c.task}</dd>
          <dt>Action</dt>
          <dd>
            <ul>
              {c.action.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </dd>
          <dt>Result</dt>
          <dd>{c.result}</dd>
        </dl>
      </details>
      {c.tags.length > 0 && (
        <ul className="tags">
          {c.tags.map((t) => (
            <li key={t}>
              <button type="button" className="chip" aria-pressed={activeTags.includes(t)} onClick={() => onTag(t)}>
                {t}
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(",");
  useEffect(() => {
    const els = key ? key.split(",").map((id) => document.getElementById(`section-${id}`)).filter(Boolean) : [];
    if (!els.length || !("IntersectionObserver" in window)) return;
    const visible = new Map<string, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set((e.target as HTMLElement).dataset.section!, e.isIntersecting ? e.intersectionRatio : 0);
        let best: string | null = null;
        let bestVal = 0;
        for (const [id, v] of visible) if (v > bestVal) [best, bestVal] = [id, v];
        if (best) setActive(best);
      },
      { rootMargin: "-15% 0px -55% 0px", threshold: [0, 0.15, 0.4, 0.75, 1] },
    );
    els.forEach((el) => obs.observe(el!));
    return () => obs.disconnect();
  }, [key]);
  return active;
}
