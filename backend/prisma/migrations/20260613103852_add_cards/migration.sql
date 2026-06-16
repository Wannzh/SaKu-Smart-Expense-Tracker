-- CreateEnum
CREATE TYPE "CardProvider" AS ENUM ('BANK', 'EWALLET', 'BLOCKCHAIN', 'OTHER');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('PERSONAL', 'BUSINESS');

-- CreateEnum
CREATE TYPE "CardCategory" AS ENUM ('MAIN', 'BACKUP', 'FREELANCE', 'BUSINESS', 'OTHER');

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "holderName" TEXT NOT NULL,
    "lastFourDigits" VARCHAR(4) NOT NULL,
    "accountNumber" TEXT,
    "expiryMonth" VARCHAR(2),
    "expiryYear" VARCHAR(4),
    "label" TEXT,
    "branch" TEXT,
    "provider" "CardProvider" NOT NULL DEFAULT 'BANK',
    "type" "CardType" NOT NULL DEFAULT 'PERSONAL',
    "category" "CardCategory" NOT NULL DEFAULT 'MAIN',
    "cardColor" TEXT NOT NULL DEFAULT '#3525cd',
    "pinToTop" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cards_userId_idx" ON "cards"("userId");

-- CreateIndex
CREATE INDEX "cards_userId_provider_idx" ON "cards"("userId", "provider");

-- CreateIndex
CREATE INDEX "cards_userId_pinToTop_idx" ON "cards"("userId", "pinToTop");

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
