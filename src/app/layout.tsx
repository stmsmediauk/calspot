import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import { siteUrl } from "@/lib/site";
import { GeistSans } from "geist/font/sans";
import { Bricolage_Grotesque } from "next/font/google";

/** Headings and buttons. Variable font, 200-800. */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Calspot",
  description: "Your coaching. All in one spot.",
  applicationName: "Calspot",
  manifest: "/site.webmanifest",
  openGraph: { siteName: "Calspot", locale: "en_GB", type: "website" },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = { themeColor: "#0B1030" };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${GeistSans.className} ${GeistSans.variable} ${bricolage.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
