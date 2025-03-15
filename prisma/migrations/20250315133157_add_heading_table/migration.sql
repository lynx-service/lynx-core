-- CreateTable
CREATE TABLE "heading" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "tag" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "heading_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "heading" ADD CONSTRAINT "heading_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heading" ADD CONSTRAINT "heading_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "heading"("id") ON DELETE SET NULL ON UPDATE CASCADE;
