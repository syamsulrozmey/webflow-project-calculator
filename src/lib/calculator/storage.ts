"use client";

import type { SupportedCurrency } from "@/lib/calculator/from-answers";
import type { CalculationResult } from "@/lib/calculator/types";

const STORAGE_KEY = "wpc-last-calculation";

export interface CalculationMeta {
  hourlyRate: number;
  currency: SupportedCurrency;
  margin: number;
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
    return JSON.parse(raw) as StoredCalculation;
  } catch (error) {
    console.warn("Failed to parse stored calculation result", error);
    return null;
  }
}


