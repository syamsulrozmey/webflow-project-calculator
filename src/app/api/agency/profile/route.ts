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
    const parsed = UpsertSchema.parse(json);

    // Build payload excluding undefined values for exactOptionalPropertyTypes compatibility
    const payload: Parameters<typeof upsertAgencyProfile>[1] = {};
    if (parsed.targetMargin !== undefined) payload.targetMargin = parsed.targetMargin;
    if (parsed.desiredMarkup !== undefined) payload.desiredMarkup = parsed.desiredMarkup;
    if (parsed.notes !== undefined) payload.notes = parsed.notes;
    if (parsed.members !== undefined) {
      payload.members = parsed.members.map((m) => ({
        id: m.id ?? crypto.randomUUID(),
        name: m.name,
        role: m.role,
        costRate: m.costRate,
        ...(m.billableRate !== undefined && { billableRate: m.billableRate }),
        ...(m.weeklyCapacity !== undefined && { weeklyCapacity: m.weeklyCapacity }),
        ...(m.utilizationTarget !== undefined && { utilizationTarget: m.utilizationTarget }),
        ...(m.color !== undefined && { color: m.color }),
      }));
    }

    const profile = await upsertAgencyProfile(userId, payload);
    return NextResponse.json({ data: profile });
  } catch (error) {
    return handleApiError(error);
  }
}


