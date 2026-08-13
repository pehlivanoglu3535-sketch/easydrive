import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, KeyRound, RotateCcw, FileText, Phone, Mail, MapPin, Printer, ClipboardCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import { updateReservationStatusAction, updatePaymentAction, setDropoffBranchAction } from "@/lib/actions/reservations";
import { updateCustomerInfoAction } from "@/lib/actions/panel-reservations";
import { ArrowRightLeft } from "lucide-react";
import { getPanelT } from "@/lib/i18n/panel";
import { formatDate, formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { BackLink } from "@/components/BackLink";
import { ContractForm } from "@/components/ContractForm";
import type { ReservationStatus } from "@prisma/client";
import type { LucideIcon } from "lucide-react";

type ActKey = "approve" | "reject" | "handover" | "cancel" | "takeBack";
const NEXT_ACTIONS: Record<string, { status: ReservationStatus; labelKey: ActKey; icon: LucideIcon; variant: string }[]> = {
  PENDING: [
    { status: "CONFIRMED", labelKey: "approve", icon: Check, variant: "btn-primary" },
    { status: "CANCELLED", labelKey: "reject", icon: X, variant: "btn-outline text-red-600" },
  ],
  CONFIRMED: [
    { status: "ACTIVE", labelKey: "handover", icon: KeyRound, variant: "btn-primary" },
    { status: "CANCELLED", labelKey: "cancel", icon: X, variant: "btn-outline text-red-600" },
  ],
  ACTIVE: [{ status: "COMPLETED", labelKey: "takeBack", icon: RotateCcw, variant: "btn-primary" }],
  COMPLETED: [],
  CANCELLED: [],
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2 last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireOffice();
  const { t } = await getPanelT();
  const D = t.resDetail;
  const { id } = await params;

  const [r, branches] = await Promise.all([
    prisma.reservation.findFirst({
      where: { id, companyId: session.companyId },
      include: { car: true, customer: true, contract: true, pickupLocation: true, dropoffLocation: true, pickupBranch: true, dropoffBranch: true, inspections: { orderBy: { createdAt: "desc" } } },
    }),
    prisma.branch.findMany({ where: { companyId: session.companyId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!r) notFound();

  const actions = NEXT_ACTIONS[r.status] || [];
  const oneWay = r.dropoffBranchId && r.dropoffBranchId !== r.pickupBranchId;
  const transferred = r.status === "COMPLETED" && r.dropoffBranchId && r.car.branchId === r.dropoffBranchId && r.pickupBranchId !== r.dropoffBranchId;

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/panel/reservations">{D.back}</BackLink>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{r.car.make} {r.car.model}</h1>
          <StatusBadge status={r.status} label={t.status[r.status as keyof typeof t.status]} />
        </div>
        {r.contract && (
          <span className="badge bg-slate-100 text-slate-600 ring-slate-500/20">{D.contractNo}: {r.contract.contractNo}</span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol: detaylar */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-4 font-semibold">{D.rentalDetail}</h2>
            <dl className="text-sm">
              <Row label={D.pickup} value={formatDate(r.startDate, "tr")} />
              <Row label={D.return} value={formatDate(r.endDate, "tr")} />
              <Row label={D.duration} value={`${r.days} ${t.common.day}`} />
              {r.pickupLocation && <Row label={D.pickupPlace} value={<span className="inline-flex items-center gap-1"><MapPin size={13} /> {r.pickupLocation.name}</span>} />}
              {r.dropoffLocation && <Row label={D.returnPlace} value={<span className="inline-flex items-center gap-1"><MapPin size={13} /> {r.dropoffLocation.name}</span>} />}
              <Row label={D.rentalType} value={r.rentalType === "MONTHLY" ? D.monthly : D.daily} />
              {r.rentalType === "MONTHLY"
                ? <Row label={D.monthlyRate} value={r.car.monthlyPrice ? formatMoney(r.car.monthlyPrice) : "—"} />
                : <Row label={D.dailyAvg} value={formatMoney(Math.round(r.totalPrice / r.days))} />}
              <Row label={D.total} value={<span className="text-base font-bold text-[var(--brand-600)]">{formatMoney(r.totalPrice)}</span>} />
              {r.note && <Row label={D.note} value={r.note} />}
            </dl>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-semibold">{D.customer}</h2>
            <dl className="mb-4 text-sm">
              <Row label={D.fullName} value={r.customer.name} />
              <Row label={D.email} value={<span className="inline-flex items-center gap-1"><Mail size={13} /> {r.customer.email}</span>} />
            </dl>
            <form action={updateCustomerInfoAction} className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
              <input type="hidden" name="customerId" value={r.customerId} />
              <input type="hidden" name="reservationId" value={r.id} />
              <div><label className="label">{D.phone}</label><input name="phone" className="input" defaultValue={r.customer.phone ?? ""} /></div>
              <div><label className="label">{D.idNo}</label><input name="idNumber" className="input" defaultValue={r.customer.idNumber ?? ""} /></div>
              <div><label className="label">{D.licenseNo}</label><input name="licenseNo" className="input" defaultValue={r.customer.licenseNo ?? ""} /></div>
              <div className="sm:col-span-3"><button type="submit" className="btn-outline btn-sm">{D.saveCustomer}</button></div>
            </form>
          </div>

          {/* Kira Sözleşmesi */}
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold"><FileText size={18} className="text-[var(--brand-600)]" /> {D.contract}</h2>
              {r.contract && (
                <Link href={`/contract/${r.id}`} target="_blank" className="btn-outline btn-sm">
                  <Printer size={14} /> {D.printContract}
                </Link>
              )}
            </div>
            {!r.contract && (
              <p className="mb-4 rounded-lg bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500">
                {D.contractHint}
              </p>
            )}
            <ContractForm reservationId={r.id} defaults={r.contract ?? {}} labels={t.contractForm} commonLabels={t.common} />
          </div>

          {/* Teslim / İade Kontrolleri */}
          {r.inspections.length > 0 && (
            <div className="card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold"><ClipboardCheck size={18} className="text-[var(--brand-600)]" /> {D.inspections}</h2>
                {r.inspections.some((i) => i.kind === "RETURN") && (
                  <Link href={`/return/${r.id}`} target="_blank" className="btn-outline btn-sm"><Printer size={14} /> {D.printReturn}</Link>
                )}
              </div>
              <div className="flex flex-col gap-5">
                {r.inspections.map((insp) => {
                  const photos = [
                    [t.handover.front, insp.photoFront], [t.handover.back, insp.photoBack], [t.handover.left, insp.photoLeft],
                    [t.handover.right, insp.photoRight], [t.handover.intFront, insp.photoInteriorFront], [t.handover.intBack, insp.photoInteriorBack],
                  ].filter(([, url]) => url) as [string, string][];
                  return (
                    <div key={insp.id} className="rounded-xl border border-slate-200 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className={`badge ${insp.kind === "PICKUP" ? "bg-blue-50 text-blue-700 ring-blue-600/20" : "bg-indigo-50 text-indigo-700 ring-indigo-600/20"}`}>
                          {insp.kind === "PICKUP" ? D.pickupInsp : D.returnInsp}
                        </span>
                        <span className="text-xs text-slate-400">{formatDate(insp.createdAt, "tr")}</span>
                      </div>
                      <div className="mb-3 flex flex-wrap gap-3 text-sm text-slate-600">
                        {insp.mileage != null && <span>🚗 {insp.mileage.toLocaleString("tr-TR")} km</span>}
                        {insp.fuelLevel && <span>⛽ {insp.fuelLevel}</span>}
                        {insp.damageNote && <span className="text-amber-600">⚠ {insp.damageNote}</span>}
                      </div>
                      {photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                          {photos.map(([label, url]) => (
                            <a key={label} href={url} target="_blank" className="group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt={label} className="aspect-square w-full rounded-lg border object-cover" />
                              <span className="mt-0.5 block text-center text-[10px] text-slate-400">{label}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      {insp.signatureUrl && (
                        <div className="mt-3">
                          <div className="mb-1 text-xs text-slate-400">{D.customerSign}</div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={insp.signatureUrl} alt="İmza" className="h-16 rounded-lg border bg-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sağ: araç + durum işlemleri */}
        <div className="flex flex-col gap-6">
          <div className="card overflow-hidden">
            <div className="aspect-[16/10] bg-slate-100">
              {r.car.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.car.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="p-4">
              <div className="font-semibold">{r.car.make} {r.car.model}</div>
              <div className="text-sm text-slate-500">{r.car.year} · {r.car.category}</div>
              <div className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">{r.car.plate}</div>
            </div>
          </div>

          {/* Şube / Tek yön transfer */}
          {branches.length > 0 && (
            <div className="card p-5">
              <h2 className="mb-3 flex items-center gap-2 font-semibold"><ArrowRightLeft size={17} className="text-[var(--brand-600)]" /> {D.branchTransfer}</h2>
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-slate-500">{D.pickupBranch}</span>
                <span className="font-medium">{r.pickupBranch?.name || "—"}</span>
              </div>
              <form action={setDropoffBranchAction} className="flex flex-col gap-2">
                <label className="label">{D.dropoffBranch}</label>
                <div className="flex gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <select name="dropoffBranchId" defaultValue={r.dropoffBranchId ?? ""} className="input">
                    <option value="">{D.sameBranch}</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <button type="submit" className="btn-outline btn-sm shrink-0">{t.common.save}</button>
                </div>
              </form>
              {transferred ? (
                <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 ring-1 ring-emerald-600/10">
                  ✓ {D.transferred.replace("{b}", r.dropoffBranch?.name ?? "")}
                </div>
              ) : oneWay ? (
                <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 ring-1 ring-amber-600/10">
                  🔁 {D.willTransfer.replace("{b}", r.dropoffBranch?.name ?? "")}
                </div>
              ) : null}
            </div>
          )}

          <div className="card p-5">
            <h2 className="mb-3 font-semibold">{D.statusActions}</h2>
            {(r.status === "CONFIRMED" || r.status === "ACTIVE") && (
              <Link href={`/panel/handover/${r.id}`} className="btn-outline mb-2 w-full">
                <ClipboardCheck size={15} /> {r.status === "CONFIRMED" ? D.pickupForm : D.returnForm}
              </Link>
            )}
            {actions.length === 0 ? (
              <p className="text-sm text-slate-400">{D.noAction}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {actions.map((a) => {
                  const Icon = a.icon;
                  return (
                    <form key={a.status} action={updateReservationStatusAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value={a.status} />
                      <button type="submit" className={`${a.variant} w-full`}><Icon size={15} /> {t.reservations[a.labelKey]}</button>
                    </form>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ödeme */}
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">{t.payment.title}</h2>
              <span className={`badge ${PAY_STYLE[r.paymentStatus]}`}>{t.payment[r.paymentStatus as keyof typeof t.payment]}</span>
            </div>
            <div className="mb-3 flex justify-between text-sm">
              <span className="text-slate-500">{t.payment.paidOfTotal}</span>
              <span className="font-medium">{formatMoney(r.paidAmount)} / {formatMoney(r.totalPrice)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["UNPAID", "PARTIAL", "PAID"] as const).map((ps) => (
                <form key={ps} action={updatePaymentAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="paymentStatus" value={ps} />
                  {ps === "PARTIAL" && <input type="hidden" name="paidAmount" value={Math.round(r.totalPrice / 2)} />}
                  <button type="submit" className={`w-full rounded-lg border px-2 py-1.5 text-xs font-medium ${r.paymentStatus === ps ? "border-transparent bg-[var(--brand-600)] text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                    {t.payment[ps]}
                  </button>
                </form>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PAY_STYLE: Record<string, string> = {
  UNPAID: "bg-red-50 text-red-700 ring-red-600/20",
  PARTIAL: "bg-amber-50 text-amber-700 ring-amber-600/20",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};
