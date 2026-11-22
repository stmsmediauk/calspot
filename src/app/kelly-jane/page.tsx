import type { Metadata } from "next";
import Image from "next/image";
import { SiteShell } from "@/components/coach-site/site-shell";
import { publicCoach } from "@/components/coach-site/content";
import { BookingForm } from "@/components/coach-site/booking-form";
import { WhatsAppButton } from "@/components/coach-site/whatsapp-button";
import styles from "@/components/coach-site/site.module.css";

export const metadata: Metadata = {
  title: "Request a padel session · Kelly-Jane Whalley · Preview",
  description:
    "Choose a sample padel lesson and preferred time with Kelly-Jane Whalley. Local mini-site design preview.",
  robots: { index: false, follow: false },
};
export default async function CoachHome({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string | string[] }>;
}) {
  const selected = (await searchParams).lesson;
  const initialLesson =
    typeof selected === "string" &&
    publicCoach.lessons.some((l) => l.id === selected)
      ? selected
      : "private";
  return (
    <SiteShell>
      <section className={styles.miniIntro}>
        <span className={styles.eyebrow}>PADEL WITH KELLY-JANE</span>
        <h1>Let’s get you on court.</h1>
        <p>
          Choose your session and a time that suits you. Confirmed after coach
          approval.
        </p>
      </section>
      <div className={styles.miniGrid}>
        <aside className={styles.coachCard} aria-label="Your coach">
          <div className={styles.coachImage}>
            <Image
              src="/coach/court-editorial.webp"
              alt="Concept image of a blue padel court, racket and balls"
              fill
              sizes="(max-width: 760px) 100vw, 300px"
              preload
            />
            <span>Concept image</span>
          </div>
          <div className={styles.coachIdentity}>
            <span className={styles.coachInitials} aria-hidden="true">
              KJW
            </span>
            <div>
              <h2>{publicCoach.name}</h2>
              <span>Padel coaching · Profile preview</span>
            </div>
          </div>
          <p className={styles.coachBio}>
            One to one, with your partner or as a group. Choose a format, club
            and time below.
          </p>
          <span className={styles.sampleNote}>
            Sample lessons, venues and prices. Kelly-Jane’s photo and short
            introduction are still to come.
          </span>
          <div className={styles.contactCard}>
            <h3>A question before you book?</h3>
            <p>Not sure which session to choose? Start with a quick hello.</p>
            <WhatsAppButton />
            <span className={styles.sampleNote}>
              Message preview only · Number to be added
            </span>
          </div>
        </aside>
        <div id="book" className={styles.inlineBooking}>
          <BookingForm initialLesson={initialLesson} embedded />
        </div>
      </div>
    </SiteShell>
  );
}
