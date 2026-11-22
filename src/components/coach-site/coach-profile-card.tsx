"use client";
import { useSyncExternalStore } from "react";
import { MapPin, Instagram } from "lucide-react";
import { hasWhatsApp, useCoachWorkspace } from "@/lib/coach-workspace";
import { useSite } from "./site-context";
import { WhatsAppButton } from "./whatsapp-button";
import styles from "./site.module.css";

const narrowQuery = "(max-width: 819px)";
function useNarrow() {
  return useSyncExternalStore(
    (callback) => {
      const query = window.matchMedia(narrowQuery);
      query.addEventListener("change", callback);
      return () => query.removeEventListener("change", callback);
    },
    () => window.matchMedia(narrowQuery).matches,
    () => false,
  );
}

export function CoachProfileCard() {
  const { profile, clubs } = useCoachWorkspace();
  const { live } = useSite();
  const narrow = useNarrow();
  const activeClubs = clubs.filter((c) => c.active);
  const shortName = profile.name.split(" ")[0];
  const details = (
    <>
      {profile.experience && (
        <div className={styles.experience}>
          <h3>Experience</h3>
          <p>{profile.experience}</p>
        </div>
      )}
      {(profile.location || activeClubs.length > 0) && (
        <div className={styles.locations}>
          <h3>Where I coach</h3>
          {profile.location && <p>{profile.location}</p>}
          {activeClubs.map((club) => (
            <div className={styles.venue} key={club.id}>
              <MapPin size={16} aria-hidden="true" />
              <div>
                <strong>{club.name}</strong>
                <span>{club.address}</span>
                {club.notes && <span>{club.notes}</span>}
              </div>
            </div>
          ))}
          {!live && (
            <span className={styles.demoNote}>
              Sample clubs for this preview.
            </span>
          )}
        </div>
      )}
    </>
  );
  return (
    <aside id="about" className={styles.about} aria-label="Your coach">
      <span className={styles.eyebrow}>Meet your coach</span>
      <h2 className={styles.sectionTitle}>Coaching with {shortName}.</h2>
      <p className={styles.bio}>{profile.introduction}</p>
      {narrow ? (
        <details className={styles.moreDetails}>
          <summary>Experience &amp; locations</summary>
          {details}
        </details>
      ) : (
        details
      )}
      {(hasWhatsApp(profile.whatsapp) || profile.instagram) && (
        <div className={styles.contactLinks}>
          {hasWhatsApp(profile.whatsapp) && <WhatsAppButton />}
          {profile.instagram && (
            <a
              href={`https://www.instagram.com/${encodeURIComponent(profile.instagram)}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={16} aria-hidden="true" />
              Instagram enquiries
            </a>
          )}
        </div>
      )}
    </aside>
  );
}
