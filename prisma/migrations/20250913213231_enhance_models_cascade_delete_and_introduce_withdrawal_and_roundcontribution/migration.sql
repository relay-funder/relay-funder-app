-- CreateEnum
CREATE TYPE "PaymentRefundState" AS ENUM ('NONE', 'REQUESTED', 'PROCESSED', 'APPROVED');

-- CreateEnum
CREATE TYPE "MediaState" AS ENUM ('CREATED', 'UPLOADED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "WithdrawState" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'EXECUTED');

-- DropForeignKey
ALTER TABLE "CampaignCollection" DROP CONSTRAINT "CampaignCollection_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignCollection" DROP CONSTRAINT "CampaignCollection_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignImage" DROP CONSTRAINT "CampaignImage_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_userId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentMethod" DROP CONSTRAINT "PaymentMethod_userId_fkey";

-- DropForeignKey
ALTER TABLE "RoundCampaigns" DROP CONSTRAINT "RoundCampaigns_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "RoundCampaigns" DROP CONSTRAINT "RoundCampaigns_roundId_fkey";

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "mediaOrder" INTEGER[];

-- AlterTable
ALTER TABLE "CampaignUpdate" ADD COLUMN     "mediaOrder" INTEGER[];

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "refundState" "PaymentRefundState" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "Round" ADD COLUMN     "approvedResult" JSONB,
ADD COLUMN     "descriptionUrl" TEXT,
ADD COLUMN     "fundWalletAddress" TEXT,
ADD COLUMN     "mediaOrder" INTEGER[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "featureFlags" TEXT[];

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER,
    "state" "MediaState" NOT NULL DEFAULT 'CREATED',
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "mimeType" TEXT NOT NULL,
    "campaignId" INTEGER,
    "updateId" INTEGER,
    "roundId" INTEGER,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoundContribution" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignId" INTEGER NOT NULL,
    "roundCampaignId" INTEGER NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "humanityScore" INTEGER NOT NULL,

    CONSTRAINT "RoundContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER NOT NULL,
    "approvedById" INTEGER NOT NULL,
    "amount" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "notes" TEXT,
    "transactionHash" TEXT,
    "campaignId" INTEGER NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CampaignImage" ADD CONSTRAINT "CampaignImage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "CampaignUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundCampaigns" ADD CONSTRAINT "RoundCampaigns_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundCampaigns" ADD CONSTRAINT "RoundCampaigns_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignCollection" ADD CONSTRAINT "CampaignCollection_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignCollection" ADD CONSTRAINT "CampaignCollection_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundContribution" ADD CONSTRAINT "RoundContribution_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundContribution" ADD CONSTRAINT "RoundContribution_roundCampaignId_fkey" FOREIGN KEY ("roundCampaignId") REFERENCES "RoundCampaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundContribution" ADD CONSTRAINT "RoundContribution_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
