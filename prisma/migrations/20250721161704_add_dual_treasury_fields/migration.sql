-- CreateEnum
CREATE TYPE "PaymentFlow" AS ENUM ('CRYPTO', 'CREDIT_CARD');

-- CreateEnum
CREATE TYPE "TreasuryMode" AS ENUM ('DUAL', 'UNIFIED');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "cryptoTreasuryAddress" TEXT,
ADD COLUMN     "paymentTreasuryAddress" TEXT,
ADD COLUMN     "treasuryMode" "TreasuryMode" DEFAULT 'DUAL';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "paymentFlow" "PaymentFlow",
ADD COLUMN     "processingDetails" JSONB;

