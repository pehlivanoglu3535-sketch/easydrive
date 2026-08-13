-- AlterTable
ALTER TABLE "Contract" ADD COLUMN "damageNote" TEXT;
ALTER TABLE "Contract" ADD COLUMN "damagePhotoUrl" TEXT;
ALTER TABLE "Contract" ADD COLUMN "extraDriverLicense" TEXT;
ALTER TABLE "Contract" ADD COLUMN "extraDriverName" TEXT;
ALTER TABLE "Contract" ADD COLUMN "extras" TEXT;
ALTER TABLE "Contract" ADD COLUMN "extrasFee" REAL;
ALTER TABLE "Contract" ADD COLUMN "insuranceFee" REAL;
ALTER TABLE "Contract" ADD COLUMN "insurancePackage" TEXT;

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Branch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Car" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "branchId" TEXT,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "plate" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "fuel" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "pricePerDay" REAL NOT NULL,
    "monthlyPrice" REAL,
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
    CONSTRAINT "Car_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Car_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Car" ("category", "companyId", "condition", "conditionNote", "createdAt", "fuel", "id", "imageUrl", "inspectionDate", "insuranceDate", "kaskoDate", "make", "mileage", "model", "monthlyPrice", "nextServiceDate", "nextServiceKm", "plate", "pricePerDay", "seats", "status", "transmission", "year") SELECT "category", "companyId", "condition", "conditionNote", "createdAt", "fuel", "id", "imageUrl", "inspectionDate", "insuranceDate", "kaskoDate", "make", "mileage", "model", "monthlyPrice", "nextServiceDate", "nextServiceKm", "plate", "pricePerDay", "seats", "status", "transmission", "year" FROM "Car";
DROP TABLE "Car";
ALTER TABLE "new_Car" RENAME TO "Car";
CREATE INDEX "Car_companyId_idx" ON "Car"("companyId");
CREATE UNIQUE INDEX "Car_companyId_plate_key" ON "Car"("companyId", "plate");
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "branchId" TEXT,
    "pickupLocationId" TEXT,
    "dropoffLocationId" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "days" INTEGER NOT NULL,
    "totalPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rentalType" TEXT NOT NULL DEFAULT 'DAILY',
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "note" TEXT,
    "source" TEXT NOT NULL DEFAULT 'web',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reservation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reservation_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reservation_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reservation_dropoffLocationId_fkey" FOREIGN KEY ("dropoffLocationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("carId", "companyId", "createdAt", "customerId", "days", "dropoffLocationId", "endDate", "id", "note", "paidAmount", "paymentStatus", "pickupLocationId", "rentalType", "source", "startDate", "status", "totalPrice") SELECT "carId", "companyId", "createdAt", "customerId", "days", "dropoffLocationId", "endDate", "id", "note", "paidAmount", "paymentStatus", "pickupLocationId", "rentalType", "source", "startDate", "status", "totalPrice" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
CREATE INDEX "Reservation_companyId_idx" ON "Reservation"("companyId");
CREATE INDEX "Reservation_carId_idx" ON "Reservation"("carId");
CREATE INDEX "Reservation_customerId_idx" ON "Reservation"("customerId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "locale" TEXT NOT NULL DEFAULT 'sq',
    "companyId" TEXT,
    "branchId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("companyId", "createdAt", "email", "id", "locale", "name", "passwordHash", "phone", "role") SELECT "companyId", "createdAt", "email", "id", "locale", "name", "passwordHash", "phone", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_companyId_idx" ON "User"("companyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Branch_companyId_idx" ON "Branch"("companyId");
