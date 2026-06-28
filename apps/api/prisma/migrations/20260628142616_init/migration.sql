-- CreateTable
CREATE TABLE "MasterResume" (
    "id" TEXT NOT NULL,
    "basics" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterResume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "parentId" TEXT,
    "isChoiceGroup" BOOLEAN NOT NULL DEFAULT false,
    "isDefaultChoice" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagCategory" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,

    CONSTRAINT "TagCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemTag" (
    "itemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ItemTag_pkey" PRIMARY KEY ("itemId","tagId")
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "templateId" TEXT NOT NULL,
    "baseVariantId" TEXT,
    "targetCompany" TEXT,
    "jobDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariantTag" (
    "variantId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,

    CONSTRAINT "VariantTag_pkey" PRIMARY KEY ("variantId","tagId")
);

-- CreateTable
CREATE TABLE "VariantItem" (
    "variantId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "included" BOOLEAN NOT NULL,
    "order" INTEGER NOT NULL,
    "overrideData" JSONB,
    "chosenAlternativeId" TEXT,
    "locked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VariantItem_pkey" PRIMARY KEY ("variantId","itemId")
);

-- CreateIndex
CREATE INDEX "Item_masterId_idx" ON "Item"("masterId");

-- CreateIndex
CREATE INDEX "Item_parentId_idx" ON "Item"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "TagCategory_key_key" ON "TagCategory"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_categoryId_label_key" ON "Tag"("categoryId", "label");

-- CreateIndex
CREATE INDEX "ItemTag_tagId_idx" ON "ItemTag"("tagId");

-- CreateIndex
CREATE INDEX "Variant_masterId_idx" ON "Variant"("masterId");

-- CreateIndex
CREATE INDEX "Variant_baseVariantId_idx" ON "Variant"("baseVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantTag_variantId_priority_key" ON "VariantTag"("variantId", "priority");

-- CreateIndex
CREATE INDEX "VariantTag_tagId_idx" ON "VariantTag"("tagId");

-- CreateIndex
CREATE INDEX "VariantItem_itemId_idx" ON "VariantItem"("itemId");

-- CreateIndex
CREATE INDEX "VariantItem_chosenAlternativeId_idx" ON "VariantItem"("chosenAlternativeId");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "MasterResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TagCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTag" ADD CONSTRAINT "ItemTag_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTag" ADD CONSTRAINT "ItemTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "MasterResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_baseVariantId_fkey" FOREIGN KEY ("baseVariantId") REFERENCES "Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantTag" ADD CONSTRAINT "VariantTag_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantTag" ADD CONSTRAINT "VariantTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantItem" ADD CONSTRAINT "VariantItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantItem" ADD CONSTRAINT "VariantItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantItem" ADD CONSTRAINT "VariantItem_chosenAlternativeId_fkey" FOREIGN KEY ("chosenAlternativeId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
