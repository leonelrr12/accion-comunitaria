/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `communities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `corregimientos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `districts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `provinces` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "communities" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "communities_id_seq";

-- AlterTable
ALTER TABLE "corregimientos" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "corregimientos_id_seq";

-- AlterTable
ALTER TABLE "districts" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "districts_id_seq";

-- AlterTable
ALTER TABLE "provinces" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "provinces_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "communities_id_key" ON "communities"("id");

-- CreateIndex
CREATE UNIQUE INDEX "corregimientos_id_key" ON "corregimientos"("id");

-- CreateIndex
CREATE UNIQUE INDEX "districts_id_key" ON "districts"("id");

-- CreateIndex
CREATE UNIQUE INDEX "provinces_id_key" ON "provinces"("id");
