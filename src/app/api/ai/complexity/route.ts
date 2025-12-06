import { NextResponse } from "next/server";
import { z } from "zod";

import type { QuestionnaireUserType, EntryFlow } from "@/config/questionnaire";
import { requestComplexityInsight } from "@/lib/ai/complexity";
import { PROJECT_TYPES } from "@/lib/calculator/types";
import { ApiError, handleApiError } from "@/lib/http";
import { rateLimitByKey } from "@/lib/rate-limit";

const ENTRY_ENUM = ["fresh", "existing"] as const satisfies EntryFlow[];
const USER_ENUM = ["freelancer", "agency", "company"] as const satisfies QuestionnaireUserType[];

const ComplexityRequestSchema = z.object({
  projectType: z.enum(PROJECT_TYPES),
  summary: z.string().min(40, "Provide at least a few sentences for AI analysis.").max(2000),
  features: z.array(z.string().min(3).max(180)).max(20).optional(),
  constraints: z.array(z.string().min(3).max(180)).max(12).optional(),
  signals: z
    .record(
      z.string().min(1).max(40),
      z.union([z.number().finite(), z.string().min(1).max(140)]),
    )
    .optional()
    .refine(
      (value) => !value || Object.keys(value).length <= 20,
      { message: "Provide at most 20 signal entries." },
    ),
  entry: z.enum(ENTRY_ENUM).optional(),
  userType: z.enum(USER_ENUM).optional(),
});

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "anonymous";
    const limit = await rateLimitByKey(`ai:complexity:${ip}`, 5, 60);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "AI rate limit reached. Try again in a minute." },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => {
      throw new ApiError("Invalid JSON body", 400);
    });
    const parsed = ComplexityRequestSchema.parse(body);
    const insight = await requestComplexityInsight({
      ...parsed,
      features: parsed.features ?? [],
      constraints: parsed.constraints ?? [],
      signals: parsed.signals ?? {},
      entry: parsed.entry ?? null,
      userType: parsed.userType ?? null,
    });

    return NextResponse.json({ data: insight });
  } catch (error) {
    return handleApiError(error);
  }
}


