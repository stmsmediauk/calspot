"use client";
import { SiteShell } from "./site-shell";
import { BookingForm } from "./booking-form";
import { CoachProfileCard } from "./coach-profile-card";
import { CoachHero } from "./coach-hero";
import { Faq, Testimonials } from "./sections";
import { resolveLessonId } from "./content";
import styles from "./site.module.css";

export function CoachBookingPage({ initialLesson }: { initialLesson?: string }) {
  return (
    <SiteShell>
      <CoachHero />
      <div className={`${styles.wrap} ${styles.mainGrid}`}>
        <CoachProfileCard />
        <section
          id="book"
          className={styles.booking}
          aria-label="Request a session"
        >
          <BookingForm initialLesson={resolveLessonId(initialLesson)} />
        </section>
      </div>
      <Testimonials />
      <Faq />
    </SiteShell>
  );
}
