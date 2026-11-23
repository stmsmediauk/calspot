"use client";
import { useClaim } from "./claim";
import styles from "./landing.module.css";

/** A small Instagram profile with the coach's Calspot link in the bio. Picks up the typed name. */
export function InstaProfile() {
  const { slug } = useClaim();
  return (
    <div className={styles.instaWrap}>
      <div
        className={styles.insta}
        role="img"
        aria-label={`Example Instagram profile with the link calspot.co.uk/${slug} in the bio`}
      >
        <div className={styles.instaTop}>
          <span className={styles.instaAvatar} aria-hidden="true" />
          <dl className={styles.instaStats}>
            <div>
              <dt>posts</dt>
              <dd>214</dd>
            </div>
            <div>
              <dt>followers</dt>
              <dd>3.1k</dd>
            </div>
            <div>
              <dt>following</dt>
              <dd>402</dd>
            </div>
          </dl>
        </div>
        <p className={styles.instaName}>{slug.replace(/-/g, "")}</p>
        <p>Padel coach · Riverside &amp; Northside clubs</p>
        <p>Private, duo and group sessions</p>
        <span className={styles.instaLink}>calspot.co.uk/{slug}</span>
      </div>
    </div>
  );
}
