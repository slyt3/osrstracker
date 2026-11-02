-- CreateTable
CREATE TABLE "EquipmentStats" (
    "itemId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "members" BOOLEAN NOT NULL DEFAULT false,
    "tradeable" BOOLEAN NOT NULL DEFAULT false,
    "aStab" INTEGER NOT NULL DEFAULT 0,
    "aSlash" INTEGER NOT NULL DEFAULT 0,
    "aCrush" INTEGER NOT NULL DEFAULT 0,
    "aMagic" INTEGER NOT NULL DEFAULT 0,
    "aRange" INTEGER NOT NULL DEFAULT 0,
    "dStab" INTEGER NOT NULL DEFAULT 0,
    "dSlash" INTEGER NOT NULL DEFAULT 0,
    "dCrush" INTEGER NOT NULL DEFAULT 0,
    "dMagic" INTEGER NOT NULL DEFAULT 0,
    "dRange" INTEGER NOT NULL DEFAULT 0,
    "str" INTEGER NOT NULL DEFAULT 0,
    "rStr" INTEGER NOT NULL DEFAULT 0,
    "mDmg" INTEGER NOT NULL DEFAULT 0,
    "prayer" INTEGER NOT NULL DEFAULT 0,
    "weaponType" TEXT,
    "attackSpeed" INTEGER,
    "icon" TEXT,

    CONSTRAINT "EquipmentStats_pkey" PRIMARY KEY ("itemId")
);

-- CreateIndex
CREATE INDEX "EquipmentStats_slot_idx" ON "EquipmentStats"("slot");

