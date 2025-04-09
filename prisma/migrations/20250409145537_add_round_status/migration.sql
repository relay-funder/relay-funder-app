-- AlterTable
ALTER TABLE "RoundCampaigns" ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "status" INTEGER DEFAULT 0;
