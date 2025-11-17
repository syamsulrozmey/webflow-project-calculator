import { NextResponse } from "next/server";
import { z } from "zod";

import { getAgencyProfile, upsertAgencyProfile } from "@/lib/agency/profile-service";
import { ApiError, handleApiError } from "@/lib/http";

const UpsertSchema = z.object({
  targetMargin: z.number().min(0.05).max(0.8).optional(),
  desiredMarkup: z.number().min(0).max(1).optional(),
  notes: z.string().max(600).optional(),
  members: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        role: z.string().min(1),
        costRate: z.number().min(0),
        billableRate: z.number().min(0).optional(),
        weeklyCapacity: z.number().min(0).max(80).optional(),
        utilizationTarget: z.number().min(0).max(1).optional(),
        color: z.string().max(12).optional(),
      }),
    )
    .max(20)
    .optional(),
});

function requireUserId(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    throw new ApiError("Missing user identity", 401);
  }
  return userId;
}

export async function GET(request: Request) {
  try {
    const userId = requireUserId(request);
    const profile = await getAgencyProfile(userId);
    if (!profile) {
      return NextResponse.json({ data: null }, { status: 200 });
    }
    return NextResponse.json({ data: profile });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const userId = requireUserId(request);
    const json = await request.json().catch(() => {
      throw new ApiError("Invalid JSON body", 400);
    });
    const payload = UpsertSchema.parse(json);
    const profile = await upsertAgencyProfile(userId, payload);
    return NextResponse.json({ data: profile });
  } catch (error) {
    return handleApiError(error);
  }
}


