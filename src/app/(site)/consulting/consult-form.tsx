"use client";

import { startTransition, useActionState, useState } from "react";
import type { EngagementType, ScopeOption, TimelineOption } from "@/db/schema";
import { estimateRange, formatMoney } from "@/lib/estimate";
import { submitContact } from "./actions";

type Estimator = {
  currency: string;
  engagementTypes: EngagementType[];
  scopeOptions: ScopeOption[];
  timelineOptions: TimelineOption[];
  disclaimer: string;
};

export function ConsultForm({ estimator }: { estimator: Estimator | null }) {
  const [state, action, pending] = useActionState(submitContact, null);
  const [engagementType, setEngagementType] = useState(estimator?.engagementTypes[0]?.key ?? "");
  const [scope, setScope] = useState(estimator?.scopeOptions[1]?.key ?? estimator?.scopeOptions[0]?.key ?? "");
  const [timeline, setTimeline] = useState(estimator?.timelineOptions[1]?.key ?? estimator?.timelineOptions[0]?.key ?? "");
  const [useEstimate, setUseEstimate] = useState(true);
  const range = estimator ? estimateRange(estimator, engagementType, scope, timeline) : null;

  const contactPanel = (
    <section className="panel" id="contact" aria-labelledby="contact-title">
      <h2 id="contact-title">Send a note</h2>
      {state?.ok ? (
        <p className="form-status form-status--ok" role="status">
          {state.message}
        </p>
      ) : (
        <form
          action={action}
          onSubmit={(e) => {
            // Keep what the visitor typed if validation fails (skip React's auto-reset).
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            startTransition(() => action(data));
          }}
        >
          <div className="grid-2">
            <label className="field">
              <span>Name</span>
              <input type="text" name="name" required autoComplete="name" />
            </label>
            <label className="field">
              <span>Email</span>
              <input type="email" name="email" required autoComplete="email" />
            </label>
          </div>
          <label className="field">
            <span>Company (optional)</span>
            <input type="text" name="company" autoComplete="organization" />
          </label>
          <label className="field">
            <span>What are you working on?</span>
            <textarea name="message" required rows={5} />
          </label>
          <label className="hp" aria-hidden="true">
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
          {range && (
            <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={useEstimate} onChange={(e) => setUseEstimate(e.target.checked)} />
              <small>Include my estimator selections</small>
            </label>
          )}
          {range && useEstimate && (
            <>
              <input type="hidden" name="engagementType" value={engagementType} />
              <input type="hidden" name="scope" value={scope} />
              <input type="hidden" name="timeline" value={timeline} />
            </>
          )}
          <div className="form-actions">
            <button className="btn" type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send"}
            </button>
            {state && !state.ok && (
              <p className="form-status form-status--err" role="alert">
                {state.message}
              </p>
            )}
          </div>
        </form>
      )}
    </section>
  );

  if (!estimator) return <div style={{ maxWidth: 640, marginTop: 40 }}>{contactPanel}</div>;

  return (
    <div className="consult">
      <section className="panel" aria-labelledby="estimate-title">
        <h2 id="estimate-title">Estimate</h2>
        <OptionGroup
          legend="Engagement type"
          name="engagementType-picker"
          value={engagementType}
          onChange={setEngagementType}
          options={estimator.engagementTypes.map((e) => ({ key: e.key, label: e.label, hint: e.description }))}
        />
        <OptionGroup
          legend="Scope"
          name="scope-picker"
          value={scope}
          onChange={setScope}
          options={estimator.scopeOptions.map((s) => ({ key: s.key, label: s.label, hint: s.description }))}
        />
        <OptionGroup
          legend="Timeline"
          name="timeline-picker"
          value={timeline}
          onChange={setTimeline}
          options={estimator.timelineOptions.map((t) => ({ key: t.key, label: t.label }))}
        />
        <div className="range" aria-live="polite">
          <span className="section-label">Directional range</span>
          <span className="range__val">
            {range ? `${formatMoney(range.low, estimator.currency)} – ${formatMoney(range.high, estimator.currency)}` : "—"}
          </span>
          {estimator.disclaimer && <p className="range__note">{estimator.disclaimer}</p>}
        </div>
      </section>
      {contactPanel}
    </div>
  );
}

function OptionGroup({
  legend,
  name,
  value,
  onChange,
  options,
}: {
  legend: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { key: string; label: string; hint?: string }[];
}) {
  return (
    <fieldset className="options">
      <legend className="section-label">{legend}</legend>
      <div className="options__grid">
        {options.map((o) => (
          <label key={o.key} className="option">
            <input type="radio" name={name} value={o.key} checked={value === o.key} onChange={() => onChange(o.key)} />
            <span>
              <b>{o.label}</b>
              {o.hint && <small>{o.hint}</small>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
