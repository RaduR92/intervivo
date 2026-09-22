-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN "previousTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_previousTokenHash_key" ON "RefreshToken"("previousTokenHash");
