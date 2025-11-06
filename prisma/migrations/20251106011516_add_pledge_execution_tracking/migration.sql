-- CreateEnum
CREATE TYPE "PledgeExecutionStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "pledgeExecutionAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pledgeExecutionError" TEXT,
ADD COLUMN     "pledgeExecutionLastAttempt" TIMESTAMP(3),
ADD COLUMN     "pledgeExecutionStatus" "PledgeExecutionStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "pledgeExecutionTxHash" TEXT;

-- CreateIndex
CREATE INDEX "Payment_pledgeExecutionStatus_provider_idx" ON "Payment"("pledgeExecutionStatus", "provider");
