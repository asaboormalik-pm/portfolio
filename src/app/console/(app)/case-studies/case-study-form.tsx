import type { Metric } from "@/db/schema";
import { saveCaseStudy } from "../../actions";
import { ActionForm, RowsEditor } from "../../ui";

type Study = {
  id: string;
  title: string;
  slug: string;
  code: string;
  context: string;
  location: string;
  locationFlag: string;
  hook: string;
  sectionId: string | null;
  situation: string;
  task: string;
  action: string[];
  result: string;
  metrics: Metric[];
  published: boolean;
  tagIds: string[];
};

export function CaseStudyForm({
  study,
  sections,
  tags,
}: {
  study: Study | null;
  sections: { id: string; label: string }[];
  tags: { id: string; label: string; retired: boolean }[];
}) {
  const s = study;
  const selected = new Set(s?.tagIds ?? []);
  return (
    <ActionForm action={saveCaseStudy.bind(null, s?.id ?? null)} submitLabel={s ? "Save" : "Create"}>
      <div className="grid-2">
        <label className="field">
          <span>Title</span>
          <input type="text" name="title" defaultValue={s?.title} required />
        </label>
        <label className="field">
          <span>Code / label</span>
          <input type="text" name="code" defaultValue={s?.code} placeholder="WMS-01 · built from zero" />
        </label>
      </div>
      <label className="field">
        <span>One-line hook</span>
        <input type="text" name="hook" defaultValue={s?.hook} placeholder="The sentence that makes someone open the case" />
        <small>Shown on the collapsed card. If empty, the Task line is shown instead.</small>
      </label>
      <div className="grid-2">
        <label className="field">
          <span>Context</span>
          <input type="text" name="context" defaultValue={s?.context} placeholder="Company category · your role" />
        </label>
        <label className="field">
          <span>Section</span>
          <select name="sectionId" defaultValue={s?.sectionId ?? ""}>
            <option value="">— none —</option>
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid-2">
        <label className="field">
          <span>Location (optional)</span>
          <input type="text" name="location" defaultValue={s?.location} placeholder="e.g. Riyadh" />
          <small>Shown as a stamp on the case card.</small>
        </label>
        <label className="field">
          <span>Flag emoji (optional)</span>
          <input type="text" name="locationFlag" defaultValue={s?.locationFlag} placeholder="🇸🇦" maxLength={8} />
        </label>
      </div>
      <label className="field">
        <span>Situation</span>
        <textarea name="situation" defaultValue={s?.situation} />
      </label>
      <label className="field">
        <span>Task</span>
        <textarea name="task" defaultValue={s?.task} />
      </label>
      <label className="field">
        <span>Action</span>
        <textarea name="action" rows={6} defaultValue={s?.action.join("\n")} />
        <small>One point per line.</small>
      </label>
      <label className="field">
        <span>Result</span>
        <textarea name="result" defaultValue={s?.result} />
      </label>

      <div className="field">
        <span>Metrics</span>
        <small>“Highlight” renders the value in the accent colour — use it for qualitative wins rather than numbers.</small>
      </div>
      <RowsEditor
        name="metrics"
        addLabel="Add metric"
        columns={[
          { key: "value", label: "Value", width: "1fr" },
          { key: "label", label: "Label", width: "2fr" },
          { key: "signal", label: "Highlight", type: "checkbox", width: "auto" },
        ]}
        initial={s?.metrics ?? []}
      />

      <fieldset className="field" style={{ border: 0, padding: 0 }}>
        <legend>Skill tags</legend>
        <div className="tag-picker">
          {tags
            .filter((t) => !t.retired || selected.has(t.id))
            .map((t) => (
              <label key={t.id}>
                <input type="checkbox" name="tagIds" value={t.id} defaultChecked={selected.has(t.id)} />
                <span>{t.label}</span>
              </label>
            ))}
        </div>
      </fieldset>
      <label className="field">
        <span>New tags</span>
        <input type="text" name="newTags" placeholder="Comma-separated, e.g. Pricing strategy, B2B SaaS" />
      </label>
      <div className="grid-2">
        <label className="field">
          <span>URL slug</span>
          <input type="text" name="slug" defaultValue={s?.slug} placeholder="auto from title" />
        </label>
        <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 22 }}>
          <input type="checkbox" name="published" defaultChecked={s?.published ?? false} />
          <small>Published on the public site</small>
        </label>
      </div>
    </ActionForm>
  );
}
