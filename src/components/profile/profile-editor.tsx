"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { UserRound, ImagePlus } from "lucide-react";
import {
  hasWhatsApp,
  normaliseWhatsApp,
  updateCoachWorkspace,
  useCoachWorkspace,
  type CoachProfile,
} from "@/lib/coach-workspace";
import { type CoachAppearance } from "@/lib/coach-theme";
import { useMediaQuery } from "@/lib/use-media";
import {
  defaultTemplates,
  renderTemplate,
  templateFields,
  templateLabels,
  type WhatsAppTemplates,
} from "@/lib/whatsapp";
import { AppearanceEditor } from "./appearance-editor";
import { PreviewFrame, PreviewSheet } from "./preview-frame";
import { useAdmin } from "../admin/context";
import styles from "./profile-editor.module.css";

export function AssetInput({
  label,
  value,
  onChange,
  onError,
  onReading,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  onError: (value: string) => void;
  onReading: (change: number) => void;
}) {
  return (
    <div className={styles.asset}>
      <div className={styles.assetPreview}>
        {value ? (
          <Image
            src={value}
            alt={`${label} preview`}
            width={80}
            height={90}
            unoptimized
          />
        ) : label === "Coach photograph" ? (
          <UserRound size={30} />
        ) : (
          <ImagePlus size={27} />
        )}
      </div>
      <div>
        <label className={styles.uploadLabel}>
          {label}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              if (
                !["image/jpeg", "image/png", "image/webp"].includes(
                  file.type,
                ) ||
                file.size > 1_048_576
              ) {
                onError("Choose a JPEG, PNG or WebP image smaller than 1 MB.");
                return;
              }
              onReading(1);
              onError("");
              try {
                const bitmap = await createImageBitmap(file);
                bitmap.close();
                const data = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(String(reader.result));
                  reader.onerror = () =>
                    reject(new Error("Image could not be read."));
                  reader.readAsDataURL(file);
                });
                onChange(data);
              } catch {
                onError(
                  "This image could not be opened. Try another JPEG, PNG or WebP.",
                );
              } finally {
                onReading(-1);
              }
            }}
          />
        </label>
        <p>JPEG, PNG or WebP · Up to 1 MB · Local preview only</p>
        {value && (
          <button
            type="button"
            className="text-button"
            onClick={() => onChange(null)}
          >
            Remove {label.toLowerCase()}
          </button>
        )}
      </div>
    </div>
  );
}
const tabs = [
  { id: "profile", label: "Profile" },
  { id: "appearance", label: "Appearance" },
  { id: "contact", label: "Contact" },
] as const;
type TabId = (typeof tabs)[number]["id"];

export function ProfileEditor({ initialTab }: { initialTab?: string }) {
  const workspace = useCoachWorkspace();
  const { profile } = workspace;
  const [tab, setTab] = useState<TabId>(
    tabs.some((t) => t.id === initialTab) ? (initialTab as TabId) : "profile",
  );
  const [draft, setDraft] = useState<CoachProfile>(profile),
    [error, setError] = useState(""),
    [status, setStatus] = useState(""),
    [reading, setReading] = useState(0),
    [device, setDevice] = useState<"desktop" | "phone">("desktop"),
    [sheet, setSheet] = useState(false);
  const wide = useMediaQuery("(min-width: 1180px)");
  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);
  const previewWorkspace = useMemo(
    () => ({ ...workspace, profile: draft }),
    [workspace, draft],
  );
  const { setDirty } = useAdmin();
  useEffect(() => {
    setDirty(dirty);
    return () => setDirty(false);
  }, [dirty, setDirty]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const change = (field: keyof CoachProfile, value: string | null) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setStatus("");
  };
  const patch = (partial: Partial<CoachProfile>) => {
    setDraft((current) => ({ ...current, ...partial }));
    setStatus("");
  };
  const patchAppearance = (partial: Partial<CoachAppearance>) => {
    setDraft((current) => ({
      ...current,
      appearance: { ...current.appearance, ...partial },
    }));
    setStatus("");
  };
  const save = () => {
    setError("");
    setStatus("");
    if (
      !draft.name.trim() ||
      !draft.title.trim() ||
      !draft.introduction.trim()
    ) {
      setTab("profile");
      setError("Add your name, coaching title and short introduction.");
      return;
    }
    if (draft.whatsapp.trim() && !hasWhatsApp(draft.whatsapp)) {
      setTab("contact");
      setError(
        "Use an international WhatsApp number, such as +447700900123. Leave it blank to hide WhatsApp.",
      );
      return;
    }
    if (
      draft.instagram.trim() &&
      !/^[a-zA-Z0-9._]{1,30}$/.test(draft.instagram.trim().replace(/^@/, ""))
    ) {
      setTab("contact");
      setError(
        "Enter your Instagram handle without the link, such as kellyjayne_padel.",
      );
      return;
    }
    const cleaned = {
      ...draft,
      name: draft.name.trim(),
      title: draft.title.trim(),
      tagline: draft.tagline.trim(),
      highlights: draft.highlights
        .map((h) => ({ value: h.value.trim(), label: h.label.trim() }))
        .filter((h) => h.value),
      testimonials: draft.testimonials
        .map((t) => ({
          quote: t.quote.trim(),
          attribution: t.attribution.trim(),
        }))
        .filter((t) => t.quote),
      whatsappTemplates: Object.fromEntries(
        (Object.keys(defaultTemplates) as (keyof WhatsAppTemplates)[]).map(
          (key) => [
            key,
            draft.whatsappTemplates[key].trim() || defaultTemplates[key],
          ],
        ),
      ) as WhatsAppTemplates,
      introduction: draft.introduction.trim(),
      experience: draft.experience.trim(),
      location: draft.location.trim(),
      whatsapp: normaliseWhatsApp(draft.whatsapp),
      instagram: draft.instagram.trim().replace(/^@/, ""),
    };
    const persisted = updateCoachWorkspace((current) => ({
      ...current,
      profile: cleaned,
    }));
    setDraft(cleaned);
    setStatus(
      persisted
        ? "Saved in this browser tab. Your booking page is updated."
        : "Updated for this visit. Browser storage is unavailable, so refresh will reset it.",
    );
  };
  const assetProps = {
    onError: setError,
    onReading: (n: number) => setReading((v) => v + n),
  };
  return (
    <div className={`profile-workspace ${wide ? "with-preview" : ""}`}>
      <form
        className={styles.editor}
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="page-header">
          <div>
            <h1>My profile</h1>
            <p>
              Your details and how your booking page looks. Changes show in the
              preview.
            </p>
          </div>
        </div>
        <div className="tabs" role="tablist" aria-label="Profile sections">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === "profile" && (
            <>
              <section className={`panel ${styles.section}`}>
                <h3>Coach profile</h3>
                <p>Keep your introduction to two or three sentences.</p>
                <AssetInput
                  label="Coach photograph"
                  value={draft.photograph}
                  onChange={(value) => change("photograph", value)}
                  {...assetProps}
                />
                <div className={styles.columns}>
                  <label>
                    Name
                    <input
                      value={draft.name}
                      required
                      maxLength={80}
                      onChange={(e) => change("name", e.target.value)}
                    />
                  </label>
                  <label>
                    Coaching title
                    <input
                      value={draft.title}
                      required
                      maxLength={80}
                      onChange={(e) => change("title", e.target.value)}
                    />
                  </label>
                </div>
                <label>
                  Short introduction
                  <textarea
                    rows={4}
                    maxLength={500}
                    required
                    value={draft.introduction}
                    onChange={(e) => change("introduction", e.target.value)}
                  />
                  <small>{draft.introduction.length}/500 characters</small>
                </label>
                <label>
                  Qualifications or experience <span>(optional)</span>
                  <textarea
                    rows={2}
                    maxLength={300}
                    value={draft.experience}
                    onChange={(e) => change("experience", e.target.value)}
                  />
                </label>
                <label>
                  Coaching area <span>(optional)</span>
                  <input
                    value={draft.location}
                    maxLength={100}
                    placeholder="e.g. Lancashire"
                    onChange={(e) => change("location", e.target.value)}
                  />
                  <small>
                    Your active clubs also appear on the profile and in the
                    request form.
                  </small>
                </label>
              </section>
              <section className={`panel ${styles.section}`}>
                <h3>Logo</h3>
                <p>Optional. Replaces your name in the page header.</p>
                <AssetInput
                  label="Logo"
                  value={draft.logo}
                  onChange={(value) => change("logo", value)}
                  {...assetProps}
                />
                <AssetInput
                  label="Logo for dark looks"
                  value={draft.logoDark}
                  onChange={(value) => change("logoDark", value)}
                  {...assetProps}
                />
                <p className={styles.hint}>
                  Dark looks such as Midnight use this light version. Without
                  one, your name is shown as text so it stays readable.
                </p>
              </section>
            </>
          )}
          {tab === "appearance" && (
            <AppearanceEditor
              draft={draft}
              onAppearance={patchAppearance}
              onPatch={patch}
            />
          )}
          {tab === "contact" && (
            <>
              <section className={`panel ${styles.section}`}>
                <h3>Contact options</h3>
                <p>
                  Add your WhatsApp number to let players message you. It
                  appears on your page, and WhatsApp opens in their own app.
                </p>
                <label>
                  WhatsApp number <span>(optional)</span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={draft.whatsapp}
                    placeholder="+447700900123"
                    maxLength={30}
                    onChange={(e) => change("whatsapp", e.target.value)}
                  />
                  <small>
                    Include the country code. Leave blank to hide WhatsApp.
                  </small>
                </label>
                <label>
                  Instagram handle <span>(optional)</span>
                  <input
                    value={draft.instagram}
                    maxLength={31}
                    onChange={(e) => change("instagram", e.target.value)}
                  />
                </label>
              </section>
              <section className={`panel ${styles.section}`}>
                <h3>WhatsApp messages</h3>
                <p>
                  Drafts that open in WhatsApp when you approve, decline or
                  remind a player. You can edit each one in WhatsApp before you
                  send it.
                </p>
                {(
                  Object.keys(defaultTemplates) as (keyof WhatsAppTemplates)[]
                ).map((key) => (
                  <label key={key}>
                    {templateLabels[key]}
                    <textarea
                      rows={3}
                      maxLength={600}
                      value={draft.whatsappTemplates[key]}
                      onChange={(e) =>
                        patch({
                          whatsappTemplates: {
                            ...draft.whatsappTemplates,
                            [key]: e.target.value,
                          },
                        })
                      }
                    />
                    <small>
                      Example:{" "}
                      {renderTemplate(draft.whatsappTemplates[key], {
                        first: "Sam",
                        name: "Sam Player",
                        lesson: "Private lesson",
                        club: "Riverside",
                        date: "Tue 24 Nov",
                        time: "10:00",
                        suggestion: "Wed 25 Nov at 11:00",
                        coach: draft.name.split(" ")[0],
                      })}
                    </small>
                  </label>
                ))}
                <p className={styles.hint}>
                  You can use {templateFields.join(" ")}.
                </p>
                <button
                  type="button"
                  className="button secondary small"
                  onClick={() => patch({ whatsappTemplates: defaultTemplates })}
                >
                  Reset to defaults
                </button>
              </section>
              <div className={styles.management}>
                <p>
                  <strong>Clubs, lessons and availability</strong> are managed
                  in their own tabs. Active items appear on your booking page.
                </p>
              </div>
            </>
          )}
        </div>
        <div className="save-bar">
          <p
            role={error ? "alert" : "status"}
            className={error ? "form-error" : ""}
          >
            {error ||
              status ||
              (reading > 0
                ? "Reading image…"
                : dirty
                  ? "You have unsaved changes."
                  : "All changes saved.")}
          </p>
          <div className="row">
            {dirty && (
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setDraft(profile);
                  setError("");
                  setStatus("");
                }}
              >
                Discard
              </button>
            )}
            {!wide && (
              <button
                type="button"
                className="button secondary"
                onClick={() => setSheet(true)}
              >
                Preview
              </button>
            )}
            <button
              className="button"
              type="submit"
              disabled={reading > 0 || !dirty}
            >
              Save changes
            </button>
          </div>
        </div>
      </form>
      {wide && (
        <aside className="preview-pane" aria-label="Live preview">
          <div className="preview-toolbar">
            <strong>Live preview</strong>
            <div className="segmented">
              {(["desktop", "phone"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={device === d}
                  className={device === d ? "selected" : ""}
                  onClick={() => setDevice(d)}
                >
                  {d === "desktop" ? "Desktop" : "Phone"}
                </button>
              ))}
            </div>
          </div>
          <PreviewFrame workspace={previewWorkspace} device={device} />
        </aside>
      )}
      {sheet && (
        <PreviewSheet
          workspace={previewWorkspace}
          onClose={() => setSheet(false)}
        />
      )}
    </div>
  );
}
