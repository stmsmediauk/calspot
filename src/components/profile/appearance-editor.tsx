"use client";

import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import type { CoachProfile } from "@/lib/coach-workspace";
import {
  accentSwatches,
  coachPalettes,
  coachTheme,
  cornerStyles,
  heroLayouts,
  lookPresets,
  matchingLook,
  resolveColours,
  typePairings,
  type CoachAppearance,
  type CoachPaletteId,
  type CornerStyleId,
  type HeroLayoutId,
  type TypePairingId,
} from "@/lib/coach-theme";
import { nameLines } from "../coach-site/content";
import styles from "./profile-editor.module.css";

type Props = {
  draft: CoachProfile;
  onAppearance: (patch: Partial<CoachAppearance>) => void;
  onPatch: (patch: Partial<CoachProfile>) => void;
};

/** Small themed card showing how the chosen look treats the coach's name. */
export function LookPreview({
  appearance,
  name,
}: {
  appearance: CoachAppearance;
  name: string;
}) {
  const lines = nameLines(name);
  return (
    <div
      className={styles.lookPreview}
      style={coachTheme(appearance) as CSSProperties}
      aria-hidden="true"
    >
      <span className={styles.lookName}>{lines.join(" ")}</span>
      <span className={styles.lookRow}>
        <i className={styles.lookButton}>Request a session</i>
        <i className={styles.lookChip} />
      </span>
    </div>
  );
}

export function AppearanceEditor({ draft, onAppearance, onPatch }: Props) {
  const { appearance } = draft;
  const current = matchingLook(appearance);
  const colours = resolveColours(appearance);
  const radio = <T extends string>(
    name: string,
    value: T,
    selected: boolean,
    label: string,
    hint: string,
    onSelect: (value: T) => void,
  ) => (
    <label
      key={value}
      className={`${styles.choice} ${selected ? styles.choiceSelected : ""}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onSelect(value)}
      />
      <strong>{label}</strong>
      <small>{hint}</small>
    </label>
  );
  const setHighlight = (
    index: number,
    key: "value" | "label",
    text: string,
  ) => {
    const list = [0, 1, 2].map(
      (i) => draft.highlights[i] ?? { value: "", label: "" },
    );
    list[index] = { ...list[index], [key]: text };
    onPatch({ highlights: list });
  };
  const setTestimonial = (
    index: number,
    key: "quote" | "attribution",
    text: string,
  ) => {
    const list = [0, 1].map(
      (i) => draft.testimonials[i] ?? { quote: "", attribution: "" },
    );
    list[index] = { ...list[index], [key]: text };
    onPatch({ testimonials: list });
  };

  return (
    <>
      <section className={`panel ${styles.section}`}>
        <h3>Page look</h3>
        <p>
          Pick a style for your whole page. Your photograph and words stay the
          same.
        </p>
        <fieldset className={styles.fieldsetReset}>
          <legend className={styles.srOnly}>Page look</legend>
          <div className={styles.lookGrid}>
            {lookPresets.map((preset) => {
              const selected = current?.id === preset.id;
              const preview: CoachAppearance = {
                ...appearance,
                ...preset.appearance,
              };
              return (
                <label
                  key={preset.id}
                  className={`${styles.look} ${selected ? styles.lookSelected : ""}`}
                >
                  <input
                    type="radio"
                    name="look"
                    value={preset.id}
                    checked={selected}
                    onChange={() => onAppearance({ ...preset.appearance })}
                  />
                  <LookPreview appearance={preview} name={draft.name} />
                  <strong>
                    {preset.name}
                    {selected && <Check size={14} aria-hidden="true" />}
                  </strong>
                  <small>{preset.description}</small>
                </label>
              );
            })}
          </div>
        </fieldset>
        {!current && (
          <p className={styles.customNote}>
            You have a custom look. Choose a style above to start again.
          </p>
        )}
        <details className={styles.fineTune} open>
          <summary>
            <span>Fine-tune your page</span>
            <small>Layout, colours, accent, fonts and more</small>
          </summary>
          <fieldset className={styles.fieldsetReset}>
            <legend>Page style</legend>
            <div className={styles.choiceRow}>
              {(Object.keys(heroLayouts) as HeroLayoutId[]).map((id) =>
                radio(
                  "hero",
                  id,
                  appearance.hero === id,
                  heroLayouts[id].name,
                  heroLayouts[id].description,
                  (hero) => onAppearance({ hero }),
                ),
              )}
            </div>
          </fieldset>
          <fieldset className={styles.fieldsetReset}>
            <legend>Colours</legend>
            <div className={styles.choiceRow}>
              {(Object.keys(coachPalettes) as CoachPaletteId[]).map((id) =>
                radio(
                  "palette",
                  id,
                  appearance.palette === id,
                  coachPalettes[id].name,
                  coachPalettes[id].description,
                  (palette) => onAppearance({ palette }),
                ),
              )}
            </div>
          </fieldset>
          <fieldset className={styles.fieldsetReset}>
            <legend>Accent</legend>
            <div className={styles.swatches}>
              <button
                type="button"
                className={styles.swatchAuto}
                aria-pressed={appearance.accent === "palette"}
                onClick={() => onAppearance({ accent: "palette" })}
              >
                Match colours
              </button>
              {accentSwatches.map((swatch) => (
                <button
                  key={swatch.value}
                  type="button"
                  className={styles.swatch}
                  style={{ background: swatch.value }}
                  aria-label={swatch.name}
                  aria-pressed={appearance.accent === swatch.value}
                  onClick={() => onAppearance({ accent: swatch.value })}
                />
              ))}
            </div>
            <p className={styles.hint} role="status">
              Button text contrast {colours.buttonContrast.toFixed(1)}:1.
              {colours.accentOnPage < 4.5
                ? " This accent is light, so it fills buttons and highlights while small text stays dark."
                : " This accent also works for small text and links."}
            </p>
          </fieldset>
          <fieldset className={styles.fieldsetReset}>
            <legend>Type</legend>
            <div className={styles.choiceRow}>
              {(Object.keys(typePairings) as TypePairingId[]).map((id) =>
                radio(
                  "font",
                  id,
                  appearance.font === id,
                  typePairings[id].name,
                  typePairings[id].description,
                  (font) => onAppearance({ font }),
                ),
              )}
            </div>
          </fieldset>
          <fieldset className={styles.fieldsetReset}>
            <legend>Corners</legend>
            <div className={styles.choiceRow}>
              {(Object.keys(cornerStyles) as CornerStyleId[]).map((id) =>
                radio(
                  "corners",
                  id,
                  appearance.corners === id,
                  cornerStyles[id].name,
                  "",
                  (corners) => onAppearance({ corners }),
                ),
              )}
            </div>
          </fieldset>
        </details>
      </section>

      <section className={`panel ${styles.section}`}>
        <h3>Page content</h3>
        <p>Short extras that make your page feel like yours. All optional.</p>
        <label>
          Tagline <span>(optional)</span>
          <input
            value={draft.tagline}
            maxLength={80}
            placeholder="e.g. Your game. Your pace."
            onChange={(e) => onPatch({ tagline: e.target.value })}
          />
        </label>
        <fieldset className={styles.fieldsetReset}>
          <legend>Highlights (up to three)</legend>
          <label className={styles.checkLine}>
            <input
              type="checkbox"
              checked={appearance.showHighlights}
              onChange={(e) =>
                onAppearance({ showHighlights: e.target.checked })
              }
            />
            Show highlights under the photograph
          </label>
          {[0, 1, 2].map((i) => (
            <div className={styles.pair} key={i}>
              <input
                aria-label={`Highlight ${i + 1} headline`}
                value={draft.highlights[i]?.value ?? ""}
                maxLength={30}
                placeholder="e.g. 10+ years"
                onChange={(e) => setHighlight(i, "value", e.target.value)}
              />
              <input
                aria-label={`Highlight ${i + 1} detail`}
                value={draft.highlights[i]?.label ?? ""}
                maxLength={60}
                placeholder="e.g. Coaching experience"
                onChange={(e) => setHighlight(i, "label", e.target.value)}
              />
            </div>
          ))}
        </fieldset>
        <fieldset className={styles.fieldsetReset}>
          <legend>Player testimonials (up to two)</legend>
          <label className={styles.checkLine}>
            <input
              type="checkbox"
              checked={appearance.showTestimonials}
              onChange={(e) =>
                onAppearance({ showTestimonials: e.target.checked })
              }
            />
            Show testimonials. The section appears only when you add one.
          </label>
          {[0, 1].map((i) => (
            <div key={i} className={styles.quoteEdit}>
              <textarea
                aria-label={`Testimonial ${i + 1}`}
                rows={2}
                maxLength={220}
                value={draft.testimonials[i]?.quote ?? ""}
                placeholder="Only add words a player has given you permission to share."
                onChange={(e) => setTestimonial(i, "quote", e.target.value)}
              />
              <input
                aria-label={`Testimonial ${i + 1} attribution`}
                value={draft.testimonials[i]?.attribution ?? ""}
                maxLength={60}
                placeholder="e.g. Club player, Preston"
                onChange={(e) =>
                  setTestimonial(i, "attribution", e.target.value)
                }
              />
            </div>
          ))}
        </fieldset>
        <label className={styles.checkLine}>
          <input
            type="checkbox"
            checked={appearance.showFaq}
            onChange={(e) => onAppearance({ showFaq: e.target.checked })}
          />
          Show the “Before you ask” questions
        </label>
      </section>
    </>
  );
}
