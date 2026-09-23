-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('TECHNICAL', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'CASE_STUDY', 'CULTURE_FIT');

-- AlterEnum
ALTER TYPE "InterviewStatus" ADD VALUE 'IN_PROGRESS';

-- AlterTable: add nullable first, since "InterviewSession" already has rows
ALTER TABLE "InterviewSession" ADD COLUMN     "type" "InterviewType";

-- Backfill existing rows (dev fixture data) so NOT NULL can be enforced below.
UPDATE "InterviewSession" SET "type" = 'TECHNICAL' WHERE "type" IS NULL;

-- Now that every row has a value, enforce NOT NULL.
ALTER TABLE "InterviewSession" ALTER COLUMN "type" SET NOT NULL;
