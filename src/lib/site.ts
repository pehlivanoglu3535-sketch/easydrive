import "server-only";
import { notFound } from "next/navigation";
import { prisma } from "./db";
import { getSiteLocale } from "./i18n/server";
import { getDictionary } from "./i18n/dictionaries";

/** Slug'dan firma + aktif dil + sözlük çözer. Yoksa/askıdaysa 404. */
export async function getCompanyContext(slug: string) {
  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company || company.status === "SUSPENDED") notFound();
  const locale = await getSiteLocale(company.defaultLocale);
  const dict = getDictionary(locale);
  return { company, locale, dict };
}
