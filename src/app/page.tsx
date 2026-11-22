import { redirect } from "next/navigation";

/** The dashboard now lives at real URLs under /dashboard. */
export default function Home() {
  redirect("/dashboard");
}
