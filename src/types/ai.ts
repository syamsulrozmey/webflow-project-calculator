import { z } from "zod";

import {
  CONTENT_COMPLEXITIES,
  DESIGN_COMPLEXITIES,
  FUNCTIONALITY_COMPLEXITIES,
  TECHNICAL_COMPLEXITIES,
  TIMELINE_URGENCY,
  type ComplexityMultipliers,
} from "@/lib/calculator/types";

export const AiMultiplierSchema = z.object({
  design: z.enum(DESIGN_COMPLEXITIES),
  functionality: z.enum(FUNCTIONALITY_COMPLEXITIES),
  content: z.enum(CONTENT_COMPLEXITIES),
  technical: z.enum(TECHNICAL_COMPLEXITIES),
  timeline: z.enum(TIMELINE_URGENCY),
});

export const AiFactorConfidenceSchema = z.object({
  design: z.number().min(0).max(1).optional(),
  functionality: z.number().min(0).max(1).optional(),
  content: z.number().min(0).max(1).optional(),
  technical: z.number().min(0).max(1).optional(),
  timeline: z.number().min(0).max(1).optional(),
});

export const ComplexityInsightSchema = z.object({
  complexityScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1).default(0.5),
  multipliers: AiMultiplierSchema,
  factorConfidences: AiFactorConfidenceSchema.optional(),
  highlights: z.array(z.string().min(6).max(300)).max(6).optional(),
  risks: z.array(z.string().min(6).max(300)).max(6).optional(),
  rationale: z.string().min(6).max(600).optional(),
  source: z.literal("openrouter").default("openrouter"),
});

export type ComplexityInsight = z.infer<typeof ComplexityInsightSchema>;

export type FactorConfidenceMap = Partial<
  Record<keyof ComplexityMultipliers, number>
>;


