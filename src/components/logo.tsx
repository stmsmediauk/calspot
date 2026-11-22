import Image from "next/image";

/** Frame the supplied artwork without modifying its original pixels or proportions. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`calspot-logo${compact ? " compact" : ""}`}>
      <Image
        src="/brand/calspot-logo.png"
        alt="Calspot"
        width={2172}
        height={724}
        className="calspot-logo-art"
        priority={!compact}
      />
    </span>
  );
}
