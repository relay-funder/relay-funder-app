-- AlterTable
ALTER TABLE "EventFeed" ALTER COLUMN "eventUuid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Round" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;
