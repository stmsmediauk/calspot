"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import {
  defaultWorkspace,
  parseWorkspace,
  type CoachWorkspace,
} from "./workspace-model";

export * from "./workspace-model";

const storageKey = "calspot:coach-workspace:v1";
let workspace = defaultWorkspace;
let loaded = false;
/** True once a coach has signed up in this tab. Until then there is no coach data at all. */
let coachExists = false;
const subscribers = new Set<() => void>();

function getSnapshot() {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      const parsed = raw ? parseWorkspace(raw) : null;
      if (parsed) {
        workspace = parsed;
        coachExists = true;
      }
    } catch {
      /* Memory-only editing still works when storage is unavailable. */
    }
  }
  return workspace;
}
function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}
/** Lets the dashboard preview render the public page from unsaved draft data. */
const PreviewContext = createContext<CoachWorkspace | null>(null);
export const CoachWorkspacePreview = PreviewContext.Provider;
export function useCoachWorkspace() {
  const preview = useContext(PreviewContext);
  const live = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => defaultWorkspace,
  );
  return preview ?? live;
}
/** null before hydration, then whether a coach has signed up in this tab. */
export function useHasCoach(): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      getSnapshot();
      return coachExists;
    },
    () => null,
  );
}
export function updateCoachWorkspace(
  update: (current: CoachWorkspace) => CoachWorkspace,
) {
  workspace = update(getSnapshot());
  coachExists = true;
  let persisted = false;
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(workspace));
    persisted = true;
  } catch {
    /* The caller can report a memory-only save. */
  }
  subscribers.forEach((callback) => callback());
  return persisted;
}
/** Forgets the coach in this tab so the next visit starts at sign-up. */
export function resetCoachWorkspace() {
  workspace = defaultWorkspace;
  coachExists = false;
  try {
    window.sessionStorage.removeItem(storageKey);
  } catch {
    /* Nothing stored to clear. */
  }
  subscribers.forEach((callback) => callback());
}
