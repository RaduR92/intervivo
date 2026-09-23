-- DropIndex
DROP INDEX "Feedback_sessionId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_sessionId_authorId_key" ON "Feedback"("sessionId", "authorId");
