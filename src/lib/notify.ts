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

async function withTimeout(run: (signal: AbortSignal) => Promise<unknown>, ms = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    await run(controller.signal);
  } catch (err) {
    console.error("Bildirim gönderilemedi:", err);
  } finally {
    clearTimeout(timer);
  }
}

/** Telegram botu üzerinden site sahibine mesaj gönderir. */
async function sendTelegram(token: string, chatId: string, text: string) {
  await withTimeout((signal) =>
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal,
    })
  );
}

/** CallMeBot üzerinden WhatsApp mesajı gönderir (opsiyonel yedek kanal). */
async function sendCallMeBot(phone: string, apikey: string, text: string) {
  const url =
    "https://api.callmebot.com/whatsapp.php" +
    `?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;
  await withTimeout((signal) => fetch(url, { method: "GET", signal }));
}

/**
 * Site sahibine anlık bildirim gönderir (randevu, başvuru vb.).
 * Yapılandırılmış tüm kanallara gönderir; hiçbiri ayarlı değilse sessiz no-op olur.
 * Env: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (tercih edilen),
 *      WHATSAPP_NOTIFY_PHONE + WHATSAPP_CALLMEBOT_APIKEY (opsiyonel).
 */
export async function notifyOwner(message: string): Promise<void> {
  const tgToken = readEnv("TELEGRAM_BOT_TOKEN");
  const tgChat = readEnv("TELEGRAM_CHAT_ID");
  if (tgToken && tgChat) {
    await sendTelegram(tgToken, tgChat, message);
  }

  const phone = readEnv("WHATSAPP_NOTIFY_PHONE");
  const apikey = readEnv("WHATSAPP_CALLMEBOT_APIKEY");
  if (phone && apikey) {
    await sendCallMeBot(phone, apikey, message);
  }
}
