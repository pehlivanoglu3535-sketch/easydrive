"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";

export type InspectionState = { error?: string } | undefined;

const PHOTO_FIELDS = [
  "photoFront", "photoBack", "photoLeft", "photoRight", "photoInteriorFront", "photoInteriorBack",
] as const;

/** Araç teslim/iade kontrol formunu kaydeder; teslim ise rezervasyonu ACTIVE, iade ise COMPLETED yapar. */
export async function saveInspectionAction(
  _prev: InspectionState,
  formData: FormData
): Promise<InspectionState> {
  const session = await requireCompany();
  const reservationId = String(formData.get("reservationId") || "");

  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, companyId: session.companyId },
    include: { car: { select: { id: true, branchId: true } } },
  });
  if (!reservation) return { error: "Rezervasyon bulunamadı." };

  const kind = reservation.status === "ACTIVE" ? "RETURN" : "PICKUP";
  if (kind === "PICKUP" && reservation.status !== "CONFIRMED") {
    return { error: "Bu araç teslime hazır değil (rezervasyon onaylı olmalı)." };
  }

  const mileage = parseInt(String(formData.get("mileage") || ""), 10);
  const fuelLevel = String(formData.get("fuelLevel") || "").trim() || null;
  const damageNote = String(formData.get("damageNote") || "").trim() || null;
  const signatureUrl = String(formData.get("signature") || "").trim() || null;

  // Fotoğrafları kaydet
  const photos: Record<string, string | null> = {};
  for (const field of PHOTO_FIELDS) {
    const f = formData.get(field);
    photos[field] = f && typeof f === "object" && "size" in f && (f as File).size > 0
      ? await saveUpload(f as File, `insp-${field}-${reservationId}`)
      : null;
  }

  await prisma.inspection.create({
    data: {
      reservationId,
      kind,
      staffId: session.userId,
      mileage: isNaN(mileage) ? null : mileage,
      fuelLevel,
      damageNote,
      signatureUrl,
      ...photos,
    },
  });

  // Araç km güncelle
  if (!isNaN(mileage)) {
    await prisma.car.update({ where: { id: reservation.carId }, data: { mileage } });
  }

  if (kind === "PICKUP") {
    await prisma.reservation.update({ where: { id: reservationId }, data: { status: "ACTIVE" } });
  } else {
    await prisma.reservation.update({ where: { id: reservationId }, data: { status: "COMPLETED" } });
    // Tek yön: iade şubesine aktar
    if (reservation.dropoffBranchId && reservation.dropoffBranchId !== reservation.car.branchId) {
      await prisma.car.update({ where: { id: reservation.carId }, data: { branchId: reservation.dropoffBranchId } });
    }
  }

  revalidatePath("/panel/handover");
  revalidatePath(`/panel/reservations/${reservationId}`);
  revalidatePath("/panel");
  redirect("/panel/handover?ok=1");
}
