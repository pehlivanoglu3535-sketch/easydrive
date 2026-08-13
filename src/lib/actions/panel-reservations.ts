"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import { diffInDays, isCarAvailable } from "@/lib/utils";
import { computeRental, computeMonthly, type PricingRuleLite } from "@/lib/pricing";
import type { RentalType, ReservationStatus } from "@prisma/client";

export type NewReservationState = { error?: string } | undefined;

/** Personel (gişe) rezervasyonu oluşturur. */
export async function createReservationAction(
  _prev: NewReservationState,
  formData: FormData
): Promise<NewReservationState> {
  const session = await requireOffice();
  const companyId = session.companyId;

  const carId = String(formData.get("carId") || "");
  const startStr = String(formData.get("startDate") || "");
  const endStr = String(formData.get("endDate") || "");
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const idNumber = String(formData.get("idNumber") || "").trim() || null;
  const licenseNo = String(formData.get("licenseNo") || "").trim() || null;
  const note = String(formData.get("note") || "").trim() || null;
  const pickupLocationId = String(formData.get("pickupLocationId") || "") || null;
  const dropoffLocationId = String(formData.get("dropoffLocationId") || "") || null;
  const pickupBranchIdRaw = String(formData.get("pickupBranchId") || "").trim();
  const dropoffBranchIdRaw = String(formData.get("dropoffBranchId") || "").trim();
  const rentalType = (String(formData.get("rentalType") || "DAILY") === "MONTHLY" ? "MONTHLY" : "DAILY") as RentalType;
  const statusRaw = String(formData.get("status") || "CONFIRMED");
  const status = (["PENDING", "CONFIRMED", "ACTIVE"].includes(statusRaw) ? statusRaw : "CONFIRMED") as ReservationStatus;

  if (!carId || !startStr || !endStr) return { error: "Araç ve tarih alanları zorunludur." };
  if (!name) return { error: "Müşteri adı zorunludur." };

  const car = await prisma.car.findFirst({ where: { id: carId, companyId } });
  if (!car) return { error: "Araç bulunamadı." };

  // Şube doğrulama (firmaya ait mi?)
  const validB = async (v: string) => (v ? (await prisma.branch.findFirst({ where: { id: v, companyId } }))?.id ?? null : null);
  const pickupBranchId = (await validB(pickupBranchIdRaw)) ?? car.branchId;
  const dropoffBranchId = (await validB(dropoffBranchIdRaw)) ?? pickupBranchId;

  const start = new Date(startStr), end = new Date(endStr);
  if (end <= start) return { error: "İade tarihi alıştan sonra olmalı." };

  const available = await isCarAvailable(companyId, carId, start, end);
  if (!available) return { error: "Seçilen tarihlerde bu araç müsait değil." };

  // Müşteri kaydı
  let customerId: string;
  if (email) {
    const cust = await prisma.customer.upsert({
      where: { companyId_email: { companyId, email } },
      update: { name, phone: phone || undefined, idNumber: idNumber || undefined, licenseNo: licenseNo || undefined },
      create: { companyId, name, email, phone, idNumber, licenseNo },
    });
    customerId = cust.id;
  } else {
    const cust = await prisma.customer.create({
      data: { companyId, name, email: `walkin-${Date.now()}@rentflow.local`, phone, idNumber, licenseNo },
    });
    customerId = cust.id;
  }

  // Fiyat
  let days: number, totalPrice: number;
  if (rentalType === "MONTHLY" && car.monthlyPrice) {
    days = diffInDays(start, end);
    totalPrice = computeMonthly(car.monthlyPrice, start, end).total;
  } else {
    const rules = (await prisma.pricingRule.findMany({ where: { companyId } })) as unknown as PricingRuleLite[];
    const r = computeRental(car.pricePerDay, car.category, start, end, rules);
    days = r.days; totalPrice = r.total;
  }

  const reservation = await prisma.reservation.create({
    data: {
      companyId, carId, customerId,
      branchId: pickupBranchId, pickupBranchId, dropoffBranchId,
      pickupLocationId, dropoffLocationId,
      startDate: start, endDate: end, days, totalPrice, rentalType, status,
      note, source: "panel",
    },
  });

  revalidatePath("/panel/reservations");
  revalidatePath("/panel");
  redirect(`/panel/reservations/${reservation.id}`);
}

/** Müşterinin kimlik/ehliyet/telefon bilgisini günceller (sözleşme için). */
export async function updateCustomerInfoAction(formData: FormData) {
  const session = await requireOffice();
  const id = String(formData.get("customerId") || "");
  const customer = await prisma.customer.findFirst({ where: { id, companyId: session.companyId } });
  if (!customer) return;

  await prisma.customer.update({
    where: { id },
    data: {
      phone: String(formData.get("phone") || "").trim() || null,
      idNumber: String(formData.get("idNumber") || "").trim() || null,
      licenseNo: String(formData.get("licenseNo") || "").trim() || null,
    },
  });
  const rid = String(formData.get("reservationId") || "");
  if (rid) revalidatePath(`/panel/reservations/${rid}`);
  revalidatePath(`/panel/customers/${id}`);
}

export type CustomerState = { error?: string; ok?: boolean } | undefined;

/** Müşteri detay sayfasından tam güncelleme (ad + iletişim + kimlik). */
export async function updateCustomerAction(
  _prev: CustomerState,
  formData: FormData
): Promise<CustomerState> {
  const session = await requireOffice();
  const id = String(formData.get("customerId") || "");
  const customer = await prisma.customer.findFirst({ where: { id, companyId: session.companyId } });
  if (!customer) return { error: "Müşteri bulunamadı." };

  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Ad Soyad zorunludur." };

  await prisma.customer.update({
    where: { id },
    data: {
      name,
      phone: String(formData.get("phone") || "").trim() || null,
      idNumber: String(formData.get("idNumber") || "").trim() || null,
      licenseNo: String(formData.get("licenseNo") || "").trim() || null,
    },
  });
  revalidatePath(`/panel/customers/${id}`);
  revalidatePath("/panel/customers");
  return { ok: true };
}
