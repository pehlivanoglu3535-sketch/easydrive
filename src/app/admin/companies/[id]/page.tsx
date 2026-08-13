import Link from "next/link";
import { notFound } from "next/navigation";
import { Car, CalendarCheck, Users, Wallet, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { setCompanyStatusAction, updateCompanyPlanAction, createInvoiceAction, toggleInvoicePaidAction } from "@/lib/actions/companies";
import { formatDate, formatMoney, COMPANY_STATUS_TR } from "@/lib/utils";
import { StatCard } from "@/components/StatCard";
import { BackLink } from "@/components/BackLink";

const STATUS_STYLE: Record<string, string> = {
  TRIAL: "bg-amber-50 text-amber-700 ring-amber-600/20",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  SUSPENDED: "bg-red-50 text-red-700 ring-red-600/20",
};

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      users: true,
      invoices: { orderBy: { issuedAt: "desc" } },
      _count: { select: { cars: true, reservations: true, customers: true } },
      reservations: { where: { status: { in: ["CONFIRMED", "ACTIVE", "COMPLETED"] } }, select: { totalPrice: true } },
    },
  });
  if (!company) notFound();

  const PLANS = ["TRIAL", "BASIC", "PRO", "ENTERPRISE"];
  const thisPeriod = new Date().toISOString().slice(0, 7);

  const revenue = company.reservations.reduce((s, r) => s + r.totalPrice, 0);
  const initials = company.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin">Firmalara dön</BackLink>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white" style={{ backgroundColor: company.primaryColor }}>{initials}</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
              <span className={`badge ${STATUS_STYLE[company.status]}`}>{COMPANY_STATUS_TR[company.status]}</span>
            </div>
            <Link href={`/s/${company.slug}`} target="_blank" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
              /s/{company.slug} <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Araç" value={company._count.cars} icon={Car} tone="brand" />
        <StatCard label="Rezervasyon" value={company._count.reservations} icon={CalendarCheck} tone="amber" />
        <StatCard label="Müşteri" value={company._count.customers} icon={Users} tone="indigo" />
        <StatCard label="Ciro" value={formatMoney(revenue, company.currency)} icon={Wallet} tone="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-semibold">Künye</h2>
          <dl className="flex flex-col gap-1 text-sm">
            {[
              ["Şehir", company.city],
              ["E-posta", company.contactEmail || "—"],
              ["Telefon", company.contactPhone || "—"],
              ["Adres", company.address || "—"],
              ["Varsayılan dil", company.defaultLocale.toUpperCase()],
              ["Para birimi", company.currency],
              ["Kayıt", formatDate(company.createdAt, "tr")],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-100 py-2 last:border-0">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-medium text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card p-6">
            <h2 className="mb-1 font-semibold">Abonelik Durumu</h2>
            <p className="mb-4 text-sm text-slate-500">"Askıda" durumunda firma kullanıcıları panele giremez.</p>
            <div className="flex flex-wrap gap-2">
              {(["TRIAL", "ACTIVE", "SUSPENDED"] as const).map((s) => (
                <form key={s} action={setCompanyStatusAction}>
                  <input type="hidden" name="id" value={company.id} />
                  <input type="hidden" name="status" value={s} />
                  <button type="submit" className={company.status === s ? "btn-primary btn-sm" : "btn-outline btn-sm"}>
                    {COMPANY_STATUS_TR[s]}
                  </button>
                </form>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-semibold">Yöneticiler & Personel</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {company.users.map((u) => (
                <li key={u.id} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                  <span className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{u.name.slice(0,1).toUpperCase()}</span>
                    <span className="font-medium text-slate-900">{u.name}</span>
                    <span className="text-slate-400">{u.email}</span>
                  </span>
                  <span className={`badge ${u.role === "COMPANY_ADMIN" ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20" : "bg-slate-100 text-slate-600 ring-slate-500/20"}`}>
                    {u.role === "COMPANY_ADMIN" ? "Yönetici" : "Personel"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Abonelik & Faturalar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-semibold">Abonelik Planı</h2>
          <form action={updateCompanyPlanAction} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={company.id} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Plan</label>
                <select name="plan" className="input" defaultValue={company.plan}>
                  {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Aylık Ücret (€)</label>
                <input name="planPriceMonthly" type="number" step="0.01" className="input" defaultValue={company.planPriceMonthly} />
              </div>
            </div>
            <button type="submit" className="btn-primary self-start">Planı Kaydet</button>
          </form>
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Faturalar</h2>
            <form action={createInvoiceAction} className="flex items-end gap-2">
              <input type="hidden" name="companyId" value={company.id} />
              <input type="hidden" name="period" value={thisPeriod} />
              <input type="hidden" name="amount" value={company.planPriceMonthly} />
              <button type="submit" className="btn-outline btn-sm">+ {thisPeriod} faturası</button>
            </form>
          </div>
          {company.invoices.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Fatura yok.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {company.invoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                  <span><span className="font-medium text-slate-900">{inv.period}</span> · {formatMoney(inv.amount, company.currency)}</span>
                  <form action={toggleInvoicePaidAction}>
                    <input type="hidden" name="id" value={inv.id} />
                    <button type="submit" className={`badge ${inv.status === "PAID" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-red-50 text-red-700 ring-red-600/20"}`}>
                      {inv.status === "PAID" ? "Ödendi" : "Ödenmedi"}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
