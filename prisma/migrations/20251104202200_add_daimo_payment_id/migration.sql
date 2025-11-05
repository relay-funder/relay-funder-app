-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "daimoPaymentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_daimoPaymentId_key" ON "Payment"("daimoPaymentId");
