/**
 * Site genel yapılandırması — marka adı, iletişim bilgileri, menü vb.
 * Markayı/iletişimi değiştirmek için tek nokta burasıdır.
 */

export const site = {
  name: "ProKosova Solutions",
  shortName: "ProKosova",
  tagline: "Kosova'da iş kurmanın ve yaşamanın en kolay yolu",
  description:
    "6 yıldır Kosova'da; 600'den fazla şirket kuruluşu ve 820'den fazla oturum başvurusuyla yabancı girişimci ve yatırımcıların güvenilir danışmanı.",
  // İletişim
  email: "info@prokosovasolutions.com",
  phone: "+383 49 000 000",
  phoneHref: "+38349000000",
  whatsapp: "+383 49 000 000",
  address: "Rr. Nëna Terezë, Prishtina, Kosova",
  mapQuery: "Prishtina, Kosovo",
  workingHours: "Pazartesi – Cuma, 09:00 – 18:00",
  // Sosyal
  social: {
    linkedin: "https://www.linkedin.com/",
    instagram: "https://www.instagram.com/prishtinelibulent/",
    facebook: "https://www.facebook.com/muhasebecibulent/",
  },
  foundedYear: 2020,
  // Kurucu / baş danışman
  owner: {
    name: "Bülent BOZKURT",
    title: "Kurucu & Baş Danışman",
    bio: "6 yılı aşkın süredir Kosova'da yabancı girişimci ve yatırımcılara danışmanlık veriyor. Bugüne kadar 600'den fazla şirketin kuruluşuna ve 820'den fazla oturum başvurusuna liderlik etti. Yerel mevzuata hâkimiyeti ve uçtan uca takip anlayışıyla, Kosova'da iş kurmak isteyenlerin en güvendiği isimlerden biri.",
  },
  // Öne çıkan istatistikler (ana sayfa + hakkımızda)
  stats: [
    { value: "6+", label: "Yıl Kosova tecrübesi" },
    { value: "600+", label: "Kurulan şirket" },
    { value: "820+", label: "Alınan oturum" },
    { value: "%98", label: "Müşteri memnuniyeti" },
  ],
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
