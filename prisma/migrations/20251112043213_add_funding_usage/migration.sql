-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "fundingUsage" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "EventFeed" ALTER COLUMN "eventUuid" DROP DEFAULT;
