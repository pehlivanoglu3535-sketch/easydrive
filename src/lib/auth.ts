import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { hashPassword, verifyPassword } from "./password.mjs";
import type { Role } from "@/lib/schema";

export { hashPassword, verifyPassword };

const COOKIE_NAME = "prokosova_session";

// Oturum imzalama anahtarı — tembel (ilk kullanımda) hesaplanır, modül yüklenirken değil.
// Böylece build sırasında env yokken hata vermez; production'da eksikse ilk istekte net hata verir.
let _secret: Uint8Array | null = null;
function secretKey(): Uint8Array {
  if (_secret) return _secret;
  const val = process.env.AUTH_SECRET;
  if (!val) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET ayarlanmamış. Production'da güçlü, rastgele bir değer verin (openssl rand -base64 48)."
      );
    }
    _secret = new TextEncoder().encode("dev-secret-change-me-in-production-please-1234567890");
  } else {
    _secret = new TextEncoder().encode(val);
  }
  return _secret;
}

export type SessionPayload = {
  userId: string;
  role: Role;
  name: string;
  email: string;
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());

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
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Oturum yoksa /login'e yönlendirir. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export { COOKIE_NAME };
