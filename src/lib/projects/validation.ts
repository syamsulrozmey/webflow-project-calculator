import { z } from "zod";

import type { EntryFlow, QuestionnaireUserType } from "@/config/questionnaire";
import type { SupportedCurrency } from "@/lib/calculator/from-answers";

const FLOW_VALUES = ["fresh", "existing"] as const satisfies EntryFlow[];
const PERSONA_VALUES = ["freelancer", "agency", "company"] as const satisfies QuestionnaireUserType[];
const CURRENCY_VALUES = ["usd", "eur", "gbp"] as const satisfies SupportedCurrency[];

const AnswerValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.null(),
]);

export const ProjectWriteSchema = z.object({
  title: z.string().min(1).max(140),
  status: z.string().min(1).max(32).default("draft"),
  flow: z.enum(FLOW_VALUES),
  persona: z.enum(PERSONA_VALUES).optional(),
  hourlyRate: z.number().min(0).max(2000).optional(),
  currency: z.enum(CURRENCY_VALUES).default("usd"),
  notes: z.string().max(2000).optional().nullable(),
  answers: z.record(z.string(), AnswerValueSchema).default({}),
});

export type ProjectWritePayload = z.infer<typeof ProjectWriteSchema>;

