-- Add new values to the TreasuryMode enum
ALTER TYPE "TreasuryMode" ADD VALUE 'CRYPTO_ONLY';
ALTER TYPE "TreasuryMode" ADD VALUE 'PAYMENT_ONLY';
ALTER TYPE "TreasuryMode" ADD VALUE 'LEGACY';
