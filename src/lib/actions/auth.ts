"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";

export type AuthState = { error?: string } | undefined;

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  // Hata kodları döner; kullanıcıya gösterilen metin client'ta (dile göre) çevrilir.
  if (!email || !password) {
    return { error: "missing" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true },
  });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "invalid" };
  }

  // Firma askıya alınmışsa (süper admin hariç) girişi engelle
  if (user.role !== "SUPER_ADMIN" && user.company?.status === "SUSPENDED") {
    return { error: "suspended" };
  }

  await createSession({
    userId: user.id,
    role: user.role,
    companyId: user.companyId,
    branchId: user.branchId,
    name: user.name,
    email: user.email,
    locale: user.locale,
  });

  redirect(user.role === "SUPER_ADMIN" ? "/admin" : "/panel");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
