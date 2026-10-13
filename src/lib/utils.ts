/** className birleştirici (koşullu sınıflar için). */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Tarihi YYYY-MM-DD formatına çevirir (input value için). */
export function toDateInput(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

/** Tarihi okunabilir Türkçe formata çevirir. */
export function formatDate(d: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(d));
}

/** Tarih + saat (randevu/panel). */
export function formatDateTime(d: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

/** Sadece saat (HH:mm). */
export function formatTime(d: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

/** Kısa göreli zaman: "az önce", "3 sa", "2 g", eski ise tarih. */
export function formatRelativeShort(d: Date | string): string {
  const date = new Date(d);
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "az önce";
  if (min < 60) return `${min} dk`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} sa`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} g`;
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(date);
}

/** Türkçe karakterleri sadeleştirerek URL uyumlu slug üretir. */
export function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u",
  };
  return input
    .trim()
    .replace(/[çğıİöşüÇĞÖŞÜ]/g, (c) => map[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Satır başı ile ayrılmış metni (boş olmayan) satır dizisine çevirir. */
export function toLines(input: string | null | undefined): string[] {
  if (!input) return [];
  return input
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export const MESSAGE_STATUS_TR: Record<string, string> = {
  NEW: "Yeni",
  READ: "Okundu",
  REPLIED: "Yanıtlandı",
  ARCHIVED: "Arşiv",
};

export const APPOINTMENT_STATUS_TR: Record<string, string> = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  CANCELLED: "İptal",
  COMPLETED: "Tamamlandı",
};
