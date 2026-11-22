"use client";
import { useCoachWorkspace } from "@/lib/coach-workspace";
import { faqItems } from "./content";
import styles from "./site.module.css";

export function Highlights() {
  const { profile } = useCoachWorkspace();
  const items = profile.highlights.filter((h) => h.value.trim());
  if (!profile.appearance.showHighlights || items.length === 0) return null;
  return (
    <ul
      className={styles.highlights}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      aria-label="Highlights"
    >
      {items.map((item) => (
        <li key={item.value}>
          <strong>{item.value}</strong>
          {item.label && <span>{item.label}</span>}
        </li>
      ))}
    </ul>
  );
}

export function Testimonials() {
  const { profile } = useCoachWorkspace();
  const items = profile.testimonials.filter((t) => t.quote.trim());
  if (!profile.appearance.showTestimonials || items.length === 0) return null;
  return (
    <section className={styles.testimonials} aria-labelledby="players-say">
      <div className={styles.wrap}>
        <span className={styles.eyebrow}>From players</span>
        <h2 id="players-say" className={styles.sectionTitle}>
          What players say.
        </h2>
        <div className={styles.quoteGrid}>
          {items.map((t) => (
            <blockquote key={t.quote}>
              “{t.quote}”{t.attribution && <cite>{t.attribution}</cite>}
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const { profile } = useCoachWorkspace();
  if (!profile.appearance.showFaq) return null;
  return (
    <section
      id="faq"
      className={`${styles.wrap} ${styles.faq}`}
      aria-labelledby="faq-title"
    >
      <span className={styles.eyebrow}>Good to know</span>
      <h2 id="faq-title" className={styles.sectionTitle}>
        Before you ask.
      </h2>
      <div>
        {faqItems.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
