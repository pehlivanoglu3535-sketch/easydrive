import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, CalendarCheck, Wallet, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import { getPanelT } from "@/lib/i18n/panel";
import { formatDate, formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { StatCard } from "@/components/StatCard";
import { BackLink } from "@/components/BackLink";
import { CustomerEditForm } from "./CustomerEditForm";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireOffice();
  const { t } = await getPanelT();
  const C = t.customers;
  const { id } = await params;

  const customer = await prisma.customer.findFirst({
    where: { id, companyId: session.companyId },
    include: { reservations: { include: { car: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!customer) notFound();

  const spend = customer.reservations
    .filter((r) => ["CONFIRMED", "ACTIVE", "COMPLETED"].includes(r.status))
    .reduce((s, r) => s + r.totalPrice, 0);
  const isWalkin = customer.email.endsWith("@rentflow.local");

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/panel/customers">{C.back}</BackLink>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-50)] text-lg font-semibold text-[var(--brand-600)]">{customer.name.slice(0, 1).toUpperCase()}</div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{customer.name}</h1>
          {!isWalkin && <p className="inline-flex items-center gap-1 text-sm text-slate-500"><Mail size={13} /> {customer.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={C.reservations} value={customer.reservations.length} icon={CalendarCheck} tone="brand" />
        <StatCard label={C.spend} value={formatMoney(spend)} icon={Wallet} tone="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <h2 className="mb-4 font-semibold">{C.info}</h2>
          <CustomerEditForm customer={customer} labels={C} commonLabels={t.common} />
        </div>

        <div className="card lg:col-span-2">
          <div className="border-b px-5 py-4"><h2 className="font-semibold">{C.history}</h2></div>
          {customer.reservations.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-400">{C.noHistory}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {customer.reservations.map((r) => (
                <li key={r.id}>
                  <Link href={`/panel/reservations/${r.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                    <div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {r.car.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.car.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900">{r.car.make} {r.car.model}</div>
                      <div className="text-xs text-slate-500">{formatDate(r.startDate, "tr")} → {formatDate(r.endDate, "tr")} · {formatMoney(r.totalPrice)}</div>
                    </div>
                    <StatusBadge status={r.status} label={t.status[r.status as keyof typeof t.status]} />
                    <ChevronRight size={16} className="text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
