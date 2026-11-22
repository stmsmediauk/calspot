import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
export const metadata: Metadata = {
  title: "Calspot · Coach dashboard",
  description: "Your coaching. All in one spot. Local mock dashboard.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={GeistSans.className}>
      <body>{children}</body>
    </html>
  );
}
