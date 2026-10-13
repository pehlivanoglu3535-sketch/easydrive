"use server";

import { prisma } from "@/lib/db";
import { isValidSlot } from "@/lib/appointments";

export type AppointmentState = { ok?: boolean; error?: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function bookAppointmentAction(
  _prev: AppointmentState,
  formData: FormData
): Promise<AppointmentState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const note = String(formData.get("note") || "").trim();
  const slotIso = String(formData.get("slot") || "").trim();
  const serviceSlug = String(formData.get("serviceSlug") || "").trim();
  const trap = String(formData.get("website") || "").trim();

  if (!name || !email || !slotIso) {
    return { error: "Lütfen ad, e-posta ve bir randevu saati seçin." };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Geçerli bir e-posta adresi girin." };
  }
  if (!isValidSlot(slotIso)) {
    return { error: "Seçilen randevu saati geçersiz. Lütfen listeden güncel bir saat seçin." };
  }
  if (trap) {
    return { ok: true };
  }

  const slot = new Date(slotIso);

  // Çifte rezervasyon kontrolü (yarış durumu için DB kısıtı da yakalar)
  const existing = await prisma.appointment.findFirst({
    where: { slot, status: { in: ["PENDING", "CONFIRMED"] } },
    select: { id: true },
  });
  if (existing) {
    return { error: "Bu saat az önce doldu. Lütfen başka bir saat seçin." };
  }

  let serviceId: string | null = null;
  if (serviceSlug) {
    const service = await prisma.service.findUnique({ where: { slug: serviceSlug }, select: { id: true } });
    serviceId = service?.id ?? null;
  }

  await prisma.appointment.create({
    data: {
      name,
      email,
      phone: phone || null,
      note: note || null,
      slot,
      serviceId,
    },
  });

  return { ok: true };
}
