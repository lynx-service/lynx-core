/*
  Warnings:

  - A unique constraint covering the columns `[project_id,article_url]` on the table `article` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[criteria_article_id,linked_article_id]` on the table `inner_link` will be added. If there are existing duplicate values, this will fail.
  - Made the column `article_url` on table `article` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "article" ALTER COLUMN "article_url" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "article_project_id_article_url_key" ON "article"("project_id", "article_url");

-- CreateIndex
CREATE UNIQUE INDEX "inner_link_criteria_article_id_linked_article_id_key" ON "inner_link"("criteria_article_id", "linked_article_id");
