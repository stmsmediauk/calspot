import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { Logo } from "../logo";
import {
  ClaimForm,
  ClaimLink,
  ClaimProvider,
  Slug,
  StickyCta,
} from "./claim";
import { InstaProfile } from "./insta";
import {
  FOUNDING_OFFER_ACTIVE as founding,
  FOUNDING_PLACES,
  FOUNDING_PRICE,
  STANDARD_PRICE,
} from "@/lib/offer";
import { Showcase } from "./showcase";
import styles from "./landing.module.css";

const steps = [
  {
    title: "Build your page",
    text: "Add your lessons, prices, clubs and weekly hours. Pick a look. About ten minutes.",
    image: {
      src: "/landing/step1.jpg",
      alt: "Coach setting up their page on a laptop courtside",
      width: 1400,
      height: 1045,
    },
  },
  {
    title: "Share your link",
    text: "Drop it in your Instagram bio, your club group chat, or send it straight to players.",
    image: null,
  },
  {
    title: "Tap approve",
    text: "Requests land in your dashboard. Approve, decline or suggest another time. You stay in charge.",
    image: {
      src: "/landing/step3.jpg",
      alt: "Coach waving a player onto a floodlit padel court",
      width: 1400,
      height: 781,
    },
  },
];

const benefits = [
  {
    title: "Fill the gaps in your week",
    text: "Players see your open slots and request them straight away, so empty hours get booked without you chasing.",
  },
  {
    title: "Look pro to new players",
    text: "A proper page with your photo, story, lessons and prices. First impressions sorted before they’ve even messaged.",
  },
  {
    title: "Keep every penny",
    text: "No booking fees and no commission. Players pay you directly, so what you charge is what you keep.",
  },
];

const features = [
  {
    title: "Your own booking page",
    text: "A personal link like calspot.co.uk/yourname with your photo, story, experience and highlights. Players need no app or account, and it looks great when shared.",
  },
  {
    title: "A look that’s yours",
    text: "Choose from five complete looks, three hero layouts, your accent colour, type pairing and corner style. Preview changes live before you save.",
  },
  {
    title: "Private and group lessons",
    text: "Set a price per person and the number of spaces. Players share a session until it’s full, and you see spaces left at a glance.",
  },
  {
    title: "Approve, decline or suggest",
    text: "Every request lands in your inbox with notes and how long ago it arrived. Overlaps are flagged, and you can offer another time from your real availability.",
  },
  {
    title: "WhatsApp, ready to send",
    text: "Approve a request and a reply opens in your WhatsApp, ready to send. Edit your message templates, follow up on decisions and see tomorrow’s reminders.",
  },
  {
    title: "Weekly hours that run themselves",
    text: "Set your recurring availability, copy it across days and block out dates. Players only ever see times you can really do.",
  },
];

const moreFeatures = [
  "Book with friends: Players can request several spaces and add their friends’ names.",
  "Every club in one place: Each club gets its own lessons, prices and notes.",
  "Your week at a glance: Week, month and agenda calendar views, filtered by club.",
  "Show off your coaching: Highlights, testimonials and your coach profile, each switched on or off.",
  "Know what needs doing: An overview of what needs attention, plus a setup checklist.",
  "Works on your phone: Approve a request between lessons from a mobile-friendly dashboard.",
];

/**
 * Real coach quotes go here. The section stays hidden until there is at least
 * one, so no placeholder or invented testimonial is ever published.
 */
const quotes: {
  quote: string;
  name: string;
  sport: string;
  slug: string;
  photo?: { src: string; alt: string };
}[] = [];

const included = [
  "Your own coaching page and link",
  "Five looks with colours, fonts and layouts",
  "Private and group lessons with spaces",
  "Booking requests: approve, decline or suggest a time",
  "Unlimited clubs, lessons and prices",
  "Weekly availability and blocked dates",
  "Calendar with week, month and agenda views",
  "WhatsApp click-to-chat with editable replies",
  "Tomorrow’s reminders and setup checklist",
];

const faqs = [
  ...(founding
    ? [
        {
          q: "What’s the founding price?",
          a: `The first ${FOUNDING_PLACES} coaches pay £${FOUNDING_PRICE} a month instead of £${STANDARD_PRICE}, locked in for as long as they stay subscribed. If you cancel and come back later, you’ll rejoin at the standard £${STANDARD_PRICE}.`,
        },
      ]
    : []),
  {
    q: "Do my players need to download an app?",
    a: "No. They open your link in their browser, pick a time and send a request.",
  },
  {
    q: "I coach at more than one club. Does that work?",
    a: "Yes. Add each club with its own lessons, prices and availability, and players choose where they want to play.",
  },
  {
    q: "How do players pay?",
    a: "Players pay you directly, the way you already take payment. Calspot doesn’t handle the money, so there are no booking fees and no commission.",
  },
  // TODO: add "What happens after my free trial?" once the wording is confirmed.
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contract. Cancel from your dashboard whenever you like.",
  },
];

const trial =
  "14-day free trial · No card needed · No booking fees · Cancel anytime";
const heroMicro = founding
  ? `14-day free trial · No booking fees · Founding price for the first ${FOUNDING_PLACES} coaches`
  : trial;
const finalMicro = founding
  ? `14-day free trial · No booking fees · Founding price ends after ${FOUNDING_PLACES} coaches`
  : trial;

function Tick() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3A5CF5"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.tick}
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

/** Public landing page. The claim field is shared by the hero, the looks and the closing call to action. */
export function Landing() {
  const heroAlt = "Padel coach feeding a ball at the net under floodlights";
  const common = { alt: heroAlt, fill: true, sizes: "100vw", quality: 70 };
  const {
    props: { srcSet: desktopSet },
  } = getImageProps({ ...common, src: "/landing/hero-desktop.jpg" });
  const { props: mobile } = getImageProps({
    ...common,
    src: "/landing/hero-mobile.jpg",
    priority: true,
  });

  return (
    <ClaimProvider>
      <div className={styles.page}>
        {founding && (
          <div className={styles.offerBar}>
            <p>
              <strong>
                Founding coaches: £{FOUNDING_PRICE}/month, locked in. Only{" "}
                {FOUNDING_PLACES} places.
              </strong>{" "}
              <a href="#pricing">Claim yours →</a>
            </p>
          </div>
        )}
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/" aria-label="Calspot home">
              <Logo tone="light" />
            </Link>
            <nav aria-label="Main" className={styles.nav}>
              <a href="#how">How it works</a>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
              <Link href="/login">Log in</Link>
              <ClaimLink className={styles.navCta}>Start free trial</ClaimLink>
            </nav>
          </div>
        </header>

        <main className={styles.main}>
          <section id="top" className={styles.hero}>
            <picture className={styles.heroPhoto}>
              <source media="(min-width: 768px)" srcSet={desktopSet} />
              <img {...mobile} alt={heroAlt} />
            </picture>
            <div className={`${styles.container} ${styles.heroInner}`}>
              <p className={`${styles.eyebrow} ${styles.eyebrowTint}`}>
                For independent coaches
              </p>
              <h1 className={styles.h1}>
                Less admin.
                <br />
                <span className={`${styles.strip} ${styles.stripLime}`}>
                  More court time.</span>
              </h1>
              <p className={styles.heroCopy}>
                Your own booking page in minutes. Players pick a time, you tap
                approve, and the chat carries on in WhatsApp. No more
                back-and-forth.
              </p>
              <ClaimForm />
              <p className={styles.micro}>{heroMicro}</p>
            </div>
          </section>

          <section aria-labelledby="pain" className={styles.light}>
            <div className={`${styles.container} ${styles.problem}`}>
              <div>
                <p className={`${styles.eyebrow} ${styles.eyebrowBlue}`}>
                  Sound familiar?
                </p>
                <h2 id="pain" className={styles.h2}>
                  Ten messages to book one lesson.
                </h2>
                <p className={styles.lead}>
                  Every booking turns into a thread. Which day, what time, which
                  club, how much. Then someone cancels and it starts again,
                  usually at 11pm.
                </p>
                <p className={`${styles.lead} ${styles.leadStrong}`}>
                  Calspot turns all of that into one tap.
                </p>
                <Image
                  src="/landing/problem.jpg"
                  alt="Coach checking their phone courtside next to a padel racket and balls"
                  width={1200}
                  height={1490}
                  sizes="(max-width: 768px) 100vw, 480px"
                  className={styles.problemPhoto}
                />
              </div>
              <div className={styles.compare}>
                <div className={styles.before}>
                  <p className={styles.compareLabel}>Before · WhatsApp</p>
                  <span className={styles.them}>Hey, are you free Tues?</span>
                  <span className={styles.me}>Only 6pm, any good?</span>
                  <span className={styles.them}>What about 4?</span>
                  <span className={styles.them}>Actually could we do Weds</span>
                  <span className={styles.them}>Can I bring my mate?</span>
                  <span className={styles.me}>Which club are you at?</span>
                  <span className={styles.them}>
                    Is it still the same price?
                  </span>
                  <span className={styles.time}>23:14</span>
                </div>
                <div className={styles.after}>
                  <p className={`${styles.compareLabel} ${styles.eyebrowTint}`}>
                    After · Calspot
                  </p>
                  <div className={styles.requestCard}>
                    <p className={styles.requestNew}>New request</p>
                    <p className={styles.requestWho}>Emma W. · Duo session</p>
                    <p className={styles.requestWhen}>
                      Wed 16:00 · Riverside Club · 2 players
                    </p>
                    <div className={styles.requestButtons}>
                      <span className={styles.approve}>Approve</span>
                      <span className={styles.suggest}>Suggest time</span>
                    </div>
                  </div>
                  <span className={`${styles.me} ${styles.booked}`}>
                    You’re booked in for Wed at 4. See you on court!
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section id="how" aria-labelledby="how-h" className={styles.white}>
            <div className={styles.container}>
              <h2 id="how-h" className={`${styles.h2} ${styles.spaced}`}>
                Live in three steps.
              </h2>
              <ol className={styles.steps}>
                {steps.map((step, i) => (
                  <li key={step.title}>
                    <p className={styles.numeral} aria-hidden="true">
                      0{i + 1}
                    </p>
                    <h3 className={styles.h3}>{step.title}</h3>
                    <p className={styles.stepText}>{step.text}</p>
                    {step.image ? (
                      <Image
                        {...step.image}
                        alt={step.image.alt}
                        sizes="(max-width: 768px) 100vw, 380px"
                        className={styles.stepPhoto}
                      />
                    ) : (
                      <InstaProfile />
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section
            id="looks"
            aria-labelledby="looks-h"
            className={styles.light}
          >
            <Showcase />
          </section>

          <section aria-labelledby="why-h" className={styles.navy}>
            <div className={styles.container}>
              <h2 id="why-h" className={`${styles.h2} ${styles.whyTitle}`}>
                Built for coaches who’d rather be{" "}
                <span className={styles.underline}>on court.</span>
              </h2>
              <div className={styles.benefits}>
                {benefits.map((b) => (
                  <div key={b.title}>
                    <h3 className={styles.benefitTitle}>{b.title}</h3>
                    <p className={styles.benefitText}>{b.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            id="features"
            aria-labelledby="features-h"
            className={styles.light}
          >
            <div className={styles.container}>
              <div className={styles.featuresHead}>
                <p className={`${styles.eyebrow} ${styles.eyebrowBlue}`}>
                  Everything in one plan
                </p>
                <h2 id="features-h" className={styles.h2}>
                  Everything you need to run your bookings.
                </h2>
                <p className={styles.lead}>
                  From your first page to your last lesson of the day, Calspot
                  handles the admin so you don’t have to.
                </p>
              </div>
              <ul className={styles.features}>
                {features.map((f) => (
                  <li key={f.title} className={styles.feature}>
                    <h3 className={styles.featureTitle}>{f.title}</h3>
                    <p className={styles.featureText}>{f.text}</p>
                  </li>
                ))}
              </ul>
              <div className={styles.featuresMore}>
                <h3 className={styles.featuresMoreTitle}>Also included</h3>
                <ul className={styles.featuresMoreList}>
                  {moreFeatures.map((f) => (
                    <li key={f}>
                      <Tick />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {quotes.length > 0 && (
            <section aria-labelledby="proof-h" className={styles.white}>
              <div className={styles.container}>
                <p className={`${styles.eyebrow} ${styles.eyebrowBlue}`}>
                  Coaches on Calspot
                </p>
                <h2 id="proof-h" className={`${styles.h2} ${styles.spaced}`}>
                  Don’t take our word for it.
                </h2>
                <div className={styles.quotes}>
                  {quotes.map((q) => (
                    <figure key={q.name} className={styles.quote}>
                      {q.photo && (
                        <Image
                          src={q.photo.src}
                          alt={q.photo.alt}
                          width={600}
                          height={400}
                          className={styles.quotePhoto}
                        />
                      )}
                      <blockquote>“{q.quote}”</blockquote>
                      <figcaption>
                        {q.name} · {q.sport} ·{" "}
                        <Link href={`/${q.slug}`}>calspot.co.uk/{q.slug}</Link>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section
            id="pricing"
            aria-labelledby="price-h"
            className={styles.pricing}
          >
            <div className={`${styles.container} ${styles.pricingInner}`}>
              <div>
                <p className={`${styles.eyebrow} ${styles.eyebrowTint}`}>
                  One plan. Everything in.
                </p>
                <h2 id="price-h" className={styles.h2}>
                  Less than one lesson a month.
                </h2>
                <p className={`${styles.lead} ${styles.onDark}`}>
                  If Calspot books you one extra session a month, it’s paid for
                  itself. Try it free first.
                </p>
                <p className={styles.noFees}>
                  No booking fees. No commission. Your money goes straight to
                  you.
                </p>
              </div>
              <div className={styles.priceCard}>
                {founding && (
                  <p className={styles.badge}>Founding coach offer</p>
                )}
                <p className={styles.price}>
                  <span>£{founding ? FOUNDING_PRICE : STANDARD_PRICE}</span>
                  <small>a month</small>
                  {founding && (
                    <del className={styles.was}>
                      <span className={styles.srOnly}>Standard price </span>£
                      {STANDARD_PRICE}
                    </del>
                  )}
                </p>
                {founding && (
                  <p className={styles.lockLine}>
                    Locked in for as long as you stay subscribed. Rises to £
                    {STANDARD_PRICE} after the first {FOUNDING_PLACES} coaches.
                  </p>
                )}
                <p className={styles.trialLine}>First 14 days free</p>
                <ul className={styles.included}>
                  {included.map((item) => (
                    <li key={item}>
                      <Tick />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <ClaimLink className={styles.priceCta}>
                  {founding ? "Claim founding price" : "Start my free trial"}
                </ClaimLink>
                <p className={styles.priceMicro}>
                  {founding
                    ? `14-day free trial · No card needed · Only ${FOUNDING_PLACES} places`
                    : "No card needed · Cancel anytime"}
                </p>
              </div>
            </div>
          </section>

          <section id="faq" aria-labelledby="faq-h" className={styles.light}>
            <div className={`${styles.container} ${styles.faq}`}>
              <h2 id="faq-h" className={`${styles.h2} ${styles.spacedSm}`}>
                Questions.
              </h2>
              {faqs.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section aria-labelledby="final-h" className={styles.final}>
            <Image
              src="/landing/final-court.jpg"
              alt=""
              fill
              sizes="100vw"
              quality={70}
              className={styles.finalPhoto}
            />
            <div className={`${styles.container} ${styles.finalInner}`}>
              <h2 id="final-h" className={styles.h1Final}>
                Your page is
                <br />
                <span className={`${styles.strip} ${styles.stripBlue}`}>
                  one tap away.
                </span>
              </h2>
              <div className={styles.claim}>
                <div
                  className={styles.claimField}
                  aria-label="Your page address"
                >
                  <span>calspot.co.uk/</span>
                  <strong>
                    <Slug />
                  </strong>
                </div>
                <ClaimLink className={styles.claimButton}>
                  Claim it free
                </ClaimLink>
              </div>
              <p className={styles.micro}>{finalMicro}</p>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <Link href="/" aria-label="Calspot home">
              <Logo tone="light" />
            </Link>
            <nav aria-label="Footer">
              <Link href="/login">Log in</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <a href="mailto:contact@calspot.co.uk">Contact</a>
              <span>© Calspot</span>
            </nav>
          </div>
        </footer>
        <StickyCta />
      </div>
    </ClaimProvider>
  );
}
