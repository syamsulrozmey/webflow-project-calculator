"use client";

import type { AnalysisResult } from "@/types/analysis";

const LATEST_ANALYSIS_KEY = "wpc-latest-analysis-v1";

export function saveLatestAnalysis(result: AnalysisResult) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LATEST_ANALYSIS_KEY, JSON.stringify(result));
  } catch {
    // noop — storage may be unavailable (Safari private mode, etc.)
  }
}

export function readLatestAnalysis(): AnalysisResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LATEST_ANALYSIS_KEY);
    return raw ? (JSON.parse(raw) as AnalysisResult) : null;
  } catch {
    return null;
  }
}

export function clearLatestAnalysis() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LATEST_ANALYSIS_KEY);
  } catch {
    // ignore
  }
}

