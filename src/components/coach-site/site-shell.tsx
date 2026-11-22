"use client";
import Image from "next/image";
import Link from "next/link";
import { useCoachWorkspace } from "@/lib/coach-workspace";
import { coachTheme } from "@/lib/coach-theme";
import { Logo } from "@/components/logo";
import { useSite } from "./site-context";
import styles from "./site.module.css";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const { profile } = useCoachWorkspace();
  const { basePath } = useSite();
  const { appearance } = profile;
  /** A dark logo vanishes on a dark look, so use the dark-look logo or fall back to text. */
  const logo =
    appearance.palette === "midnight" ? profile.logoDark : profile.logo;
  return (
    <div
      className={styles.site}
      data-palette={appearance.palette}
      style={coachTheme(appearance)}
    >
      <a href="#coach-main" className={styles.skip}>
        Skip to content
      </a>
      <header className={`${styles.wrap} ${styles.header}`}>
        <Link
          className={styles.wordmark}
          href={basePath}
          aria-label={`${profile.name} home`}
        >
          {logo ? (
            <Image
              src={logo}
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
        <nav className={styles.footerLinks} aria-label="Legal">
          <Link href={`${basePath}/privacy`}>Privacy</Link>
          <Link href={`${basePath}/terms`}>Terms</Link>
        </nav>
        <Link
          className={styles.poweredBy}
          href="/"
          aria-label="Powered by Calspot"
        >
          <span>Powered by</span>
          <Logo />
        </Link>
      </footer>
    </div>
  );
}
