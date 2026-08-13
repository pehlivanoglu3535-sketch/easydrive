"use server";

import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { requireOffice, requireCompanyAdmin, hashPassword } from "@/lib/auth";
import { coerceLocale } from "@/lib/i18n/config";

export type SettingsState = { error?: string; ok?: boolean } | undefined;

const ALLOWED_IMAGE = ["png", "jpg", "jpeg", "webp", "svg", "gif"];
const MAX_LOGO_BYTES = 3 * 1024 * 1024; // 3 MB

/** Yüklenen logo dosyasını public/uploads'a kaydeder, yolunu döndürür. */
async function saveLogo(file: File, companyId: string): Promise<string> {
  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const fname = `logo-${companyId}-${Date.now()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, fname), bytes);
  return `/uploads/${fname}`;
}

/** Firma markası/ayarları (yalnızca COMPANY_ADMIN). */
export async function updateCompanySettingsAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const session = await requireCompanyAdmin();

  const name = String(formData.get("name") || "").trim();
  const primaryColor = String(formData.get("primaryColor") || "#2563eb");
  const defaultLocale = coerceLocale(String(formData.get("defaultLocale") || "sq"));
  const contactEmail = String(formData.get("contactEmail") || "").trim() || null;
  const contactPhone = String(formData.get("contactPhone") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;
  const city = String(formData.get("city") || "").trim() || "Prishtinë";
  const taxId = String(formData.get("taxId") || "").trim() || null;
  const website = String(formData.get("website") || "").trim() || null;
  const instagram = String(formData.get("instagram") || "").trim() || null;
  const facebook = String(formData.get("facebook") || "").trim() || null;
  const whatsapp = String(formData.get("whatsapp") || "").trim() || null;

  if (!name) return { error: "Firma adı zorunludur." };

  // Logo: yeni dosya yüklendiyse onu kullan, yoksa URL alanını (varsa) koru
  const urlField = String(formData.get("logoUrl") || "").trim();
  let logoUrl: string | null | undefined = urlField || undefined; // undefined = değiştirme
  const removeLogo = String(formData.get("removeLogo") || "") === "1";

  const file = formData.get("logoFile");
  if (file && typeof file === "object" && "size" in file && file.size > 0) {
    const f = file as File;
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_IMAGE.includes(ext)) {
      return { error: "Logo formatı desteklenmiyor (png, jpg, webp, svg, gif)." };
    }
    if (f.size > MAX_LOGO_BYTES) {
      return { error: "Logo dosyası çok büyük (en fazla 3 MB)." };
    }
    logoUrl = await saveLogo(f, session.companyId);
  } else if (removeLogo) {
    logoUrl = null;
  } else if (!urlField) {
    logoUrl = undefined; // ne dosya ne URL: mevcut logoyu koru
  }

  await prisma.company.update({
    where: { id: session.companyId },
    data: {
      name, primaryColor, defaultLocale, contactEmail, contactPhone, address, city,
      taxId, website, instagram, facebook, whatsapp,
      ...(logoUrl !== undefined ? { logoUrl } : {}),
    },
  });
  revalidatePath("/panel/settings");
  revalidatePath("/panel");
  return { ok: true };
}

/** Lokasyon (şube/teslim noktası) ekle. */
export async function createLocationAction(formData: FormData) {
  const session = await requireOffice();
  const name = String(formData.get("name") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const address = String(formData.get("address") || "").trim() || null;
  if (!name || !city) return;

  await prisma.location.create({
    data: { companyId: session.companyId, name, city, address },
  });
  revalidatePath("/panel/settings");
}

/** Lokasyon sil. */
export async function deleteLocationAction(formData: FormData) {
  const session = await requireOffice();
  const id = String(formData.get("id") || "");
  const owned = await prisma.location.findFirst({
    where: { id, companyId: session.companyId },
  });
  if (!owned) return;
  await prisma.location.delete({ where: { id } });
  revalidatePath("/panel/settings");
}

/** Şube ekle. */
export async function createBranchAction(formData: FormData) {
  const session = await requireOffice();
  const name = String(formData.get("name") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const address = String(formData.get("address") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  if (!name || !city) return;
  await prisma.branch.create({ data: { companyId: session.companyId, name, city, address, phone } });
  revalidatePath("/panel/settings");
}

/** Şube sil (araç/rezervasyon bağı SetNull olur). */
export async function deleteBranchAction(formData: FormData) {
  const session = await requireOffice();
  const id = String(formData.get("id") || "");
  const owned = await prisma.branch.findFirst({ where: { id, companyId: session.companyId } });
  if (!owned) return;
  await prisma.branch.delete({ where: { id } });
  revalidatePath("/panel/settings");
}

/** Personel ekle (yalnızca COMPANY_ADMIN). */
export async function createStaffAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const session = await requireCompanyAdmin();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "STAFF");

  if (!name || !email || !password) return { error: "Tüm alanlar zorunludur." };
  if (password.length < 6) return { error: "Şifre en az 6 karakter olmalıdır." };

  const taken = await prisma.user.findUnique({ where: { email } });
  if (taken) return { error: "Bu e-posta zaten kayıtlı." };

  const branchIdRaw = String(formData.get("branchId") || "").trim();
  let branchId: string | null = null;
  if (branchIdRaw) {
    const b = await prisma.branch.findFirst({ where: { id: branchIdRaw, companyId: session.companyId } });
    branchId = b ? b.id : null;
  }

  const validRole = ["COMPANY_ADMIN", "STAFF", "HANDOVER"].includes(role) ? role : "STAFF";
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: validRole as "COMPANY_ADMIN" | "STAFF" | "HANDOVER",
      locale: session.locale,
      companyId: session.companyId,
      branchId,
    },
  });
  revalidatePath("/panel/settings");
  return { ok: true };
}

export async function deleteStaffAction(formData: FormData) {
  const session = await requireCompanyAdmin();
  const id = String(formData.get("id") || "");
  if (id === session.userId) return; // kendini silemez
  const owned = await prisma.user.findFirst({
    where: { id, companyId: session.companyId },
  });
  if (!owned) return;
  await prisma.user.delete({ where: { id } });
  revalidatePath("/panel/settings");
}
