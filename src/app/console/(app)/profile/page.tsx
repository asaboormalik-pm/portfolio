import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { ThemeColorKey } from "@/db/schema";
import { requireOwner } from "@/lib/dal";
import { saveProfile } from "../../actions";
import { ActionForm, RowsEditor } from "../../ui";

const colorFields: [ThemeColorKey, string, string][] = [
  ["canvas", "Background", "#FFFFFF"],
  ["ink", "Text", "#1D1D1F"],
  ["inkSoft", "Muted text", "#6E6E73"],
  ["pine", "Primary accent", "#1F4A3E"],
  ["marigold", "Second accent", "#E29A3D"],
  ["rose", "Third accent", "#D9738F"],
];

export default async function ProfilePage() {
  const { tenantId } = await requireOwner();
  const t = await db.query.tenants.findFirst({ where: eq(schema.tenants.id, tenantId) });
  if (!t) return null;
  const colors = t.themeConfig.colors ?? {};

  return (
    <>
      <h1>Profile &amp; branding</h1>
      <p className="console__lede">
        Landing-page copy, identity and theme. Use <code>*word*</code> for the accent colour and <code>**word**</code> for bold. Blank lines separate
        paragraphs.
      </p>
      <ActionForm action={saveProfile}>
        <div className="grid-2">
          <label className="field">
            <span>Name</span>
            <input type="text" name="name" defaultValue={t.name} required />
          </label>
          <label className="field">
            <span>Public contact email</span>
            <input type="email" name="contactEmail" defaultValue={t.contactEmail} required />
            <small>Also where enquiry notifications go.</small>
          </label>
        </div>
        <label className="field">
          <span>Headline</span>
          <input type="text" name="headline" defaultValue={t.headline} />
        </label>
        <label className="field">
          <span>Role line</span>
          <input type="text" name="roleLine" defaultValue={t.roleLine} />
        </label>
        <label className="field">
          <span>Subhead</span>
          <textarea name="subhead" rows={2} defaultValue={t.subhead} />
        </label>

        <h2>Identity card</h2>
        <div className="grid-2">
          <label className="field">
            <span>Availability</span>
            <select name="availability" defaultValue={t.availability}>
              <option value="hidden">Don&apos;t show</option>
              <option value="open">Open to work</option>
              <option value="exploring">Exploring options</option>
              <option value="closed">Not looking</option>
            </select>
          </label>
          <div className="grid-2" style={{ gridTemplateColumns: "2fr 1fr" }}>
            <label className="field">
              <span>Location</span>
              <input type="text" name="location" defaultValue={t.location} />
            </label>
            <label className="field">
              <span>Flag</span>
              <input type="text" name="locationFlag" defaultValue={t.locationFlag} maxLength={8} />
            </label>
          </div>
        </div>
        <div className="grid-2">
          <label className="field">
            <span>Photo URL (optional)</span>
            <input type="url" name="photo" defaultValue={t.themeConfig.photo} placeholder="https://…" />
            <small>Without one, the card shows your initials.</small>
          </label>
          <label className="field">
            <span>Photo alt text</span>
            <input type="text" name="photoAlt" defaultValue={t.themeConfig.photoAlt} />
          </label>
        </div>
        <label className="field">
          <span>Intro video URL (optional)</span>
          <input type="url" name="introVideoUrl" defaultValue={t.themeConfig.introVideoUrl} placeholder="https://…" />
        </label>
        <div className="field">
          <span>Links</span>
          <small>LinkedIn, GitHub and ADPList get their own round buttons on the identity card.</small>
        </div>
        <RowsEditor
          name="links"
          addLabel="Add link"
          columns={[
            { key: "label", label: "Label", width: "1fr" },
            { key: "url", label: "URL", width: "2.4fr" },
          ]}
          initial={t.links}
        />

        <h2>Highlights</h2>
        <p className="console__lede">
          The floating “stickers” under the hero — up to 6. The case-file count is added automatically. Only use figures the case studies back up.
        </p>
        <RowsEditor
          name="highlights"
          addLabel="Add highlight"
          columns={[
            { key: "value", label: "Value", width: "0.7fr" },
            { key: "label", label: "Label", width: "2fr" },
          ]}
          initial={t.highlights}
        />

        <h2>About</h2>
        <label className="field">
          <span>Bio</span>
          <textarea name="bio" rows={5} defaultValue={t.bio} />
        </label>
        <label className="field">
          <span>“How to read this” note</span>
          <textarea name="readingNote" rows={5} defaultValue={t.readingNote} />
        </label>
        <label className="field">
          <span>Footer note</span>
          <textarea name="footNote" rows={2} defaultValue={t.footNote} />
        </label>

        <h2>Theme colours</h2>
        <p className="console__lede">Soft tints are derived from these automatically.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginBottom: 18 }}>
          {colorFields.map(([key, label, fallback]) => (
            <label key={key} className="field" style={{ margin: 0 }}>
              <span>{label}</span>
              <input type="color" name={`color_${key}`} defaultValue={colors[key] ?? fallback} />
            </label>
          ))}
        </div>
      </ActionForm>
    </>
  );
}
