/*
  Warnings:

  - The `status` column on the `Campaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.

  Migration will preserve and map old status values to the new enum.
*/

-- Check if CampaignStatus enum exists, if not create it
DO $$ BEGIN
    CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'COMPLETED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 1: Add a temporary column to preserve old status values
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "old_status" TEXT;
UPDATE "Campaign" SET "old_status" = "status"::TEXT WHERE "old_status" IS NULL;

-- Step 2: Drop and recreate the status column with the new enum type
ALTER TABLE "Campaign" DROP COLUMN IF EXISTS "status";
ALTER TABLE "Campaign" ADD COLUMN "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT';

-- Step 3: Migrate old status values to the new enum values
UPDATE "Campaign" SET "status" =
  CASE
    WHEN lower("old_status") = 'draft' THEN 'DRAFT'::"CampaignStatus"
    WHEN lower("old_status") = 'pending_approval' THEN 'PENDING_APPROVAL'::"CampaignStatus"
    WHEN lower("old_status") = 'active' THEN 'ACTIVE'::"CampaignStatus"
    WHEN lower("old_status") = 'completed' THEN 'COMPLETED'::"CampaignStatus"
    WHEN lower("old_status") = 'failed' THEN 'FAILED'::"CampaignStatus"
    ELSE 'DRAFT'::"CampaignStatus"
  END;

-- Step 4: Remove the temporary column
ALTER TABLE "Campaign" DROP COLUMN IF EXISTS "old_status";

-- Drop the old Status enum if it exists
DROP TYPE IF EXISTS "Status";
