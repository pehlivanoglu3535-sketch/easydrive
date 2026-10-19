"use server";

import { getDb } from "@/lib/db";
import { appointment } from "@/lib/schema";
import { isValidSlot } from "@/lib/appointments";
import { notifyOwner } from "@/lib/notify";
import { formatDateTime } from "@/lib/utils";

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
  const db = getDb();

  // Çifte rezervasyon kontrolü (uygulama seviyesinde)
  const existing = await db.query.appointment.findFirst({
    where: (a, { and, eq, inArray }) => and(eq(a.slot, slot), inArray(a.status, ["PENDING", "CONFIRMED"])),
    columns: { id: true },
  });
  if (existing) {
    return { error: "Bu saat az önce doldu. Lütfen başka bir saat seçin." };
  }

  let serviceId: string | null = null;
  let serviceTitle = "";
  if (serviceSlug) {
    const svc = await db.query.service.findFirst({
      where: (s, { eq }) => eq(s.slug, serviceSlug),
      columns: { id: true, title: true },
    });
    serviceId = svc?.id ?? null;
    serviceTitle = svc?.title ?? "";
  }

  await db.insert(appointment).values({
    name,
    email,
    phone: phone || null,
    note: note || null,
    slot,
    serviceId,
  });

  // Site sahibine WhatsApp bildirimi (yapılandırılmışsa)
  const lines = [
    "📅 Yeni Randevu Talebi",
    `👤 ${name}`,
    phone ? `📞 ${phone}` : "",
    `✉️ ${email}`,
    `🕒 ${formatDateTime(slot)}`,
    serviceTitle ? `🧩 ${serviceTitle}` : "",
    note ? `📝 ${note}` : "",
  ].filter(Boolean);
  await notifyOwner(lines.join("\n"));

  return { ok: true };
}
