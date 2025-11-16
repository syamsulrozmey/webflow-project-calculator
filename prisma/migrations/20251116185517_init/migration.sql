-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('FREELANCER', 'AGENCY', 'COMPANY');

-- CreateEnum
CREATE TYPE "ProjectFlow" AS ENUM ('FRESH', 'EXISTING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "hourlyRate" DECIMAL(8,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "flow" "ProjectFlow" NOT NULL,
    "hourlyRate" DECIMAL(8,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectResponse" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "answerType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostCalculation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "totalHours" DECIMAL(8,2) NOT NULL,
    "totalCost" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "breakdown" JSONB NOT NULL,
    "aiEnhanced" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostCalculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawlResult" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "url" TEXT NOT NULL,
    "urlHash" TEXT NOT NULL,
    "resultData" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "CrawlResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Project_flow_status_idx" ON "Project"("flow", "status");

-- CreateIndex
CREATE INDEX "ProjectResponse_projectId_idx" ON "ProjectResponse"("projectId");

-- CreateIndex
CREATE INDEX "ProjectResponse_questionKey_idx" ON "ProjectResponse"("questionKey");

-- CreateIndex
CREATE INDEX "CostCalculation_projectId_idx" ON "CostCalculation"("projectId");

-- CreateIndex
CREATE INDEX "CostCalculation_createdAt_idx" ON "CostCalculation"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CrawlResult_urlHash_key" ON "CrawlResult"("urlHash");

-- CreateIndex
CREATE INDEX "CrawlResult_projectId_idx" ON "CrawlResult"("projectId");

-- CreateIndex
CREATE INDEX "CrawlResult_urlHash_idx" ON "CrawlResult"("urlHash");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectResponse" ADD CONSTRAINT "ProjectResponse_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCalculation" ADD CONSTRAINT "CostCalculation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawlResult" ADD CONSTRAINT "CrawlResult_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
