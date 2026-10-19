import { getCloudflareContext } from "@opennextjs/cloudflare";

// Kullandığımız R2 metodları için küçük, yerel bir arayüz
// (global @cloudflare/workers-types'a bağımlı olmadan derlensin diye).
export interface R2ObjectBodyLike {
  body: ReadableStream;
  size: number;
  httpMetadata?: { contentType?: string };
}
export interface R2BucketLike {
  put(
    key: string,
    value: ArrayBuffer | ReadableStream | string,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
  get(key: string): Promise<R2ObjectBodyLike | null>;
  delete(key: string): Promise<void>;
}

/**
 * İstek kapsamında Cloudflare R2 bucket binding'ini (UPLOADS) döndürür.
 * Başvuru belgeleri (pasaport, sabıka, fatura) burada saklanır.
 */
export function getUploadsBucket(): R2BucketLike {
  const { env } = getCloudflareContext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bucket = (env as any).UPLOADS as R2BucketLike | undefined;
  if (!bucket) {
    throw new Error(
      "R2 binding (UPLOADS) bulunamadı. Cloudflare'de 'prokosova-uploads' bucket'ını oluşturup wrangler.jsonc içindeki r2_buckets ayarını bağlayın."
    );
  }
  return bucket;
}

// İzin verilen belge türleri ve dosya başına azami boyut.
export const ALLOWED_UPLOAD_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

/** Güvenli bir R2 nesne anahtarı üretir: basvuru/<id>/<alan>-<rand>.<uzanti> */
export function buildFileKey(appId: string, field: string, type: string): string {
  const ext = ALLOWED_UPLOAD_TYPES[type] || "bin";
  const rand = crypto.randomUUID().slice(0, 8);
  return `basvuru/${appId}/${field}-${rand}.${ext}`;
}
