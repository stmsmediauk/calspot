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
export const useClaim = () => {
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
