-- AlterTable
ALTER TABLE "EventFeed" ADD COLUMN "eventUuid" TEXT;

-- Update existing rows to have a UUID
UPDATE "EventFeed" SET "eventUuid" = gen_random_uuid() WHERE "eventUuid" IS NULL;

-- Set default and not null
ALTER TABLE "EventFeed" ALTER COLUMN "eventUuid" SET DEFAULT gen_random_uuid();
ALTER TABLE "EventFeed" ALTER COLUMN "eventUuid" SET NOT NULL;

-- CreateIndex
CREATE INDEX "EventFeed_eventUuid_idx" ON "EventFeed"("eventUuid");
