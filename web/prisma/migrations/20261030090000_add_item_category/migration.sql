-- CreateTable
CREATE TABLE "ItemCategory" (
    "itemId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "ItemCategory_pkey" PRIMARY KEY ("itemId")
);

-- CreateIndex
CREATE INDEX "ItemCategory_category_idx" ON "ItemCategory"("category");

