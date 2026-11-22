"use client";
import { useRouter } from "next/navigation";
import { signOutCoach } from "@/lib/coach-workspace";

/** Ends the session and returns to the log in page. */
export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await signOutCoach();
        router.replace("/login");
      }}
    >
      Log out
    </button>
  );
}
