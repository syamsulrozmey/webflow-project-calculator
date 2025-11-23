"use client";

import type { SupportedCurrency } from "@/lib/calculator/from-answers";
import type { AgencyRateSummary } from "@/lib/agency/types";
import type { CalculationResult } from "@/lib/calculator/types";

const STORAGE_KEY = "wpc-last-calculation";

export interface CalculationMeta {
  hourlyRate: number;
  currency: SupportedCurrency;
  margin: number;
  internalHourlyRate?: number;
  agencyRateSummary?: AgencyRateSummary;
}

export interface StoredCalculation {
  result: CalculationResult;
  recordedAt: number;
  source?: "questionnaire" | "analysis" | "demo";
  meta?: CalculationMeta;
}

export function saveCalculationResult(payload: StoredCalculation) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Failed to store calculation result", error);
  }
}

export function loadCalculationResult(): StoredCalculation | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredCalculation;
    if (parsed?.result) {
      parsed.result = hydrateLegacyResult(parsed.result);
    }
    return parsed;
  } catch (error) {
    console.warn("Failed to parse stored calculation result", error);
    return null;
  }
}

function hydrateLegacyResult(result: CalculationResult): CalculationResult {
  const next = { ...result };
  if (typeof next.productionHours !== "number") {
    const total = typeof result.totalHours === "number" ? result.totalHours : 0;
    const maintenance = typeof result.maintenanceHours === "number" ? result.maintenanceHours : 0;
    next.productionHours = Math.max(0, total - maintenance);
  }
  if (typeof next.bufferHours !== "number") {
    next.bufferHours = 0;
  }
  if (typeof next.bufferCost !== "number") {
    next.bufferCost = 0;
  }
  if (typeof next.bufferPercentage !== "number") {
    next.bufferPercentage = 0.2;
  }
  if (!next.complexity) {
    next.complexity = {
      total: 0,
      tier: "starter",
      bufferPercentage: next.bufferPercentage,
      categories: [],
    };
  } else if (typeof next.complexity.bufferPercentage !== "number") {
    next.complexity = {
      ...next.complexity,
      bufferPercentage: next.bufferPercentage,
    };
  }
  if (!Array.isArray((next as Partial<CalculationResult>).addons)) {
    next.addons = [];
  }
  if (!Array.isArray((next as Partial<CalculationResult>).retainers)) {
    next.retainers = [];
  }
  return next;
}


