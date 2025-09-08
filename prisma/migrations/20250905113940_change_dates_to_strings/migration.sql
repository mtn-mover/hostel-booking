-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EventPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apartmentId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EventPrice_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EventPrice" ("apartmentId", "createdAt", "date", "eventName", "id", "isActive", "price", "updatedAt") SELECT "apartmentId", "createdAt", "date", "eventName", "id", "isActive", "price", "updatedAt" FROM "EventPrice";
DROP TABLE "EventPrice";
ALTER TABLE "new_EventPrice" RENAME TO "EventPrice";
CREATE INDEX "EventPrice_apartmentId_date_idx" ON "EventPrice"("apartmentId", "date");
CREATE UNIQUE INDEX "EventPrice_apartmentId_date_key" ON "EventPrice"("apartmentId", "date");
CREATE TABLE "new_SeasonPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apartmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SeasonPrice_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SeasonPrice" ("apartmentId", "createdAt", "endDate", "id", "isActive", "name", "price", "priority", "startDate", "type", "updatedAt") SELECT "apartmentId", "createdAt", "endDate", "id", "isActive", "name", "price", "priority", "startDate", "type", "updatedAt" FROM "SeasonPrice";
DROP TABLE "SeasonPrice";
ALTER TABLE "new_SeasonPrice" RENAME TO "SeasonPrice";
CREATE INDEX "SeasonPrice_apartmentId_startDate_endDate_idx" ON "SeasonPrice"("apartmentId", "startDate", "endDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
