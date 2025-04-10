/*
  Warnings:

  - The `status` column on the `RoundCampaigns` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[roundId,campaignId]` on the table `RoundCampaigns` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "RecipientStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "RoundCampaigns" ADD COLUMN     "onchainRecipientId" TEXT,
ADD COLUMN     "recipientAddress" TEXT,
ADD COLUMN     "submittedByWalletAddress" TEXT,
ADD COLUMN     "txHash" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "RecipientStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "RoundCampaigns_roundId_campaignId_key" ON "RoundCampaigns"("roundId", "campaignId");
