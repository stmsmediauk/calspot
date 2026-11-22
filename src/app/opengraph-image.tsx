import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Calspot. Your coaching. All in one spot.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(
    path.join(process.cwd(), "public/brand/calspot-logo.png"),
  );
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fdfdfd",
          fontFamily: "sans-serif",
        }}
      >
        <img
          src={`data:image/png;base64,${logo.toString("base64")}`}
          alt=""
          width={900}
          height={300}
        />
        <div
          style={{
            display: "flex",
            marginTop: -20,
            fontSize: 44,
            color: "#33343a",
          }}
        >
          Your coaching. All in one spot.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            padding: "14px 30px",
            borderRadius: 999,
            background: "#0a3cff",
            color: "#fff",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          A booking page of your own · £29.99 a month
        </div>
      </div>
    ),
    size,
  );
}
