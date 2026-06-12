/*
  Warnings:

  - You are about to drop the column `priority` on the `wishlists` table. All the data in the column will be lost.
  - You are about to drop the column `savedAmount` on the `wishlists` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "wishlists" DROP COLUMN "priority",
DROP COLUMN "savedAmount";

-- DropEnum
DROP TYPE "WishlistPriority";
