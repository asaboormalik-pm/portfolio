"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type File = {
  slug: string;
  title: string;
  hook: string;
  tags: string[];
  metric: { value: string; label: string } | null;
  location: string;
  locationFlag: string;
};

// Horizontal case-file carousel: drag, arrow buttons, progress bar. Vertical wheel scrolling is left alone.
export function CaseFiles({ files }: { files: File[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, moved: false, startX: 0, startScroll: 0 });
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 1);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const step = (dir: number) => {
    const el = scroller.current;
    const card = el?.querySelector<HTMLElement>(".file");
    if (el && card) el.scrollBy({ left: dir * (card.offsetWidth + 22) * 1.2, behavior: "smooth" });
  };

  return (
    <>
      <div
        ref={scroller}
        className={`files${dragging ? " dragging" : ""}`}
        onMouseDown={(e) => {
          drag.current = { down: true, moved: false, startX: e.pageX, startScroll: scroller.current!.scrollLeft };
        }}
        onMouseMove={(e) => {
          const d = drag.current;
          if (!d.down) return;
          const dx = e.pageX - d.startX;
          if (!d.moved && Math.abs(dx) > 5) {
            d.moved = true;
            setDragging(true);
          }
          if (d.moved) scroller.current!.scrollLeft = d.startScroll - dx;
        }}
        onMouseUp={() => {
          drag.current.down = false;
          setDragging(false);
        }}
        onMouseLeave={() => {
          drag.current.down = false;
          setDragging(false);
        }}
      >
        {files.map((f, i) => (
          <article key={f.slug} className={`file t${(i % 5) + 1}`}>
            {f.location && (
              <div className="flag-stamp">
                {f.locationFlag && <span className="flag">{f.locationFlag}</span>}
                <span className="place">{f.location}</span>
              </div>
            )}
            {f.tags.length > 0 && (
              <div className="file-tags">
                {f.tags.map((t) => (
                  <span key={t} className="file-tag">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <h3>{f.title}</h3>
            <p className="hook">{f.hook}</p>
            {f.metric && (
              <div className="metric-row">
                <span className="big">{f.metric.value}</span>
                <span className="small">{f.metric.label}</span>
              </div>
            )}
            <div className="file-foot">
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                Case {String(i + 1).padStart(2, "0")}
              </span>
              <Link className="read-link" href={`/work#${f.slug}`} draggable={false}>
                Read the file
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>
      <div className="scroll-controls">
        <button type="button" className="arrow-btn" aria-label="Previous case files" onClick={() => step(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${Math.max(8, progress * 100)}%` }} />
        </div>
        <button type="button" className="arrow-btn" aria-label="Next case files" onClick={() => step(1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </>
  );
}
