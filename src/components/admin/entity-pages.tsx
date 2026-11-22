"use client";
import { ChevronDown, ChevronUp, Clock3, MapPin, Plus } from "lucide-react";
import { updateCoachWorkspace, useCoachWorkspace } from "@/lib/coach-workspace";
import { useAdmin } from "./context";
import { PageHeader } from "./page-header";

function Switch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="switch"
      onClick={onChange}
    >
      <i />
    </button>
  );
}

export function ClubsPage() {
  const { clubs } = useCoachWorkspace();
  const { openModal } = useAdmin();
  return (
    <>
      <PageHeader
        title="Clubs"
        description="Where you coach. Active clubs appear on your page and in the request form."
        action={
          <button className="button" onClick={() => openModal({ kind: "club" })}>
            <Plus size={16} aria-hidden="true" /> Add club
          </button>
        }
      />
      <section className="panel list-panel">
        {clubs.map((club) => (
          <article className={`list-row ${club.active ? "" : "off"}`} key={club.id}>
            <MapPin size={18} aria-hidden="true" />
            <div className="grow">
              <h2>{club.name}</h2>
              <p>{club.address}</p>
              <small>{club.notes || "No venue notes yet."}</small>
            </div>
            <label className="visibility">
              <Switch
                checked={club.active}
                label={`Show ${club.name} on my page`}
                onChange={() =>
                  updateCoachWorkspace((c) => ({
                    ...c,
                    clubs: c.clubs.map((x) =>
                      x.id === club.id ? { ...x, active: !x.active } : x,
                    ),
                  }))
                }
              />
              <span>{club.active ? "On my page" : "Hidden"}</span>
            </label>
            <button
              className="button secondary small"
              onClick={() => openModal({ kind: "club", id: club.id })}
            >
              Edit
            </button>
          </article>
        ))}
      </section>
    </>
  );
}

export function LessonsPage() {
  const { lessons } = useCoachWorkspace();
  const { openModal } = useAdmin();
  const move = (index: number, by: number) =>
    updateCoachWorkspace((c) => {
      const next = [...c.lessons];
      const target = index + by;
      if (target < 0 || target >= next.length) return c;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...c, lessons: next };
    });
  return (
    <>
      <PageHeader
        title="Lessons"
        description="What players can request. Active lessons appear on your page in this order."
        action={
          <button className="button" onClick={() => openModal({ kind: "lesson" })}>
            <Plus size={16} aria-hidden="true" /> Add lesson
          </button>
        }
      />
      <section className="panel list-panel">
        {lessons.map((lesson, index) => (
          <article className={`list-row ${lesson.active ? "" : "off"}`} key={lesson.id}>
            <div className="reorder">
              <button
                type="button"
                className="icon-button"
                aria-label={`Move ${lesson.name} up`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ChevronUp size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label={`Move ${lesson.name} down`}
                disabled={index === lessons.length - 1}
                onClick={() => move(index, 1)}
              >
                <ChevronDown size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="grow">
              <h2>{lesson.name}</h2>
              <p>{lesson.description}</p>
              <small>
                <Clock3 size={13} aria-hidden="true" /> {lesson.duration} minutes
                · £{lesson.price} guide price
              </small>
            </div>
            <label className="visibility">
              <Switch
                checked={lesson.active}
                label={`Show ${lesson.name} on my page`}
                onChange={() =>
                  updateCoachWorkspace((c) => ({
                    ...c,
                    lessons: c.lessons.map((x) =>
                      x.id === lesson.id ? { ...x, active: !x.active } : x,
                    ),
                  }))
                }
              />
              <span>{lesson.active ? "On my page" : "Hidden"}</span>
            </label>
            <button
              className="button secondary small"
              onClick={() => openModal({ kind: "lesson", id: lesson.id })}
            >
              Edit
            </button>
          </article>
        ))}
      </section>
      <p className="footnote">Descriptions and club notes are shown to players on your page.</p>
    </>
  );
}
