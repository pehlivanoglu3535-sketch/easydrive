"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { coerceLocale } from "@/lib/i18n/config";
import { SITE_LOCALE_COOKIE } from "@/lib/i18n/server";

/** Müşteri sitesi dilini değiştirir (cookie'ye yazar). */
export async function setSiteLocaleAction(formData: FormData) {
  const locale = coerceLocale(String(formData.get("locale") || ""));
  const path = String(formData.get("path") || "/");
  const store = await cookies();
  store.set(SITE_LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath(path);
}
