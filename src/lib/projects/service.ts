import { Prisma, ProjectFlow, UserType } from "@prisma/client";

import type {
  EntryFlow,
  QuestionnaireAnswer,
  QuestionnaireAnswerMap,
  QuestionnaireUserType,
} from "@/config/questionnaire";
import type { SupportedCurrency } from "@/lib/calculator/from-answers";
import { ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { ProjectWritePayload } from "@/lib/projects/validation";
import type { ProjectDetail, ProjectSummary } from "@/lib/projects/types";

const FLOW_TO_MODEL: Record<EntryFlow, ProjectFlow> = {
  fresh: ProjectFlow.FRESH,
  existing: ProjectFlow.EXISTING,
};

const FLOW_FROM_MODEL: Record<ProjectFlow, EntryFlow> = {
  [ProjectFlow.FRESH]: "fresh",
  [ProjectFlow.EXISTING]: "existing",
};

const PERSONA_TO_MODEL: Record<QuestionnaireUserType, UserType> = {
  freelancer: UserType.FREELANCER,
  agency: UserType.AGENCY,
  company: UserType.COMPANY,
};

const PERSONA_FROM_MODEL: Record<UserType, QuestionnaireUserType> = {
  [UserType.FREELANCER]: "freelancer",
  [UserType.AGENCY]: "agency",
  [UserType.COMPANY]: "company",
};

type TxClient = Prisma.TransactionClient;

export async function listProjects(userId: string): Promise<ProjectSummary[]> {
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: SUMMARY_SELECT,
  });

  return projects.map(mapProjectSummary);
}

export async function getProject(
  userId: string,
  projectId: string,
): Promise<ProjectDetail> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      responses: true,
    },
  });

  if (!project) {
    throw new ApiError("Project not found", 404);
  }

  return mapProjectDetail(project);
}

export async function createProject(
  userId: string,
  payload: ProjectWritePayload,
): Promise<ProjectDetail> {
  const projectId = await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        userId,
        title: sanitizeTitle(payload.title),
        status: payload.status ?? "draft",
        flow: FLOW_TO_MODEL[payload.flow],
        persona: payload.persona ? PERSONA_TO_MODEL[payload.persona] : null,
        hourlyRate: payload.hourlyRate ?? null,
        currency: formatCurrencyForStore(payload.currency),
        notes: sanitizeNotes(payload.notes),
      },
    });

    await replaceResponses(tx, project.id, payload.answers);

    return project.id;
  });

  return getProject(userId, projectId);
}

export async function updateProject(
  userId: string,
  projectId: string,
  payload: ProjectWritePayload,
): Promise<ProjectDetail> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true },
    });

    if (!existing) {
      throw new ApiError("Project not found", 404);
    }

    await tx.project.update({
      where: { id: projectId },
      data: {
        title: sanitizeTitle(payload.title),
        status: payload.status ?? "draft",
        flow: FLOW_TO_MODEL[payload.flow],
        persona: payload.persona ? PERSONA_TO_MODEL[payload.persona] : null,
        hourlyRate: payload.hourlyRate ?? null,
        currency: formatCurrencyForStore(payload.currency),
        notes: sanitizeNotes(payload.notes),
      },
    });

    await replaceResponses(tx, projectId, payload.answers);
  });

  return getProject(userId, projectId);
}

export async function deleteProject(userId: string, projectId: string) {
  const existing = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError("Project not found", 404);
  }

  await prisma.project.delete({
    where: { id: projectId },
  });
}

export async function duplicateProject(
  userId: string,
  projectId: string,
): Promise<ProjectDetail> {
  const newProjectId = await prisma.$transaction(async (tx) => {
    const project = await tx.project.findFirst({
      where: { id: projectId, userId },
      include: { responses: true },
    });

    if (!project) {
      throw new ApiError("Project not found", 404);
    }

    const clone = await tx.project.create({
      data: {
        userId,
        title: buildCopyTitle(project.title),
        status: "draft",
        flow: project.flow,
        persona: project.persona,
        hourlyRate: project.hourlyRate,
        currency: project.currency,
        notes: project.notes,
      },
    });

    const existingAnswers = buildAnswerMap(project.responses);
    await replaceResponses(tx, clone.id, existingAnswers);

    return clone.id;
  });

  return getProject(userId, newProjectId);
}

const SUMMARY_SELECT = {
  id: true,
  title: true,
  status: true,
  flow: true,
  persona: true,
  hourlyRate: true,
  currency: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProjectSelect;

type ProjectSummaryRecord = Prisma.ProjectGetPayload<{ select: typeof SUMMARY_SELECT }>;

type ProjectWithResponses = Prisma.ProjectGetPayload<{
  include: { responses: true };
}>;

function mapProjectSummary(project: ProjectSummaryRecord): ProjectSummary {
  return {
    id: project.id,
    title: project.title,
    status: project.status,
    flow: FLOW_FROM_MODEL[project.flow],
    persona: project.persona ? PERSONA_FROM_MODEL[project.persona] : null,
    hourlyRate: project.hourlyRate ? project.hourlyRate.toNumber() : null,
    currency: normalizeCurrency(project.currency),
    notes: project.notes ?? null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

function mapProjectDetail(project: ProjectWithResponses): ProjectDetail {
  return {
    ...mapProjectSummary(project),
    answers: buildAnswerMap(project.responses),
  };
}

async function replaceResponses(
  tx: TxClient,
  projectId: string,
  answers: QuestionnaireAnswerMap,
) {
  await tx.projectResponse.deleteMany({ where: { projectId } });
  const records = buildResponseRecords(projectId, answers);
  if (records.length > 0) {
    await tx.projectResponse.createMany({
      data: records,
    });
  }
}

function buildResponseRecords(
  projectId: string,
  answers: QuestionnaireAnswerMap,
) {
  return Object.entries(answers ?? {}).reduce<Prisma.ProjectResponseCreateManyInput[]>(
    (records, [questionKey, value]) => {
      if (value === undefined) {
        return records;
      }
      records.push({
        projectId,
        questionKey,
        answer: toJsonValue(value),
        answerType: detectAnswerType(value),
      });
      return records;
    },
    [],
  );
}

function buildAnswerMap(
  responses: { questionKey: string; answer: Prisma.JsonValue }[],
): QuestionnaireAnswerMap {
  return responses.reduce<QuestionnaireAnswerMap>((acc, response) => {
    acc[response.questionKey] = fromJsonValue(response.answer);
    return acc;
  }, {});
}

function normalizeCurrency(currency?: string | null): SupportedCurrency {
  const safe = currency?.toLowerCase();
  if (safe === "eur" || safe === "gbp" || safe === "usd") {
    return safe as SupportedCurrency;
  }
  return "usd";
}

function formatCurrencyForStore(currency?: SupportedCurrency) {
  return (currency ?? "usd").toUpperCase();
}

function sanitizeTitle(title: string) {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    return "Untitled Project";
  }
  return trimmed.slice(0, 140);
}

function sanitizeNotes(notes?: string | null) {
  if (!notes) {
    return null;
  }
  const trimmed = notes.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return trimmed.slice(0, 2000);
}

function detectAnswerType(value: QuestionnaireAnswer | undefined) {
  if (value === undefined || value === null) {
    return null;
  }
  if (Array.isArray(value)) {
    return "array";
  }
  return typeof value;
}

function toJsonValue(value: QuestionnaireAnswer): Prisma.InputJsonValue {
  if (value === null) {
    return Prisma.JsonNull;
  }
  return value as Prisma.InputJsonValue;
}

function fromJsonValue(value: Prisma.JsonValue): QuestionnaireAnswer {
  if (value === null || value === Prisma.JsonNull) {
    return null;
  }
  if (Array.isArray(value)) {
    return value as string[];
  }
  if (typeof value === "object") {
    return value as unknown as QuestionnaireAnswer;
  }
  return value as QuestionnaireAnswer;
}

export function buildCopyTitle(title: string) {
  const trimmed = title.trim();
  const base = trimmed.length === 0 ? "Untitled Project" : trimmed;
  const copySuffixPattern = /\(Copy(?: (\d+))?\)$/i;
  const match = base.match(copySuffixPattern);
  if (!match) {
    return `${base} (Copy)`;
  }
  const count = match[1] ? Number(match[1]) : 1;
  const nextCount = Number.isNaN(count) ? 2 : count + 1;
  return base.replace(copySuffixPattern, `(Copy ${nextCount})`);
}

