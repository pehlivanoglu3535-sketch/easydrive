import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;
const d = (days) => new Date(Date.now() + days * DAY);

// model -> filo verisi (bugüne göreli tarihler)
const DATA = {
  "Golf": { mileage: 85000, condition: "GOOD", insuranceDate: d(8), inspectionDate: d(45), nextServiceDate: d(20), kaskoDate: d(120) },
  "Octavia": { mileage: 62000, condition: "EXCELLENT", insuranceDate: d(120), inspectionDate: d(-5), nextServiceDate: d(90) },
  "320d": { mileage: 44000, condition: "EXCELLENT", insuranceDate: d(210), inspectionDate: d(160), kaskoDate: d(25), nextServiceKm: 45000 },
  "Duster": { mileage: 96000, condition: "FAIR", conditionNote: "Ön tampon çizik", insuranceDate: d(70), inspectionDate: d(30), nextServiceDate: d(-3) },
  "Vito": { mileage: 131000, condition: "GOOD", insuranceDate: d(15), inspectionDate: d(200), nextServiceDate: d(60) },
  "Model 3": { mileage: 21000, condition: "EXCELLENT", insuranceDate: d(300), inspectionDate: d(280), nextServiceDate: d(150) },
  "Clio": { mileage: 78000, condition: "GOOD", insuranceDate: d(40), inspectionDate: d(9), nextServiceDate: d(50) },
  "A4": { mileage: 55000, condition: "EXCELLENT", insuranceDate: d(180), inspectionDate: d(150), kaskoDate: d(6) },
};

for (const [model, fields] of Object.entries(DATA)) {
  const car = await prisma.car.findFirst({ where: { model } });
  if (car) {
    await prisma.car.update({ where: { id: car.id }, data: fields });
    console.log("✔", car.make, model);
  }
}

// Bir kiralamayı 'aktif' (teslim edilmiş) yap → dönüş listesi dolsun
const golf = await prisma.car.findFirst({ where: { model: "Golf" } });
if (golf) {
  const res = await prisma.reservation.findFirst({ where: { carId: golf.id }, orderBy: { startDate: "asc" } });
  if (res) {
    await prisma.reservation.update({
      where: { id: res.id },
      data: { status: "ACTIVE", startDate: new Date(Date.now() - 2 * DAY), endDate: d(4) },
    });
    console.log("✔ Golf kiralaması ACTIVE (4 gün sonra iade)");
  }
}

await prisma.$disconnect();
console.log("Filo demo verisi hazır.");
