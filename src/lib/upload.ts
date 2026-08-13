import "server-only";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ALLOWED = ["png", "jpg", "jpeg", "webp", "gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Yükleme klasörü. Varsayılan public/uploads (Next bunu runtime'da statik servis eder).
// Production'da UPLOAD_DIR ile kalıcı bir volume'a yönlendirin (bkz. DEPLOY.md).
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "public", "uploads");

/**
 * Yüklenen görseli yükleme klasörüne kaydeder, public yolunu (/uploads/...) döndürür.
 * Geçersizse null. Kalıcı depolama için UPLOAD_DIR'i mounted volume'a bağlayın.
 */
export async function saveUpload(file: File, prefix: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED.includes(ext)) return null;
  if (file.size > MAX_BYTES) return null;

  await mkdir(UPLOAD_DIR, { recursive: true });
  const fname = `${prefix}-${Date.now()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, fname), bytes);
  return `/uploads/${fname}`;
}
