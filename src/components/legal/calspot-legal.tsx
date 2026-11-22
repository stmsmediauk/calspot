import Link from "next/link";
import { Logo } from "../logo";
import styles from "./legal.module.css";

type Section = { heading: string; body: string[] };

const operator = "[Calspot Trading as STMS Media Ltd, company number 14512345]";
const contact = "contact@calspot.co.uk";
const address = "[registered address]";

export const privacy: Section[] = [
  {
    heading: "Who we are",
    body: [
      `Calspot is a service run by ${operator}, ${address} ("Calspot", "we"). It gives coaches a booking page where players can request lessons. You can contact us at ${contact}.`,
    ],
  },
  {
    heading: "Two kinds of people, two roles",
    body: [
      "Coaches: when you create an account, Calspot is the controller of your account information.",
      "Players: when a player sends a lesson request through a coach’s page, the coach decides why and how that information is used. Calspot stores and delivers it on the coach’s behalf, acting as the coach’s processor. A player who wants to see, correct or delete their request should contact the coach first; we will help the coach to do this.",
    ],
  },
  {
    heading: "What we collect",
    body: [
      "From coaches: your email address, your password (stored only as a secure hash by our authentication provider), the details you add to your page (name, photograph, introduction, clubs, lessons, prices, availability, WhatsApp number and Instagram name), and the requests you receive.",
      "From players: the name, email address, phone number and message you type into a booking request, along with the lesson, club, date and time you ask for.",
      "Technical data: standard server logs such as IP address and browser type, used to keep the service secure and to limit abuse. Our booking form also uses your IP address briefly to limit repeated submissions.",
    ],
  },
  {
    heading: "Why we use it, and our lawful basis",
    body: [
      "To run your account and your booking page, and to deliver player requests to the coach: performance of our contract with the coach.",
      "To keep the service secure, prevent spam and fix problems: our legitimate interests.",
      "To meet legal obligations, such as tax records once billing starts.",
      "We do not sell personal data and we do not use it for advertising.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "We use only the cookies and browser storage that are strictly necessary to keep a coach signed in. We do not use advertising or analytics cookies, so there is no cookie banner. If we add analytics later we will update this notice and ask first where the law requires it.",
    ],
  },
  {
    heading: "Who we share data with",
    body: [
      "We use a small number of service providers to run Calspot: Supabase (database, sign-in and file storage) and Vercel (hosting). They process data only on our instructions. [Confirm the data regions and transfer safeguards used for each provider.]",
      "When billing starts we will add our payment provider to this list. We do not share a coach’s players’ details with other coaches or with Calspot staff except where needed to provide support, fix a fault or meet the law.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "Coach accounts and pages are kept while the account is open. If a coach is deleted, their page, lessons, availability, requests and login are removed. [State any backup retention period.]",
      "Player requests are kept for as long as the coach keeps them in their dashboard, and are removed when the coach deletes them or their account.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "You can ask to see, correct, delete or move your personal data, and to object to or restrict how it is used. Email us at " +
        contact +
        ". We will reply within one month.",
      "If you are unhappy with how we handle your data you can complain to the Information Commissioner’s Office at ico.org.uk.",
    ],
  },
  {
    heading: "Changes",
    body: [
      "We will update this notice if what we do changes, and show the date below. [Date last updated.]",
    ],
  },
];

export const terms: Section[] = [
  {
    heading: "About these terms",
    body: [
      `These terms are between you and ${operator} ("Calspot"). By creating an account or using Calspot you agree to them. If you do not agree, please do not use the service.`,
    ],
  },
  {
    heading: "The service",
    body: [
      "Calspot gives coaches a personal booking page. Players use it to request a lesson time. The coach decides whether to accept, suggest another time or decline, and the conversation then usually continues by email or WhatsApp. A request is not a confirmed booking until the coach confirms it.",
      "Calspot does not take payment for lessons, does not employ or vouch for coaches, and is not a party to any lesson. Lessons are agreed directly between coach and player.",
    ],
  },
  {
    heading: "Coach accounts",
    body: [
      "You must be 18 or over and give accurate information. You are responsible for your account, your password and everything on your page.",
      "You are responsible for your coaching: qualifications, insurance, safeguarding, safety, prices and the way you handle players’ personal data. You must use players’ details only to respond to their requests.",
      "You must keep your page honest and lawful. No misleading claims, no content you do not have the right to use, and nothing offensive or illegal.",
    ],
  },
  {
    heading: "Price and billing",
    body: [
      "Calspot costs £29 a month, including VAT where it applies. [Confirm VAT position.] New coaches get a 14-day free trial with no card needed. We will tell you before any charge starts and before any price change, and you can cancel before the change takes effect.",
      "You can cancel at any time. [Describe how, and what happens to your page and data after cancellation.]",
    ],
  },
  {
    heading: "Acceptable use",
    body: [
      "You must not misuse Calspot: no spam or automated submissions, no attempts to break or probe the service, no scraping players’ data and no use that harms other people.",
      "We may suspend or remove a page or account that breaks these terms, puts others at risk or harms the service. We will tell you why where we can.",
    ],
  },
  {
    heading: "Your content",
    body: [
      "You keep ownership of what you put on your page. You give us permission to store it and show it on your page and in share previews so that the service works.",
    ],
  },
  {
    heading: "Availability and changes",
    body: [
      "We work to keep Calspot running, but it is provided as is and may sometimes be unavailable. We may improve or change features. During early access the service may change often.",
    ],
  },
  {
    heading: "Liability",
    body: [
      "Nothing in these terms limits liability that cannot be limited by law, including for death or personal injury caused by negligence, or for fraud.",
      "Otherwise, and to the extent the law allows, Calspot is not liable for lost bookings, lost income, injury during a lesson, or disputes between coach and player. Our total liability to you is limited to the fees you paid us in the 12 months before the claim. [Have this clause reviewed.]",
    ],
  },
  {
    heading: "Law and contact",
    body: [
      "These terms are governed by the law of England and Wales. Questions? Email " +
        contact +
        ".",
      "[Date last updated.]",
    ],
  },
];

export function CalspotLegal({
  title,
  sections,
}: {
  title: string;
  sections: Section[];
}) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="Calspot home">
          <Logo />
        </Link>
        <Link href="/signup" className={styles.cta}>
          Get started
        </Link>
      </header>
      <article className={styles.article}>
        <h1>{title}</h1>
        <p className={styles.draft} role="note">
          Draft for legal review. Text in [square brackets] must be completed
          before launch. This is not legal advice.
        </p>
        {sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))}
      </article>
      <footer className={styles.footer}>
        <span>© Calspot</span>
        <nav aria-label="Legal">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </footer>
    </div>
  );
}
