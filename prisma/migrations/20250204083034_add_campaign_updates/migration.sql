/*
  Warnings:

  - You are about to drop the `CampaignUpdate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CampaignUpdate" DROP CONSTRAINT "CampaignUpdate_campaignId_fkey";

-- DropTable
DROP TABLE "CampaignUpdate";
