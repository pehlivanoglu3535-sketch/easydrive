import { prisma } from "./db";
import type { AppLocale } from "./i18n/config";

/** Gün cinsinden fark (en az 1 gün). */
export function diffInDays(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(days, 1);
}

/** Tarihi YYYY-MM-DD formatına çevirir (input value için). */
export function toDateInput(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

/** Para formatı (varsayılan Euro). */
export function formatMoney(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const DATE_LOCALE: Record<AppLocale, string> = {
  sq: "sq-AL",
  en: "en-GB",
  sr: "sr-RS",
  tr: "tr-TR",
};

/** Tarihi okunabilir formata çevirir. */
export function formatDate(d: Date, locale: AppLocale = "sq"): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale] || "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
}

export const RESERVATION_STATUS_TR: Record<string, string> = {
  PENDING: "Onay Bekliyor",
  CONFIRMED: "Onaylandı",
  ACTIVE: "Teslim Edildi",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal Edildi",
};

export const CAR_STATUS_TR: Record<string, string> = {
  AVAILABLE: "Müsait",
  MAINTENANCE: "Bakımda",
  RETIRED: "Hizmet Dışı",
};

export const COMPANY_STATUS_TR: Record<string, string> = {
  TRIAL: "Deneme",
  ACTIVE: "Aktif",
  SUSPENDED: "Askıda",
};

/** İki tarih aralığının çakışıp çakışmadığını kontrol eder. */
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Belirli tarih aralığında bir aracın müsait olup olmadığını kontrol eder.
 * Firma bazında izole çalışır.
 */
export async function isCarAvailable(
  companyId: string,
  carId: string,
  start: Date,
  end: Date,
  excludeReservationId?: string
): Promise<boolean> {
  const car = await prisma.car.findFirst({ where: { id: carId, companyId } });
  if (!car || car.status !== "AVAILABLE") return false;

  const active = await prisma.reservation.findMany({
    where: {
      companyId,
      carId,
      status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
      ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
    },
    select: { startDate: true, endDate: true },
  });

  return !active.some((r) => overlaps(start, end, r.startDate, r.endDate));
}

/**
 * Bir firmanın araçlarını, opsiyonel tarih aralığı müsaitliğiyle döndürür.
 */
export async function findCompanyCars(
  companyId: string,
  opts: { start?: Date; end?: Date; category?: string } = {}
) {
  const cars = await prisma.car.findMany({
    where: {
      companyId,
      status: "AVAILABLE",
      ...(opts.category ? { category: opts.category } : {}),
    },
    orderBy: { pricePerDay: "asc" },
    include: {
      reservations: {
        where: { status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] } },
        select: { startDate: true, endDate: true },
      },
    },
  });

  if (!opts.start || !opts.end) {
    return cars.map((c) => ({ ...c, available: true }));
  }
  const start = opts.start;
  const end = opts.end;
  return cars.map((c) => ({
    ...c,
    available: !c.reservations.some((r) =>
      overlaps(start, end, r.startDate, r.endDate)
    ),
  }));
}
