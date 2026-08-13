import type { Role } from "@prisma/client";

/**
 * Aktif şube filtresini belirler:
 * - STAFF ise ve bir şubeye bağlıysa → kendi şubesi (zorunlu).
 * - COMPANY_ADMIN (veya şubesiz personel) → URL param'daki şube (varsa), yoksa tümü.
 * Dönen değer undefined ise tüm şubeler.
 */
export function resolveBranchFilter(
  session: { role: Role; branchId?: string | null },
  param?: string
): string | undefined {
  if (session.role === "STAFF" && session.branchId) return session.branchId;
  if (param) return param;
  return undefined;
}

/** Personel kendi şubesini değiştirebilir mi (COMPANY_ADMIN evet). */
export function canPickBranch(session: { role: Role; branchId?: string | null }): boolean {
  return !(session.role === "STAFF" && !!session.branchId);
}
