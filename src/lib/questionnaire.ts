import type {
  EntryFlow,
  QuestionDefinition,
  QuestionnaireAnswer,
  QuestionnaireSection,
  QuestionnaireUserType,
  VisibilityCondition,
} from "@/config/questionnaire";

export const QUESTIONNAIRE_STORAGE_KEY = "wpc-questionnaire-progress-v1";

export type QuestionnaireAnswerMap = Record<string, QuestionnaireAnswer>;

export interface StoredQuestionnaireState {
  answers: QuestionnaireAnswerMap;
  skipped?: Record<string, boolean>;
  showAdvanced?: Record<string, boolean>;
  entry?: EntryFlow | null;
  userType?: QuestionnaireUserType | null;
  sessionId?: string | null;
  touched?: Record<string, boolean>;
  timestamp: number;
}

export function evaluateVisibility(
  question: QuestionDefinition,
  answers: QuestionnaireAnswerMap,
): boolean {
  if (!question.visibleWhen || question.visibleWhen.length === 0) {
    return true;
  }

  return question.visibleWhen.every((rule) =>
    checkCondition(rule, answers[rule.questionId]),
  );
}

function checkCondition(
  condition: VisibilityCondition,
  value: QuestionnaireAnswer,
): boolean {
  if (value === undefined) {
    return false;
  }

  switch (condition.kind) {
    case "equals":
      return value === condition.value;
    case "notEquals":
      return value !== condition.value;
    case "includes":
      return Array.isArray(value) && value.includes(condition.value);
    default:
      return true;
  }
}

export function isQuestionAnswered(
  question: QuestionDefinition,
  answer: QuestionnaireAnswer,
): boolean {
  if (question.type === "multi") {
    return Array.isArray(answer) && answer.length > 0;
  }
  if (question.type === "scale") {
    return typeof answer === "number";
  }
  if (question.type === "toggle") {
    return typeof answer === "boolean";
  }
  if (question.type === "text") {
    return typeof answer === "string" && answer.trim().length > 0;
  }
  return answer !== undefined && answer !== null && answer !== "";
}

export function buildDefaultAnswers(
  sections: QuestionnaireSection[],
  userType?: QuestionnaireUserType | null,
): QuestionnaireAnswerMap {
  return sections.reduce<QuestionnaireAnswerMap>((acc, section) => {
    section.questions.forEach((question) => {
      const userDefault =
        (userType && question.defaultsByUserType?.[userType]) ?? undefined;
      if (userDefault !== undefined) {
        acc[question.id] = userDefault;
        return;
      }
      if (question.defaultValue !== undefined) {
        acc[question.id] = question.defaultValue;
      }
    });
    return acc;
  }, {});
}

