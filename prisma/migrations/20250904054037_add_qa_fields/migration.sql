/*
  Warnings:

  - You are about to drop the column `confidenceScore` on the `LearnedKnowledge` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LearnedKnowledge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "keyName" TEXT NOT NULL,
    "question" TEXT,
    "answer" TEXT,
    "content" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0.9,
    "learnedFromChats" TEXT NOT NULL DEFAULT '[]',
    "successRate" REAL NOT NULL DEFAULT 0.0,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_LearnedKnowledge" ("category", "content", "createdAt", "id", "keyName", "lastUsed", "learnedFromChats", "successRate", "updatedAt", "useCount") SELECT "category", "content", "createdAt", "id", "keyName", "lastUsed", "learnedFromChats", "successRate", "updatedAt", "useCount" FROM "LearnedKnowledge";
DROP TABLE "LearnedKnowledge";
ALTER TABLE "new_LearnedKnowledge" RENAME TO "LearnedKnowledge";
CREATE UNIQUE INDEX "LearnedKnowledge_keyName_key" ON "LearnedKnowledge"("keyName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
