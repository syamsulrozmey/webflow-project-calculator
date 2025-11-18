import type {
  EntryFlow,
  QuestionnaireAnswerMap,
  QuestionnaireUserType,
} from "@/config/questionnaire";
import type { SupportedCurrency } from "@/lib/calculator/from-answers";

export interface ProjectSummary {
  id: string;
  title: string;
  status: string;
  flow: EntryFlow;
  persona: QuestionnaireUserType | null;
  hourlyRate: number | null;
  currency: SupportedCurrency;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail extends ProjectSummary {
  answers: QuestionnaireAnswerMap;
}

export interface ProjectRequestPayload {
  title: string;
  status?: string;
  flow: EntryFlow;
  persona?: QuestionnaireUserType | null;
  hourlyRate?: number | null;
  currency: SupportedCurrency;
  notes?: string | null;
  answers: QuestionnaireAnswerMap;
}

