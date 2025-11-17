import type { EntryFlow, QuestionnaireUserType } from "@/config/questionnaire";

const USER_CONTEXT_STORAGE_KEY = "wpc-user-context";

export interface UserContextSnapshot {
  entry?: EntryFlow | null;
  userType?: QuestionnaireUserType | null;
  sessionId?: string | null;
}

export function readUserContext(): UserContextSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(USER_CONTEXT_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as UserContextSnapshot) : null;
  } catch {
    return null;
  }
}

export function saveUserContext(
  partial: Partial<UserContextSnapshot>,
): UserContextSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const existing = readUserContext() ?? {};
    const next: UserContextSnapshot = { ...existing, ...partial };
    window.localStorage.setItem(USER_CONTEXT_STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return null;
  }
}

export function clearUserContext() {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(USER_CONTEXT_STORAGE_KEY);
  } catch {
    // ignore
  }
}


