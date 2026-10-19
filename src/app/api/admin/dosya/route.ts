import { getSession } from "@/lib/auth";
import { getUploadsBucket } from "@/lib/r2";

export const dynamic = "force-dynamic";

/**
 * Admin'e özel belge indirme. Yalnızca oturum açmış admin erişebilir.
 * /api/admin/dosya?key=basvuru/<id>/<alan>-<rand>.<uzanti>
 */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return new Response("Yetkisiz erişim.", { status: 401 });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key") || "";
  // Yalnızca başvuru belgeleri; path traversal engeli.
  if (!key.startsWith("basvuru/") || key.includes("..")) {
    return new Response("Geçersiz dosya anahtarı.", { status: 400 });
  }

  const obj = await getUploadsBucket().get(key);
  if (!obj) {
    return new Response("Dosya bulunamadı.", { status: 404 });
  }

  const filename = key.split("/").pop() || "belge";
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
