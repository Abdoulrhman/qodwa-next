/*
  Warnings:

  - You are about to drop the column `package_id` on the `Package` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Package_package_id_key";

-- AlterTable
ALTER TABLE "Package" DROP COLUMN "package_id",
ADD COLUMN     "classes_per_month" INTEGER,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "duration_weeks" INTEGER,
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "level" TEXT,
ADD COLUMN     "sort_order" INTEGER,
ADD COLUMN     "subject" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "total_classes" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "auto_renew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cancellation_reason" TEXT,
ADD COLUMN     "classes_completed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "classes_remaining" INTEGER,
ADD COLUMN     "next_class_date" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "payment_method" TEXT,
ADD COLUMN     "stripe_session_id" TEXT;
