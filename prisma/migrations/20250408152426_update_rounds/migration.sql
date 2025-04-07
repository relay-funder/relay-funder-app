/*
  Warnings:

  - Added the required column `managerAddress` to the `Round` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `Round` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strategyAddress` to the `Round` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenAddress` to the `Round` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenDecimals` to the `Round` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Round` table without a default value. This is not possible if the table is not empty.
  - Added the required column `blockchain` to the `Round` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Round"
    ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN     "managerAddress" TEXT NOT NULL,
    ADD COLUMN     "poolId" BIGINT,
    ADD COLUMN     "profileId" TEXT NOT NULL,
    ADD COLUMN     "strategyAddress" TEXT NOT NULL,
    ADD COLUMN     "tokenAddress" TEXT NOT NULL,
    ADD COLUMN     "tokenDecimals" INTEGER NOT NULL,
    ADD COLUMN     "transactionHash" TEXT,
    ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
    ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[],
    ALTER COLUMN "matchingPool" SET DATA TYPE DECIMAL(65,30),
    ALTER COLUMN "startDate" DROP DEFAULT,
    ALTER COLUMN "logoUrl" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Round_poolId_key" ON "Round"("poolId");

-- CreateIndex
CREATE UNIQUE INDEX "Round_transactionHash_key" ON "Round"("transactionHash");
