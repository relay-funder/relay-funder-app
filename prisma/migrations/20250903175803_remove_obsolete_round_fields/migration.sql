/*
  Warnings:

  - You are about to drop the column `profileId` on the `Round` table. All the data in the column will be lost.
  - You are about to drop the column `strategyAddress` on the `Round` table. All the data in the column will be lost.
  - You are about to drop the column `tokenAddress` on the `Round` table. All the data in the column will be lost.
  - You are about to drop the column `tokenDecimals` on the `Round` table. All the data in the column will be lost.
  - You are about to drop the column `transactionHash` on the `Round` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Round_transactionHash_key";

-- AlterTable
ALTER TABLE "Round" DROP COLUMN "profileId",
DROP COLUMN "strategyAddress",
DROP COLUMN "tokenAddress",
DROP COLUMN "tokenDecimals",
DROP COLUMN "transactionHash";
