import Link from "next/link";
import {
  Car, KeyRound, Clock, Wallet, Users, CalendarClock, ArrowRight,
  ShieldAlert, ShieldCheck, ClipboardCheck, Wrench, CircleCheck,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/utils";
import { getFleetAlerts, type AlertType } from "@/lib/alerts";
import { getPanelT } from "@/lib/i18n/panel";
import { resolveBranchFilter, canPickBranch } from "@/lib/branch";
import { StatusBadge } from "@/components/StatusBadge";
import { AlertsPanel } from "@/components/AlertsPanel";
import { Gauge } from "@/components/Gauge";
import { RevenueChart, type RevenuePoint } from "@/components/RevenueChart";
import { BranchFilter } from "@/components/BranchFilter";

const DAY = 24 * 60 * 60 * 1000;
function daysLeft(date: Date) {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(date).getTime() - t.getTime()) / DAY);
}
function returnText(n: number, d: { returnToday: string; returnTomorrow: string; returnIn: string; overdue: string }) {
  if (n < 0) return { text: `${Math.abs(n)} ${d.overdue}`, cls: "bg-red-100 text-red-700 ring-red-600/20" };
  if (n === 0) return { text: d.returnToday, cls: "bg-orange-100 text-orange-700 ring-orange-600/20" };
  if (n === 1) return { text: d.returnTomorrow, cls: "bg-amber-100 text-amber-700 ring-amber-600/20" };
  return { text: `${n} ${d.returnIn}`, cls: "bg-slate-100 text-slate-600 ring-slate-500/20" };
}

const ALERT_ICON: Record<AlertType, typeof ShieldAlert> = {
  insurance: ShieldAlert, kasko: ShieldCheck, inspection: ClipboardCheck, service: Wrench,
};

export default async function PanelDashboard({ searchParams }: { searchParams: Promise<{ branch?: string }> }) {
  const session = await requireOffice();
  const { t } = await getPanelT();
  const d = t.dashboard;
  const companyId = session.companyId;
  const sp = await searchParams;
  const branchFilter = resolveBranchFilter(session, sp.branch);
  const bf = branchFilter ? { branchId: branchFilter } : {};
  const todayMid = new Date(); todayMid.setHours(0, 0, 0, 0);
  const since = new Date(todayMid.getTime() - 29 * DAY);

  const [cars, activeRentals, pendingCount, customerCount, revAllRes, revRecent, recent, alerts, branches] =
    await Promise.all([
      prisma.car.findMany({ where: { companyId, ...bf }, select: { status: true } }),
      prisma.reservation.findMany({
        where: { companyId, status: "ACTIVE", ...(branchFilter ? { OR: [{ branchId: branchFilter }, { dropoffBranchId: branchFilter }] } : {}) },
        orderBy: { endDate: "asc" },
        include: { car: true, customer: true, dropoffBranch: { select: { name: true } }, pickupBranch: { select: { name: true } } },
      }),
      prisma.reservation.count({ where: { companyId, status: "PENDING", ...bf } }),
      prisma.customer.count({ where: { companyId } }),
      prisma.reservation.findMany({ where: { companyId, status: { in: ["CONFIRMED", "ACTIVE", "COMPLETED"] }, ...bf }, select: { totalPrice: true } }),
      prisma.reservation.findMany({ where: { companyId, status: { in: ["CONFIRMED", "ACTIVE", "COMPLETED"] }, startDate: { gte: since }, ...bf }, select: { startDate: true, totalPrice: true } }),
      prisma.reservation.findMany({ where: { companyId, ...bf }, take: 5, orderBy: { createdAt: "desc" }, include: { car: true, customer: true } }),
      getFleetAlerts(companyId),
      prisma.branch.findMany({ where: { companyId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    ]);

  // Filo durumu
  const total = cars.length;
  const retired = cars.filter((c) => c.status === "RETIRED").length;
  const maintenance = cars.filter((c) => c.status === "MAINTENANCE").length;
  const rentedIds = new Set(activeRentals.map((r) => r.carId));
  const rented = rentedIds.size;
  const operational = total - retired;
  const available = Math.max(0, operational - maintenance - rented);
  const occupancy = operational > 0 ? (rented / operational) * 100 : 0;

  const revenueAll = revAllRes.reduce((s, r) => s + r.totalPrice, 0);

  // 30 günlük ciro kovaları
  const fmtShort = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });
  const fmtFull = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long" });
  const buckets: RevenuePoint[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(todayMid.getTime() - (29 - i) * DAY);
    return { label: fmtShort.format(d), full: fmtFull.format(d), value: 0 };
  });
  for (const r of revRecent) {
    const d = new Date(r.startDate); d.setHours(0, 0, 0, 0);
    const idx = 29 - Math.round((todayMid.getTime() - d.getTime()) / DAY);
    if (idx >= 0 && idx < 30) buckets[idx].value += r.totalPrice;
  }

  // Belge uyarı özetleri (tipe göre)
  const byType: Record<AlertType, { count: number; overdue: boolean }> = {
    insurance: { count: 0, overdue: false }, kasko: { count: 0, overdue: false },
    inspection: { count: 0, overdue: false }, service: { count: 0, overdue: false },
  };
  for (const a of alerts) {
    byType[a.type].count++;
    if (a.severity === "overdue") byType[a.type].overdue = true;
  }

  const statusTiles = [
    { label: d.total, value: total, icon: Car, cls: "text-slate-600" },
    { label: d.rented, value: rented, icon: KeyRound, cls: "text-[var(--brand-600)]" },
    { label: d.idle, value: available, icon: CircleCheck, cls: "text-emerald-600" },
    { label: d.maintenance, value: maintenance, icon: Wrench, cls: "text-amber-600" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{d.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{d.subtitle}</p>
        </div>
        {canPickBranch(session) && <BranchFilter branches={branches} current={sp.branch} allLabel={t.common.allBranches} />}
      </div>

      {/* Filo durumu + doluluk */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold">{d.fleetStatus}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statusTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <div key={tile.label} className="rounded-xl border p-4">
                  <Icon size={18} className={tile.cls} />
                  <div className={`mt-2 text-2xl font-semibold ${tile.cls}`}>{tile.value}</div>
                  <div className="text-xs text-slate-500">{tile.label}</div>
                </div>
              );
            })}
          </div>

          {/* Belge uyarı sekmeleri */}
          <div className="mt-4 border-t pt-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{d.docAlerts}</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(byType) as AlertType[]).map((type) => {
                const info = byType[type];
                const Icon = ALERT_ICON[type];
                const cls = info.count === 0
                  ? "border-slate-200 text-slate-500"
                  : info.overdue
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-amber-200 bg-amber-50 text-amber-700";
                return (
                  <Link key={type} href="/panel/cars" className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50 ${cls}`}>
                    <Icon size={15} /> {t.alertType[type]}
                    <span className="rounded-full bg-white/70 px-1.5 text-xs ring-1 ring-inset ring-black/5">{info.count}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card flex flex-col items-center justify-center p-5">
          <Gauge percent={occupancy} label={d.occupancy} sublabel={`${rented}/${operational} ${d.inUse}`} color="var(--brand-600)" />
        </div>
      </div>

      {/* Ciro grafiği + yan istatistikler */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">{d.revenueDist}</h2>
            <span className="text-sm text-slate-400">{d.last30}</span>
          </div>
          <RevenueChart data={buckets} color="var(--brand-600)" labels={{ last30: t.common.last30short, total: t.common.total }} />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-sm text-slate-500"><Wallet size={16} className="text-emerald-600" /> {d.totalRevenue}</div>
            <div className="mt-1 text-2xl font-semibold">{formatMoney(revenueAll)}</div>
          </div>
          <Link href="/panel/reservations?status=PENDING" className="card card-hover p-5">
            <div className="flex items-center gap-2 text-sm text-slate-500"><Clock size={16} className="text-amber-600" /> {d.pending}</div>
            <div className="mt-1 text-2xl font-semibold">{pendingCount}</div>
          </Link>
          <Link href="/panel/customers" className="card card-hover p-5">
            <div className="flex items-center gap-2 text-sm text-slate-500"><Users size={16} className="text-[var(--brand-600)]" /> {d.registeredCustomers}</div>
            <div className="mt-1 text-2xl font-semibold">{customerCount}</div>
          </Link>
        </div>
      </div>

      {/* Kiradaki araçlar + uyarılar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="flex items-center gap-2 font-semibold"><CalendarClock size={18} className="text-[var(--brand-600)]" /> {d.rentedCars}</h2>
              <span className="text-sm text-slate-400">{d.byReturn}</span>
            </div>
            {activeRentals.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-400">{d.noRented}</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {activeRentals.map((r) => {
                  const rt = returnText(daysLeft(r.endDate), d);
                  return (
                    <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {r.car.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.car.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-slate-900">{r.car.make} {r.car.model} <span className="font-mono text-xs text-slate-400">{r.car.plate}</span></div>
                        <div className="text-xs text-slate-500">{r.customer.name} · {d.returnLabel} {formatDate(r.endDate, "tr")}</div>
                        {r.dropoffBranchId && r.dropoffBranchId !== r.pickupBranchId && (
                          <div className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-amber-600">🔁 {r.pickupBranch?.name} → {r.dropoffBranch?.name}</div>
                        )}
                      </div>
                      <span className={`badge ${rt.cls}`}>{rt.text}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-semibold">{d.recentRes}</h2>
              <Link href="/panel/reservations" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--brand-600)] hover:text-[var(--brand-700)]">{t.common.all} <ArrowRight size={15} /></Link>
            </div>
            {recent.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-400">{d.noRes}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="table-head">
                      <th className="px-5 py-3">{d.customer}</th>
                      <th className="px-5 py-3">{d.car}</th>
                      <th className="px-5 py-3">{d.date}</th>
                      <th className="px-5 py-3">{d.amount}</th>
                      <th className="px-5 py-3">{d.statusCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r) => (
                      <tr key={r.id} className="table-row">
                        <td className="px-5 py-3 font-medium text-slate-900">{r.customer.name}</td>
                        <td className="px-5 py-3 text-slate-600">{r.car.make} {r.car.model}</td>
                        <td className="px-5 py-3 text-slate-500">{formatDate(r.startDate, "tr")}</td>
                        <td className="px-5 py-3 font-semibold text-slate-900">{formatMoney(r.totalPrice)}</td>
                        <td className="px-5 py-3"><StatusBadge status={r.status} label={t.status[r.status as keyof typeof t.status]} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <AlertsPanel alerts={alerts} labels={{ title: d.alertsTitle, word: d.alertWord, allGood: d.allGood, seeAll: d.seeAll, dLeft: d.dLeft, dOver: d.dOver, kmLeft: d.kmLeft, kmOver: d.kmOver, today: d.todayTxt, types: t.alertType }} />
      </div>
    </div>
  );
}
