"use client";
import { useRef, useState } from "react";
import { Check, Clock3, MapPin, CalendarDays } from "lucide-react";
import { publicCoach } from "./content";
import { WhatsAppButton } from "./whatsapp-button";
import styles from "./site.module.css";
const days = [
  { date: "2026-11-23", day: "Mon", number: 23 },
  { date: "2026-11-24", day: "Tue", number: 24 },
  { date: "2026-11-25", day: "Wed", number: 25 },
  { date: "2026-11-26", day: "Thu", number: 26 },
  { date: "2026-11-27", day: "Fri", number: 27 },
  { date: "2026-11-28", day: "Sat", number: 28 },
];
const times = ["09:00", "11:00", "14:00"];
export function BookingForm({
  initialLesson = "private",
  embedded = false,
}: {
  initialLesson?: string;
  embedded?: boolean;
}) {
  const [step, setStep] = useState(0),
    [lessonId, setLessonId] = useState(initialLesson),
    [venueId, setVenueId] = useState("yard"),
    [date, setDate] = useState(days[0].date),
    [time, setTime] = useState(""),
    [submitted, setSubmitted] = useState(false),
    [player, setPlayer] = useState({
      name: "",
      email: "",
      phone: "",
      contact: "email",
      level: "",
      message: "",
    });
  const heading = useRef<HTMLHeadingElement>(null);
  const lesson = publicCoach.lessons.find((l) => l.id === lessonId)!;
  const venue = publicCoach.venues.find((v) => v.id === venueId)!;
  const day = days.find((d) => d.date === date)!;
  const advance = (next: number) => {
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus());
  };
  const ConfirmationHeading = embedded ? "h2" : "h1";
  const summary = (
    <>
      <h3>Your session</h3>
      <div className={styles.summaryCoach}>
        With Kelly-Jane Whalley
        <span>Demo request · Coach approval required</span>
      </div>
      <dl>
        <dt>Coaching</dt>
        <dd>{lesson.name}</dd>
        <dt>
          <Clock3 size={15} /> Duration
        </dt>
        <dd>{lesson.duration} minutes</dd>
        <dt>
          <MapPin size={15} /> Club
        </dt>
        <dd>
          {venue.name}
          <small>Sample venue</small>
        </dd>
        {time && (
          <>
            <dt>
              <CalendarDays size={15} /> When
            </dt>
            <dd>
              {day.day} {day.number} November 2026
              <br />
              {time} · Europe/London (GMT)
            </dd>
          </>
        )}
        {step === 2 || submitted ? (
          <>
            <dt>Preferred contact</dt>
            <dd>{player.contact === "whatsapp" ? "WhatsApp" : "Email"}</dd>
          </>
        ) : null}
        <dt>Indicative price</dt>
        <dd>
          £{lesson.price}
          <small>Sample session price · No payment taken</small>
        </dd>
      </dl>
      <p>
        Requests are not confirmed until approved. A request does not reserve a
        court.
      </p>
    </>
  );
  if (submitted)
    return (
      <section
        className={`${styles.confirmation} ${embedded ? styles.embeddedConfirmation : ""}`}
        aria-label="Demo request confirmation"
      >
        <div className={styles.confirmationIcon}>
          <Check size={30} />
        </div>
        <span className={styles.eyebrow}>LOCAL DEMO COMPLETE</span>
        <ConfirmationHeading ref={heading} tabIndex={-1}>
          Your request is ready.
        </ConfirmationHeading>
        <p>
          Thanks, {player.name.split(" ")[0]}. Your demo request is{" "}
          <strong>pending coach approval</strong>.
        </p>
        <div className={styles.confirmationNotice}>
          Nothing has been sent to Kelly-Jane. No lesson or court has been
          reserved, and no email will be sent. Your details stay in this page’s
          memory and disappear when you leave or refresh.
        </div>
        <aside className={styles.bookingSummary}>{summary}</aside>
        <div className={styles.confirmationActions}>
          <WhatsAppButton
            label="Preview WhatsApp follow-up"
            message={`Hi Kelly-Jane, I’d like to request ${lesson.name.toLowerCase()} at ${venue.name} on ${day.day} ${day.number} November 2026 at ${time}. Please could you confirm availability? Thanks, ${player.name.trim()}.`}
          />
          <button
            className={styles.secondary}
            onClick={() => {
              setSubmitted(false);
              setTime("");
              setPlayer({
                name: "",
                email: "",
                phone: "",
                contact: "email",
                level: "",
                message: "",
              });
              advance(0);
            }}
          >
            Try another request
          </button>
        </div>
      </section>
    );
  return (
    <section
      className={`${styles.bookingPage} ${embedded ? styles.embeddedBooking : ""}`}
      aria-label="Request a session"
    >
      {!embedded && (
        <div className={styles.bookingHeading}>
          <span className={styles.eyebrow}>A LITTLE TIME FOR YOUR GAME</span>
          <h1>Find your session.</h1>
          <p>
            A few details. A preferred time. Kelly-Jane takes it from there.
          </p>
        </div>
      )}
      <div className={styles.bookingSteps} aria-label="Request progress">
        {["Your session", "Your time", "Your details"].map((label, i) => (
          <span
            key={label}
            className={
              step === i
                ? styles.currentStep
                : step > i
                  ? styles.completedStep
                  : ""
            }
            aria-current={step === i ? "step" : undefined}
          >
            <i>{step > i ? <Check size={14} /> : i + 1}</i>
            {label}
          </span>
        ))}
      </div>
      <div className={styles.bookingLayout}>
        <div className={styles.bookingPanel}>
          <h2 tabIndex={-1} ref={heading}>
            {["Request a session", "Choose a time", "Your details"][step]}
          </h2>
          {step === 0 ? (
            <>
              <p className={styles.formLead}>
                Choose a lesson and your preferred club.
              </p>
              <fieldset className={styles.choiceField}>
                <legend>Lesson type</legend>
                {publicCoach.lessons.map((l) => (
                  <label
                    key={l.id}
                    className={`${styles.radioCard} ${lessonId === l.id ? styles.radioSelected : ""}`}
                  >
                    <input
                      type="radio"
                      name="lesson"
                      value={l.id}
                      checked={lessonId === l.id}
                      onChange={() => setLessonId(l.id)}
                    />
                    <span>
                      <strong>{l.name}</strong>
                      <small>
                        {l.duration} minutes · {l.tag}
                      </small>
                    </span>
                    <b>£{l.price}</b>
                  </label>
                ))}
              </fieldset>
              <label className={styles.formLabel}>
                Preferred club
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                >
                  {publicCoach.venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} (sample)
                    </option>
                  ))}
                </select>
              </label>
              <p className={styles.formNote}>
                Sample sessions and prices for this preview. No payment is
                taken.
              </p>
              <div className={styles.formButtons}>
                <button className={styles.primary} onClick={() => advance(1)}>
                  Choose a time
                </button>
              </div>
            </>
          ) : step === 1 ? (
            <>
              <p className={styles.formLead}>
                Sample week · 23–28 November 2026 · Europe/London
              </p>
              <fieldset className={styles.choiceField}>
                <legend>Preferred day</legend>
                <div className={styles.dayChoices}>
                  {days.map((d) => (
                    <button
                      key={d.date}
                      aria-pressed={date === d.date}
                      className={date === d.date ? styles.daySelected : ""}
                      onClick={() => {
                        setDate(d.date);
                        setTime("");
                      }}
                    >
                      <span>{d.day}</span>
                      <strong>{d.number}</strong>
                      <small>Nov</small>
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className={styles.choiceField}>
                <legend>Preferred start time</legend>
                <div className={styles.timeChoices}>
                  {times.map((t) => (
                    <button
                      key={t}
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
                Illustrative times, not live availability. Choosing a time does
                not hold a slot or reserve a court.
              </p>
              <div className={styles.formButtons}>
                <button className={styles.secondary} onClick={() => advance(0)}>
                  Back
                </button>
                <button
                  className={styles.primary}
                  disabled={!time}
                  onClick={() => advance(2)}
                >
                  Add your details
                </button>
              </div>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
                if (!embedded) window.scrollTo({ top: 0, behavior: "instant" });
                requestAnimationFrame(() => heading.current?.focus());
              }}
            >
              <p className={styles.formLead}>
                Try the flow with fictional details. Nothing is sent.
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
              <fieldset className={styles.contactPreference}>
                <legend>How would you prefer to hear from your coach?</legend>
                <label>
                  <input
                    type="radio"
                    name="contact"
                    value="email"
                    checked={player.contact === "email"}
                    onChange={() => setPlayer({ ...player, contact: "email" })}
                  />{" "}
                  Email
                </label>
                <label>
                  <input
                    type="radio"
                    name="contact"
                    value="whatsapp"
                    checked={player.contact === "whatsapp"}
                    onChange={() =>
                      setPlayer({ ...player, contact: "whatsapp" })
                    }
                  />{" "}
                  WhatsApp
                </label>
              </fieldset>
              <div className={styles.formTwo}>
                <label className={styles.formLabel}>
                  {player.contact === "whatsapp"
                    ? "WhatsApp number"
                    : "Phone (optional)"}
                  <input
                    type="tel"
                    required={player.contact === "whatsapp"}
                    pattern={
                      player.contact === "whatsapp"
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
                  Playing level <span>(optional)</span>
                  <select
                    value={player.level}
                    onChange={(e) =>
                      setPlayer({ ...player, level: e.target.value })
                    }
                  >
                    <option value="">Choose your level</option>
                    <option>New to padel</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </label>
              </div>
              {player.contact === "whatsapp" && (
                <p className={styles.formNote}>
                  Include your country code. Choosing WhatsApp records your
                  preference for messages about this request; this demo sends
                  nothing.
                </p>
              )}
              <label className={styles.formLabel}>
                What would you like to work on? <span>(optional)</span>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={player.message}
                  onChange={(e) =>
                    setPlayer({ ...player, message: e.target.value })
                  }
                />
              </label>
              <label className={styles.acknowledgement}>
                <input type="checkbox" required />{" "}
                <span>
                  I understand this is a demo request. No lesson, court or email
                  will be booked or sent.
                </span>
              </label>
              <div className={styles.formButtons}>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => advance(1)}
                >
                  Back
                </button>
                <button type="submit" className={styles.primary}>
                  Create demo request
                </button>
              </div>
            </form>
          )}
        </div>
        {step === 2 && (
          <aside className={styles.bookingSummary}>{summary}</aside>
        )}
      </div>
      <p className={styles.approvalNote}>
        Your request needs coach approval. Court availability is arranged
        separately.
      </p>
    </section>
  );
}
