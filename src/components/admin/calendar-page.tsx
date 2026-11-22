"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Clock3, SlidersHorizontal } from "lucide-react";
import { useCoachWorkspace } from "@/lib/coach-workspace";
import { useMediaQuery } from "@/lib/use-media";
import * as mock from "@/lib/mock-data";
import { CalendarPanel } from "../calendar-panel";
import { useAdmin } from "./context";
import { PageHeader } from "./page-header";

export function CalendarPage() {
  const { clubs, lessons, bookings, rules, exceptions } = useCoachWorkspace();
  const { openModal } = useAdmin();
  const narrow = useMediaQuery("(max-width: 760px)");
  const [week, setWeek] = useState(mock.demoWeek),
    [chosenView, setChosenView] = useState<string | null>(null),
    [filter, setFilter] = useState("all");
  /** Phones default to a day-by-day agenda; the week grid needs horizontal scrolling. */
  const view = chosenView ?? (narrow ? "Agenda" : "Week");
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = mock.parseDate(week);
    d.setDate(d.getDate() + i);
    return d;
  });
  const shift = (direction: number) => {
    const d = mock.parseDate(week);
    if (view === "Month") {
      d.setDate(1);
      d.setMonth(d.getMonth() + direction);
    } else d.setDate(d.getDate() + direction * 7);
    setWeek(mock.dateKey(d));
  };
  const visible = bookings.filter(
    (b) =>
      b.status !== "declined" &&
      b.status !== "cancelled" &&
      (filter === "all" || b.clubId === filter),
  );
  return (
    <>
      <PageHeader
        title="Calendar"
        description="Your confirmed sessions, pending requests and open time."
        action={
          <Link className="button secondary" href="/dashboard/availability">
            <SlidersHorizontal size={16} aria-hidden="true" /> Edit availability
          </Link>
        }
      />
      <CalendarPanel
        week={week}
        view={view}
        dates={dates}
        filter={filter}
        clubs={clubs}
        visible={visible}
        rules={rules}
        exceptions={exceptions}
        shift={shift}
        setWeek={setWeek}
        setView={(value) => {
          setChosenView(value);
          if (value !== "Month") {
            const monday = mock.parseDate(week);
            monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
            setWeek(mock.dateKey(monday));
          }
        }}
        setFilter={setFilter}
        lesson={(id) => lessons.find((l) => l.id === id)}
        club={(id) => clubs.find((c) => c.id === id)?.name ?? "Unknown club"}
        onSelect={(id) => openModal({ kind: "booking", id })}
      />
      <div className="calendar-note">
        <Clock3 size={16} aria-hidden="true" />
        <span>
          Requests need your approval. Court availability must be arranged
          separately.
        </span>
        <Link className="text-button" href="/dashboard/requests">
          Review requests <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </>
  );
}
