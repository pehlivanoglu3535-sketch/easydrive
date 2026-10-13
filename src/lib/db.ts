import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { schema } from "./schema";

/**
 * İstek kapsamında Cloudflare D1 binding'ini alıp Drizzle örneği döndürür.
 * (Prisma Cloudflare Workers'ta çalışmadığı için Drizzle kullanılıyor.)
 */
export function getDb() {
  const { env } = getCloudflareContext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d1 = (env as any).DB;
  if (!d1) {
    throw new Error("D1 binding (DB) bulunamadı. wrangler.jsonc içindeki d1_databases ayarını kontrol edin.");
  }
  return drizzle(d1, { schema });
}

export type DB = ReturnType<typeof getDb>;
