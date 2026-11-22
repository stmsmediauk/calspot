import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { Logo } from "../logo";
import {
  ClaimForm,
  ClaimLink,
  ClaimProvider,
  Looks,
  Slug,
  StickyCta,
} from "./claim";
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
    // TODO: photo of a player booking on their phone.
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
    title: "Get your evenings back",
    text: "No more late-night scheduling threads. Approve with a tap, and ready-made WhatsApp replies do the rest.",
  },
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
  "Booking requests: approve, decline or suggest a time",
  "Clubs, lessons, prices and weekly availability",
  "WhatsApp click-to-chat with ready-made replies",
  "Customisable look and layout",
];

const faqs = [
  {
    q: "Do my players need to download an app?",
    a: "No. They open your link in their browser, pick a time and send a request.",
  },
  {
    q: "I coach at more than one club. Does that work?",
    a: "Yes. Add each club with its own lessons, prices and availability, and players choose where they want to play.",
  },
  // TODO: add "What happens after my free trial?" and "How do players pay?"
  // once the wording is confirmed. They are left out so no placeholder shows.
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contract. Cancel from your dashboard whenever you like.",
  },
];

const trial = "14-day free trial · No card needed · Cancel anytime";

function Tick() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0038FC"
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
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/" aria-label="Calspot home">
              <Logo tone="light" />
            </Link>
            <nav aria-label="Main" className={styles.nav}>
              <a href="#how">How it works</a>
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
                <span className={styles.strip}>More court time.</span>
              </h1>
              <p className={styles.heroCopy}>
                Your own booking page in minutes. Players pick a time, you tap
                approve, and the chat carries on in WhatsApp. No more
                back-and-forth.
              </p>
              <ClaimForm />
              <p className={styles.micro}>{trial}</p>
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
                      <div
                        className={styles.stepPlaceholder}
                        aria-hidden="true"
                      />
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
            <Looks />
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
              </div>
              <div className={styles.priceCard}>
                <p className={styles.price}>
                  <span>£29</span>
                  <small>a month</small>
                </p>
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
                  Start my free trial
                </ClaimLink>
                <p className={styles.priceMicro}>
                  No card needed · Cancel anytime
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
              <p className={styles.micro}>{trial}</p>
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
