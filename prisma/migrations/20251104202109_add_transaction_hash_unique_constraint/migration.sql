/*
  Warnings:

  - A unique constraint covering the columns `[transactionHash]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionHash_key" ON "Payment"("transactionHash");
