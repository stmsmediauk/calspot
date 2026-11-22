import Image from "next/image";
import Link from "next/link";
import {
  CalendarCheck,
  Check,
  MapPin,
  MessageCircle,
  Palette,
} from "lucide-react";
import { coachPalettes } from "@/lib/coach-theme";
import { Logo } from "../logo";
import styles from "./landing.module.css";

const features = [
  {
    icon: Palette,
    title: "A page that looks like you",
    text: "Your photo, your story and your style on a clean page of your own. Pick a look, then fine-tune the colours, fonts and layout.",
  },
  {
    icon: CalendarCheck,
    title: "Requests, in your control",
    text: "Players choose from the times you have open and send a request. You approve it, decline it or suggest another time.",
  },
  {
    icon: MessageCircle,
    title: "Works with WhatsApp",
    text: "Reply to players in the app you already use, with messages ready to send in one tap.",
  },
  {
    icon: MapPin,
    title: "Your clubs and lessons",
    text: "Set your lessons, prices, clubs and weekly availability once. Block out holidays whenever you need.",
  },
];

const steps = [
  { title: "Build your page", text: "Create your account and set up your page in a few minutes." },
  { title: "Share your link", text: "Send it to players, or add it to your Instagram bio." },
  { title: "Approve and coach", text: "Requests land in your dashboard. You stay in charge." },
];

const included = [
  "Your own coaching page",
  "Booking requests with approve, decline and suggest-a-time",
  "Clubs, lessons and weekly availability",
  "WhatsApp click-to-chat messages",
  "Customisable look and layout",
];

/** Five example looks, drawn from the real palettes coaches can choose. */
const looks = [
  { key: "studio", name: "Studio", font: "var(--font-geist-sans), sans-serif", weight: 700 },
  { key: "sand", name: "Journal", font: "'Instrument Serif', serif", weight: 400 },
  { key: "clay", name: "Clay", font: "var(--font-geist-sans), sans-serif", weight: 700 },
  { key: "court", name: "Court", font: "'Barlow Condensed', sans-serif", weight: 700 },
  { key: "midnight", name: "Midnight", font: "'Barlow Condensed', sans-serif", weight: 700 },
] as const;

/** Public landing page: what Calspot is, what it costs, and where to start. */
export function Landing() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" aria-label="Calspot home">
            <Logo />
          </Link>
          <nav aria-label="Account">
            <Link href="/login" className={styles.login}>
              Log in
            </Link>
            <Link href="/signup" className={styles.button}>
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>For independent coaches</p>
            <h1>
              Your coaching.
              <br />
              <span>All in one spot.</span>
            </h1>
            <p className={styles.lead}>
              A personal booking page that looks like you. Players request a
              time, you approve it, and the conversation carries on in
              WhatsApp.
            </p>
            <div className={styles.actions}>
              <Link href="/signup" className={styles.button}>
                Get started
              </Link>
              <span className={styles.price}>
                <strong>£29.99</strong> a month
              </span>
            </div>
          </div>

          <div className={styles.stage} aria-hidden="true">
            <div className={styles.browser}>
              <div className={styles.chrome}>
                <i />
                <i />
                <i />
                <span>calspot.com/your-name</span>
              </div>
              <div className={styles.shot}>
                <Image
                  src="/coach/court-editorial.webp"
                  alt=""
                  fill
                  sizes="(max-width: 900px) 90vw, 560px"
                  priority
                />
                <div className={styles.shotName}>
                  <small>Padel coach</small>
                  <b>SAM TAYLOR</b>
                  <span>Request a session</span>
                </div>
              </div>
              <div className={styles.chips}>
                <span>Private lesson · 60 min</span>
                <span>Duo session</span>
                <span>Group coaching</span>
              </div>
            </div>
            <div className={styles.request}>
              <small>New request</small>
              <b>Emma W. · Private lesson</b>
              <span>Tue 10:00 · Riverside Club</span>
              <div>
                <em>Approve</em>
                <u>Decline</u>
              </div>
            </div>
            <div className={styles.bubble}>
              Hi Emma, you’re booked in for Tuesday at 10:00. See you on court!
            </div>
          </div>
        </section>

        <section className={styles.looks} aria-labelledby="looks">
          <h2 id="looks">Make it look like you</h2>
          <p>Start from a look, then change anything. No two pages need to match.</p>
          <ul aria-label="Example looks">
            {looks.map((l) => {
              const c = coachPalettes[l.key];
              return (
                <li
                  key={l.key}
                  style={{ background: c.background, color: c.ink, borderColor: c.line }}
                >
                  <b style={{ fontFamily: l.font, fontWeight: l.weight }}>
                    Your Name
                  </b>
                  <span style={{ color: c.muted }}>{l.name}</span>
                  <i style={{ background: c.accent, color: c.onAccent }}>
                    Request
                  </i>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={styles.features} aria-labelledby="what">
          <h2 id="what">Everything you need to take bookings</h2>
          <ul>
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className={styles.icon}>
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.steps} aria-labelledby="how">
          <h2 id="how">How it works</h2>
          <ol>
            {steps.map((s, i) => (
              <li key={s.title}>
                <span aria-hidden="true">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.pricing} aria-labelledby="price">
          <div className={styles.pricingInner}>
            <div>
              <h2 id="price">Simple pricing</h2>
              <p>One plan, everything included.</p>
            </div>
            <div className={styles.card}>
              <p className={styles.amount}>
                £29.99<span> a month</span>
              </p>
              <ul>
                {included.map((item) => (
                  <li key={item}>
                    <Check size={18} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={styles.button}>
                Get started
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>© Calspot</span>
        <Link href="/login">Log in</Link>
      </footer>
    </div>
  );
}
