import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import { GeistSans } from "geist/font/sans";
export const metadata: Metadata = {
  title: "Calspot · Coach dashboard",
  description: "Your coaching. All in one spot. Local mock dashboard.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${GeistSans.className} ${GeistSans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
