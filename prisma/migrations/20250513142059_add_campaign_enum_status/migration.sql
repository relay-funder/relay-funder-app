/*
  Warnings:

  - The `status` column on the `Campaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.

  Migration will preserve and map old status values to the new enum.
*/
-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'COMPLETED', 'FAILED');

-- Step 1: Add a temporary column to preserve old status values
ALTER TABLE "Campaign" ADD COLUMN "old_status" TEXT;
UPDATE "Campaign" SET "old_status" = "status";

-- Step 2: Drop and recreate the status column with the new enum type
ALTER TABLE "Campaign" DROP COLUMN "status";
ALTER TABLE "Campaign" ADD COLUMN "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT';

-- Step 3: Migrate old status values to the new enum values
UPDATE "Campaign" SET "status" =
  CASE
    WHEN lower("old_status") = 'draft' THEN 'DRAFT'
    WHEN lower("old_status") = 'pending_approval' THEN 'PENDING_APPROVAL'
    WHEN lower("old_status") = 'active' THEN 'ACTIVE'
    WHEN lower("old_status") = 'completed' THEN 'COMPLETED'
    WHEN lower("old_status") = 'failed' THEN 'FAILED'
    ELSE 'DRAFT'
  END;

-- Step 4: Remove the temporary column
ALTER TABLE "Campaign" DROP COLUMN "old_status";

-- DropEnum
DROP TYPE "Status";
