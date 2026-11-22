import type { CSSProperties } from "react";

/**
 * Public-page theming. Coaches never edit raw colours or CSS. They choose a
 * whole-site "look" (a preset) or fine-tune curated options, and everything
 * resolves to the design tokens below.
 */
export const coachPalettes = {
  studio: {
    name: "Studio",
    description: "Off-white · Charcoal · Electric blue",
    background: "#f5f5f1",
    ink: "#1b1b1b",
    muted: "#65666e",
    surface: "#eaece5",
    line: "#d4d7ce",
    accent: "#1744ed",
    onAccent: "#ffffff",
    selected: "#e5eaff",
  },
  clay: {
    name: "Clay",
    description: "Warm cream · Dark brown · Terracotta",
    background: "#f5eee5",
    ink: "#38271f",
    muted: "#705b4a",
    surface: "#eee1d4",
    line: "#d7c5b5",
    accent: "#9b452e",
    onAccent: "#ffffff",
    selected: "#f0d6c8",
  },
  court: {
    name: "Court",
    description: "Muted sage · Deep green · Lime",
    background: "#e6ece4",
    ink: "#183c31",
    muted: "#4c6657",
    surface: "#d9e3d6",
    line: "#b9cbbb",
    accent: "#dcf26b",
    onAccent: "#1c352a",
    selected: "#d7e6bb",
  },
  midnight: {
    name: "Midnight",
    description: "Dark charcoal · Warm white · Ice blue",
    background: "#202326",
    ink: "#f2efe7",
    muted: "#b7bcbf",
    surface: "#2c3034",
    line: "#4b5257",
    accent: "#bde2f5",
    onAccent: "#17252e",
    selected: "#344a57",
  },
  sand: {
    name: "Sand",
    description: "Beige · Dark brown · Muted bronze",
    background: "#eae1d2",
    ink: "#3a2f25",
    muted: "#645542",
    surface: "#e0d3bf",
    line: "#c5b49b",
    accent: "#7e5b39",
    onAccent: "#ffffff",
    selected: "#d9c5aa",
  },
} as const;
export type CoachPaletteId = keyof typeof coachPalettes;
export function isCoachPalette(value: unknown): value is CoachPaletteId {
  return typeof value === "string" && Object.hasOwn(coachPalettes, value);
}

/** Vetted accent colours. "palette" uses the selected palette's own accent. */
export const accentSwatches = [
  { value: "#1744ed", name: "Electric blue" },
  { value: "#9b452e", name: "Terracotta" },
  { value: "#c8e84a", name: "Lime" },
  { value: "#bde2f5", name: "Ice blue" },
  { value: "#7e5b39", name: "Bronze" },
  { value: "#0f766e", name: "Teal" },
  { value: "#c2185b", name: "Berry" },
  { value: "#e8590c", name: "Orange" },
  { value: "#5b3df5", name: "Violet" },
  { value: "#181818", name: "Black" },
] as const;
export type CoachAccent = "palette" | (typeof accentSwatches)[number]["value"];
export function isCoachAccent(value: unknown): value is CoachAccent {
  return (
    value === "palette" ||
    accentSwatches.some((swatch) => swatch.value === value)
  );
}

export const heroLayouts = {
  editorial: {
    name: "Editorial",
    description: "Oversized name above a wide photograph",
  },
  split: { name: "Split", description: "Name beside a portrait photograph" },
  overlay: {
    name: "Full-bleed",
    description: "Name set over a full-width photograph",
  },
} as const;
export type HeroLayoutId = keyof typeof heroLayouts;
export function isHeroLayout(value: unknown): value is HeroLayoutId {
  return typeof value === "string" && Object.hasOwn(heroLayouts, value);
}

/** Display and body stacks. Families are bundled locally (see layout.tsx). */
export const typePairings = {
  geist: {
    name: "Modern sans",
    description: "Geist throughout",
    display: 'var(--font-geist-sans), "Geist", system-ui, sans-serif',
    body: 'var(--font-geist-sans), "Geist", system-ui, sans-serif',
    nameWeight: 700,
    nameTracking: "-0.05em",
    nameCase: "none",
    headingWeight: 500,
    headingTracking: "-0.035em",
    /** Approximate average glyph width in em, used to fit the name. */
    nameWidth: 0.55,
  },
  serif: {
    name: "Editorial serif",
    description: "Instrument Serif with Geist",
    display: '"Instrument Serif", Georgia, "Times New Roman", serif',
    body: 'var(--font-geist-sans), "Geist", system-ui, sans-serif',
    nameWeight: 400,
    nameTracking: "-0.03em",
    nameCase: "none",
    headingWeight: 400,
    headingTracking: "-0.015em",
    nameWidth: 0.44,
  },
  condensed: {
    name: "Bold condensed",
    description: "Barlow Condensed with Geist",
    display: '"Barlow Condensed", "Arial Narrow", system-ui, sans-serif',
    body: 'var(--font-geist-sans), "Geist", system-ui, sans-serif',
    nameWeight: 700,
    nameTracking: "-0.005em",
    nameCase: "uppercase",
    headingWeight: 600,
    headingTracking: "0em",
    nameWidth: 0.42,
  },
} as const;
export type TypePairingId = keyof typeof typePairings;
export function isTypePairing(value: unknown): value is TypePairingId {
  return typeof value === "string" && Object.hasOwn(typePairings, value);
}

export const cornerStyles = {
  sharp: { name: "Sharp", button: "2px", card: "2px", input: "2px" },
  soft: { name: "Soft", button: "10px", card: "14px", input: "10px" },
  pill: { name: "Rounded", button: "999px", card: "18px", input: "14px" },
} as const;
export type CornerStyleId = keyof typeof cornerStyles;
export function isCornerStyle(value: unknown): value is CornerStyleId {
  return typeof value === "string" && Object.hasOwn(cornerStyles, value);
}

export type CoachAppearance = {
  hero: HeroLayoutId;
  palette: CoachPaletteId;
  accent: CoachAccent;
  font: TypePairingId;
  corners: CornerStyleId;
  showHighlights: boolean;
  showTestimonials: boolean;
  showFaq: boolean;
  poweredBy: boolean;
};

export const defaultAppearance: CoachAppearance = {
  hero: "editorial",
  palette: "studio",
  accent: "palette",
  font: "geist",
  corners: "soft",
  showHighlights: true,
  showTestimonials: true,
  showFaq: true,
  poweredBy: true,
};

/** Whole-site looks. Each bundles hero, palette, accent, type and corners. */
export const lookPresets = [
  {
    id: "studio",
    name: "Studio",
    description: "Clean editorial, soft corners",
    appearance: {
      hero: "editorial",
      palette: "studio",
      accent: "palette",
      font: "geist",
      corners: "soft",
    },
  },
  {
    id: "journal",
    name: "Journal",
    description: "Serif headline, warm sand",
    appearance: {
      hero: "editorial",
      palette: "sand",
      accent: "palette",
      font: "serif",
      corners: "sharp",
    },
  },
  {
    id: "clay",
    name: "Clay split",
    description: "Portrait beside the name",
    appearance: {
      hero: "split",
      palette: "clay",
      accent: "palette",
      font: "geist",
      corners: "soft",
    },
  },
  {
    id: "court",
    name: "Fresh court",
    description: "Sage and lime, rounded",
    appearance: {
      hero: "split",
      palette: "court",
      accent: "palette",
      font: "geist",
      corners: "pill",
    },
  },
  {
    id: "midnight",
    name: "Midnight bold",
    description: "Dark, full-bleed, condensed",
    appearance: {
      hero: "overlay",
      palette: "midnight",
      accent: "palette",
      font: "condensed",
      corners: "sharp",
    },
  },
] as const satisfies readonly {
  id: string;
  name: string;
  description: string;
  appearance: Pick<
    CoachAppearance,
    "hero" | "palette" | "accent" | "font" | "corners"
  >;
}[];

/** Returns the preset whose look fields all match, if any. */
export function matchingLook(appearance: CoachAppearance) {
  return lookPresets.find((preset) =>
    (
      Object.keys(preset.appearance) as (keyof typeof preset.appearance)[]
    ).every((key) => preset.appearance[key] === appearance[key]),
  );
}

/** Validates unknown saved data, falling back per field. */
export function sanitiseAppearance(
  value: unknown,
  legacyPalette?: unknown,
): CoachAppearance {
  const raw = (value && typeof value === "object" ? value : {}) as Record<
    string,
    unknown
  >;
  const flag = (key: keyof CoachAppearance) =>
    typeof raw[key] === "boolean"
      ? (raw[key] as boolean)
      : (defaultAppearance[key] as boolean);
  return {
    hero: isHeroLayout(raw.hero) ? raw.hero : defaultAppearance.hero,
    palette: isCoachPalette(raw.palette)
      ? raw.palette
      : isCoachPalette(legacyPalette)
        ? legacyPalette
        : defaultAppearance.palette,
    accent: isCoachAccent(raw.accent) ? raw.accent : defaultAppearance.accent,
    font: isTypePairing(raw.font) ? raw.font : defaultAppearance.font,
    corners: isCornerStyle(raw.corners)
      ? raw.corners
      : defaultAppearance.corners,
    showHighlights: flag("showHighlights"),
    showTestimonials: flag("showTestimonials"),
    showFaq: flag("showFaq"),
    poweredBy: true,
  };
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrastRatio(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
/** Picks black or white text for a filled background, whichever reads better. */
export function readableOn(background: string) {
  return contrastRatio("#ffffff", background) >=
    contrastRatio("#141414", background)
    ? "#ffffff"
    : "#141414";
}

/** Resolves an appearance to concrete colours, including derived contrast values. */
export function resolveColours(appearance: CoachAppearance) {
  const palette = coachPalettes[appearance.palette];
  const accent =
    appearance.accent === "palette" ? palette.accent : appearance.accent;
  const onAccent =
    appearance.accent === "palette" ? palette.onAccent : readableOn(accent);
  const accentOnPage = contrastRatio(accent, palette.background);
  return {
    palette,
    accent,
    onAccent,
    buttonContrast: contrastRatio(onAccent, accent),
    accentOnPage,
    /** Accent used for small text and links; falls back to ink when too light. */
    accentText: accentOnPage >= 4.5 ? accent : palette.ink,
  };
}

/** Fits the stacked name lockup: sized by its longest word. */
export function nameFontSize(name: string, appearance: CoachAppearance) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const longest = Math.max(...words.map((w) => w.length), 4);
  const width = typePairings[appearance.font].nameWidth;
  const column =
    appearance.hero === "split"
      ? 0.5
      : appearance.hero === "overlay"
        ? 0.62
        : 1;
  const vw = Math.min(14.5, 90 / (longest * width)) * column;
  const px = Math.min(210, 1290 / (longest * width)) * column;
  return `clamp(${appearance.hero === "split" ? 44 : 52}px, ${vw.toFixed(2)}vw, ${px.toFixed(0)}px)`;
}

export function coachTheme(appearance: CoachAppearance): CSSProperties {
  const { palette, accent, onAccent, accentText } = resolveColours(appearance);
  const type = typePairings[appearance.font];
  const corners = cornerStyles[appearance.corners];
  return {
    "--coach-background": palette.background,
    "--coach-ink": palette.ink,
    "--coach-muted": palette.muted,
    "--coach-surface": palette.surface,
    "--coach-line": palette.line,
    "--coach-selected": palette.selected,
    "--coach-accent": accent,
    "--coach-on-accent": onAccent,
    "--coach-accent-text": accentText,
    "--coach-font-display": type.display,
    "--coach-font-body": type.body,
    "--coach-name-weight": type.nameWeight,
    "--coach-name-tracking": type.nameTracking,
    "--coach-name-case": type.nameCase,
    "--coach-heading-weight": type.headingWeight,
    "--coach-heading-tracking": type.headingTracking,
    "--coach-radius-button": corners.button,
    "--coach-radius-card": corners.card,
    "--coach-radius-input": corners.input,
    "--coach-chevron": `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='${palette.ink}' stroke-width='2'><path d='m6 9 6 6 6-6'/></svg>`)}")`,
    colorScheme: appearance.palette === "midnight" ? "dark" : "light",
  } as CSSProperties;
}
