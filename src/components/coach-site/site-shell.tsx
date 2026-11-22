import Link from "next/link";
import { publicCoach } from "./content";
import { WhatsAppButton } from "./whatsapp-button";
import styles from "./site.module.css";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const home = publicCoach.basePath;
  return (
    <div className={styles.site}>
      <a href="#coach-main" className={styles.skip}>
        Skip to content
      </a>
      <div className={styles.previewBar}>
        Design preview · Sample sessions. No bookings or messages are sent.
      </div>
      <header className={styles.header}>
        <Link
          className={styles.wordmark}
          href={home}
          aria-label="Kelly-Jane Whalley home"
        >
          Kelly-Jane<span>WHALLEY · PADEL COACHING</span>
        </Link>
        <a className={styles.headerBooking} href="#book">
          Request a session
        </a>
        <div className={styles.mobileContact}>
          <WhatsAppButton label="WhatsApp" />
        </div>
      </header>
      <main className={styles.main} id="coach-main">
        {children}
      </main>
      <footer className={styles.footer}>
        <span>Kelly-Jane Whalley · Padel coaching</span>
        <Link href="/">Coach dashboard</Link>
      </footer>
    </div>
  );
}
