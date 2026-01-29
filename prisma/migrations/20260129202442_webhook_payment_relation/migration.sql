-- Rename paymentId to daimoNestedId (preserves existing data)
ALTER TABLE "DaimoWebhookEvent" RENAME COLUMN "paymentId" TO "daimoNestedId";

-- Add internalPaymentId column for relation to Payment model
ALTER TABLE "DaimoWebhookEvent" ADD COLUMN "internalPaymentId" INTEGER;

-- Create index for efficient lookups
CREATE INDEX "DaimoWebhookEvent_internalPaymentId_idx" ON "DaimoWebhookEvent"("internalPaymentId");

-- Add foreign key constraint
ALTER TABLE "DaimoWebhookEvent" ADD CONSTRAINT "DaimoWebhookEvent_internalPaymentId_fkey" FOREIGN KEY ("internalPaymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill internalPaymentId by matching on daimoPaymentId
UPDATE "DaimoWebhookEvent" dwe
SET "internalPaymentId" = p.id
FROM "Payment" p
WHERE dwe."daimoPaymentId" = p."daimoPaymentId"
  AND dwe."internalPaymentId" IS NULL;
