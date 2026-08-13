"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import type { PricingKind } from "@prisma/client";

export type PricingState = { error?: string; ok?: boolean } | undefined;

export async function createPricingRuleAction(
  _prev: PricingState,
  formData: FormData
): Promise<PricingState> {
  const session = await requireOffice();
  const name = String(formData.get("name") || "").trim();
  const startStr = String(formData.get("startDate") || "");
  const endStr = String(formData.get("endDate") || "");
  const category = String(formData.get("category") || "").trim() || null;
  const kind = (String(formData.get("kind") || "PERCENT") === "ABSOLUTE" ? "ABSOLUTE" : "PERCENT") as PricingKind;
  const value = parseFloat(String(formData.get("value") || "0"));
  const priority = parseInt(String(formData.get("priority") || "0"), 10) || 0;

  if (!name || !startStr || !endStr) return { error: "Ad ve tarih aralığı zorunludur." };
  const start = new Date(startStr), end = new Date(endStr);
  if (end < start) return { error: "Bitiş tarihi başlangıçtan önce olamaz." };
  if (isNaN(value)) return { error: "Geçerli bir değer girin." };

  await prisma.pricingRule.create({
    data: { companyId: session.companyId, name, startDate: start, endDate: end, category, kind, value, priority },
  });
  revalidatePath("/panel/pricing");
  return { ok: true };
}

export async function deletePricingRuleAction(formData: FormData) {
  const session = await requireOffice();
  const id = String(formData.get("id") || "");
  const owned = await prisma.pricingRule.findFirst({ where: { id, companyId: session.companyId } });
  if (!owned) return;
  await prisma.pricingRule.delete({ where: { id } });
  revalidatePath("/panel/pricing");
}
