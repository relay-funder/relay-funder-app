-- CreateTable
CREATE TABLE "DaimoWebhookEvent" (
    "id" SERIAL NOT NULL,
    "daimoPaymentId" TEXT,
    "paymentId" TEXT,
    "eventType" TEXT NOT NULL,
    "paymentStatus" TEXT,
    "idempotencyKey" TEXT,
    "replayedFromId" INTEGER,
    "replayedAt" TIMESTAMP(3),
    "replayedKey" TEXT,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "processingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "processingError" TEXT,

    CONSTRAINT "DaimoWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DaimoWebhookEvent_daimoPaymentId_idx" ON "DaimoWebhookEvent"("daimoPaymentId");

-- CreateIndex
CREATE INDEX "DaimoWebhookEvent_idempotencyKey_idx" ON "DaimoWebhookEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "DaimoWebhookEvent_replayedFromId_idx" ON "DaimoWebhookEvent"("replayedFromId");
