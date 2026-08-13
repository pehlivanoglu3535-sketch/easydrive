// Fiyat & sezon motoru — saf fonksiyonlar (hem sunucu hem istemcide kullanılır).

export type PricingRuleLite = {
  id: string;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  category: string | null;
  kind: "PERCENT" | "ABSOLUTE";
  value: number;
  priority: number;
};

const DAY = 24 * 60 * 60 * 1000;

/** Belirli bir gün + kategori için geçerli günlük fiyatı hesaplar. */
export function effectiveDailyPrice(
  base: number,
  category: string,
  date: Date,
  rules: PricingRuleLite[]
): number {
  const applicable = rules
    .filter((r) => {
      const s = new Date(r.startDate); s.setHours(0, 0, 0, 0);
      const e = new Date(r.endDate); e.setHours(23, 59, 59, 999);
      const inRange = date >= s && date <= e;
      const catMatch = !r.category || r.category === category;
      return inRange && catMatch;
    })
    .sort((a, b) => b.priority - a.priority);

  if (applicable.length === 0) return base;
  const r = applicable[0];
  if (r.kind === "ABSOLUTE") return Math.max(0, r.value);
  return Math.max(0, Math.round(base * (1 + r.value / 100)));
}

/** Kiralama süresi boyunca gün gün fiyatı toplar. */
export function computeRental(
  base: number,
  category: string,
  start: Date,
  end: Date,
  rules: PricingRuleLite[]
): { days: number; total: number } {
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / DAY));
  let total = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * DAY);
    d.setHours(12, 0, 0, 0);
    total += effectiveDailyPrice(base, category, d, rules);
  }
  return { days, total };
}

/** Uzun dönem (aylık) toplam: ay sayısı * aylık fiyat. */
export function computeMonthly(monthlyPrice: number, start: Date, end: Date): { months: number; total: number } {
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / DAY));
  const months = Math.max(1, Math.round(days / 30));
  return { months, total: months * monthlyPrice };
}
