import { BarChart3, Wallet, CalendarCheck, Gauge, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import { getPanelT } from "@/lib/i18n/panel";
import { formatDate, formatMoney, toDateInput } from "@/lib/utils";
import { RevenueChart, type RevenuePoint } from "@/components/RevenueChart";
import { ExportCSV } from "@/components/ExportCSV";
import { StatCard } from "@/components/StatCard";

const DAY = 24 * 60 * 60 * 1000;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await requireOffice();
  const { t } = await getPanelT();
  const R = t.reports;
  const sp = await searchParams;

  const to = sp.to ? new Date(sp.to) : new Date();
  to.setHours(23, 59, 59, 999);
  const from = sp.from ? new Date(sp.from) : new Date(to.getTime() - 29 * DAY);
  from.setHours(0, 0, 0, 0);

  const reservations = await prisma.reservation.findMany({
    where: {
      companyId: session.companyId,
      status: { in: ["CONFIRMED", "ACTIVE", "COMPLETED"] },
      startDate: { gte: from, lte: to },
    },
    include: { car: true, customer: true },
    orderBy: { startDate: "asc" },
  });

  const totalRevenue = reservations.reduce((s, r) => s + r.totalPrice, 0);
  const count = reservations.length;
  const avg = count > 0 ? totalRevenue / count : 0;
  const uniqueCustomers = new Set(reservations.map((r) => r.customerId)).size;

  // En çok kiralanan araçlar
  const carMap = new Map<string, { label: string; plate: string; count: number; revenue: number }>();
  for (const r of reservations) {
    const k = r.carId;
    const cur = carMap.get(k) || { label: `${r.car.make} ${r.car.model}`, plate: r.car.plate, count: 0, revenue: 0 };
    cur.count++; cur.revenue += r.totalPrice;
    carMap.set(k, cur);
  }
  const topCars = [...carMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  // Kategori dağılımı
  const catMap = new Map<string, number>();
  for (const r of reservations) catMap.set(r.car.category, (catMap.get(r.car.category) || 0) + r.totalPrice);
  const categories = [...catMap.entries()].sort((a, b) => b[1] - a[1]);

  // Günlük ciro
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / DAY) + 1);
  const fmtShort = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });
  const fmtFull = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long" });
  const buckets: RevenuePoint[] = Array.from({ length: Math.min(days, 90) }, (_, i) => {
    const d = new Date(from.getTime() + i * DAY);
    return { label: fmtShort.format(d), full: fmtFull.format(d), value: 0 };
  });
  for (const r of reservations) {
    const d = new Date(r.startDate); d.setHours(0, 0, 0, 0);
    const idx = Math.round((d.getTime() - from.getTime()) / DAY);
    if (idx >= 0 && idx < buckets.length) buckets[idx].value += r.totalPrice;
  }

  const csvRows = reservations.map((r) => ({
    Tarih: toDateInput(r.startDate),
    Müşteri: r.customer.name,
    Araç: `${r.car.make} ${r.car.model}`,
    Plaka: r.car.plate,
    Gün: r.days,
    Tip: r.rentalType === "MONTHLY" ? "Uzun Dönem" : "Günlük",
    Tutar: r.totalPrice,
    Durum: r.status,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{R.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{formatDate(from, "tr")} → {formatDate(to, "tr")} {R.period}</p>
        </div>
        <div className="flex items-end gap-2">
          <form method="get" className="flex items-end gap-2">
            <div>
              <label className="label">{R.start}</label>
              <input name="from" type="date" className="input" defaultValue={toDateInput(from)} />
            </div>
            <div>
              <label className="label">{R.end}</label>
              <input name="to" type="date" className="input" defaultValue={toDateInput(to)} />
            </div>
            <button type="submit" className="btn-primary">{R.apply}</button>
          </form>
          <ExportCSV rows={csvRows} filename={`rapor-${toDateInput(from)}_${toDateInput(to)}.csv`} label={R.exportCsv} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={R.totalRevenue} value={formatMoney(totalRevenue)} icon={Wallet} tone="emerald" />
        <StatCard label={R.reservations} value={count} icon={CalendarCheck} tone="brand" />
        <StatCard label={R.avgRes} value={formatMoney(avg)} icon={Gauge} tone="amber" />
        <StatCard label={R.uniqueCustomers} value={uniqueCustomers} icon={Users} tone="indigo" />
      </div>

      <div className="card p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><BarChart3 size={18} className="text-[var(--brand-600)]" /> {R.dailyRevenue}</h2>
        <RevenueChart data={buckets} color="var(--brand-600)" labels={{ last30: t.common.last30short, total: t.common.total }} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="border-b px-5 py-4"><h2 className="font-semibold">{R.topCars}</h2></div>
          {topCars.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">{R.noData}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {topCars.map((c, i) => (
                <li key={i} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="font-medium text-slate-900">{c.label} <span className="font-mono text-xs text-slate-400">{c.plate}</span></div>
                    <div className="text-xs text-slate-500">{c.count} {R.rentals}</div>
                  </div>
                  <span className="font-semibold text-slate-900">{formatMoney(c.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="border-b px-5 py-4"><h2 className="font-semibold">{R.catDist}</h2></div>
          {categories.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">{R.noData}</p>
          ) : (
            <ul className="flex flex-col gap-3 p-5">
              {categories.map(([cat, rev]) => {
                const pct = totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0;
                return (
                  <li key={cat}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{cat}</span>
                      <span className="text-slate-500">{formatMoney(rev)} · {Math.round(pct)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "var(--brand-600)" }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
