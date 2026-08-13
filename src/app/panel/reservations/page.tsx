import Link from "next/link";
import { Check, X, KeyRound, RotateCcw, Phone, StickyNote, FileText, ChevronRight, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import { resolveBranchFilter, canPickBranch } from "@/lib/branch";
import { getPanelT } from "@/lib/i18n/panel";
import { BranchFilter } from "@/components/BranchFilter";
import { updateReservationStatusAction } from "@/lib/actions/reservations";
import { formatDate, formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import type { ReservationStatus } from "@prisma/client";
import type { LucideIcon } from "lucide-react";

const PAY_STYLE: Record<string, string> = {
  UNPAID: "bg-red-50 text-red-700 ring-red-600/20",
  PARTIAL: "bg-amber-50 text-amber-700 ring-amber-600/20",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

const FILTER_KEYS = ["", "PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"];

type ActKey = "approve" | "reject" | "handover" | "cancel" | "takeBack";
const NEXT_ACTIONS: Record<string, { status: ReservationStatus; labelKey: ActKey; icon: LucideIcon; variant: string }[]> = {
  PENDING: [
    { status: "CONFIRMED", labelKey: "approve", icon: Check, variant: "btn-primary btn-sm" },
    { status: "CANCELLED", labelKey: "reject", icon: X, variant: "btn-outline btn-sm text-red-600" },
  ],
  CONFIRMED: [
    { status: "ACTIVE", labelKey: "handover", icon: KeyRound, variant: "btn-primary btn-sm" },
    { status: "CANCELLED", labelKey: "cancel", icon: X, variant: "btn-outline btn-sm text-red-600" },
  ],
  ACTIVE: [{ status: "COMPLETED", labelKey: "takeBack", icon: RotateCcw, variant: "btn-primary btn-sm" }],
  COMPLETED: [],
  CANCELLED: [],
};

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; branch?: string }>;
}) {
  const session = await requireOffice();
  const { t } = await getPanelT();
  const R = t.reservations;
  const { status, branch } = await searchParams;
  const filter = FILTER_KEYS.includes(status || "") ? status : "";
  const branchFilter = resolveBranchFilter(session, branch);

  const [reservations, branches] = await Promise.all([
    prisma.reservation.findMany({
      where: { companyId: session.companyId, ...(filter ? { status: filter as ReservationStatus } : {}), ...(branchFilter ? { branchId: branchFilter } : {}) },
      include: { car: true, customer: true, contract: { select: { contractNo: true } }, branch: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.branch.findMany({ where: { companyId: session.companyId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const statusHref = (key: string) => {
    const p = new URLSearchParams();
    if (key) p.set("status", key);
    if (branch) p.set("branch", branch);
    const q = p.toString();
    return q ? `/panel/reservations?${q}` : "/panel/reservations";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{R.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{reservations.length} {R.records}</p>
        </div>
        <div className="flex items-center gap-2">
          {canPickBranch(session) && <BranchFilter branches={branches} current={branch} allLabel={t.common.allBranches} />}
          <Link href="/panel/reservations/new" className="btn-primary"><Plus size={16} /> {R.newRes}</Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_KEYS.map((key) => (
          <Link
            key={key}
            href={statusHref(key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === key ? "bg-[var(--brand-600)] text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {key ? t.statusFilter[key as keyof typeof t.statusFilter] : t.common.all}
          </Link>
        ))}
      </div>

      {reservations.length === 0 ? (
        <div className="card p-12 text-center text-sm text-slate-400">{R.noneFilter}</div>
      ) : (
        <div className="flex flex-col gap-3">
          {reservations.map((r) => {
            const actions = NEXT_ACTIONS[r.status] || [];
            return (
              <div key={r.id} className="card card-hover p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {r.car.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.car.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">{r.car.make} {r.car.model}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-500">{r.car.plate}</span>
                        {r.rentalType === "MONTHLY" && <span className="badge bg-violet-50 text-violet-700 ring-violet-600/20">{R.longTerm}</span>}
                      </div>
                      <div className="mt-0.5 text-sm text-slate-600">{r.customer.name}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1"><Phone size={12} /> {r.customer.phone || r.customer.email}</span>
                        <span>{formatDate(r.startDate, "tr")} → {formatDate(r.endDate, "tr")} · {r.days} {t.common.day}</span>
                        {r.note && <span className="inline-flex items-center gap-1"><StickyNote size={12} /> {r.note}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 lg:justify-end">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-900">{formatMoney(r.totalPrice)}</div>
                      <div className="flex items-center justify-end gap-2">
                        {r.contract && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400"><FileText size={12} /> {r.contract.contractNo}</span>
                        )}
                        <span className={`badge ${PAY_STYLE[r.paymentStatus]}`}>{t.payment[r.paymentStatus as keyof typeof t.payment]}</span>
                        <StatusBadge status={r.status} label={t.status[r.status as keyof typeof t.status]} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {actions.map((a) => {
                        const Icon = a.icon;
                        return (
                          <form key={a.status} action={updateReservationStatusAction}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="status" value={a.status} />
                            <button type="submit" className={a.variant}><Icon size={14} /> {R[a.labelKey]}</button>
                          </form>
                        );
                      })}
                      <Link href={`/panel/reservations/${r.id}`} className="btn-outline btn-sm">
                        {t.common.details} <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
