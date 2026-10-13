"use server";

import { prisma } from "@/lib/db";

export type ContactState = { ok?: boolean; error?: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactAction(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const serviceSlug = String(formData.get("serviceSlug") || "").trim();
  const kind = String(formData.get("kind") || "contact") === "quote" ? "quote" : "contact";
  // Bal küpü (bot koruması): doldurulmuşsa sessizce başarı döneriz.
  const trap = String(formData.get("website") || "").trim();

  if (!name || !email || !message) {
    return { error: "Lütfen ad, e-posta ve mesaj alanlarını doldurun." };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Geçerli bir e-posta adresi girin." };
  }
  if (message.length < 10) {
    return { error: "Mesajınız çok kısa. Lütfen biraz daha ayrıntı verin." };
  }
  if (trap) {
    return { ok: true };
  }

  let serviceId: string | null = null;
  if (serviceSlug) {
    const service = await prisma.service.findUnique({ where: { slug: serviceSlug }, select: { id: true } });
    serviceId = service?.id ?? null;
  }

  await prisma.contactMessage.create({
    data: {
      name,
      email,
      phone: phone || null,
      company: company || null,
      subject: subject || null,
      message,
      kind,
      serviceId,
    },
  });

  return { ok: true };
}
