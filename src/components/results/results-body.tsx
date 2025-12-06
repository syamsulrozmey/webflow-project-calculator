"use client"

import { ResultsExperience } from "@/components/results/results-experience"
import { useWorkspace } from "@/hooks/use-workspace"
import type { CalculationResult } from "@/lib/calculator/types"

export function ResultsBody({ fallbackResult }: { fallbackResult: CalculationResult }) {
  const { calculation, tier } = useWorkspace()
  const result = calculation?.result ?? fallbackResult
  const source = calculation?.source ?? "demo"

  return <ResultsExperience result={result} fallbackSource={source} planTier={tier} />
}

