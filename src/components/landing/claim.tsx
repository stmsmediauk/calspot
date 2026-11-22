"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  cornerStyles,
  lookPresets,
  resolveColours,
  typePairings,
} from "@/lib/coach-theme";
import { slugPattern, slugify } from "@/lib/slug";
import styles from "./landing.module.css";

/** The name typed in the hero is shared with the looks section and the closing call to action. */
type Claim = {
  name: string;
  setName: (value: string) => void;
  slug: string;
  display: string;
  possessive: string;
  href: string;
};
const Context = createContext<Claim | null>(null);
const useClaim = () => {
  const claim = useContext(Context);
  if (!claim) throw new Error("Claim components must sit inside ClaimProvider");
  return claim;
};

export function ClaimProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState("");
  const raw = name.trim();
  const slug = slugify(raw);
  const value: Claim = {
    name,
    setName,
    slug: slug || "your-name",
    display: raw || "Your Name",
    possessive: raw ? `${raw}${/s$/i.test(raw) ? "’" : "’s"}` : "your",
    // Sign-up picks the name and address up from here.
    href: slugPattern.test(slug)
      ? `/signup?slug=${slug}&name=${encodeURIComponent(raw)}`
      : "/signup",
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

/** The hero's "claim your link" field. */
export function ClaimForm() {
  const { name, setName, href } = useClaim();
  const router = useRouter();
  return (
    <form
      className={styles.claim}
      onSubmit={(e) => {
        e.preventDefault();
        router.push(href);
      }}
    >
      <label className={styles.claimField} htmlFor="claim-name">
        <span>calspot.co.uk/</span>
        <input
          id="claim-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="your-name"
          maxLength={60}
          autoComplete="name"
          aria-label="Your page name"
        />
      </label>
      <button type="submit" className={styles.claimButton}>
        Claim my page
      </button>
    </form>
  );
}

/** Sign-up link that carries the claimed name. */
export function ClaimLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { href } = useClaim();
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function Slug() {
  return <>{useClaim().slug}</>;
}

/** "Make it look like you": the name field and five real looks. */
export function Looks() {
  const { name, setName, display, possessive, slug } = useClaim();
  return (
    <div className={styles.container}>
      <div className={styles.looksHead}>
        <div>
          <p className={`${styles.eyebrow} ${styles.eyebrowBlue}`}>
            Make it look like you
          </p>
          <h2 id="looks-h" className={styles.h2}>
            Here’s {possessive} page.
          </h2>
        </div>
        <label className={styles.nameField} htmlFor="looks-name">
          <span>Your name</span>
          <input
            id="looks-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sam Taylor"
            maxLength={60}
          />
        </label>
      </div>
      <ul className={styles.looks}>
        {lookPresets.map((preset) => {
          const { palette, accent, onAccent } = resolveColours({
            ...preset.appearance,
            showHighlights: true,
            showTestimonials: true,
            showFaq: true,
            poweredBy: true,
          });
          const type = typePairings[preset.appearance.font];
          const corners = cornerStyles[preset.appearance.corners];
          return (
            <li
              key={preset.id}
              className={styles.look}
              style={{ background: palette.background, color: palette.ink }}
            >
              <div>
                <div
                  className={styles.lookChip}
                  style={{ background: palette.surface }}
                />
                <p
                  className={styles.lookName}
                  style={{
                    fontFamily: type.display,
                    fontWeight: type.nameWeight,
                    textTransform: type.nameCase,
                  }}
                >
                  {display}
                </p>
                <p className={styles.lookMeta} style={{ color: palette.muted }}>
                  Padel coach · Riverside Club
                </p>
              </div>
              <div>
                <p
                  className={styles.lookLabel}
                  style={{ color: palette.muted }}
                >
                  {preset.name}
                </p>
                <span
                  className={styles.lookButton}
                  style={{
                    background: accent,
                    color: onAccent,
                    borderRadius: corners.button,
                  }}
                >
                  Request a session
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <p className={styles.looksNote}>
        Start from a look, then change colours, fonts and layout. Your page
        lives at <strong>calspot.co.uk/{slug}</strong>.
      </p>
    </div>
  );
}

/** Mobile-only bar that appears once the hero has scrolled out of view. */
export function StickyCta() {
  const { href } = useClaim();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) =>
      setShow(!entry.isIntersecting),
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  return (
    <div className={styles.sticky} data-show={show} aria-hidden={!show}>
      <Link href={href} tabIndex={show ? 0 : -1}>
        Claim your page
      </Link>
    </div>
  );
}
