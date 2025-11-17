"use client";

import type { AgencyTeamState } from "@/lib/agency/types";

const STORAGE_KEY = "wpc-agency-team";

interface StoredConfigMap {
  [sessionId: string]: {
    state: AgencyTeamState;
    updatedAt: number;
  };
}

export function loadAgencyState(sessionId?: string | null): AgencyTeamState | null {
  if (typeof window === "undefined") return null;
  if (!sessionId) return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredConfigMap;
    return parsed[sessionId]?.state ?? null;
  } catch (error) {
    console.warn("Failed to parse agency state", error);
    return null;
  }
}

export function persistAgencyState(
  sessionId: string | null,
  next: AgencyTeamState,
): AgencyTeamState | null {
  if (typeof window === "undefined") return null;
  if (!sessionId) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredConfigMap) : {};
    parsed[sessionId] = { state: next, updatedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return next;
  } catch (error) {
    console.warn("Failed to persist agency state", error);
    return null;
  }
}

export function clearAgencyState(sessionId?: string | null) {
  if (typeof window === "undefined") return;
  if (!sessionId) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as StoredConfigMap;
    delete parsed[sessionId];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.warn("Failed to clear agency state", error);
  }
}


