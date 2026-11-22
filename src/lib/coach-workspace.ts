"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { createClient } from "./supabase/client";
import {
  createCoach,
  emptySaved,
  loadCoach,
  pushChanges,
  snapshotOf,
  type Saved,
} from "./workspace-db";
import { defaultWorkspace, type CoachWorkspace } from "./workspace-model";

export * from "./workspace-model";

/** The coach's plan: on a free trial, paid, or complimentary. `active` is false once a trial ends. */
export type Plan = {
  status: "trial" | "paid" | "free" | "overdue";
  trialEndsAt: string | null;
  suspended: boolean;
  active: boolean;
};

export type SessionStatus = "loading" | "signed-out" | "no-coach" | "ready";
type State = {
  status: SessionStatus;
  workspace: CoachWorkspace;
  coachId: string | null;
  slug: string | null;
  published: boolean;
  plan: Plan | null;
  email: string | null;
  saving: boolean;
  saveError: string | null;
};
const initial: State = {
  status: "loading",
  workspace: defaultWorkspace,
  coachId: null,
  slug: null,
  published: false,
  plan: null,
  email: null,
  saving: false,
  saveError: null,
};

let state = initial;
let saved: Saved = emptySaved();
let started = false;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let saveChain: Promise<void> = Promise.resolve();
const subscribers = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  subscribers.forEach((callback) => callback());
}
function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

/** Reads the coach's plan. Returns null until the trial tables exist in the database. */
async function loadPlan(): Promise<Plan | null> {
  const { data, error } = await createClient().rpc("my_plan");
  if (error || !data) return null;
  return {
    status: data.status,
    trialEndsAt: data.trial_ends_at ?? null,
    suspended: Boolean(data.suspended),
    active: Boolean(data.active),
  };
}

async function refresh() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) {
    saved = emptySaved();
    set({ ...initial, status: "signed-out" });
    return;
  }
  try {
    const coach = await loadCoach(supabase, user.id);
    if (!coach) {
      set({ ...initial, status: "no-coach", email: user.email ?? null });
      return;
    }
    saved = snapshotOf(coach.coachId, coach.workspace);
    const plan = await loadPlan();
    set({
      status: "ready",
      plan,
      workspace: coach.workspace,
      coachId: coach.coachId,
      slug: coach.slug,
      published: coach.published,
      email: user.email ?? null,
      saving: false,
      saveError: null,
    });
  } catch (error) {
    set({
      ...initial,
      status: "no-coach",
      email: user.email ?? null,
      saveError: error instanceof Error ? error.message : "Could not load your data.",
    });
  }
}

/** Starts watching the Supabase session. Safe to call repeatedly. */
export function startCoachSession() {
  if (started || typeof window === "undefined") return;
  started = true;
  void refresh();
  createClient().auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "SIGNED_OUT") void refresh();
  });
}

export function useCoachSession() {
  const status = useSyncExternalStore(
    subscribe,
    () => state.status,
    () => "loading" as SessionStatus,
  );
  return status;
}
export function useAccount() {
  const email = useSyncExternalStore(subscribe, () => state.email, () => null);
  const slug = useSyncExternalStore(subscribe, () => state.slug, () => null);
  const published = useSyncExternalStore(subscribe, () => state.published, () => false);
  const plan = useSyncExternalStore(subscribe, () => state.plan, () => null);
  return { email, slug, published, plan };
}
export function useSaveState() {
  const saving = useSyncExternalStore(subscribe, () => state.saving, () => false);
  const error = useSyncExternalStore(subscribe, () => state.saveError, () => null);
  return { saving, error };
}

/** Lets the dashboard preview render the public page from unsaved draft data. */
const PreviewContext = createContext<CoachWorkspace | null>(null);
export const CoachWorkspacePreview = PreviewContext.Provider;
export function useCoachWorkspace() {
  const preview = useContext(PreviewContext);
  const live = useSyncExternalStore(
    subscribe,
    () => state.workspace,
    () => defaultWorkspace,
  );
  return preview ?? live;
}

function flush() {
  saveChain = saveChain.then(async () => {
    if (!state.coachId) return;
    set({ saving: true });
    try {
      const result = await pushChanges(
        createClient(),
        state.coachId,
        state.workspace,
        saved,
      );
      saved = result.saved;
      // Uploaded images come back as URLs; keep any edits made while saving.
      if (result.workspace.profile !== state.workspace.profile) {
        state = {
          ...state,
          workspace: {
            ...state.workspace,
            profile: {
              ...state.workspace.profile,
              photograph: result.workspace.profile.photograph,
              logo: result.workspace.profile.logo,
              logoDark: result.workspace.profile.logoDark,
            },
          },
        };
      }
      set({ saving: false, saveError: null });
    } catch (error) {
      set({
        saving: false,
        saveError:
          error instanceof Error
            ? error.message
            : "Your latest change could not be saved.",
      });
    }
  });
  return saveChain;
}

/** Applies an edit immediately and saves it to Supabase shortly after. */
export function updateCoachWorkspace(
  update: (current: CoachWorkspace) => CoachWorkspace,
) {
  state = { ...state, workspace: update(state.workspace) };
  subscribers.forEach((callback) => callback());
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => void flush(), 500);
  return true;
}
/** Saves right now and resolves when the database has the latest edit. */
export function saveCoachWorkspaceNow() {
  clearTimeout(saveTimer);
  return flush().then(() => {
    if (state.saveError) throw new Error(state.saveError);
  });
}

/** Creates the coach record for the signed-in account from the sign-up wizard. */
export async function registerCoach(slug: string, workspace: CoachWorkspace) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Please sign in again.");
  const coach = await createCoach(supabase, data.user.id, slug, workspace);
  saved = snapshotOf(coach.coachId, coach.workspace);
  set({
    status: "ready",
    workspace: coach.workspace,
    coachId: coach.coachId,
    slug: coach.slug,
    published: coach.published,
    email: data.user.email ?? null,
    saving: false,
    saveError: null,
  });
}

/** Makes the public page visible to players, or hides it again. */
export async function setCoachPublished(published: boolean) {
  if (!state.coachId) throw new Error("Please sign in again.");
  const { error } = await createClient()
    .from("coaches")
    .update({ published })
    .eq("id", state.coachId);
  if (error) throw new Error(error.message);
  set({ published });
}

export async function signOutCoach() {
  clearTimeout(saveTimer);
  await createClient().auth.signOut();
  saved = emptySaved();
  set({ ...initial, status: "signed-out" });
}
