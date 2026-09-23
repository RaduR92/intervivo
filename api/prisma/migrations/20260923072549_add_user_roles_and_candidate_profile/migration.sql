-- CreateEnum
CREATE TYPE "Role" AS ENUM ('HR', 'CANDIDATE');

-- AlterTable: add nullable first, since "User" already has rows
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "role" "Role";

-- Backfill existing rows so the NOT NULL constraint below can be applied.
-- (Placeholder values only — this project's seed data is throwaway dev
-- fixtures, re-seeded right after this migration.)
UPDATE "User" SET
  "role" = 'HR',
  "firstName" = 'Unknown',
  "lastName" = 'Unknown'
WHERE "role" IS NULL;

-- Now that every row has a value, enforce NOT NULL.
ALTER TABLE "User" ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "role" SET NOT NULL;

-- CreateTable
CREATE TABLE "CandidateProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "currentRole" TEXT,
    "yearsExperience" INTEGER,
    "targetRole" TEXT,
    "resumeUrl" TEXT,
    "notes" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProfile_userId_key" ON "CandidateProfile"("userId");

-- AddForeignKey
ALTER TABLE "CandidateProfile" ADD CONSTRAINT "CandidateProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
