import { Prisma, ProjectFlow, UserType } from "@prisma/client";

import { duplicateProject, buildCopyTitle } from "@/lib/projects/service";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => {
  const transactionClient = {
    project: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    projectResponse: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  const prismaMock = {
    $transaction: jest.fn((fn: (tx: typeof transactionClient) => unknown) =>
      fn(transactionClient),
    ),
    project: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    projectResponse: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  (prismaMock as Record<string, unknown>).__tx = transactionClient;

  return { prisma: prismaMock };
});

const tx = (prisma as unknown as { __tx: any }).__tx;

describe("project service helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tx.project.findFirst.mockReset();
    tx.project.create.mockReset();
    tx.projectResponse.deleteMany.mockReset();
    tx.projectResponse.createMany.mockReset();
    (prisma.project.findFirst as jest.Mock).mockReset();
  });

  it("increments copy titles predictably", () => {
    expect(buildCopyTitle("Landing Page")).toBe("Landing Page (Copy)");
    expect(buildCopyTitle("Landing Page (Copy)")).toBe("Landing Page (Copy 2)");
    expect(buildCopyTitle("Landing Page (Copy 3)")).toBe("Landing Page (Copy 4)");
    expect(buildCopyTitle("")).toBe("Untitled Project (Copy)");
  });

  it("duplicates a project and preserves answers", async () => {
    const originalResponses = [
      {
        id: "resp_1",
        projectId: "proj_1",
        questionKey: "project_type",
        answer: "landing",
      },
      {
        id: "resp_2",
        projectId: "proj_1",
        questionKey: "hourly_rate",
        answer: 125,
      },
    ];

    tx.project.findFirst.mockResolvedValueOnce({
      id: "proj_1",
      userId: "user_1",
      title: "Landing Page",
      status: "draft",
      flow: ProjectFlow.FRESH,
      persona: UserType.FREELANCER,
      hourlyRate: new Prisma.Decimal(120),
      currency: "USD",
      notes: null,
      responses: originalResponses,
    });

    tx.project.create.mockResolvedValue({
      id: "proj_2",
      title: "Landing Page (Copy)",
    });

    tx.projectResponse.deleteMany.mockResolvedValue({ count: 0 });
    tx.projectResponse.createMany.mockResolvedValue({
      count: originalResponses.length,
    });

    (prisma.project.findFirst as jest.Mock).mockResolvedValue({
      id: "proj_2",
      userId: "user_1",
      title: "Landing Page (Copy)",
      status: "draft",
      flow: ProjectFlow.FRESH,
      persona: UserType.FREELANCER,
      hourlyRate: new Prisma.Decimal(120),
      currency: "USD",
      notes: null,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-02"),
      responses: originalResponses.map((response) => ({
        ...response,
        projectId: "proj_2",
      })),
    });

    const detail = await duplicateProject("user_1", "proj_1");

    expect(tx.project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Landing Page (Copy)",
          flow: ProjectFlow.FRESH,
          persona: UserType.FREELANCER,
          userId: "user_1",
        }),
      }),
    );
    expect(tx.projectResponse.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ questionKey: "project_type" }),
        ]),
      }),
    );
    expect(detail.id).toBe("proj_2");
    expect(detail.answers.project_type).toBe("landing");
    expect(detail.answers.hourly_rate).toBe(125);
  });
});

