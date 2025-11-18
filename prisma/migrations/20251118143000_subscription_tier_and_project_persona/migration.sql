-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
ADD COLUMN "subscriptionRenewedAt" TIMESTAMP(3),
ADD COLUMN "subscriptionExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Project"
ADD COLUMN "persona" "UserType";

