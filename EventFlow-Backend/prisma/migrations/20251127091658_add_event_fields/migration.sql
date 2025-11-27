-- CreateEnum (SQLite doesn't support enums, so we use TEXT with constraints)

-- AlterTable: Add new columns to Event table
ALTER TABLE "Event" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'OUTRO';
ALTER TABLE "Event" ADD COLUMN "eventType" TEXT NOT NULL DEFAULT 'PRESENCIAL';
ALTER TABLE "Event" ADD COLUMN "price" REAL NOT NULL DEFAULT 0;
ALTER TABLE "Event" ADD COLUMN "minAge" INTEGER;
ALTER TABLE "Event" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "Event" ADD COLUMN "onlineUrl" TEXT;
ALTER TABLE "Event" ADD COLUMN "tags" TEXT;
