-- AlterTable
ALTER TABLE "User" ADD COLUMN "rawAddress" TEXT;
UPDATE "User" SET "rawAddress" = "address";
ALTER TABLE "User" ALTER COLUMN "rawAddress" SET NOT NULL;
