import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ─── Süper Admin (platform sahibi) ───
  await prisma.user.upsert({
    where: { email: "admin@platform.com" },
    update: {},
    create: {
      email: "admin@platform.com",
      passwordHash: await bcrypt.hash("super123", 10),
      name: "Platform Yöneticisi",
      role: "SUPER_ADMIN",
      locale: "tr",
    },
  });

  // ─── Demo Firma 1: Prishtina Rent ───
  const company1 = await prisma.company.upsert({
    where: { slug: "prishtina-rent" },
    update: {},
    create: {
      name: "Prishtina Rent a Car",
      slug: "prishtina-rent",
      primaryColor: "#2563eb",
      status: "ACTIVE",
      defaultLocale: "sq",
      currency: "EUR",
      contactEmail: "info@prishtinarent.com",
      contactPhone: "+383 44 123 456",
      city: "Prishtinë",
      address: "Rr. Nëna Terezë, Prishtinë",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@prishtinarent.com" },
    update: {},
    create: {
      email: "admin@prishtinarent.com",
      passwordHash: await bcrypt.hash("firma123", 10),
      name: "Arben Krasniqi",
      role: "COMPANY_ADMIN",
      locale: "sq",
      companyId: company1.id,
    },
  });

  const loc1 = await prisma.location.create({
    data: {
      companyId: company1.id,
      name: "Aeroporti i Prishtinës (PRN)",
      city: "Prishtinë",
      address: "Prishtina International Airport",
    },
  });
  const loc2 = await prisma.location.create({
    data: {
      companyId: company1.id,
      name: "Zyra Qendër",
      city: "Prishtinë",
      address: "Rr. Nëna Terezë",
    },
  });

  const carsCompany1 = [
    { make: "Volkswagen", model: "Golf", year: 2022, plate: "01-123-AB", category: "Ekonomik", transmission: "Manuel", fuel: "Dizel", seats: 5, pricePerDay: 35, imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80" },
    { make: "Škoda", model: "Octavia", year: 2023, plate: "01-234-BC", category: "Orta", transmission: "Otomatik", fuel: "Dizel", seats: 5, pricePerDay: 45, imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80" },
    { make: "BMW", model: "320d", year: 2024, plate: "01-345-CD", category: "Lüks", transmission: "Otomatik", fuel: "Dizel", seats: 5, pricePerDay: 85, imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80" },
    { make: "Dacia", model: "Duster", year: 2022, plate: "01-456-DE", category: "SUV", transmission: "Manuel", fuel: "Benzin", seats: 5, pricePerDay: 40, imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80" },
    { make: "Mercedes", model: "Vito", year: 2023, plate: "01-567-EF", category: "Ticari", transmission: "Manuel", fuel: "Dizel", seats: 8, pricePerDay: 70, imageUrl: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800&q=80" },
    { make: "Tesla", model: "Model 3", year: 2024, plate: "01-678-FG", category: "Lüks", transmission: "Otomatik", fuel: "Elektrik", seats: 5, pricePerDay: 95, imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80" },
  ];
  for (const c of carsCompany1) {
    await prisma.car.create({ data: { ...c, companyId: company1.id } });
  }

  // Örnek müşteri + rezervasyon (izolasyon testi için)
  const cust1 = await prisma.customer.create({
    data: {
      companyId: company1.id,
      name: "Driton Berisha",
      email: "driton@example.com",
      phone: "+383 44 555 111",
      idNumber: "1234567890",
      licenseNo: "PR-556677",
    },
  });
  const golf = await prisma.car.findFirst({
    where: { companyId: company1.id, model: "Golf" },
  });
  if (golf) {
    await prisma.reservation.create({
      data: {
        companyId: company1.id,
        carId: golf.id,
        customerId: cust1.id,
        pickupLocationId: loc1.id,
        dropoffLocationId: loc2.id,
        startDate: new Date("2026-08-20"),
        endDate: new Date("2026-08-25"),
        days: 5,
        totalPrice: 5 * golf.pricePerDay,
        status: "PENDING",
        source: "web",
      },
    });
  }

  // ─── Demo Firma 2: Prizren Cars (izolasyon kanıtı) ───
  const company2 = await prisma.company.upsert({
    where: { slug: "prizren-cars" },
    update: {},
    create: {
      name: "Prizren Cars",
      slug: "prizren-cars",
      primaryColor: "#dc2626",
      status: "ACTIVE",
      defaultLocale: "sq",
      currency: "EUR",
      contactEmail: "info@prizrencars.com",
      contactPhone: "+383 49 987 654",
      city: "Prizren",
    },
  });
  await prisma.user.upsert({
    where: { email: "admin@prizrencars.com" },
    update: {},
    create: {
      email: "admin@prizrencars.com",
      passwordHash: await bcrypt.hash("firma123", 10),
      name: "Blerim Hoxha",
      role: "COMPANY_ADMIN",
      locale: "tr",
      companyId: company2.id,
    },
  });
  await prisma.location.create({
    data: { companyId: company2.id, name: "Prizren Qendër", city: "Prizren" },
  });
  const carsCompany2 = [
    { make: "Renault", model: "Clio", year: 2021, plate: "02-111-AA", category: "Ekonomik", transmission: "Manuel", fuel: "Benzin", seats: 5, pricePerDay: 30, imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80" },
    { make: "Audi", model: "A4", year: 2023, plate: "02-222-BB", category: "Lüks", transmission: "Otomatik", fuel: "Dizel", seats: 5, pricePerDay: 80, imageUrl: "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800&q=80" },
  ];
  for (const c of carsCompany2) {
    await prisma.car.create({ data: { ...c, companyId: company2.id } });
  }

  // ─── Filo verisi (belge/bakım) — bugüne göreli tarihler ───
  const DAY = 24 * 60 * 60 * 1000;
  const rel = (days: number) => new Date(Date.now() + days * DAY);
  const fleet: Record<string, any> = {
    Golf: { mileage: 85000, condition: "GOOD", insuranceDate: rel(8), inspectionDate: rel(45), nextServiceDate: rel(20), kaskoDate: rel(120) },
    Octavia: { mileage: 62000, condition: "EXCELLENT", insuranceDate: rel(120), inspectionDate: rel(-5), nextServiceDate: rel(90) },
    "320d": { mileage: 44000, condition: "EXCELLENT", insuranceDate: rel(210), inspectionDate: rel(160), kaskoDate: rel(25), nextServiceKm: 45000 },
    Duster: { mileage: 96000, condition: "FAIR", conditionNote: "Ön tampon çizik", insuranceDate: rel(70), inspectionDate: rel(30), nextServiceDate: rel(-3) },
    Vito: { mileage: 131000, condition: "GOOD", insuranceDate: rel(15), inspectionDate: rel(200), nextServiceDate: rel(60) },
    "Model 3": { mileage: 21000, condition: "EXCELLENT", insuranceDate: rel(300), inspectionDate: rel(280), nextServiceDate: rel(150) },
    Clio: { mileage: 78000, condition: "GOOD", insuranceDate: rel(40), inspectionDate: rel(9), nextServiceDate: rel(50) },
    A4: { mileage: 55000, condition: "EXCELLENT", insuranceDate: rel(180), inspectionDate: rel(150), kaskoDate: rel(6) },
  };
  for (const [model, data] of Object.entries(fleet)) {
    const car = await prisma.car.findFirst({ where: { model } });
    if (car) await prisma.car.update({ where: { id: car.id }, data });
  }

  console.log("✔ Seed tamamlandı.");
  console.log("─────────────────────────────────────────────");
  console.log("SÜPER ADMIN:     admin@platform.com / super123");
  console.log("FİRMA 1 ADMIN:   admin@prishtinarent.com / firma123  (/s/prishtina-rent)");
  console.log("FİRMA 2 ADMIN:   admin@prizrencars.com / firma123    (/s/prizren-cars)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
