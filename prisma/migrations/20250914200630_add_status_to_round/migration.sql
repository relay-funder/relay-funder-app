-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('CREATED', 'OPEN', 'ACTIVE', 'ENDED', 'CLOSED');

-- AlterTable
ALTER TABLE "Round" ADD COLUMN     "status" "RoundStatus" NOT NULL DEFAULT 'CREATED';
