"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  defaultAppearance,
  lookPresets,
  matchingLook,
  type CoachAppearance,
} from "@/lib/coach-theme";
import {
  registerCoach,
  type CoachProfile,
  type CoachWorkspace,
} from "@/lib/coach-workspace";
import { slugAvailable } from "@/lib/workspace-db";
import { defaultTemplates } from "@/lib/whatsapp";
import { useMediaQuery } from "@/lib/use-media";
import { LogoutButton } from "../auth/logout-button";
import { Logo } from "../logo";
import { LookPreview } from "../profile/appearance-editor";
import { PreviewFrame, PreviewSheet } from "../profile/preview-frame";
import { claimKey, slugPattern, slugify } from "@/lib/slug";
import { AssetInput } from "../profile/profile-editor";
import { FocusPicker } from "../profile/focus-picker";
import profileStyles from "../profile/profile-editor.module.css";
import styles from "./signup.module.css";

const days = [
  { day: 1, name: "Monday" },
  { day: 2, name: "Tuesday" },
  { day: 3, name: "Wednesday" },
  { day: 4, name: "Thursday" },
  { day: 5, name: "Friday" },
  { day: 6, name: "Saturday" },
  { day: 0, name: "Sunday" },
];
const steps = [
  "You",
  "Your story",
  "Your look",
  "Clubs & lessons",
  "Your week",
  "Review",
];
const starterLessons = [
  {
    name: "Private lesson",
    description: "One-to-one coaching built around your game.",
    duration: 60,
    price: 55,
    on: true,
  },
  {
    name: "Duo lesson",
    description: "Train with a partner and share the session.",
    duration: 60,
    price: 70,
    on: false,
  },
  {
    name: "Small group",
    description: "Fun, focused coaching for up to four players.",
    duration: 90,
    price: 90,
    on: false,
  },
];

type Draft = {
  photograph: string | null;
  focusX: number;
  focusY: number;
  name: string;
  slug: string;
  title: string;
  location: string;
  tagline: string;
  introduction: string;
  experience: string;
  appearance: CoachAppearance;
  clubName: string;
  clubAddress: string;
  lessons: typeof starterLessons;
  days: number[];
  start: string;
  end: string;
};
const blank: Draft = {
  photograph: null,
  focusX: 50,
  focusY: 30,
  name: "",
  slug: "",
  title: "Padel coach",
  location: "",
  tagline: "",
  introduction: "",
  experience: "",
  appearance: defaultAppearance,
  clubName: "",
  clubAddress: "",
  lessons: starterLessons,
  days: [1, 2, 3, 4, 5],
  start: "09:00",
  end: "17:00",
};
const hours = (value: string) => {
  const [h, m] = value.split(":").map(Number);
  return h + (m || 0) / 60;
};

/** Reads the name and address the landing page saved, if they are valid. */
function readClaim(): { name: string; slug: string } | null {
  try {
    const raw = JSON.parse(localStorage.getItem(claimKey) ?? "null");
    if (
      raw &&
      typeof raw.name === "string" &&
      typeof raw.slug === "string" &&
      slugPattern.test(raw.slug)
    )
      return { name: raw.name.slice(0, 80), slug: raw.slug };
  } catch {}
  return null;
}

/** Builds a complete workspace from the wizard's answers. */
function toWorkspace(d: Draft, placeholders: boolean): CoachWorkspace {
  const profile: CoachProfile = {
    name: d.name.trim() || (placeholders ? "Your Name" : ""),
    title: d.title.trim() || "Padel coach",
    tagline: d.tagline.trim(),
    introduction:
      d.introduction.trim() ||
      (placeholders
        ? "Your introduction will appear here. Tell players how you coach and who you help."
        : ""),
    experience: d.experience.trim(),
    location: d.location.trim(),
    highlights: [],
    testimonials: [],
    appearance: d.appearance,
    photograph: d.photograph,
    photoFocusX: d.focusX,
    photoFocusY: d.focusY,
    logo: null,
    logoDark: null,
    whatsapp: "",
    whatsappTemplates: defaultTemplates,
    instagram: "",
  };
  const clubName = d.clubName.trim() || (placeholders ? "Your club" : "");
  const clubId = crypto.randomUUID();
  const chosen = d.lessons.filter((l) => l.on);
  return {
    profile,
    clubs: clubName
      ? [
          {
            id: clubId,
            name: clubName,
            address:
              d.clubAddress.trim() || (placeholders ? "Club address" : ""),
            notes: "",
            active: true,
          },
        ]
      : [],
    lessons: chosen.map((l) => ({
      id: crypto.randomUUID(),
      name: l.name.trim() || "Lesson",
      description: l.description,
      duration: l.duration,
      price: Number.isFinite(l.price) ? l.price : 0,
      active: true,
    })),
    bookings: [],
    rules: d.days.map((day) => ({
      id: crypto.randomUUID(),
      day,
      clubId,
      lessonId: "all",
      start: hours(d.start),
      end: hours(d.end),
      effectiveStart: "2026-11-01",
      effectiveEnd: "2027-12-31",
    })),
    exceptions: [],
  };
}

export function SignupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  /** A name and address claimed on the landing page, if any. */
  const [claim] = useState(readClaim);
  const [draft, setDraft] = useState<Draft>(() =>
    claim ? { ...blank, name: claim.name, slug: claim.slug } : blank,
  );
  const [error, setError] = useState("");
  const [reading, setReading] = useState(0);
  const [sheet, setSheet] = useState(false);
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const heading = useRef<HTMLHeadingElement>(null);
  const wide = useMediaQuery("(min-width: 1100px)");
  const [slugEdited, setSlugEdited] = useState(claim !== null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({
      ...d,
      [key]: value,
      ...(key === "name" && !slugEdited ? { slug: slugify(String(value)) } : {}),
    }));
    setError("");
  };
  const preview = useMemo(() => toWorkspace(draft, true), [draft]);
  const look = matchingLook(draft.appearance);
  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  const validate = (): string => {
    if (step === 0 && (!draft.name.trim() || !draft.title.trim()))
      return "Add your name and what you coach.";
    if (step === 0 && !slugPattern.test(draft.slug))
      return "Choose a page address of 3–40 letters, numbers or hyphens.";
    if (step === 1 && !draft.introduction.trim())
      return "Add a short introduction so players know who you are.";
    if (step === 3) {
      if (!draft.clubName.trim() || !draft.clubAddress.trim())
        return "Add the club where you coach, with its address.";
      const chosen = draft.lessons.filter((l) => l.on);
      if (chosen.length === 0) return "Choose at least one lesson.";
      if (chosen.some((l) => !l.name.trim() || !(l.price >= 0)))
        return "Give each lesson a name and a price (use 0 if free).";
    }
    if (step === 4) {
      if (draft.days.length === 0) return "Choose at least one day you coach.";
      if (hours(draft.end) - hours(draft.start) < 1)
        return "Your coaching window needs to be at least one hour.";
    }
    return "";
  };
  const next = async () => {
    const problem = validate();
    if (problem) return setError(problem);
    if (step === 0) {
      setBusy(true);
      try {
        if (!(await slugAvailable(draft.slug))) {
          setBusy(false);
          return setError("That page address is taken. Try another.");
        }
      } catch {
        setBusy(false);
        return setError("Couldn’t check that address. Check your connection and try again.");
      }
      setBusy(false);
    }
    setError("");
    setStep((s) => Math.min(steps.length - 1, s + 1));
  };
  const finish = async () => {
    setBusy(true);
    setError("");
    try {
      await registerCoach(draft.slug, toWorkspace(draft, false));
      try {
        localStorage.removeItem(claimKey);
      } catch {}
      router.push("/dashboard/overview");
    } catch (e) {
      setBusy(false);
      const message = e instanceof Error ? e.message : "Something went wrong.";
      if (/address/i.test(message)) setStep(0);
      setError(message);
    }
  };

  const first = draft.name.trim().split(" ")[0];
  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <Logo />
        <span className={styles.demoTag}>Setting up your page</span>
        <LogoutButton className={styles.skip} />
      </header>
      <div className={`${styles.layout} ${wide ? styles.withPreview : ""}`}>
        <section className={styles.panel} aria-label="Sign up">
          <ol className={styles.progress} aria-label="Sign-up progress">
            {steps.map((label, i) => (
              <li
                key={label}
                className={
                  i === step ? styles.current : i < step ? styles.done : ""
                }
                aria-current={i === step ? "step" : undefined}
              >
                <span>
                  {i < step ? <Check size={13} aria-hidden="true" /> : i + 1}
                </span>
                <b>{label}</b>
              </li>
            ))}
          </ol>
          <h1 ref={heading} tabIndex={-1}>
            {
              [
                "Let’s build your page.",
                `Tell players about you${first ? `, ${first}` : ""}.`,
                "Choose a look.",
                "Where and what you coach.",
                "When you coach.",
                "Ready to go.",
              ][step]
            }
          </h1>
          <p className={styles.lead}>
            {
              [
                "A photo, your name and what you coach. It takes about three minutes.",
                "A line that sounds like you, and a few sentences. Players read this first.",
                "Pick a style for your whole page. You can fine-tune it later.",
                "Add your club and the lessons players can request.",
                "Set your regular week. Players only see times you have open.",
                "Check everything looks right. You can change any of it later. Your 14-day free trial starts when you finish, with no card needed.",
              ][step]
            }
          </p>

          <div className={`${profileStyles.section} ${styles.fields}`}>
            {step === 0 && (
              <>
                <AssetInput
                  label="Coach photograph"
                  value={draft.photograph}
                  onChange={(v) => set("photograph", v)}
                  onError={setError}
                  onReading={(n) => setReading((r) => r + n)}
                />
                {draft.photograph && (
                  <FocusPicker
                    src={draft.photograph}
                    x={draft.focusX}
                    y={draft.focusY}
                    onChange={(x, y) => {
                      set("focusX", x);
                      set("focusY", y);
                    }}
                  />
                )}
                <div className={profileStyles.columns}>
                  <label>
                    Your name
                    <input
                      value={draft.name}
                      maxLength={80}
                      autoComplete="name"
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </label>
                  <label>
                    What you coach
                    <input
                      value={draft.title}
                      maxLength={80}
                      onChange={(e) => set("title", e.target.value)}
                    />
                  </label>
                </div>
                <label>
                  Your page address
                  <input
                    value={draft.slug}
                    maxLength={40}
                    autoCapitalize="none"
                    spellCheck={false}
                    onChange={(e) => {
                      setSlugEdited(true);
                      set("slug", slugify(e.target.value));
                    }}
                  />
                  <small>calspot.com/{draft.slug || "your-name"}</small>
                </label>
                <label>
                  Where you coach <span>(optional)</span>
                  <input
                    value={draft.location}
                    maxLength={100}
                    placeholder="e.g. Greater Manchester"
                    onChange={(e) => set("location", e.target.value)}
                  />
                </label>
              </>
            )}
            {step === 1 && (
              <>
                <label>
                  Tagline <span>(optional)</span>
                  <input
                    value={draft.tagline}
                    maxLength={80}
                    placeholder="e.g. Your game. Your pace."
                    onChange={(e) => set("tagline", e.target.value)}
                  />
                </label>
                <label>
                  Short introduction
                  <textarea
                    rows={5}
                    maxLength={500}
                    value={draft.introduction}
                    onChange={(e) => set("introduction", e.target.value)}
                  />
                  <small>
                    {draft.introduction.length}/500 characters. Two or three
                    sentences is plenty.
                  </small>
                </label>
                <label>
                  Qualifications or experience <span>(optional)</span>
                  <textarea
                    rows={2}
                    maxLength={300}
                    value={draft.experience}
                    onChange={(e) => set("experience", e.target.value)}
                  />
                </label>
              </>
            )}
            {step === 2 && (
              <fieldset className={profileStyles.fieldsetReset}>
                <legend className={profileStyles.srOnly}>Page look</legend>
                <div className={profileStyles.lookGrid}>
                  {lookPresets.map((preset) => {
                    const selected = look?.id === preset.id;
                    return (
                      <label
                        key={preset.id}
                        className={`${profileStyles.look} ${selected ? profileStyles.lookSelected : ""}`}
                      >
                        <input
                          type="radio"
                          name="look"
                          value={preset.id}
                          checked={selected}
                          onChange={() =>
                            set("appearance", {
                              ...draft.appearance,
                              ...preset.appearance,
                            })
                          }
                        />
                        <LookPreview
                          appearance={{
                            ...draft.appearance,
                            ...preset.appearance,
                          }}
                          name={draft.name || "Your Name"}
                        />
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
            )}
            {step === 3 && (
              <>
                <div className={profileStyles.columns}>
                  <label>
                    Club name
                    <input
                      value={draft.clubName}
                      maxLength={100}
                      onChange={(e) => set("clubName", e.target.value)}
                    />
                  </label>
                  <label>
                    Club address
                    <input
                      value={draft.clubAddress}
                      maxLength={200}
                      onChange={(e) => set("clubAddress", e.target.value)}
                    />
                  </label>
                </div>
                <fieldset className={profileStyles.fieldsetReset}>
                  <legend>Lessons players can request</legend>
                  {draft.lessons.map((lesson, i) => {
                    const update = (
                      patch: Partial<(typeof draft.lessons)[number]>,
                    ) =>
                      set(
                        "lessons",
                        draft.lessons.map((l, j) =>
                          j === i ? { ...l, ...patch } : l,
                        ),
                      );
                    return (
                      <div
                        className={`${styles.lessonRow} ${lesson.on ? "" : styles.off}`}
                        key={i}
                      >
                        <label className={styles.include}>
                          <input
                            type="checkbox"
                            checked={lesson.on}
                            onChange={(e) => update({ on: e.target.checked })}
                          />
                          <span className={profileStyles.srOnly}>
                            Offer {lesson.name}
                          </span>
                        </label>
                        <input
                          aria-label={`Lesson ${i + 1} name`}
                          value={lesson.name}
                          maxLength={60}
                          disabled={!lesson.on}
                          onChange={(e) => update({ name: e.target.value })}
                        />
                        <select
                          aria-label={`${lesson.name} length`}
                          value={lesson.duration}
                          disabled={!lesson.on}
                          onChange={(e) =>
                            update({ duration: Number(e.target.value) })
                          }
                        >
                          <option value={60}>60 min</option>
                          <option value={90}>90 min</option>
                        </select>
                        <span className={styles.price}>
                          £
                          <input
                            aria-label={`${lesson.name} guide price in pounds`}
                            type="number"
                            min={0}
                            step="1"
                            value={
                              Number.isFinite(lesson.price) ? lesson.price : ""
                            }
                            disabled={!lesson.on}
                            onChange={(e) =>
                              update({
                                price:
                                  e.target.value === ""
                                    ? NaN
                                    : Number(e.target.value),
                              })
                            }
                          />
                        </span>
                      </div>
                    );
                  })}
                  <p className={profileStyles.hint}>
                    Prices are a guide. No payment is taken on your page.
                  </p>
                </fieldset>
              </>
            )}
            {step === 4 && (
              <>
                <fieldset className={profileStyles.fieldsetReset}>
                  <legend>Days you coach</legend>
                  <div className={styles.dayPicker}>
                    {days.map((d) => (
                      <label
                        key={d.day}
                        className={
                          draft.days.includes(d.day) ? styles.dayOn : ""
                        }
                      >
                        <input
                          type="checkbox"
                          checked={draft.days.includes(d.day)}
                          onChange={(e) =>
                            set(
                              "days",
                              e.target.checked
                                ? [...draft.days, d.day]
                                : draft.days.filter((x) => x !== d.day),
                            )
                          }
                        />
                        {d.name.slice(0, 3)}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className={profileStyles.columns}>
                  <label>
                    From
                    <input
                      type="time"
                      value={draft.start}
                      onChange={(e) => set("start", e.target.value)}
                    />
                  </label>
                  <label>
                    Until
                    <input
                      type="time"
                      value={draft.end}
                      onChange={(e) => set("end", e.target.value)}
                    />
                  </label>
                </div>
                <p className={profileStyles.hint}>
                  Applies to {draft.clubName || "your club"} and all your
                  lessons. Add different hours per day, copy days and block
                  dates later in Availability.
                </p>
              </>
            )}
            {step === 5 && (
              <dl className={styles.review}>
                <dt>Name</dt>
                <dd>
                  {draft.name} · {draft.title}
                </dd>
                <dt>Look</dt>
                <dd>{look ? `${look.name} look` : "Custom look"}</dd>
                <dt>Club</dt>
                <dd>
                  {draft.clubName}
                  <small>{draft.clubAddress}</small>
                </dd>
                <dt>Lessons</dt>
                <dd>
                  {draft.lessons
                    .filter((l) => l.on)
                    .map((l) => (
                      <span key={l.name}>
                        {l.name} · {l.duration} min · £{l.price}
                      </span>
                    ))}
                </dd>
                <dt>Week</dt>
                <dd>
                  {days
                    .filter((d) => draft.days.includes(d.day))
                    .map((d) => d.name.slice(0, 3))
                    .join(", ")}
                  <small>
                    {draft.start}–{draft.end}
                  </small>
                </dd>
              </dl>
            )}
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {step === 5 && (
            <p className={styles.demoNote}>
              Your page stays private until you publish it from your dashboard.
            </p>
          )}
          <div className={styles.actions}>
            {step > 0 ? (
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setError("");
                  setStep(step - 1);
                }}
              >
                <ArrowLeft size={16} aria-hidden="true" /> Back
              </button>
            ) : (
              <span />
            )}
            <div className={styles.rightActions}>
              {!wide && (
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setSheet(true)}
                >
                  Preview
                </button>
              )}
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  className="button"
                  disabled={reading > 0 || busy}
                  onClick={next}
                >
                  Continue <ArrowRight size={16} aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  className="button"
                  disabled={busy || reading > 0}
                  onClick={finish}
                >
                  Create my page <Check size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </section>
        {wide && (
          <aside className={styles.preview} aria-label="Live preview">
            <div className={styles.previewBar}>
              <strong>Your page, live</strong>
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
            <PreviewFrame workspace={preview} device={device} />
          </aside>
        )}
      </div>
      {sheet && (
        <PreviewSheet workspace={preview} onClose={() => setSheet(false)} />
      )}
    </div>
  );
}
