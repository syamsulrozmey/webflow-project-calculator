import { SubscriptionTier } from "@prisma/client";

import { ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export function requireUserId(request: Request): string {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    throw new ApiError("Missing user identity", 401);
  }
  return userId;
}

export async function requireProUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      subscriptionTier: true,
      subscriptionExpiresAt: true,
    },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isPremium =
    user.subscriptionTier === SubscriptionTier.PRO ||
    user.subscriptionTier === SubscriptionTier.ENTERPRISE;

  const isExpired =
    isPremium &&
    user.subscriptionExpiresAt !== null &&
    user.subscriptionExpiresAt < new Date();

  if (!isPremium || isExpired) {
    throw new ApiError(
      isExpired ? "Subscription expired" : "Pro subscription required",
      402,
    );
  }

  return user;
}

