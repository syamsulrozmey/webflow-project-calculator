const USER_ID_STORAGE_KEY = "wpc-user-id";

/**
 * Retrieves a stable user id for client-side API calls.
 * Prefers localStorage, then NEXT_PUBLIC_MOCK_USER_ID (for dev/testing).
 */
export function resolveClientUserId(): string | null {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(USER_ID_STORAGE_KEY);
    if (stored) {
      return stored;
    }
    const envId = process.env.NEXT_PUBLIC_MOCK_USER_ID ?? null;
    if (envId) {
      window.localStorage.setItem(USER_ID_STORAGE_KEY, envId);
      return envId;
    }
    return null;
  }

  return process.env.NEXT_PUBLIC_MOCK_USER_ID ?? null;
}

export function assertClientUserId(): string {
  const userId = resolveClientUserId();
  if (!userId) {
    throw new Error(
      "No user id configured for API calls. Set NEXT_PUBLIC_MOCK_USER_ID or populate localStorage.",
    );
  }
  return userId;
}

