import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "../logo";
import styles from "./landing.module.css";

const features = [
  {
    title: "A page that looks like you",
    text: "Your photo, your story and your style, on a clean page of your own. Pick a look, then fine-tune the colours, fonts and layout.",
  },
  {
    title: "Booking requests, in your control",
    text: "Players choose from the times you have open and send a request. You approve it, decline it or suggest another time.",
  },
  {
    title: "Works with WhatsApp",
    text: "Reply to players in the app you already use, with messages ready to send in one tap.",
  },
  {
    title: "Your clubs and lessons",
    text: "Set your lessons, prices, clubs and weekly availability once. Block out holidays whenever you need.",
  },
];

const steps = [
  "Create your account and build your page in a few minutes.",
  "Share your link with players.",
  "Approve requests and keep coaching.",
];

const included = [
  "Your own coaching page",
  "Booking requests with approve, decline and suggest-a-time",
  "Clubs, lessons and weekly availability",
  "WhatsApp click-to-chat messages",
  "Customisable look and layout",
];

/** Simple public landing page: what Calspot is, what it costs, and where to start. */
export function Landing() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
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
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>For coaches</p>
          <h1>Your coaching. All in one spot.</h1>
          <p className={styles.lead}>
            A personal booking page for independent coaches. Players request a
            time, you approve it, and the conversation carries on in WhatsApp.
          </p>
          <div className={styles.actions}>
            <Link href="/signup" className={styles.button}>
              Get started
            </Link>
            <span className={styles.price}>£29.99 a month</span>
          </div>
        </section>

        <section className={styles.features} aria-labelledby="what">
          <h2 id="what">Everything you need to take bookings</h2>
          <ul>
            {features.map((f) => (
              <li key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.steps} aria-labelledby="how">
          <h2 id="how">How it works</h2>
          <ol>
            {steps.map((s, i) => (
              <li key={s}>
                <span aria-hidden="true">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.pricing} aria-labelledby="price">
          <h2 id="price">Simple pricing</h2>
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
        </section>
      </main>

      <footer className={styles.footer}>
        <span>© Calspot</span>
        <Link href="/login">Log in</Link>
      </footer>
    </div>
  );
}
