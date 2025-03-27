-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "category" TEXT;

-- CreateIndex
CREATE INDEX "Campaign_category_idx" ON "Campaign"("category");
