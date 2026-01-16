-- CreateEnum
CREATE TYPE "WithdrawalRequestType" AS ENUM ('ON_CHAIN_AUTHORIZATION', 'WITHDRAWAL_AMOUNT');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "treasuryApprovalAdminId" INTEGER,
ADD COLUMN     "treasuryApprovalTimestamp" TIMESTAMP(3),
ADD COLUMN     "treasuryApprovalTxHash" TEXT,
ADD COLUMN     "treasuryWithdrawalsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "requestType" "WithdrawalRequestType" NOT NULL DEFAULT 'WITHDRAWAL_AMOUNT';

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_treasuryApprovalAdminId_fkey" FOREIGN KEY ("treasuryApprovalAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
