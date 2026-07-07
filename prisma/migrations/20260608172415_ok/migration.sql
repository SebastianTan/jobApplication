-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'FOUND',
    "appliedAt" DATETIME,
    "jobUrl" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "jobDescriptionFile" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Application" ("appliedAt", "company", "createdAt", "id", "jobDescriptionFile", "jobUrl", "location", "notes", "role", "status", "updatedAt") SELECT "appliedAt", "company", "createdAt", "id", "jobDescriptionFile", "jobUrl", "location", "notes", "role", "status", "updatedAt" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
