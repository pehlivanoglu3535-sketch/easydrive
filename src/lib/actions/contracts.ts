"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";

export type ContractState = { error?: string; ok?: boolean } | undefined;

function companyCode(name: string): string {
  const letters = name.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, "").toUpperCase();
  return (letters.slice(0, 3) || "SOZ");
}

function intOrNull(v: FormDataEntryValue | null): number | null {
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

/** Rezervasyon için kira sözleşmesi oluşturur/günceller. */
export async function saveContractAction(
  _prev: ContractState,
  formData: FormData
): Promise<ContractState> {
  const session = await requireOffice();
  const reservationId = String(formData.get("reservationId") || "");

  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, companyId: session.companyId },
    include: { contract: true, company: true },
  });
  if (!reservation) return { error: "Rezervasyon bulunamadı." };

  // Hasar fotoğrafı (opsiyonel)
  let damagePhotoUrl: string | null | undefined = undefined; // undefined = değiştirme
  const photo = formData.get("damagePhoto");
  if (photo && typeof photo === "object" && "size" in photo && (photo as File).size > 0) {
    damagePhotoUrl = await saveUpload(photo as File, `damage-${reservationId}`);
  }

  const data = {
    startMileage: intOrNull(formData.get("startMileage")),
    endMileage: intOrNull(formData.get("endMileage")),
    fuelLevelOut: String(formData.get("fuelLevelOut") || "").trim() || null,
    fuelLevelIn: String(formData.get("fuelLevelIn") || "").trim() || null,
    depositAmount: floatOrNull(formData.get("depositAmount")),
    signedAt: String(formData.get("signed") || "") === "1" ? new Date() : null,
    extraDriverName: String(formData.get("extraDriverName") || "").trim() || null,
    extraDriverLicense: String(formData.get("extraDriverLicense") || "").trim() || null,
    insurancePackage: String(formData.get("insurancePackage") || "").trim() || null,
    insuranceFee: floatOrNull(formData.get("insuranceFee")),
    extras: String(formData.get("extras") || "").trim() || null,
    extrasFee: floatOrNull(formData.get("extrasFee")),
    damageNote: String(formData.get("damageNote") || "").trim() || null,
    ...(damagePhotoUrl !== undefined ? { damagePhotoUrl } : {}),
  };

  if (reservation.contract) {
    await prisma.contract.update({ where: { id: reservation.contract.id }, data });
  } else {
    const year = new Date().getFullYear();
    const code = companyCode(reservation.company.name);
    const count = await prisma.contract.count({
      where: { reservation: { companyId: session.companyId } },
    });
    let contractNo = `${code}-${year}-${String(count + 1).padStart(4, "0")}`;
    // benzersizlik güvencesi
    for (let i = 0; i < 5; i++) {
      const clash = await prisma.contract.findUnique({ where: { contractNo } });
      if (!clash) break;
      contractNo = `${code}-${year}-${String(count + 1 + i + 1).padStart(4, "0")}`;
    }
    await prisma.contract.create({ data: { ...data, reservationId, contractNo } });
  }

  revalidatePath(`/panel/reservations/${reservationId}`);
  return { ok: true };
}
