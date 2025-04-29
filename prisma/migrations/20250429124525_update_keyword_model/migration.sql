/*
  Warnings:

  - You are about to drop the column `cpc` on the `keyword` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "keyword" DROP COLUMN "cpc",
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "importance" TEXT,
ADD COLUMN     "memo" TEXT,
ADD COLUMN     "relevance" TEXT,
ADD COLUMN     "search_intent" TEXT;
