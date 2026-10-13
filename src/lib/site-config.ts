/**
 * Site genel yapılandırması — marka adı, iletişim bilgileri, menü vb.
 * Markayı değiştirmek için tek nokta burasıdır.
 */

export const site = {
  name: "Meridyen Danışmanlık",
  shortName: "Meridyen",
  tagline: "Büyümenizi hızlandıran stratejik danışmanlık",
  description:
    "İş & yönetim, mali müşavirlik, göçmenlik ve yazılım danışmanlığında uçtan uca çözüm ortağınız. Kurumunuzu bir sonraki aşamaya taşıyın.",
  // İletişim
  email: "info@meridyendanismanlik.com",
  phone: "+90 212 000 00 00",
  phoneHref: "+902120000000",
  whatsapp: "+90 532 000 00 00",
  address: "Levent Mah. Büyükdere Cad. No:1, Şişli / İstanbul",
  mapQuery: "Levent, İstanbul",
  workingHours: "Pazartesi – Cuma, 09:00 – 18:00",
  // Sosyal
  social: {
    linkedin: "https://www.linkedin.com/",
    instagram: "https://www.instagram.com/",
    twitter: "https://x.com/",
  },
  foundedYear: 2012,
} as const;

export const nav = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/blog", label: "Blog" },
  { href: "/iletisim", label: "İletişim" },
] as const;

/** Randevu saat aralıkları (yerel saat, 24s) */
export const APPOINTMENT_HOURS = [9, 10, 11, 13, 14, 15, 16, 17] as const;

/** Randevu için kaç gün ileriye slot açılsın */
export const APPOINTMENT_WINDOW_DAYS = 21;
