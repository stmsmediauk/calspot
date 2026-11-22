import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calspot · Create your coaching page",
  robots: { index: false, follow: false },
};
export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
