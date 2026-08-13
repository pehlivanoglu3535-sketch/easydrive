import { notFound, redirect } from "next/navigation";
import { KeyRound, RotateCcw, Phone, MapPin } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/utils";
import { getPanelT } from "@/lib/i18n/panel";
import { BackLink } from "@/components/BackLink";
import { HandoverForm } from "./HandoverForm";

export default async function HandoverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireCompany();
  const { t } = await getPanelT();
  const h = t.handover;
  const { id } = await params;

  const r = await prisma.reservation.findFirst({
    where: { id, companyId: session.companyId },
    include: { car: true, customer: true, pickupBranch: true, dropoffBranch: true, inspections: { orderBy: { createdAt: "desc" } } },
  });
  if (!r) notFound();

  // Yalnızca teslim (CONFIRMED) veya iade (ACTIVE) aşamasındakiler
  if (r.status !== "CONFIRMED" && r.status !== "ACTIVE") redirect("/panel/handover");
  const kind = r.status === "ACTIVE" ? "RETURN" : "PICKUP";

  // İade ise, çıkış (teslim) kontrolünü referans göster
  const pickup = kind === "RETURN" ? r.inspections.find((i) => i.kind === "PICKUP") : null;
  const pickupRef = pickup
    ? { mileage: pickup.mileage, fuelLevel: pickup.fuelLevel, damageNote: pickup.damageNote }
    : null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <BackLink href="/panel/handover">{h.backToQueue}</BackLink>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
          {kind === "PICKUP" ? <KeyRound size={22} className="text-[var(--brand-600)]" /> : <RotateCcw size={22} className="text-[var(--brand-600)]" />}
          {kind === "PICKUP" ? h.pickupTitle : h.returnTitle}
        </h1>
      </div>

      {/* Özet */}
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="h-20 w-full overflow-hidden rounded-lg bg-slate-100 sm:h-16 sm:w-28">
          {r.car.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.car.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="flex-1">
          <div className="font-semibold">{r.car.make} {r.car.model} <span className="font-mono text-xs text-slate-400">{r.car.plate}</span></div>
          <div className="text-sm text-slate-500">{r.customer.name} · <span className="inline-flex items-center gap-1"><Phone size={12} /> {r.customer.phone || "—"}</span></div>
          <div className="text-xs text-slate-400">{formatDate(r.startDate, "tr")} → {formatDate(r.endDate, "tr")} · {formatMoney(r.totalPrice)}</div>
          {kind === "PICKUP" && r.dropoffBranchId && r.dropoffBranchId !== r.pickupBranchId && (
            <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-amber-600"><MapPin size={12} /> {h.dropoffBranch}: {r.dropoffBranch?.name}</div>
          )}
        </div>
      </div>

      {pickupRef && (
        <div className="card border-l-4 border-l-blue-500 p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">{h.exitInfo}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span>🚗 {h.exitKm}: <b>{pickupRef.mileage?.toLocaleString("tr-TR") ?? "—"}</b></span>
            <span>⛽ {h.exitFuel}: <b>{pickupRef.fuelLevel ?? "—"}</b></span>
            {pickupRef.damageNote && <span className="text-amber-600">⚠ {pickupRef.damageNote}</span>}
          </div>
        </div>
      )}

      <HandoverForm reservationId={r.id} kind={kind} defaultMileage={pickupRef?.mileage ?? r.car.mileage} labels={h} />
    </div>
  );
}
