"use client";
import { useRef, useState } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { hasWhatsApp, useCoachWorkspace } from "@/lib/coach-workspace";
import { startTimes } from "@/lib/availability";
import {
  formatDay,
  formatHour,
  publicCoach,
  sampleDay,
  sampleWeeks,
  zoneName,
} from "./content";
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
  const [step, setStep] = useState(0),
    [lessonId, setLessonId] = useState(initialLesson),
    [venueId, setVenueId] = useState(""),
    [week, setWeek] = useState(0),
    [dayIndex, setDayIndex] = useState<number | null>(null),
    [time, setTime] = useState(""),
    [submitted, setSubmitted] = useState(false),
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
  const demo = publicCoach.demoMode;
  /** Start times from the coach's own availability, bookings and exceptions. */
  const timesFor = (weekIndex: number, index: number) => {
    if (!lesson || !venue) return [];
    const d = sampleDay(weekIndex, index);
    const key = d.toISOString().slice(0, 10);
    return startTimes({
      date: key,
      rules: workspace.rules,
      exceptions: workspace.exceptions,
      bookings: workspace.bookings,
      lessons: workspace.lessons,
      lesson,
      clubId: venue.id,
    }).map(formatHour);
  };

  const advance = (next: number) => {
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
  const summary = (
    <div className={styles.summary} aria-live="polite">
      <div className={styles.summaryWhat}>
        <b>{lesson.name}</b>
        <span>{lesson.duration} min</span>
        <span>{venue.name}</span>
        <span>{whenText || "Time not chosen yet"}</span>
      </div>
      <div className={styles.summaryPrice}>
        £{lesson.price}
        <small>guide price</small>
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
        </p>
        <div className={styles.confirmationActions}>
          {hasWhatsApp(profile.whatsapp) && (
            <WhatsAppButton
              variant="solid"
              label={`Send to ${shortName} on WhatsApp`}
              message={`Hi ${shortName}, I’d like to request ${lesson.name.toLowerCase()} at ${venue.name} on ${whenText}.${player.message.trim() ? ` ${player.message.trim()}` : ""} Please could you confirm availability? Thanks, ${player.name.trim()}.`}
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
                    }}
                  >
                    <span className={styles.optionDot} aria-hidden="true" />
                    <span>
                      <strong>{l.name}</strong>
                      <small>
                        {l.duration} minutes
                        {l.description && ` · ${l.description}`}
                      </small>
                    </span>
                    <b>£{l.price}</b>
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
                    onClick={() => setTime(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>
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
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
              requestAnimationFrame(() => heading.current?.focus());
            }}
          >
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
            <div className={styles.formButtons}>
              <button
                type="button"
                className={`${styles.button} ${styles.ghost}`}
                onClick={() => advance(1)}
              >
                Back
              </button>
              <button type="submit" className={styles.button}>
                {demo ? "Create demo request" : "Send request"}{" "}
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
