"use client";
import Link from "next/link";
import { useCoachWorkspace } from "@/lib/coach-workspace";
import { SiteShell } from "./site-shell";
import {
  privacySections,
  termsSections,
  type LegalSection,
} from "./legal-content";
import { publicCoach } from "./content";
import styles from "./site.module.css";

export function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const { profile } = useCoachWorkspace();
  const sections: LegalSection[] =
    kind === "privacy"
      ? privacySections(profile.name)
      : termsSections(profile.name);
  const title = kind === "privacy" ? "Privacy notice" : "Terms of use";
  return (
    <SiteShell>
      <article className={`${styles.wrap} ${styles.legal}`}>
        <Link href={publicCoach.basePath} className={styles.legalBack}>
          ← Back to {profile.name.split(" ")[0]}’s page
        </Link>
        <h1 className={styles.sectionTitle}>{title}</h1>
        <p className={styles.legalDraft} role="note">
          Draft for legal review. Text in [square brackets] is a placeholder
          that must be completed before launch. This is not legal advice.
        </p>
        {sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>
    </SiteShell>
  );
}
