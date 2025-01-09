-- Add location column to Campaign table
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "location" TEXT;