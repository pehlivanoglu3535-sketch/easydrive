"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import type { ReservationStatus, PaymentStatus } from "@prisma/client";

const VALID: ReservationStatus[] = [
  "PENDING",
  "CONFIRMED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
];

/** Personel rezervasyon durumunu değiştirir (firma bazında izole). */
export async function updateReservationStatusAction(formData: FormData) {
  const session = await requireOffice();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as ReservationStatus;
  if (!VALID.includes(status)) return;

  // Yalnızca kendi firmasının rezervasyonu
  const res = await prisma.reservation.findFirst({
    where: { id, companyId: session.companyId },
    include: { car: { select: { id: true, branchId: true } } },
  });
  if (!res) return;

  await prisma.reservation.update({ where: { id }, data: { status } });

  // Tek yön kiralama: araç, teslim şubesinde iade edilince o şubeye AKTARILIR.
  if (
    status === "COMPLETED" &&
    res.dropoffBranchId &&
    res.dropoffBranchId !== res.car.branchId
  ) {
    await prisma.car.update({
      where: { id: res.carId },
      data: { branchId: res.dropoffBranchId },
    });
    revalidatePath("/panel/cars");
  }

  revalidatePath(`/panel/reservations/${id}`);
  revalidatePath("/panel/reservations");
  revalidatePath("/panel");
}

/** Rezervasyonun teslim şubesini ayarlar (tek yön kiralama). */
export async function setDropoffBranchAction(formData: FormData) {
  const session = await requireOffice();
  const id = String(formData.get("id") || "");
  const branchIdRaw = String(formData.get("dropoffBranchId") || "").trim();

  const res = await prisma.reservation.findFirst({ where: { id, companyId: session.companyId } });
  if (!res) return;

  let dropoffBranchId: string | null = null;
  if (branchIdRaw) {
    const b = await prisma.branch.findFirst({ where: { id: branchIdRaw, companyId: session.companyId } });
    dropoffBranchId = b ? b.id : null;
  }
  await prisma.reservation.update({ where: { id }, data: { dropoffBranchId } });
  revalidatePath(`/panel/reservations/${id}`);
}

/** Rezervasyon ödeme durumunu günceller. */
export async function updatePaymentAction(formData: FormData) {
  const session = await requireOffice();
  const id = String(formData.get("id") || "");
  const paymentStatus = String(formData.get("paymentStatus") || "") as PaymentStatus;
  if (!["UNPAID", "PARTIAL", "PAID"].includes(paymentStatus)) return;

  const res = await prisma.reservation.findFirst({ where: { id, companyId: session.companyId } });
  if (!res) return;

  let paidAmount = parseFloat(String(formData.get("paidAmount") || "0")) || 0;
  if (paymentStatus === "PAID") paidAmount = res.totalPrice;
  if (paymentStatus === "UNPAID") paidAmount = 0;

  await prisma.reservation.update({ where: { id }, data: { paymentStatus, paidAmount } });
  revalidatePath(`/panel/reservations/${id}`);
  revalidatePath("/panel/reservations");
}
