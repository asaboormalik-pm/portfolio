"use client";

import { startTransition, useActionState, useState } from "react";

export type FormState = { ok: boolean; message: string } | null;
type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

// Submits without React's automatic form reset, so a failed save never discards edits.
export function submitWithoutReset(formAction: (data: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  };
}

// Form wrapper for console server actions: pending state + inline save/error message.
export function ActionForm({
  action,
  children,
  submitLabel = "Save",
  className,
}: {
  action: Action;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} onSubmit={submitWithoutReset(formAction)} className={className}>
      {children}
      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
        {state && (
          <p className={`form-status form-status--${state.ok ? "ok" : "err"}`} role={state.ok ? "status" : "alert"}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

type Column = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "checkbox";
  width?: string;
  step?: string;
};
type Row = Record<string, string | number | boolean>;

// Editable list of structured rows, submitted as JSON in one hidden field.
export function RowsEditor({ name, columns, initial, addLabel = "Add row" }: { name: string; columns: Column[]; initial: Row[]; addLabel?: string }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const blank = () => Object.fromEntries(columns.map((c) => [c.key, c.type === "checkbox" ? false : c.type === "number" ? 0 : ""]));
  const update = (i: number, key: string, value: string | number | boolean) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [key]: value } : row)));
  const move = (i: number, d: number) =>
    setRows((r) => {
      const next = [...r];
      const j = i + d;
      if (j < 0 || j >= next.length) return r;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const template = `${columns.map((c) => c.width ?? "1fr").join(" ")} auto`;

  return (
    <>
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      <div className="rows">
        {rows.map((row, i) => (
          <div className="rows__row" key={i} style={{ gridTemplateColumns: template }}>
            {columns.map((c) =>
              c.type === "checkbox" ? (
                <label key={c.key} className="inline">
                  <input type="checkbox" checked={Boolean(row[c.key])} onChange={(e) => update(i, c.key, e.target.checked)} />
                  {c.label}
                </label>
              ) : (
                <label key={c.key}>
                  {c.label}
                  {c.type === "textarea" ? (
                    <textarea rows={2} value={String(row[c.key] ?? "")} onChange={(e) => update(i, c.key, e.target.value)} />
                  ) : (
                    <input
                      type={c.type === "number" ? "number" : "text"}
                      step={c.step}
                      value={String(row[c.key] ?? "")}
                      onChange={(e) => update(i, c.key, c.type === "number" ? Number(e.target.value) : e.target.value)}
                    />
                  )}
                </label>
              ),
            )}
            <div className="rows__ctl">
              <button type="button" className="btn btn--ghost btn--small" onClick={() => move(i, -1)} aria-label="Move up" disabled={i === 0}>
                ↑
              </button>
              <button type="button" className="btn btn--ghost btn--small" onClick={() => move(i, 1)} aria-label="Move down" disabled={i === rows.length - 1}>
                ↓
              </button>
              <button type="button" className="btn btn--danger btn--small" onClick={() => setRows((r) => r.filter((_, j) => j !== i))} aria-label="Remove">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn--ghost btn--small" onClick={() => setRows((r) => [...r, blank()])} style={{ marginBottom: 18 }}>
        + {addLabel}
      </button>
    </>
  );
}
