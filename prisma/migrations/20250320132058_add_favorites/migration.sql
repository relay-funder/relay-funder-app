-- CreateTable
CREATE TABLE "Favorite" (
    "id" SERIAL NOT NULL,
    "userAddress" TEXT NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Favorite_userAddress_idx" ON "Favorite"("userAddress");

-- CreateIndex
CREATE INDEX "Favorite_campaignId_idx" ON "Favorite"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userAddress_campaignId_key" ON "Favorite"("userAddress", "campaignId");

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
