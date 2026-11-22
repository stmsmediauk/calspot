import { ImageResponse } from "next/og";
import { defaultAppearance, resolveColours } from "@/lib/coach-theme";
import { getTenantWorkspace } from "@/lib/tenant";

export const alt = "Coach booking page";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Each coach page gets its own share image, drawn from their own look. */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const workspace = await getTenantWorkspace((await params).slug);
  const profile = workspace?.profile;
  const colours = resolveColours(
    profile?.appearance ?? defaultAppearance,
  );
  const { palette, accent, onAccent } = colours;

  // Satori reads JPEG and PNG only, so check before using the photograph.
  let photo: string | null = null;
  if (profile?.photograph?.startsWith("http")) {
    try {
      const res = await fetch(profile.photograph);
      const type = res.headers.get("content-type") ?? "";
      if (res.ok && /jpe?g|png/.test(type)) {
        const bytes = Buffer.from(await res.arrayBuffer());
        photo = `data:${type};base64,${bytes.toString("base64")}`;
      }
    } catch {
      photo = null;
    }
  }
  const name = profile?.name || "Calspot";
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const nameSize = name.length > 22 ? 64 : name.length > 14 ? 80 : 96;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: palette.background,
          color: palette.ink,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            padding: "64px 56px 56px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: palette.muted,
            }}
          >
            {profile?.title || "Coach"}
            {profile?.location ? `  ·  ${profile.location}` : ""}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: nameSize,
                fontWeight: 800,
                lineHeight: 1.02,
                letterSpacing: -2,
              }}
            >
              {name}
            </div>
            {profile?.tagline ? (
              <div
                style={{
                  display: "flex",
                  marginTop: 24,
                  fontSize: 32,
                  lineHeight: 1.3,
                  color: palette.muted,
                  maxWidth: 560,
                }}
              >
                {profile.tagline.slice(0, 90)}
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                padding: "16px 30px",
                borderRadius: 999,
                background: accent,
                color: onAccent,
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              Request a lesson
            </div>
            <div
              style={{
                display: "flex",
                marginLeft: "auto",
                fontSize: 24,
                color: palette.muted,
              }}
            >
              calspot
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: 440,
            padding: "48px 64px 48px 0",
          }}
        >
          {photo ? (
            <img
              src={photo}
              alt=""
              width={376}
              height={534}
              style={{
                width: 376,
                height: 534,
                borderRadius: 28,
                objectFit: "cover",
                objectPosition: `${profile?.photoFocusX ?? 50}% ${profile?.photoFocusY ?? 30}%`,
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 376,
                height: 534,
                borderRadius: 28,
                background: accent,
                color: onAccent,
                fontSize: 140,
                fontWeight: 800,
              }}
            >
              {initials}
            </div>
          )}
        </div>
      </div>
    ),
    size,
  );
}
