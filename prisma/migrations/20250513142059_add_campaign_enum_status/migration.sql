/*
  Warnings:

  - The `status` column on the `Campaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "status",
ADD COLUMN     "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT';

-- DropEnum
DROP TYPE "Status";
