"use client";

import { useEffect, useState } from "react";

import { readLatestAnalysis } from "@/lib/analysis/storage";
import type { AnalysisResult } from "@/types/analysis";

export function useLatestAnalysis(initial?: AnalysisResult | null) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(initial ?? null);

  useEffect(() => {
    setAnalysis(readLatestAnalysis());
  }, []);

  return analysis;
}

