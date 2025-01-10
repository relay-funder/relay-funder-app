/*
  Warnings:

  - You are about to drop the column `createdAt` on the `CampaignImage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[campaignAddress]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'draft';

-- AlterTable
ALTER TABLE "CampaignImage" DROP COLUMN "createdAt";

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_slug_key" ON "Campaign"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_campaignAddress_key" ON "Campaign"("campaignAddress");

-- CreateIndex
CREATE INDEX "Campaign_creatorAddress_idx" ON "Campaign"("creatorAddress");
