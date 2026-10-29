-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "outputName" TEXT NOT NULL,
    "outputItemId" INTEGER,
    "outputQty" INTEGER NOT NULL DEFAULT 1,
    "members" BOOLEAN NOT NULL DEFAULT false,
    "facilities" TEXT,
    "skillsJson" TEXT,
    "ticks" INTEGER,
    "raw" TEXT NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeMaterial" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "itemId" INTEGER,
    "qty" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "RecipeMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recipe_outputItemId_idx" ON "Recipe"("outputItemId");

-- CreateIndex
CREATE INDEX "Recipe_outputName_idx" ON "Recipe"("outputName");

-- CreateIndex
CREATE INDEX "RecipeMaterial_recipeId_idx" ON "RecipeMaterial"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeMaterial_itemId_idx" ON "RecipeMaterial"("itemId");

-- AddForeignKey
ALTER TABLE "RecipeMaterial" ADD CONSTRAINT "RecipeMaterial_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

