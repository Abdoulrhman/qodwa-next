/*
  Warnings:

  - You are about to drop the `packages` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'TEACHER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "isTeacher" BOOLEAN DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "qualifications" TEXT,
ADD COLUMN     "referralSource" TEXT,
ADD COLUMN     "subjects" TEXT,
ADD COLUMN     "teachingExperience" INTEGER;

-- DropTable
DROP TABLE "packages";

-- CreateTable
CREATE TABLE "Package" (
    "id" SERIAL NOT NULL,
    "current_price" TEXT NOT NULL,
    "original_price" TEXT NOT NULL,
    "discount" TEXT NOT NULL,
    "subscription_frequency" TEXT NOT NULL,
    "days_per_week" TEXT NOT NULL,
    "classes_per_month" TEXT NOT NULL,
    "class_duration" TEXT NOT NULL,
    "enrollment_action" TEXT NOT NULL,
    "package_type" TEXT NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);
