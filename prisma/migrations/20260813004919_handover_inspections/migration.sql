-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reservationId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "staffId" TEXT,
    "mileage" INTEGER,
    "fuelLevel" TEXT,
    "damageNote" TEXT,
    "photoFront" TEXT,
    "photoBack" TEXT,
    "photoLeft" TEXT,
    "photoRight" TEXT,
    "photoInteriorFront" TEXT,
    "photoInteriorBack" TEXT,
    "signatureUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inspection_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Inspection_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Inspection_reservationId_idx" ON "Inspection"("reservationId");
