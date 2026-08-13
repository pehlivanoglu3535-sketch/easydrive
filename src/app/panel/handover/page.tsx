import Link from "next/link";
import { KeyRound, RotateCcw, ClipboardCheck, CheckCircle2, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireCompany } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/utils";
import { getPanelT } from "@/lib/i18n/panel";

export default async function HandoverQueuePage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const session = await requireCompany();
  const { t } = await getPanelT();
  const h = t.handover;
  const { ok } = await searchParams;
  const branchScope = session.branchId ? { branchId: session.branchId } : {};

  const items = await prisma.reservation.findMany({
    where: { companyId: session.companyId, status: { in: ["CONFIRMED", "ACTIVE"] }, ...branchScope },
    include: { car: true, customer: true },
    orderBy: { startDate: "asc" },
  });

  const pickups = items.filter((r) => r.status === "CONFIRMED");
  const returns = items.filter((r) => r.status === "ACTIVE");

  function Card({ r, mode }: { r: (typeof items)[number]; mode: "PICKUP" | "RETURN" }) {
    return (
      <Link href={`/panel/handover/${r.id}`} className="card card-hover flex items-center gap-3 p-4">
        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {r.car.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.car.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-slate-900">{r.car.make} {r.car.model} <span className="font-mono text-xs text-slate-400">{r.car.plate}</span></div>
          <div className="text-sm text-slate-500">{r.customer.name} · {r.customer.phone || "—"}</div>
          <div className="text-xs text-slate-400">{formatDate(r.startDate, "tr")} → {formatDate(r.endDate, "tr")} · {formatMoney(r.totalPrice)}</div>
        </div>
        <span className={`badge ${mode === "PICKUP" ? "bg-blue-50 text-blue-700 ring-blue-600/20" : "bg-indigo-50 text-indigo-700 ring-indigo-600/20"}`}>
          {mode === "PICKUP" ? <><KeyRound size={12} /> {h.pickup}</> : <><RotateCcw size={12} /> {h.return}</>}
        </span>
        <ChevronRight size={18} className="text-slate-300" />
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight"><ClipboardCheck size={24} className="text-[var(--brand-600)]" /> {h.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{h.subtitle}</p>
      </div>

      {ok && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700 ring-1 ring-emerald-600/10">
          <CheckCircle2 size={16} /> {h.savedOk}
        </div>
      )}

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400"><KeyRound size={15} /> {h.pickupWaiting} ({pickups.length})</h2>
        {pickups.length === 0 ? (
          <div className="card p-8 text-center text-sm text-slate-400">{h.noPickup}</div>
        ) : (
          <div className="flex flex-col gap-3">{pickups.map((r) => <Card key={r.id} r={r} mode="PICKUP" />)}</div>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400"><RotateCcw size={15} /> {h.returnWaiting} ({returns.length})</h2>
        {returns.length === 0 ? (
          <div className="card p-8 text-center text-sm text-slate-400">{h.noReturn}</div>
        ) : (
          <div className="flex flex-col gap-3">{returns.map((r) => <Card key={r.id} r={r} mode="RETURN" />)}</div>
        )}
      </section>
    </div>
  );
}
