import Image from "next/image";

/**
 * Frames the supplied artwork without modifying its proportions.
 * `tone="light"` is the same logo with white letters, for dark backgrounds.
 */
export function Logo({
  compact = false,
  tone = "dark",
}: {
  compact?: boolean;
  tone?: "dark" | "light";
}) {
  return (
    <span className={`calspot-logo${compact ? " compact" : ""}`}>
      <Image
        src={
          tone === "light"
            ? "/brand/calspot-logo-light.png"
            : "/brand/calspot-logo.png"
        }
        alt="Calspot"
        width={2172}
        height={724}
        className="calspot-logo-art"
        priority={!compact}
      />
    </span>
  );
}
