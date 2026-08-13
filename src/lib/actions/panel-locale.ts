"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { PANEL_LOCALE_COOKIE } from "@/lib/i18n/panel-locale-shared";

export async function setPanelLocaleAction(formData: FormData) {
  const loc = String(formData.get("locale") || "");
  const value = loc === "sq" || loc === "en" || loc === "tr" ? loc : "tr";
  const path = String(formData.get("path") || "/panel");
  const store = await cookies();
  store.set(PANEL_LOCALE_COOKIE, value, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath(path);
}
