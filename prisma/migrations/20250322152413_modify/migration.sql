/*
  Warnings:

  - You are about to drop the column `is_active` on the `inner_link` table. All the data in the column will be lost.
  - You are about to drop the column `linked_article_id` on the `inner_link` table. All the data in the column will be lost.
  - You are about to drop the column `rel` on the `inner_link` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `inner_link` table. All the data in the column will be lost.
  - You are about to drop the `heading` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `is_indexable` on table `article` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "heading" DROP CONSTRAINT "heading_article_id_fkey";

-- DropForeignKey
ALTER TABLE "heading" DROP CONSTRAINT "heading_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "inner_link" DROP CONSTRAINT "inner_link_linked_article_id_fkey";

-- DropIndex
DROP INDEX "inner_link_criteria_article_id_linked_article_id_key";

-- AlterTable
ALTER TABLE "article" ADD COLUMN     "headings" JSONB,
ADD COLUMN     "json_ld" JSONB,
ALTER COLUMN "is_indexable" SET NOT NULL,
ALTER COLUMN "is_indexable" SET DEFAULT true;

-- AlterTable
ALTER TABLE "inner_link" DROP COLUMN "is_active",
DROP COLUMN "linked_article_id",
DROP COLUMN "rel",
DROP COLUMN "type",
ADD COLUMN     "is_follow" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "status" JSONB;

-- DropTable
DROP TABLE "heading";

-- CreateTable
CREATE TABLE "outer_link" (
    "id" SERIAL NOT NULL,
    "criteria_article_id" INTEGER NOT NULL,
    "anchor_text" TEXT,
    "link_url" TEXT NOT NULL,
    "is_follow" BOOLEAN NOT NULL DEFAULT true,
    "status" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outer_link_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "outer_link" ADD CONSTRAINT "outer_link_criteria_article_id_fkey" FOREIGN KEY ("criteria_article_id") REFERENCES "article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
