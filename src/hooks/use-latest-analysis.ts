"use client";

import { useState } from "react";

import { readLatestAnalysis } from "@/lib/analysis/storage";
import type { AnalysisResult } from "@/types/analysis";

export function useLatestAnalysis(initial?: AnalysisResult | null) {
  const [analysis] = useState<AnalysisResult | null>(() => {
    if (initial) {
      return initial;
    }
    return readLatestAnalysis();
  });

  return analysis;
}

