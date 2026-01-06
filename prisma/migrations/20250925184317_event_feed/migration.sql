/*
  Warnings:

  - You are about to drop the column `isKycCompleted` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isKycCompleted";

-- CreateTable
CREATE TABLE "EventFeed" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,

    CONSTRAINT "EventFeed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventFeed_receiverId_createdAt_idx" ON "EventFeed"("receiverId", "createdAt");

-- CreateIndex
CREATE INDEX "EventFeed_receiverId_type_idx" ON "EventFeed"("receiverId", "type");

-- AddForeignKey
ALTER TABLE "EventFeed" ADD CONSTRAINT "EventFeed_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFeed" ADD CONSTRAINT "EventFeed_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
