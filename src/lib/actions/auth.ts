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

  if (!email || !password) {
    return { error: "E-posta ve şifre gereklidir." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true },
  });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "E-posta veya şifre hatalı." };
  }

  // Firma askıya alınmışsa (süper admin hariç) girişi engelle
  if (user.role !== "SUPER_ADMIN" && user.company?.status === "SUSPENDED") {
    return { error: "Firmanızın erişimi askıya alınmış. Lütfen bizimle iletişime geçin." };
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
