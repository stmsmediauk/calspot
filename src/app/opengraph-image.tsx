import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Calspot. Your coaching. All in one spot.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The supplied brand share image (public/og-image.png). */
export default async function Image() {
  const art = await readFile(path.join(process.cwd(), "public/og-image.png"));
  return new ImageResponse(
    (
      <img
        src={`data:image/png;base64,${art.toString("base64")}`}
        alt=""
        width={1200}
        height={630}
      />
    ),
    size,
  );
}
