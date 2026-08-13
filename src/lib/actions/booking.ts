"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { diffInDays, isCarAvailable } from "@/lib/utils";
import { computeRental, computeMonthly, type PricingRuleLite } from "@/lib/pricing";
import type { RentalType } from "@prisma/client";

export type BookingState = { error?: string } | undefined;

/**
 * Herkese açık (misafir) rezervasyon — markalı müşteri sitesinden.
 * Müşteri kaydı e-posta ile firma bazında upsert edilir.
 */
export async function createPublicBookingAction(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  const slug = String(formData.get("slug") || "");
  const carId = String(formData.get("carId") || "");
  const startStr = String(formData.get("startDate") || "");
  const endStr = String(formData.get("endDate") || "");
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const note = String(formData.get("note") || "").trim();
  const pickupLocationId = String(formData.get("pickupLocationId") || "");
  const dropoffLocationId = String(formData.get("dropoffLocationId") || "");

  if (!name || !email || !startStr || !endStr) {
    return { error: "Lütfen zorunlu alanları doldurun." };
  }

  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company || company.status === "SUSPENDED") {
    return { error: "Firma bulunamadı." };
  }

  const car = await prisma.car.findFirst({
    where: { id: carId, companyId: company.id },
  });
  if (!car) return { error: "Araç bulunamadı." };

  const start = new Date(startStr);
  const end = new Date(endStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (start < today) return { error: "Alış tarihi geçmiş olamaz." };
  if (end <= start) return { error: "İade tarihi alıştan sonra olmalı." };

  const available = await isCarAvailable(company.id, carId, start, end);
  if (!available) {
    return { error: "Seçilen tarihlerde bu araç müsait değil." };
  }

  const customer = await prisma.customer.upsert({
    where: { companyId_email: { companyId: company.id, email } },
    update: { name, phone: phone || undefined },
    create: { companyId: company.id, name, email, phone: phone || null },
  });

  // Kiralama tipi + fiyat hesabı
  const rentalType = (String(formData.get("rentalType") || "DAILY") === "MONTHLY" ? "MONTHLY" : "DAILY") as RentalType;
  let days: number;
  let totalPrice: number;
  if (rentalType === "MONTHLY" && car.monthlyPrice) {
    days = diffInDays(start, end);
    totalPrice = computeMonthly(car.monthlyPrice, start, end).total;
  } else {
    const rules = (await prisma.pricingRule.findMany({ where: { companyId: company.id } })) as unknown as PricingRuleLite[];
    const r = computeRental(car.pricePerDay, car.category, start, end, rules);
    days = r.days;
    totalPrice = r.total;
  }

  const reservation = await prisma.reservation.create({
    data: {
      companyId: company.id,
      carId,
      customerId: customer.id,
      branchId: car.branchId,
      pickupLocationId: pickupLocationId || null,
      dropoffLocationId: dropoffLocationId || null,
      startDate: start,
      endDate: end,
      days,
      totalPrice,
      rentalType,
      note: note || null,
      status: "PENDING",
      source: "web",
    },
  });

  redirect(`/s/${slug}/success?r=${reservation.id}`);
}
