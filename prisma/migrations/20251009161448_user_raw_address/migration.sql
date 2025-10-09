/*
  Warnings:

  - Added the required column `rawAddress` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rawAddress" TEXT NOT NULL;
