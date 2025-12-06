import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/http";
import { requireProUser, requireUserId } from "@/lib/projects/auth";
import { duplicateProject } from "@/lib/projects/service";

interface RouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const userId = requireUserId(request);
    await requireProUser(userId);
    const { projectId } = await context.params;
    if (!projectId) {
      throw new ApiError("Project id is required", 400);
    }

    const project = await duplicateProject(userId, projectId);
    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

