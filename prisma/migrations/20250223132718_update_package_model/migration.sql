/*
  Warnings:

  - You are about to drop the column `classes_per_month` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `days_per_week` on the `Package` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[package_id]` on the table `Package` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `days` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `package_id` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `class_duration` on the `Package` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Package" DROP COLUMN "classes_per_month",
DROP COLUMN "days_per_week",
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "days" INTEGER NOT NULL,
ADD COLUMN     "is_popular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "package_id" INTEGER NOT NULL,
DROP COLUMN "class_duration",
ADD COLUMN     "class_duration" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Package_package_id_key" ON "Package"("package_id");
