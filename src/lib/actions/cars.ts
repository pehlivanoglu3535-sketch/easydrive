"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import type { CarStatus, CarCondition } from "@prisma/client";

export type CarState = { error?: string } | undefined;

function parseDate(v: FormDataEntryValue | null): Date | null {
  const s = String(v || "").trim();
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function parseIntOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v || "").trim();
  if (!s) return null;
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

function floatOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v || "").trim();
  if (!s) return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

/** branchId gerçekten bu firmaya ait mi? Değilse null. */
async function validBranch(companyId: string, branchId: string | null): Promise<string | null> {
  if (!branchId) return null;
  const b = await prisma.branch.findFirst({ where: { id: branchId, companyId } });
  return b ? b.id : null;
}

function parseCarForm(formData: FormData) {
  const conditionRaw = String(formData.get("condition") || "GOOD");
  const condition = (["EXCELLENT", "GOOD", "FAIR", "POOR"].includes(conditionRaw)
    ? conditionRaw
    : "GOOD") as CarCondition;
  return {
    make: String(formData.get("make") || "").trim(),
    model: String(formData.get("model") || "").trim(),
    year: parseInt(String(formData.get("year") || "0"), 10) || 2024,
    plate: String(formData.get("plate") || "").trim().toUpperCase(),
    category: String(formData.get("category") || "Ekonomik"),
    transmission: String(formData.get("transmission") || "Manuel"),
    fuel: String(formData.get("fuel") || "Benzin"),
    seats: parseInt(String(formData.get("seats") || "5"), 10) || 5,
    pricePerDay: parseFloat(String(formData.get("pricePerDay") || "0")),
    monthlyPrice: floatOrNull(formData.get("monthlyPrice")),
    branchId: String(formData.get("branchId") || "").trim() || null,
    imageUrl: String(formData.get("imageUrl") || "").trim() || null,
    status: String(formData.get("status") || "AVAILABLE") as CarStatus,
    // Filo yönetimi
    mileage: parseInt(String(formData.get("mileage") || "0"), 10) || 0,
    condition,
    conditionNote: String(formData.get("conditionNote") || "").trim() || null,
    inspectionDate: parseDate(formData.get("inspectionDate")),
    insuranceDate: parseDate(formData.get("insuranceDate")),
    kaskoDate: parseDate(formData.get("kaskoDate")),
    nextServiceDate: parseDate(formData.get("nextServiceDate")),
    nextServiceKm: parseIntOrNull(formData.get("nextServiceKm")),
  };
}

export async function createCarAction(
  _prev: CarState,
  formData: FormData
): Promise<CarState> {
  const session = await requireOffice();
  const data = parseCarForm(formData);

  if (!data.make || !data.model || !data.plate || !data.pricePerDay) {
    return { error: "Marka, model, plaka ve günlük ücret zorunludur." };
  }

  const existing = await prisma.car.findFirst({
    where: { companyId: session.companyId, plate: data.plate },
  });
  if (existing) return { error: "Bu plaka firmanızda zaten kayıtlı." };

  data.branchId = await validBranch(session.companyId, data.branchId);
  await prisma.car.create({ data: { ...data, companyId: session.companyId } });
  revalidatePath("/panel/cars");
  redirect("/panel/cars");
}

export async function updateCarAction(
  _prev: CarState,
  formData: FormData
): Promise<CarState> {
  const session = await requireOffice();
  const id = String(formData.get("id") || "");
  const data = parseCarForm(formData);

  const owned = await prisma.car.findFirst({
    where: { id, companyId: session.companyId },
  });
  if (!owned) return { error: "Araç bulunamadı." };

  if (!data.make || !data.model || !data.plate || !data.pricePerDay) {
    return { error: "Marka, model, plaka ve günlük ücret zorunludur." };
  }

  const clash = await prisma.car.findFirst({
    where: { companyId: session.companyId, plate: data.plate, id: { not: id } },
  });
  if (clash) return { error: "Bu plaka başka bir araçta kayıtlı." };

  data.branchId = await validBranch(session.companyId, data.branchId);
  await prisma.car.update({ where: { id }, data });
  revalidatePath("/panel/cars");
  redirect("/panel/cars");
}

export async function deleteCarAction(formData: FormData) {
  const session = await requireOffice();
  const id = String(formData.get("id") || "");
  const owned = await prisma.car.findFirst({
    where: { id, companyId: session.companyId },
  });
  if (!owned) return;

  const activeCount = await prisma.reservation.count({
    where: { carId: id, status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] } },
  });
  if (activeCount > 0) {
    await prisma.car.update({ where: { id }, data: { status: "RETIRED" } });
  } else {
    await prisma.reservation.deleteMany({ where: { carId: id } });
    await prisma.car.delete({ where: { id } });
  }
  revalidatePath("/panel/cars");
}
