-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Apartment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT 'Apartment',
    "name" TEXT,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "maxGuests" INTEGER NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "beds" INTEGER NOT NULL DEFAULT 1,
    "bathrooms" INTEGER NOT NULL,
    "size" INTEGER,
    "price" REAL NOT NULL DEFAULT 120,
    "pricePerNight" REAL,
    "pricePerWeek" REAL,
    "pricePerMonth" REAL,
    "cleaningFee" REAL NOT NULL DEFAULT 50,
    "minStayNights" INTEGER NOT NULL DEFAULT 1,
    "maxStayNights" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "address" TEXT,
    "city" TEXT NOT NULL DEFAULT 'Interlaken',
    "country" TEXT NOT NULL DEFAULT 'Switzerland',
    "latitude" REAL,
    "longitude" REAL,
    "rating" REAL,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "airbnbId" TEXT,
    "airbnbUrl" TEXT,
    "airbnbListingId" TEXT,
    "icalUrl" TEXT,
    "lastSynced" DATETIME,
    "images" TEXT NOT NULL DEFAULT '[]',
    "amenities" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Apartment" ("airbnbListingId", "airbnbUrl", "bathrooms", "bedrooms", "createdAt", "description", "id", "isActive", "maxGuests", "maxStayNights", "minStayNights", "name", "pricePerMonth", "pricePerNight", "pricePerWeek", "shortDescription", "size", "updatedAt") SELECT "airbnbListingId", "airbnbUrl", "bathrooms", "bedrooms", "createdAt", "description", "id", "isActive", "maxGuests", "maxStayNights", "minStayNights", "name", "pricePerMonth", "pricePerNight", "pricePerWeek", "shortDescription", "size", "updatedAt" FROM "Apartment";
DROP TABLE "Apartment";
ALTER TABLE "new_Apartment" RENAME TO "Apartment";
CREATE UNIQUE INDEX "Apartment_airbnbId_key" ON "Apartment"("airbnbId");
CREATE UNIQUE INDEX "Apartment_airbnbListingId_key" ON "Apartment"("airbnbListingId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
