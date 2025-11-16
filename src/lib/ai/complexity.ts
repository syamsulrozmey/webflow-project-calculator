import { z } from "zod";

import type { EntryFlow, QuestionnaireUserType } from "@/config/questionnaire";
import type { ProjectType } from "@/lib/calculator/types";
import { callOpenRouterChat } from "@/lib/openrouter";
import { ApiError } from "@/lib/http";
import {
  ComplexityInsightSchema,
  type ComplexityInsight,
} from "@/types/ai";

const promptInputSchema = z.object({
  projectType: z.string(),
  summary: z.string(),
  features: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  signals: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  entry: z.string().optional(),
  userType: z.string().optional(),
});

export interface ComplexityPromptInput {
  projectType: ProjectType;
  summary: string;
  features?: string[];
  constraints?: string[];
  signals?: Record<string, number | string>;
  entry?: EntryFlow | null;
  userType?: QuestionnaireUserType | null;
}

const SYSTEM_PROMPT = `You are an AI estimation strategist specialized in Webflow projects.
Return only strict JSON. Never include commentary outside JSON.
Use the provided questionnaire summary to estimate scope complexity and recommend multipliers that map to the calculator enums.`;

function buildUserPrompt(payload: ComplexityPromptInput): string {
  const safePayload = promptInputSchema.parse({
    ...payload,
    projectType: payload.projectType,
    entry: payload.entry,
    userType: payload.userType,
  });

  const sections = [
    `Project Type: ${safePayload.projectType}`,
    safePayload.entry ? `Entry Flow: ${safePayload.entry}` : null,
    safePayload.userType ? `User Type: ${safePayload.userType}` : null,
    `Summary: ${safePayload.summary}`,
    safePayload.features && safePayload.features.length
      ? `Key Features:\n- ${safePayload.features.join("\n- ")}`
      : null,
    safePayload.constraints && safePayload.constraints.length
      ? `Constraints:\n- ${safePayload.constraints.join("\n- ")}`
      : null,
    safePayload.signals && Object.keys(safePayload.signals).length
      ? `Signals:\n${Object.entries(safePayload.signals)
          .map(([key, value]) => `- ${key}: ${value}`)
          .join("\n")}`
      : null,
  ].filter(Boolean);

  const instructions = `Respond with JSON using this shape:
{
  "complexityScore": number (0-100),
  "confidence": number between 0 and 1,
  "multipliers": {
    "design": "minimal|standard|custom|immersive",
    "functionality": "basic|enhanced|advanced|enterprise",
    "content": "existing|mixed|net_new|multilingual",
    "technical": "basic|integrations|complex|regulated",
    "timeline": "relaxed|standard|rush|critical"
  },
  "factorConfidences": {
    "design": number 0-1,
    "functionality": number 0-1,
    "content": number 0-1,
    "technical": number 0-1,
    "timeline": number 0-1
  },
  "highlights": ["string"],
  "risks": ["string"],
  "rationale": "short explanation",
  "source": "openrouter"
}`;

  return `${sections.join("\n\n")}\n\n${instructions}`;
}

export async function requestComplexityInsight(
  payload: ComplexityPromptInput,
): Promise<ComplexityInsight> {
  try {
    const response = await callOpenRouterChat({
      model: "anthropic/claude-3.5-haiku",
      temperature: 0.15,
      maxTokens: 800,
      responseFormat: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(payload) },
      ],
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(response);
    } catch (error) {
      throw new ApiError(
        "AI response was not valid JSON.",
        502,
        error instanceof Error ? error.message : response,
      );
    }

    return ComplexityInsightSchema.parse(parsed);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Unable to fetch AI complexity insight.",
      502,
      error instanceof Error ? error.message : error,
    );
  }
}


