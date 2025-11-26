/*
  Warnings:

  - You are about to drop the column `cancelledReason` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Event` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "visibility" TEXT NOT NULL,
    "availability" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "rsvpDeadline" DATETIME,
    "capacity" INTEGER,
    "waitlistEnabled" BOOLEAN NOT NULL DEFAULT false,
    "showGuestList" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("capacity", "createdAt", "date", "description", "id", "location", "ownerId", "rsvpDeadline", "showGuestList", "time", "timezone", "title", "visibility", "waitlistEnabled") SELECT "capacity", "createdAt", "date", "description", "id", "location", "ownerId", "rsvpDeadline", "showGuestList", "time", "timezone", "title", "visibility", "waitlistEnabled" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
