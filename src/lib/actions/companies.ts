"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";
import { coerceLocale } from "@/lib/i18n/config";
import type { CompanyStatus } from "@prisma/client";

export type CompanyState = { error?: string } | undefined;

function slugify(v: string) {
  return v
    .toLowerCase()
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Süper admin yeni firma + ilk yönetici hesabı oluşturur. */
export async function createCompanyAction(
  _prev: CompanyState,
  formData: FormData
): Promise<CompanyState> {
  await requireSuperAdmin();

  const name = String(formData.get("name") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const slug = slugify(slugInput || name);
  const primaryColor = String(formData.get("primaryColor") || "#2563eb");
  const defaultLocale = coerceLocale(String(formData.get("defaultLocale") || "sq"));
  const city = String(formData.get("city") || "Prishtinë").trim();
  const contactEmail = String(formData.get("contactEmail") || "").trim() || null;
  const contactPhone = String(formData.get("contactPhone") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;
  const taxId = String(formData.get("taxId") || "").trim() || null;
  const website = String(formData.get("website") || "").trim() || null;
  const instagram = String(formData.get("instagram") || "").trim() || null;
  const facebook = String(formData.get("facebook") || "").trim() || null;
  const whatsapp = String(formData.get("whatsapp") || "").trim() || null;
  const status = String(formData.get("status") || "TRIAL") as CompanyStatus;

  // Logo (opsiyonel)
  const logoFile = formData.get("logoFile");
  let logoUrl: string | null = null;
  if (logoFile && typeof logoFile === "object" && "size" in logoFile && (logoFile as File).size > 0) {
    logoUrl = await saveUpload(logoFile as File, `logo-${slug}`);
  }

  // İlk yönetici bilgileri
  const adminName = String(formData.get("adminName") || "").trim();
  const adminEmail = String(formData.get("adminEmail") || "").trim().toLowerCase();
  const adminPassword = String(formData.get("adminPassword") || "");

  if (!name || !slug) return { error: "Firma adı zorunludur." };
  if (!adminName || !adminEmail || !adminPassword) {
    return { error: "Yönetici adı, e-postası ve şifresi zorunludur." };
  }
  if (adminPassword.length < 6) {
    return { error: "Yönetici şifresi en az 6 karakter olmalıdır." };
  }

  const slugTaken = await prisma.company.findUnique({ where: { slug } });
  if (slugTaken) return { error: `"${slug}" adresi zaten kullanımda.` };

  const emailTaken = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (emailTaken) return { error: "Bu yönetici e-postası zaten kayıtlı." };

  const company = await prisma.company.create({
    data: {
      name,
      slug,
      primaryColor,
      defaultLocale,
      currency: "EUR",
      city,
      contactEmail,
      contactPhone,
      address,
      taxId,
      website,
      instagram,
      facebook,
      whatsapp,
      logoUrl,
      status,
      users: {
        create: {
          name: adminName,
          email: adminEmail,
          passwordHash: await hashPassword(adminPassword),
          role: "COMPANY_ADMIN",
          locale: defaultLocale,
        },
      },
    },
  });

  revalidatePath("/admin");
  redirect(`/admin/companies/${company.id}`);
}

/** Firma durumunu değiştir (TRIAL/ACTIVE/SUSPENDED). */
export async function setCompanyStatusAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as CompanyStatus;
  if (!["TRIAL", "ACTIVE", "SUSPENDED"].includes(status)) return;

  await prisma.company.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
  revalidatePath(`/admin/companies/${id}`);
}

/** Abonelik planı + aylık ücret. */
export async function updateCompanyPlanAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") || "");
  const plan = String(formData.get("plan") || "TRIAL");
  const planPriceMonthly = parseFloat(String(formData.get("planPriceMonthly") || "0")) || 0;
  const valid = ["TRIAL", "BASIC", "PRO", "ENTERPRISE"];
  await prisma.company.update({
    where: { id },
    data: { plan: (valid.includes(plan) ? plan : "TRIAL") as never, planPriceMonthly },
  });
  revalidatePath(`/admin/companies/${id}`);
}

/** Abonelik faturası oluştur. */
export async function createInvoiceAction(formData: FormData) {
  await requireSuperAdmin();
  const companyId = String(formData.get("companyId") || "");
  const period = String(formData.get("period") || "").trim();
  const amount = parseFloat(String(formData.get("amount") || "0")) || 0;
  if (!companyId || !period || amount <= 0) return;
  await prisma.invoice.create({ data: { companyId, period, amount, status: "UNPAID" } });
  revalidatePath(`/admin/companies/${companyId}`);
}

/** Faturayı ödendi işaretle / geri al. */
export async function toggleInvoicePaidAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") || "");
  const inv = await prisma.invoice.findUnique({ where: { id } });
  if (!inv) return;
  const paid = inv.status !== "PAID";
  await prisma.invoice.update({ where: { id }, data: { status: paid ? "PAID" : "UNPAID", paidAt: paid ? new Date() : null } });
  revalidatePath(`/admin/companies/${inv.companyId}`);
}
