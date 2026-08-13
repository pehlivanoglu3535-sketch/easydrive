import Link from "next/link";
import { Plus, Pencil, Trash2, Car as CarIcon, Settings2, Fuel, Users, Gauge, AlertTriangle, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import { deleteCarAction } from "@/lib/actions/cars";
import { formatMoney } from "@/lib/utils";
import { computeCarAlerts } from "@/lib/alerts";
import { resolveBranchFilter, canPickBranch } from "@/lib/branch";
import { getPanelT } from "@/lib/i18n/panel";
import { BranchFilter } from "@/components/BranchFilter";

const STATUS_STYLE: Record<string, string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  MAINTENANCE: "bg-amber-50 text-amber-700 ring-amber-600/20",
  RETIRED: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

const SEV_BADGE: Record<string, string> = {
  overdue: "bg-red-100 text-red-700 ring-red-600/20",
  urgent: "bg-orange-100 text-orange-700 ring-orange-600/20",
  warning: "bg-amber-100 text-amber-700 ring-amber-600/20",
};

export default async function CarsPage({ searchParams }: { searchParams: Promise<{ branch?: string }> }) {
  const session = await requireOffice();
  const { t } = await getPanelT();
  const C = t.cars;
  const sp = await searchParams;
  const branchFilter = resolveBranchFilter(session, sp.branch);

  const [cars, branches] = await Promise.all([
    prisma.car.findMany({
      where: { companyId: session.companyId, ...(branchFilter ? { branchId: branchFilter } : {}) },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { reservations: true } }, branch: { select: { name: true } } },
    }),
    prisma.branch.findMany({ where: { companyId: session.companyId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{C.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{cars.length} {C.count}</p>
        </div>
        <div className="flex items-center gap-2">
          {canPickBranch(session) && <BranchFilter branches={branches} current={sp.branch} allLabel={t.common.allBranches} />}
          <Link href="/panel/cars/new" className="btn-primary"><Plus size={16} /> {C.addCar}</Link>
        </div>
      </div>

      {cars.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><CarIcon size={22} /></div>
          <p className="text-sm text-slate-500">{C.empty}</p>
          <Link href="/panel/cars/new" className="btn-primary btn-sm"><Plus size={14} /> {C.firstCar}</Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-head">
                <th className="px-5 py-3">{C.carCol}</th>
                <th className="px-5 py-3">{C.plate}</th>
                <th className="px-5 py-3">{C.km}</th>
                <th className="px-5 py-3">{C.docs}</th>
                <th className="px-5 py-3">{C.rate}</th>
                <th className="px-5 py-3">{C.statusCol}</th>
                <th className="px-5 py-3 text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => {
                const alerts = computeCarAlerts(car);
                const worst = alerts[0]?.severity;
                return (
                <tr key={car.id} className="table-row">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {car.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={car.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{car.make} {car.model}</div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                          <span>{car.year} · {car.category}</span>
                          <span className="inline-flex items-center gap-1"><Settings2 size={11} /> {car.transmission}</span>
                          <span className="inline-flex items-center gap-1"><Fuel size={11} /> {car.fuel}</span>
                          {car.branch && <span className="text-[var(--brand-600)]">· {car.branch.name}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3"><span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">{car.plate}</span></td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 text-slate-600"><Gauge size={13} className="text-slate-400" /> {car.mileage.toLocaleString("tr-TR")}</span>
                  </td>
                  <td className="px-5 py-3">
                    {alerts.length === 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 size={14} /> {C.current}</span>
                    ) : (
                      <span className={`badge ${SEV_BADGE[worst]}`}><AlertTriangle size={12} /> {alerts.length} {C.alerts}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{formatMoney(car.pricePerDay)}</td>
                  <td className="px-5 py-3"><span className={`badge ${STATUS_STYLE[car.status]}`}>{t.carStatus[car.status as keyof typeof t.carStatus]}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/panel/cars/${car.id}/edit`} title={t.common.edit} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><Pencil size={16} /></Link>
                      <form action={deleteCarAction}>
                        <input type="hidden" name="id" value={car.id} />
                        <button type="submit" title={t.common.delete} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                      </form>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
