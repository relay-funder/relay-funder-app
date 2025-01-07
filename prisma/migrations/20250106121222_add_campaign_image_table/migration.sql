-- CreateTable
CREATE TABLE "CampaignImage" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isMainImage" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignId" INTEGER NOT NULL,

    CONSTRAINT "CampaignImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CampaignImage" ADD CONSTRAINT "CampaignImage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
