import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Cloudflare env'den (secret/var) değer okur; yoksa process.env'e düşer. */
function readEnv(key: string): string | undefined {
  try {
    const { env } = getCloudflareContext();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = (env as any)?.[key];
    if (v) return String(v);
  } catch {
    // getCloudflareContext istek dışında çağrılırsa yok say
  }
  return process.env[key];
}

/**
 * Site sahibinin WhatsApp'ına otomatik bildirim gönderir (CallMeBot üzerinden).
 * Yapılandırma eksikse sessizce no-op olur; hata kullanıcı akışını bozmaz.
 * Gerekli env: WHATSAPP_NOTIFY_PHONE (ör. 38349368622), WHATSAPP_CALLMEBOT_APIKEY
 */
export async function notifyOwnerWhatsApp(message: string): Promise<void> {
  const phone = readEnv("WHATSAPP_NOTIFY_PHONE");
  const apikey = readEnv("WHATSAPP_CALLMEBOT_APIKEY");
  if (!phone || !apikey) return;

  const url =
    "https://api.callmebot.com/whatsapp.php" +
    `?phone=${encodeURIComponent(phone)}` +
    `&text=${encodeURIComponent(message)}` +
    `&apikey=${encodeURIComponent(apikey)}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    await fetch(url, { method: "GET", signal: controller.signal });
    clearTimeout(timer);
  } catch (err) {
    console.error("WhatsApp bildirimi gönderilemedi:", err);
  }
}
