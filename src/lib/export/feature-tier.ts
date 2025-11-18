const FEATURE_TIER_STORAGE_KEY = "wpc-feature-tier";
const KNOWN_FEATURE_TIERS = ["free", "pro", "enterprise"] as const;

export type FeatureTier = (typeof KNOWN_FEATURE_TIERS)[number];

function coerceTier(value?: string | null): FeatureTier | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  return KNOWN_FEATURE_TIERS.find((tier) => tier === normalized) ?? null;
}

function readEnvTier(): FeatureTier | null {
  return coerceTier(process.env.NEXT_PUBLIC_FEATURE_TIER ?? null);
}

function readStoredTier(): FeatureTier | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(FEATURE_TIER_STORAGE_KEY);
    return coerceTier(raw);
  } catch {
    return null;
  }
}

export function getFeatureTier(): FeatureTier {
  const stored = readStoredTier();
  if (stored) {
    return stored;
  }
  return readEnvTier() ?? "free";
}

export function setFeatureTier(tier: FeatureTier) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(FEATURE_TIER_STORAGE_KEY, tier);
  } catch {
    // ignore
  }
}

export function isFreeTier(tier: FeatureTier): boolean {
  return tier === "free";
}


