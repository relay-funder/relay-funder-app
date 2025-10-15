-- Remove dual treasury mode and related fields
-- This migration removes all dual treasury functionality for MVP cleanup

-- Drop TreasuryMode enum and related columns from Campaign
ALTER TABLE "Campaign" DROP COLUMN IF EXISTS "treasuryMode";
ALTER TABLE "Campaign" DROP COLUMN IF EXISTS "cryptoTreasuryAddress";
ALTER TABLE "Campaign" DROP COLUMN IF EXISTS "paymentTreasuryAddress";

-- Drop PaymentFlow enum and related columns from Payment
ALTER TABLE "Payment" DROP COLUMN IF EXISTS "paymentFlow";
ALTER TABLE "Payment" DROP COLUMN IF EXISTS "processingDetails";

-- Note: We keep the original treasuryAddress column for backward compatibility
-- and single treasury deployment

-- Drop the enums (PostgreSQL will remove them automatically when no longer referenced)
DROP TYPE IF EXISTS "TreasuryMode";
DROP TYPE IF EXISTS "PaymentFlow";
