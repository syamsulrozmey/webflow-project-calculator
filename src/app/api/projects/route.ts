import { NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/http";
import { requireProUser, requireUserId } from "@/lib/projects/auth";
import { createProject, listProjects } from "@/lib/projects/service";
import { ProjectWriteSchema } from "@/lib/projects/validation";

export async function GET(request: Request) {
  try {
    const userId = requireUserId(request);
    await requireProUser(userId);

    const projects = await listProjects(userId);
    return NextResponse.json({ data: projects });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = requireUserId(request);
    await requireProUser(userId);

    const json = await request.json().catch(() => {
      throw new ApiError("Invalid JSON body", 400);
    });
    const payload = ProjectWriteSchema.parse(json);
    const project = await createProject(userId, payload);

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

