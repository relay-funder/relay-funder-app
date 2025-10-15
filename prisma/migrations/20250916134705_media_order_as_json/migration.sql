/*
  Warnings:

  - The `mediaOrder` column on the `Campaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `mediaOrder` column on the `CampaignUpdate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `mediaOrder` column on the `Round` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "mediaOrder",
ADD COLUMN     "mediaOrder" JSONB;

-- AlterTable
ALTER TABLE "CampaignUpdate" DROP COLUMN "mediaOrder",
ADD COLUMN     "mediaOrder" JSONB;

-- AlterTable
ALTER TABLE "Round" DROP COLUMN "mediaOrder",
ADD COLUMN     "mediaOrder" JSONB;
