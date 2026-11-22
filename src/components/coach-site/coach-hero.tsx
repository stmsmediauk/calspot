"use client";
import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowRight, UserRound } from "lucide-react";
import { useCoachWorkspace } from "@/lib/coach-workspace";
import { nameFontSize } from "@/lib/coach-theme";
import { nameLines } from "./content";
import { Highlights } from "./sections";
import { WhatsAppButton } from "./whatsapp-button";
import styles from "./site.module.css";

export function CoachHero() {
  const { profile } = useCoachWorkspace();
  const { appearance } = profile;
  const lines = nameLines(profile.name);
  const focus = `${profile.photoFocusX}% ${profile.photoFocusY}%`;

  const name = (
    <h1
      id="coach-name"
      className={styles.heroName}
      style={
        {
          "--name-size": nameFontSize(profile.name, appearance),
        } as CSSProperties
      }
    >
      {lines.map((line) => (
        <span key={line}>
          <i>{line}</i>
        </span>
      ))}
    </h1>
  );
  const cta = (
    <a className={styles.button} href="#book">
      Request a session <ArrowRight size={16} aria-hidden="true" />
    </a>
  );
  const photo = (
    <figure
      className={`${styles.photo} ${styles[`photo_${appearance.hero}`]}`}
      style={{ "--focus": focus } as CSSProperties}
    >
      {profile.photograph ? (
        <Image
          src={profile.photograph}
          alt={`${profile.name}, ${profile.title}`}
          fill
          sizes="(max-width: 1440px) 92vw, 1320px"
          unoptimized
          preload
        />
      ) : (
        <div className={styles.portraitPlaceholder}>
          <UserRound size={84} strokeWidth={1} />
          <span>Coach photograph</span>
        </div>
      )}
      {appearance.hero === "overlay" && (
        <div className={`${styles.overlayCopy}`}>
          <div>
            {name}
            <p>
              {profile.title}
              {profile.tagline && ` · ${profile.tagline}`}
            </p>
          </div>
          <div className={styles.heroActions}>
            <WhatsAppButton />
            {cta}
          </div>
        </div>
      )}
    </figure>
  );

  return (
    <section
      id="coach-hero"
      className={`${styles.wrap} ${styles.hero} ${styles[`hero_${appearance.hero}`]}`}
      aria-labelledby="coach-name"
    >
      {appearance.hero === "editorial" && (
        <>
          {name}
          <div className={styles.heroCaption}>
            <p>
              <b>{profile.title}</b>
              {profile.tagline && <> &nbsp;·&nbsp; {profile.tagline}</>}
            </p>
            <div className={styles.heroActions}>
              <WhatsAppButton />
              {cta}
            </div>
          </div>
          {photo}
        </>
      )}
      {appearance.hero === "split" && (
        <div className={styles.splitGrid}>
          <div className={styles.splitCopy}>
            {name}
            {profile.tagline && (
              <p className={styles.splitTagline}>{profile.tagline}</p>
            )}
            <p className={styles.splitTitle}>{profile.title}</p>
            <div className={styles.heroActions}>
              {cta}
              <WhatsAppButton />
              <a className={`${styles.button} ${styles.ghost}`} href="#about">
                Meet {profile.name.split(" ")[0]}
              </a>
            </div>
          </div>
          {photo}
        </div>
      )}
      {appearance.hero === "overlay" && photo}
      <Highlights />
    </section>
  );
}
