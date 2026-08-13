import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const company = await prisma.company.findUnique({ where: { slug: "prishtina-rent" } });
if (!company) { console.error("firma yok"); process.exit(1); }

const cars = await prisma.car.findMany({ where: { companyId: company.id } });

const names = [
  "Driton Berisha", "Teuta Gashi", "Arben Krasniqi", "Fatmir Hoxha", "Vlora Kelmendi",
  "Blerim Rexhepi", "Egzon Morina", "Rina Shala", "Leon Dervishi", "Adelina Bytyqi",
  "Kushtrim Zeqiri", "Blerta Ademi",
];

// Müşteriler
const customers = [];
for (const name of names) {
  const email = name.toLowerCase().replace(/[^a-z]/g, ".") + "@example.com";
  const c = await prisma.customer.upsert({
    where: { companyId_email: { companyId: company.id, email } },
    update: {},
    create: { companyId: company.id, name, email, phone: `+383 4${rnd(4,9)} ${rnd(100,999)} ${rnd(100,999)}` },
  });
  customers.push(c);
}

// Geçmiş 30 güne yayılmış tamamlanmış kiralamalar
let created = 0;
for (let i = 0; i < 40; i++) {
  const car = pick(cars);
  const cust = pick(customers);
  const startOffset = rnd(1, 30);
  const days = rnd(1, 6);
  const start = new Date(Date.now() - startOffset * DAY);
  start.setHours(10, 0, 0, 0);
  const end = new Date(start.getTime() + days * DAY);
  await prisma.reservation.create({
    data: {
      companyId: company.id, carId: car.id, customerId: cust.id,
      startDate: start, endDate: end, days,
      totalPrice: days * car.pricePerDay,
      status: Math.random() < 0.85 ? "COMPLETED" : "CONFIRMED",
      source: Math.random() < 0.5 ? "web" : "panel",
      createdAt: start,
    },
  });
  created++;
}

console.log(`✔ ${customers.length} müşteri, ${created} geçmiş kiralama eklendi.`);
await prisma.$disconnect();
