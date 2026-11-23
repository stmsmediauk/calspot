/**
 * The Calspot wordmark (SVG). `tone="light"` is the lime version for navy
 * backgrounds; the default navy version is for white and light surfaces.
 * Never stretch or recolour it. Minimum width is 72px.
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={
          tone === "light"
            ? "/logos/calspot-wordmark-lime.svg"
            : "/logos/calspot-wordmark-navy.svg"
        }
        alt="Calspot"
        className="calspot-logo-art"
      />
    </span>
  );
}
