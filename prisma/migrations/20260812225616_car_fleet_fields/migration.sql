-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Car" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "plate" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "fuel" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "pricePerDay" REAL NOT NULL,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "conditionNote" TEXT,
    "inspectionDate" DATETIME,
    "insuranceDate" DATETIME,
    "kaskoDate" DATETIME,
    "nextServiceDate" DATETIME,
    "nextServiceKm" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Car_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Car" ("category", "companyId", "createdAt", "fuel", "id", "imageUrl", "make", "model", "plate", "pricePerDay", "seats", "status", "transmission", "year") SELECT "category", "companyId", "createdAt", "fuel", "id", "imageUrl", "make", "model", "plate", "pricePerDay", "seats", "status", "transmission", "year" FROM "Car";
DROP TABLE "Car";
ALTER TABLE "new_Car" RENAME TO "Car";
CREATE INDEX "Car_companyId_idx" ON "Car"("companyId");
CREATE UNIQUE INDEX "Car_companyId_plate_key" ON "Car"("companyId", "plate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
