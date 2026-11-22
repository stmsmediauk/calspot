"use client";
import { createContext, useContext } from "react";
import type { Booking } from "@/lib/mock-data";

export type ModalState = {
  kind: "booking" | "club" | "lesson" | "rule" | "exception";
  id?: string;
  /** Pre-filled values for a new record, such as the weekday for a rule. */
  defaults?: Record<string, unknown>;
};
export type AdminContextValue = {
  openModal: (modal: ModalState) => void;
  notify: (message: string) => void;
  decide: (id: string, status: Booking["status"]) => void;
};
export const AdminContext = createContext<AdminContextValue | null>(null);
export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin must be used inside the dashboard.");
  return value;
}
