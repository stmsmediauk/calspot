"use client";
import Image from "next/image";
import Link from "next/link";
import { useCoachWorkspace } from "@/lib/coach-workspace";
import { coachTheme } from "@/lib/coach-theme";
import { publicCoach } from "./content";
import styles from "./site.module.css";

export function SiteShell({
  children,
  embed = false,
}: {
  children: React.ReactNode;
  embed?: boolean;
}) {
  const { profile } = useCoachWorkspace();
  const { appearance } = profile;
  return (
    <div
      className={styles.site}
      data-palette={appearance.palette}
      style={coachTheme(appearance)}
    >
      <a href="#coach-main" className={styles.skip}>
        Skip to content
      </a>
      {publicCoach.demoMode && !embed && (
        <div className={styles.previewBar}>
          <span>
            Design preview · Sample sessions. No bookings or messages are sent.
          </span>
          <Link href="/">Back to dashboard</Link>
        </div>
      )}
      <header className={`${styles.wrap} ${styles.header}`}>
        <Link
          className={styles.wordmark}
          href={publicCoach.basePath}
          aria-label={`${profile.name} home`}
        >
          {profile.logo ? (
            <Image
              src={profile.logo}
              alt={`${profile.name} logo`}
              width={180}
              height={55}
              unoptimized
              className={styles.personalLogo}
            />
          ) : (
            <span className={styles.headerIdentity}>
              {profile.name}
              <small>{profile.title}</small>
            </span>
          )}
        </Link>
        <nav className={styles.headerNav} aria-label="Coach page">
          <a className={styles.navText} href="#about">
            The coach
          </a>
          {appearance.showFaq && (
            <a className={styles.navText} href="#faq">
              FAQ
            </a>
          )}
          <a className={`${styles.button} ${styles.small}`} href="#book">
            Request a session
          </a>
        </nav>
      </header>
      <main className={styles.main} id="coach-main">
        {children}
      </main>
      <footer className={`${styles.wrap} ${styles.footer}`}>
        <span>
          © {profile.name} · {profile.title}
        </span>
        {appearance.poweredBy && <span>Powered by calspot.</span>}
      </footer>
    </div>
  );
}
