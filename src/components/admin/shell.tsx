"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Ellipsis,
  ExternalLink,
  Inbox,
  Layers3,
  LayoutDashboard,
  MapPin,
  UserRound,
  X,
} from "lucide-react";
import type { Booking, Club, Exception, Lesson, Rule } from "@/lib/mock-data";
import { platform } from "@/lib/platform";
import {
  coachInitials,
  updateCoachWorkspace,
  useCoachWorkspace,
} from "@/lib/coach-workspace";
import { matchingLook } from "@/lib/coach-theme";
import { Editor } from "../editor";
import { Logo } from "../logo";
import { Modal } from "../ui";
import { Badge } from "../ui";
import { BookingDetail } from "./booking-detail";
import { AdminContext, type ModalState } from "./context";

export const navItems = [
  { name: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  { name: "Requests", href: "/dashboard/requests", icon: Inbox },
  { name: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { name: "Availability", href: "/dashboard/availability", icon: Clock3 },
  { name: "Clubs", href: "/dashboard/clubs", icon: MapPin },
  { name: "Lessons", href: "/dashboard/lessons", icon: Layers3 },
  { name: "My profile", href: "/dashboard/profile", icon: UserRound },
];
/** Primary destinations in the mobile tab bar; the rest sit behind "More". */
const tabItems = ["Requests", "Calendar", "Availability", "My profile"];

export function CoachAvatar({ size = 36 }: { size?: number }) {
  const { profile } = useCoachWorkspace();
  return profile.photograph ? (
    <Image
      className="coach-avatar"
      src={profile.photograph}
      alt=""
      width={size}
      height={size}
      unoptimized
      style={{ objectPosition: `${profile.photoFocusX}% ${profile.photoFocusY}%` }}
    />
  ) : (
    <span className="coach-mark" style={{ width: size, height: size }}>
      {coachInitials(profile.name)}
    </span>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, bookings } = useCoachWorkspace();
  const [drawer, setDrawer] = useState(false);
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [copied, setCopied] = useState(false);
  const pending = bookings.filter((b) => b.status === "pending").length;
  const look = matchingLook(profile.appearance);

  const decide = useCallback((id: string, status: Booking["status"]) => {
    updateCoachWorkspace((current) => ({
      ...current,
      bookings: current.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
    }));
    setNotice(
      platform.demoMode
        ? `Demo request ${status}. No email was sent.`
        : `Request ${status}.`,
    );
    setModal(null);
  }, []);
  const context = useMemo(
    () => ({ openModal: setModal, notify: setNotice, decide }),
    [decide],
  );
  const current =
    navItems.find((item) => pathname.startsWith(item.href))?.name ?? "";
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${platform.publicBasePath}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setNotice(`Your page link is ${window.location.origin}${platform.publicBasePath}`);
    }
  };

  const link = (item: (typeof navItems)[number], onNavigate?: () => void) => {
    const active = pathname.startsWith(item.href);
    return (
      <Link
        key={item.name}
        href={item.href}
        className={active ? "active" : ""}
        aria-current={active ? "page" : undefined}
        onClick={onNavigate}
      >
        <item.icon size={18} aria-hidden="true" />
        {item.name}
        {item.name === "Requests" && pending > 0 && (
          <span className="count" aria-label={`${pending} pending`}>
            {pending}
          </span>
        )}
      </Link>
    );
  };

  return (
    <AdminContext.Provider value={context}>
      <div className="app-shell">
        <aside className={`sidebar ${drawer ? "open" : ""}`}>
          <div className="brand">
            <Logo />
            <button
              className="mobile-only icon-button"
              aria-label="Close navigation"
              onClick={() => setDrawer(false)}
            >
              <X size={20} />
            </button>
          </div>
          <div className="workspace">
            <CoachAvatar />
            <div>
              <strong>{profile.name}</strong>
              <span>{look ? `${look.name} look` : "Custom look"}</span>
            </div>
          </div>
          <nav aria-label="Main navigation">
            {navItems.map((item) => link(item, () => setDrawer(false)))}
          </nav>
          {platform.demoMode && (
            <Link href="/signup" className="signup-link">
              Preview the sign-up flow
            </Link>
          )}
        </aside>
        {drawer && (
          <button
            className="nav-overlay"
            aria-label="Close navigation"
            onClick={() => setDrawer(false)}
          />
        )}
        <main>
          <div className="topbar">
            <div className="topbar-left">
              <span className="mobile-only mobile-brand">
                <Logo compact />
              </span>
              {platform.demoMode && (
                <span className="demo-indicator">
                  <i /> Demo · Sample data
                </span>
              )}
            </div>
            <div className="topbar-actions">
              <button
                className="button secondary small hide-mobile"
                onClick={copyLink}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Link copied" : "Copy link"}
              </button>
              <Link className="button small" href={platform.publicBasePath}>
                <ExternalLink size={15} aria-hidden="true" />
                View my page
              </Link>
            </div>
          </div>
          <div className="content">
            {notice && (
              <div className="notice" role="status">
                {notice}
                <button
                  className="icon-button"
                  aria-label="Dismiss notification"
                  onClick={() => setNotice("")}
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {children}
          </div>
        </main>
        <nav className="tab-bar" aria-label="Quick navigation">
          {tabItems.map((name) => {
            const item = navItems.find((n) => n.name === name)!;
            return link(item);
          })}
          <button
            type="button"
            className={
              current && !tabItems.includes(current) ? "active" : undefined
            }
            onClick={() => setDrawer(true)}
          >
            <Ellipsis size={18} aria-hidden="true" />
            More
          </button>
        </nav>
        {modal && (
          <Modal
            title={
              modal.kind === "booking"
                ? "Session details"
                : `${modal.id ? "Edit" : "Add"} ${modal.kind === "rule" ? "recurring availability" : modal.kind === "exception" ? "availability exception" : modal.kind}`
            }
            onClose={() => setModal(null)}
          >
            {modal.kind === "booking" ? (
              <BookingDetail id={modal.id!} />
            ) : (
              <ModalEditor modal={modal} close={() => setModal(null)} notify={setNotice} />
            )}
          </Modal>
        )}
      </div>
    </AdminContext.Provider>
  );
}

function ModalEditor({
  modal,
  close,
  notify,
}: {
  modal: ModalState;
  close: () => void;
  notify: (message: string) => void;
}) {
  const { clubs, lessons, rules } = useCoachWorkspace();
  const item =
    modal.kind === "club"
      ? clubs.find((c) => c.id === modal.id)
      : modal.kind === "lesson"
        ? lessons.find((l) => l.id === modal.id)
        : rules.find((r) => r.id === modal.id);
  return (
    <Editor
      kind={modal.kind}
      item={item}
      defaults={modal.defaults}
      clubs={clubs}
      lessons={lessons}
      onSave={(value) => {
        const id = modal.id ?? crypto.randomUUID();
        const upsert = <T extends { id: string }>(list: T[], next: T) =>
          modal.id ? list.map((x) => (x.id === id ? next : x)) : [...list, next];
        updateCoachWorkspace((c) => ({
          ...c,
          ...(modal.kind === "club"
            ? { clubs: upsert<Club>(c.clubs, { ...value, id } as Club) }
            : {}),
          ...(modal.kind === "lesson"
            ? { lessons: upsert<Lesson>(c.lessons, { ...value, id } as Lesson) }
            : {}),
          ...(modal.kind === "rule"
            ? { rules: upsert<Rule>(c.rules, { ...value, id } as Rule) }
            : {}),
          ...(modal.kind === "exception"
            ? { exceptions: [...c.exceptions, { ...value, id } as Exception] }
            : {}),
        }));
        close();
        notify(
          "Saved. Clubs, lessons and availability also update your booking page.",
        );
      }}
      onCancel={close}
    />
  );
}

export { Badge };
