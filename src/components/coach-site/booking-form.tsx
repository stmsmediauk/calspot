"use client";
import Script from "next/script";
import { useRef, useState } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { hasWhatsApp, useCoachWorkspace } from "@/lib/coach-workspace";
import { spacesTaken, startTimes } from "@/lib/availability";
import { londonHour, today } from "@/lib/mock-data";
import {
  formatDay,
  formatHour,
  sampleDay,
  sampleWeeks,
  zoneName,
} from "./content";
import { useSite } from "./site-context";
import { WhatsAppButton } from "./whatsapp-button";
import styles from "./site.module.css";

const stepLabels = ["Session", "Time", "Details"];
const stepHeadings = ["Choose your session.", "Pick a time.", "Nearly done."];
const emptyPlayer = {
  name: "",
  email: "",
  phone: "",
  /** Empty until the player chooses; defaults to WhatsApp when the coach has it. */
  contact: "",
  level: "",
  message: "",
};

export function BookingForm({
  initialLesson = "l1",
}: {
  initialLesson?: string;
}) {
  const workspace = useCoachWorkspace();
  const { profile } = workspace;
  const lessons = workspace.lessons.filter((l) => l.active);
  const clubs = workspace.clubs.filter((c) => c.active);
  const formShown = useRef(0);
  const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [step, setStep] = useState(0),
    [lessonId, setLessonId] = useState(initialLesson),
    [venueId, setVenueId] = useState(""),
    [week, setWeek] = useState(0),
    [dayIndex, setDayIndex] = useState<number | null>(null),
    [time, setTime] = useState(""),
    [spaces, setSpaces] = useState(1),
    [repeatWeeks, setRepeatWeeks] = useState(1),
    [guests, setGuests] = useState<string[]>([]),
    [submitted, setSubmitted] = useState(false),
    [sending, setSending] = useState(false),
    [sendError, setSendError] = useState(""),
    [player, setPlayer] = useState({
      ...emptyPlayer,
      contact: "",
    });
  const heading = useRef<HTMLHeadingElement>(null);
  const contact =
    player.contact || (hasWhatsApp(profile.whatsapp) ? "whatsapp" : "email");
  const lesson = lessons.find((l) => l.id === lessonId) ?? lessons[0];
  const venue = clubs.find((c) => c.id === venueId) ?? clubs[0];
  const shortName = profile.name.split(" ")[0];
  const { live, slug } = useSite();
  const demo = !live;
  /** Start times from the coach's own availability, bookings and exceptions. */
  const timesFor = (weekIndex: number, index: number) => {
    if (!lesson || !venue) return [];
    const d = sampleDay(weekIndex, index);
    const key = d.toISOString().slice(0, 10);
    const now = today();
    if (key < now) return [];
    const times = startTimes({
      date: key,
      rules: workspace.rules,
      exceptions: workspace.exceptions,
      bookings: workspace.bookings,
      lessons: workspace.lessons,
      lesson,
      clubId: venue.id,
    });
    // Today only offers times that are still ahead.
    return (key === now ? times.filter((t) => t > londonHour()) : times).map(
      formatHour,
    );
  };

  /** Spaces still open in a group session at a chosen day and time. */
  const spacesLeft = (weekIndex: number, index: number, t: string) => {
    if (!lesson || !venue) return 0;
    const [h, m] = t.split(":").map(Number);
    return (
      lesson.capacity -
      spacesTaken(
        workspace.bookings,
        lesson.id,
        venue.id,
        sampleDay(weekIndex, index).toISOString().slice(0, 10),
        h + m / 60,
      )
    );
  };

  const advance = (next: number) => {
    formShown.current = Date.now();
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus());
  };

  if (!lesson || !venue)
    return (
      <div className={styles.bookingEmpty}>
        <h2 className={styles.sectionTitle}>
          Sessions will be available soon.
        </h2>
        <p>
          The coach is updating their clubs and lessons. Please check back
          later.
        </p>
      </div>
    );

  const chosenDay = dayIndex === null ? null : sampleDay(week, dayIndex);
  const whenText =
    chosenDay && time
      ? `${formatDay(chosenDay, { weekday: "short", day: "numeric", month: "long" })}, ${time} ${zoneName(chosenDay)}`
      : "";
  /** The same day and time each week, for up to 4 weeks. The database checks every week. */
  const startHour = (() => {
    if (!time) return null;
    const [h, m] = time.split(":").map(Number);
    return h + m / 60;
  })();
  const repeatDates = chosenDay
    ? [0, 1, 2, 3].map((k) => new Date(chosenDay.getTime() + k * 7 * 86_400_000))
    : [];
  const weekIsFree = (k: number) => {
    if (!chosenDay || startHour === null) return false;
    const key = repeatDates[k].toISOString().slice(0, 10);
    const open = startTimes({
      date: key,
      rules: workspace.rules,
      exceptions: workspace.exceptions,
      bookings: workspace.bookings,
      lessons: workspace.lessons,
      lesson,
      clubId: venue.id,
    }).includes(startHour);
    const wanted = lesson.capacity > 1 ? spaces : 1;
    return (
      open &&
      lesson.capacity -
        spacesTaken(workspace.bookings, lesson.id, venue.id, key, startHour) >=
        wanted
    );
  };
  // The longest run of free weeks from the chosen day.
  let repeatMax = 1;
  for (let k = 1; k < 4 && weekIsFree(k); k++) repeatMax = k + 1;
  const weeks = Math.min(repeatWeeks, repeatMax);
  const shortDay = (d: Date) =>
    formatDay(d, { weekday: "short", day: "numeric", month: "short" });
  const repeatList = repeatDates.slice(0, weeks).map(shortDay).join(", ");
  const repeatText = weeks > 1 ? `, and every week for ${weeks} weeks (${repeatList})` : "";
  const summary = (
    <div className={styles.summary} aria-live="polite">
      <div className={styles.summaryWhat}>
        <b>{lesson.name}</b>
        <span>{lesson.duration} min</span>
        {weeks > 1 && <span>Weekly for {weeks} weeks</span>}
        {lesson.capacity > 1 && (
          <span>
            {spaces} {spaces === 1 ? "space" : "spaces"}
          </span>
        )}
        <span>{venue.name}</span>
        <span>{whenText || "Time not chosen yet"}</span>
      </div>
      <div className={styles.summaryPrice}>
        £{lesson.price * (lesson.capacity > 1 ? spaces : 1)}
        <small>
          {lesson.capacity > 1
            ? spaces > 1
              ? `guide, £${lesson.price} × ${spaces}`
              : "guide, per person"
            : "guide price"}
        </small>
      </div>
    </div>
  );

  if (submitted)
    return (
      <div className={styles.confirmation} role="status">
        <div className={styles.confirmationIcon}>
          <Check size={26} aria-hidden="true" />
        </div>
        {demo && <span className={styles.eyebrow}>Local demo complete</span>}
        <h2 ref={heading} tabIndex={-1}>
          Your request is ready.
        </h2>
        <p>
          Thanks, {player.name.split(" ")[0]}. Your request is{" "}
          <strong>pending coach approval</strong>.
        </p>
        {summary}
        {hasWhatsApp(profile.whatsapp) && (
          <p className={styles.whatsappHint}>
            Tap the WhatsApp button to open a chat with your request ready to
            send. It is sent when you press Send in WhatsApp.
          </p>
        )}
        <p className={styles.notice}>
          {demo
            ? `Nothing has been sent to ${shortName}. No lesson or court has been reserved, and no email will be sent. Your details stay in this page’s memory and disappear when you leave or refresh.`
            : `${shortName} will reply to confirm. A request does not reserve a court.`}
          {weeks > 1 &&
            !demo &&
            ` Each week is its own request, so ${shortName} can approve or decline weeks separately.`}
        </p>
        <div className={styles.confirmationActions}>
          {hasWhatsApp(profile.whatsapp) && (
            <WhatsAppButton
              variant="solid"
              label={`Send to ${shortName} on WhatsApp`}
              message={`Hi ${shortName}, I’d like to request ${lesson.capacity > 1 && spaces > 1 ? `${spaces} spaces in ` : ""}${lesson.name.toLowerCase()} at ${venue.name} on ${whenText}${repeatText}.${lesson.capacity > 1 && spaces > 1 && guests.slice(0, spaces - 1).some((g) => g.trim()) ? ` Playing: ${player.name.trim()}, ${guests.slice(0, spaces - 1).map((g) => g.trim()).filter(Boolean).join(", ")}.` : ""}${player.message.trim() ? ` ${player.message.trim()}` : ""} Please could you confirm availability? Thanks, ${player.name.trim()}.`}
            />
          )}
          <button
            type="button"
            className={`${styles.button} ${styles.ghost}`}
            onClick={() => {
              setSubmitted(false);
              setTime("");
              setDayIndex(null);
              setPlayer({
                ...emptyPlayer,
                contact: "",
              });
              setGuests([]);
              setSpaces(1);
              setRepeatWeeks(1);
              advance(0);
            }}
          >
            Make another request
          </button>
        </div>
      </div>
    );

  const timeOptions = dayIndex === null ? [] : timesFor(week, dayIndex);
  const weekStart = sampleDay(week, 0);
  const weekEnd = sampleDay(week, 6);

  return (
    <div className={styles.bookingFlow}>
      <span className={styles.eyebrow}>Request a session</span>
      <ol className={styles.steps} aria-label="Request progress">
        {stepLabels.map((label, i) => (
          <li
            key={label}
            className={
              step === i ? styles.stepCurrent : step > i ? styles.stepDone : ""
            }
            aria-current={step === i ? "step" : undefined}
          >
            {step > i ? <Check size={13} aria-hidden="true" /> : <i>{i + 1}</i>}
            {label}
          </li>
        ))}
      </ol>
      <h2 className={styles.bookingTitle} tabIndex={-1} ref={heading}>
        {stepHeadings[step]}
      </h2>
      {summary}
      <div className={styles.stepPanel} key={step}>
        {step === 0 ? (
          <>
            <fieldset className={styles.choiceField}>
              <legend>Lesson type</legend>
              <div role="radiogroup" aria-label="Lesson type">
                {lessons.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    role="radio"
                    aria-checked={lesson.id === l.id}
                    className={styles.option}
                    onClick={() => {
                      setLessonId(l.id);
                      setDayIndex(null);
                      setTime("");
                      setSpaces(1);
                    }}
                  >
                    <span className={styles.optionDot} aria-hidden="true" />
                    <span>
                      <strong>{l.name}</strong>
                      <small>
                        {l.duration} minutes
                        {l.capacity > 1 && ` · up to ${l.capacity} players`}
                        {l.description && ` · ${l.description}`}
                      </small>
                    </span>
                    <b>
                      £{l.price}
                      {l.capacity > 1 && <small> per person</small>}
                    </b>
                  </button>
                ))}
              </div>
            </fieldset>
            <label className={styles.formLabel}>
              Preferred club
              <select
                value={venue.id}
                onChange={(e) => {
                  setVenueId(e.target.value);
                  setDayIndex(null);
                  setTime("");
                }}
              >
                {clubs.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>
            {demo && (
              <p className={styles.formNote}>
                Sample sessions and prices for this preview. No payment is
                taken.
              </p>
            )}
            <div className={styles.formButtons}>
              <button
                type="button"
                className={styles.button}
                onClick={() => advance(1)}
              >
                Choose a time <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </>
        ) : step === 1 ? (
          <>
            <div className={styles.weekBar}>
              <span>
                {formatDay(weekStart, { day: "numeric", month: "short" })} –{" "}
                {formatDay(weekEnd, { day: "numeric", month: "short" })}
              </span>
              <div>
                <button
                  type="button"
                  aria-label="Previous week"
                  disabled={week === 0}
                  onClick={() => {
                    setWeek(week - 1);
                    setDayIndex(null);
                    setTime("");
                  }}
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Next week"
                  disabled={week >= sampleWeeks - 1}
                  onClick={() => {
                    setWeek(week + 1);
                    setDayIndex(null);
                    setTime("");
                  }}
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
            <fieldset className={styles.choiceField}>
              <legend className={styles.srOnly}>Preferred day</legend>
              <div className={styles.dayChoices}>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                  const d = sampleDay(week, i);
                  const free = timesFor(week, i).length > 0;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={!free}
                      aria-pressed={dayIndex === i}
                      aria-label={`${formatDay(d, { weekday: "long", day: "numeric", month: "long" })}${free ? "" : ", no times"}`}
                      className={dayIndex === i ? styles.daySelected : ""}
                      onClick={() => {
                        setDayIndex(i);
                        setTime("");
                      }}
                    >
                      <small>{formatDay(d, { weekday: "short" })}</small>
                      <strong>{formatDay(d, { day: "numeric" })}</strong>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <fieldset className={styles.choiceField}>
              <legend>
                {dayIndex === null
                  ? "Pick a day to see times"
                  : "Preferred start time"}
              </legend>
              <div className={styles.timeChoices}>
                {timeOptions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={time === t ? styles.timeSelected : ""}
                    aria-pressed={time === t}
                    onClick={() => {
                      setTime(t);
                      setSpaces((s) =>
                        Math.max(
                          1,
                          Math.min(s, spacesLeft(week, dayIndex ?? 0, t)),
                        ),
                      );
                    }}
                  >
                    {t}
                    {lesson.capacity > 1 && dayIndex !== null && (
                      <small>{spacesLeft(week, dayIndex, t)} left</small>
                    )}
                  </button>
                ))}
              </div>
            </fieldset>
            {lesson.capacity > 1 && time && dayIndex !== null && (
              <label className={styles.formLabel}>
                How many spaces?
                <select
                  value={spaces}
                  onChange={(e) => setSpaces(Number(e.target.value))}
                >
                  {Array.from(
                    { length: Math.max(1, spacesLeft(week, dayIndex, time)) },
                    (_, i) => i + 1,
                  ).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "space" : "spaces"}
                      {n > 1 && ` · about £${lesson.price * n}`}
                    </option>
                  ))}
                </select>
                <small>
                  Booking for friends too? You can add their names on the next
                  step.
                </small>
              </label>
            )}
            {time && chosenDay && (
              <label className={styles.formLabel}>
                Repeat weekly?
                <select
                  value={weeks}
                  onChange={(e) => setRepeatWeeks(Number(e.target.value))}
                >
                  <option value={1}>Just this once</option>
                  {[2, 3, 4].map((n) => (
                    <option key={n} value={n} disabled={n > repeatMax}>
                      Every week for {n} weeks
                    </option>
                  ))}
                </select>
                <small>
                  {weeks > 1
                    ? `Same day and time: ${repeatList}. Each week is its own request.`
                    : "Book the same day and time each week, up to 4 weeks."}
                  {repeatMax < 4 &&
                    ` ${shortDay(repeatDates[repeatMax])} isn’t free at this time, so longer repeats aren’t offered.`}
                </small>
              </label>
            )}
            <p className={styles.formNote}>
              Times are in {zoneName(weekStart)}. Greyed days have no
              availability.
              {demo &&
                " Illustrative times, not live availability. Choosing a time does not hold a slot or reserve a court."}
            </p>
            <div className={styles.formButtons}>
              <button
                type="button"
                className={`${styles.button} ${styles.ghost}`}
                onClick={() => advance(0)}
              >
                Back
              </button>
              <button
                type="button"
                className={styles.button}
                disabled={!time}
                onClick={() => advance(2)}
              >
                Add your details <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSendError("");
              if (live && slug && chosenDay) {
                setSending(true);
                const [h, m] = time.split(":").map(Number);
                const names = guests
                  .slice(0, spaces - 1)
                  .map((g) => g.trim())
                  .filter(Boolean);
                const notes = [
                  weeks > 1 && `Weekly for ${weeks} weeks: ${repeatList}.`,
                  spaces > 1 &&
                    `Booking ${spaces} spaces${names.length ? `: ${player.name.trim()}, ${names.join(", ")}` : ""}.`,
                  player.level && `Level: ${player.level}.`,
                  `Prefers ${contact === "whatsapp" ? "WhatsApp" : "email"}.`,
                  player.message.trim(),
                ]
                  .filter(Boolean)
                  .join(" ");
                const form = new FormData(e.currentTarget);
                let failure = "";
                try {
                  const res = await fetch("/api/book", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                      slug,
                      club: venue.id,
                      lesson: lesson.id,
                      date: chosenDay.toISOString().slice(0, 10),
                      hour: h + m / 60,
                      spaces: lesson.capacity > 1 ? spaces : 1,
                      weeks,
                      name: player.name.trim(),
                      email: player.email.trim(),
                      phone: player.phone.trim(),
                      message: notes.slice(0, 1000),
                      website: form.get("website"),
                      token: form.get("cf-turnstile-response"),
                      elapsed: Date.now() - formShown.current,
                    }),
                  });
                  if (!res.ok)
                    failure =
                      (await res.json().catch(() => null))?.error ??
                      "Your request couldn’t be sent. Please try again.";
                } catch {
                  failure = "Your request couldn’t be sent. Please try again.";
                }
                setSending(false);
                if (failure) return setSendError(failure);
              }
              setSubmitted(true);
              requestAnimationFrame(() => heading.current?.focus());
            }}
          >
            <div aria-hidden="true" className={styles.hp}>
              <label>
                Website
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            {!demo && turnstileKey && (
              <>
                <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
                <div className="cf-turnstile" data-sitekey={turnstileKey} />
              </>
            )}
            <p className={styles.formLead}>
              {demo
                ? "Try the flow with fictional details. Nothing is sent."
                : `Tell ${shortName} a little about you.`}
            </p>
            <div className={styles.formTwo}>
              <label className={styles.formLabel}>
                Your name
                <input
                  required
                  autoComplete="name"
                  pattern=".*\S.*"
                  maxLength={100}
                  value={player.name}
                  onChange={(e) =>
                    setPlayer({ ...player, name: e.target.value })
                  }
                />
              </label>
              <label className={styles.formLabel}>
                Email address
                <input
                  required
                  type="email"
                  autoComplete="email"
                  maxLength={200}
                  value={player.email}
                  onChange={(e) =>
                    setPlayer({ ...player, email: e.target.value })
                  }
                />
              </label>
            </div>
            {hasWhatsApp(profile.whatsapp) && (
              <fieldset className={styles.contactPreference}>
                <legend>How would you prefer to hear from your coach?</legend>
                {(["email", "whatsapp"] as const).map((method) => (
                  <label key={method}>
                    <input
                      type="radio"
                      name="contact"
                      value={method}
                      checked={contact === method}
                      onChange={() => setPlayer({ ...player, contact: method })}
                    />{" "}
                    {method === "email" ? "Email" : "WhatsApp"}
                  </label>
                ))}
              </fieldset>
            )}
            <div className={styles.formTwo}>
              <label className={styles.formLabel}>
                {contact === "whatsapp"
                  ? "WhatsApp number"
                  : "Phone (optional)"}
                <input
                  type="tel"
                  required={contact === "whatsapp"}
                  pattern={
                    contact === "whatsapp"
                      ? "\\+?[0-9](?:[0-9]|\\s|\\(|\\)|\\.|-){5,38}[0-9]"
                      : undefined
                  }
                  autoComplete="tel"
                  maxLength={40}
                  value={player.phone}
                  onChange={(e) =>
                    setPlayer({ ...player, phone: e.target.value })
                  }
                />
              </label>
              <label className={styles.formLabel}>
                Playing level (optional)
                <select
                  value={player.level}
                  onChange={(e) =>
                    setPlayer({ ...player, level: e.target.value })
                  }
                >
                  <option value="">Choose your level</option>
                  <option>New to the sport</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </label>
            </div>
            {contact === "whatsapp" && (
              <p className={styles.formNote}>
                Include your country code.
                {demo
                  ? " Choosing WhatsApp records your preference. This demo sends nothing."
                  : " Your coach will reply on WhatsApp."}
              </p>
            )}
            {lesson.capacity > 1 && spaces > 1 && (
              <fieldset className={styles.guestNames}>
                <legend>
                  Who else is playing? ({spaces} spaces, you and{" "}
                  {spaces - 1} {spaces === 2 ? "other" : "others"})
                </legend>
                {Array.from({ length: spaces - 1 }, (_, i) => (
                  <label className={styles.formLabel} key={i}>
                    Player {i + 2} name
                    <input
                      autoComplete="off"
                      maxLength={60}
                      value={guests[i] ?? ""}
                      onChange={(e) => {
                        const next = [...guests];
                        while (next.length < spaces - 1) next.push("");
                        next[i] = e.target.value;
                        setGuests(next);
                      }}
                    />
                  </label>
                ))}
                <small>
                  Optional, but it helps {shortName} organise the session. You
                  can add or change names later by messaging them.
                </small>
              </fieldset>
            )}
            <label className={styles.formLabel}>
              What would you like to work on? (optional)
              <textarea
                rows={4}
                maxLength={1000}
                value={player.message}
                onChange={(e) =>
                  setPlayer({ ...player, message: e.target.value })
                }
              />
            </label>
            {demo && (
              <label className={styles.acknowledgement}>
                <input type="checkbox" required />{" "}
                <span>
                  I understand this is a demo request. No lesson, court or email
                  will be booked or sent.
                </span>
              </label>
            )}
            {sendError && (
              <p className={styles.formNote} role="alert">
                {sendError}
              </p>
            )}
            <div className={styles.formButtons}>
              <button
                type="button"
                className={`${styles.button} ${styles.ghost}`}
                onClick={() => advance(1)}
              >
                Back
              </button>
              <button type="submit" className={styles.button} disabled={sending}>
                {sending
                  ? "Sending…"
                  : demo
                    ? "Create demo request"
                    : "Send request"}{" "}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </form>
        )}
      </div>
      <p className={styles.approvalNote}>
        Your request needs coach approval. Court availability is arranged
        separately.
      </p>
    </div>
  );
}
