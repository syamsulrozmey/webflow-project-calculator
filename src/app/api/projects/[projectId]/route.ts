import { NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/http";
import { requireProUser, requireUserId } from "@/lib/projects/auth";
import { deleteProject, getProject, updateProject } from "@/lib/projects/service";
import { ProjectWriteSchema } from "@/lib/projects/validation";

interface RouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const userId = requireUserId(request);
    await requireProUser(userId);
    const projectId = await requireProjectId(context);

    const project = await getProject(userId, projectId);
    return NextResponse.json({ data: project });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const userId = requireUserId(request);
    await requireProUser(userId);
    const projectId = await requireProjectId(context);

    const json = await request.json().catch(() => {
      throw new ApiError("Invalid JSON body", 400);
    });
    const payload = ProjectWriteSchema.parse(json);
    const project = await updateProject(userId, projectId, payload);

    return NextResponse.json({ data: project });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const userId = requireUserId(request);
    await requireProUser(userId);
    const projectId = await requireProjectId(context);

    await deleteProject(userId, projectId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}

async function requireProjectId(context: RouteContext) {
  const { projectId } = await context.params;
  if (!projectId) {
    throw new ApiError("Project id is required", 400);
  }
  return projectId;
}

