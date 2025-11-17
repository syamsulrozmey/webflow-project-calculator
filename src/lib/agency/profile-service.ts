import { prisma } from "@/lib/prisma";
import type {
  AgencyTeamMember,
  AgencyTeamState,
} from "@/lib/agency/types";

function serializeMember(member: AgencyTeamMember) {
  return {
    name: member.name,
    role: member.role,
    costRate: member.costRate,
    billableRate: member.billableRate,
    weeklyCapacity: member.weeklyCapacity,
    utilizationTarget: member.utilizationTarget,
    color: member.color,
  };
}

function mapMemberFromDb(member: { [key: string]: unknown }): AgencyTeamMember {
  return {
    id: String(member.id),
    name: String(member.name ?? ""),
    role: String(member.role ?? ""),
    costRate: Number(member.costRate ?? 0),
    billableRate: member.billableRate ? Number(member.billableRate) : undefined,
    weeklyCapacity: member.weeklyCapacity ? Number(member.weeklyCapacity) : undefined,
    utilizationTarget: member.utilizationTarget
      ? Number(member.utilizationTarget)
      : undefined,
    color: typeof member.color === "string" ? member.color : undefined,
  };
}

export async function getAgencyProfile(userId: string): Promise<AgencyTeamState | null> {
  const profile = await prisma.agencyProfile.findUnique({
    where: { userId },
    include: { teamMembers: { orderBy: { createdAt: "asc" } } },
  });
  if (!profile) return null;
  return {
    members: profile.teamMembers.map(mapMemberFromDb),
    targetMargin: profile.targetMargin,
    desiredMarkup: profile.desiredMarkup,
    notes: profile.notes ?? undefined,
  };
}

export async function upsertAgencyProfile(
  userId: string,
  payload: Partial<Omit<AgencyTeamState, "members">> & {
    members?: AgencyTeamMember[];
  },
) {
  const { members, ...settings } = payload;
  const profile = await prisma.agencyProfile.upsert({
    where: { userId },
    create: {
      userId,
      targetMargin: settings.targetMargin ?? 0.3,
      desiredMarkup: settings.desiredMarkup ?? 0.4,
      notes: settings.notes,
      teamMembers: members
        ? {
            create: members.map((member) => ({
              ...serializeMember(member),
            })),
          }
        : undefined,
    },
    update: {
      ...settings,
      ...(members
        ? {
            teamMembers: {
              deleteMany: {},
              create: members.map((member) => serializeMember(member)),
            },
          }
        : {}),
    },
    include: { teamMembers: { orderBy: { createdAt: "asc" } } },
  });

  return {
    members: profile.teamMembers.map(mapMemberFromDb),
    targetMargin: profile.targetMargin,
    desiredMarkup: profile.desiredMarkup,
    notes: profile.notes ?? undefined,
  } satisfies AgencyTeamState;
}


