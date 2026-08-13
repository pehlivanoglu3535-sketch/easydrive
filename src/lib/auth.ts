import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import type { Role, Locale } from "@prisma/client";

const COOKIE_NAME = "rentacar_session";

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET ayarlanmamış. Production'da güçlü, rastgele bir değer verin (openssl rand -base64 48)."
  );
}
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me-in-production-please-1234567890"
);

export type SessionPayload = {
  userId: string;
  role: Role;
  companyId: string | null; // SUPER_ADMIN için null
  branchId?: string | null; // personelin bağlı olduğu şube (null = tüm şubeler)
  name: string;
  email: string;
  locale: Locale;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    include: { company: true },
  });
}

/** Oturum yoksa /login'e yönlendirir. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Sadece SUPER_ADMIN erişebilir. */
export async function requireSuperAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SUPER_ADMIN") redirect("/panel");
  return session;
}

/**
 * Firma kullanıcısı (COMPANY_ADMIN veya STAFF) gerektirir.
 * companyId garanti edilir (asla null olmaz).
 */
export async function requireCompany(): Promise<
  SessionPayload & { companyId: string }
> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "SUPER_ADMIN") redirect("/admin");
  if (!session.companyId) redirect("/login");
  return session as SessionPayload & { companyId: string };
}

/** Sadece COMPANY_ADMIN (firma sahibi) erişimi. */
export async function requireCompanyAdmin(): Promise<
  SessionPayload & { companyId: string }
> {
  const session = await requireCompany();
  if (session.role !== "COMPANY_ADMIN") redirect("/panel");
  return session;
}

/**
 * Ofis yetkisi: COMPANY_ADMIN veya STAFF. Araç teslim personeli (HANDOVER)
 * ofis işlemlerine erişemez → teslim kuyruğuna yönlendirilir.
 */
export async function requireOffice(): Promise<
  SessionPayload & { companyId: string }
> {
  const session = await requireCompany();
  if (session.role === "HANDOVER") redirect("/panel/handover");
  return session;
}

export function isHandover(session: { role: Role }): boolean {
  return session.role === "HANDOVER";
}

export { COOKIE_NAME };
