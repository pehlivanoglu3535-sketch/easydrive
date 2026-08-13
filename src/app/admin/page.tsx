import Link from "next/link";
import { Building2, CheckCircle2, Car, CalendarCheck, Plus, ExternalLink, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate, COMPANY_STATUS_TR } from "@/lib/utils";
import { StatCard } from "@/components/StatCard";

const STATUS_STYLE: Record<string, string> = {
  TRIAL: "bg-amber-50 text-amber-700 ring-amber-600/20",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  SUSPENDED: "bg-red-50 text-red-700 ring-red-600/20",
};

export default async function AdminDashboard() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { cars: true, reservations: true, users: true } } },
  });

  const totals = {
    companies: companies.length,
    active: companies.filter((c) => c.status === "ACTIVE").length,
    cars: companies.reduce((s, c) => s + c._count.cars, 0),
    reservations: companies.reduce((s, c) => s + c._count.reservations, 0),
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Firmalar</h1>
          <p className="mt-1 text-sm text-slate-500">Platform geneli müşteri firmalarını yönetin.</p>
        </div>
        <Link href="/admin/companies/new" className="btn-primary"><Plus size={16} /> Yeni Firma</Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam Firma" value={totals.companies} icon={Building2} tone="brand" />
        <StatCard label="Aktif Abone" value={totals.active} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Toplam Araç" value={totals.cars} icon={Car} tone="indigo" />
        <StatCard label="Toplam Rezervasyon" value={totals.reservations} icon={CalendarCheck} tone="amber" />
      </div>

      <div className="card overflow-hidden">
        <div className="border-b px-5 py-4"><h2 className="font-semibold">Tüm Firmalar</h2></div>
        {companies.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-400">Henüz firma yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-head">
                  <th className="px-5 py-3">Firma</th>
                  <th className="px-5 py-3">Site Adresi</th>
                  <th className="px-5 py-3">Şehir</th>
                  <th className="px-5 py-3">Araç</th>
                  <th className="px-5 py-3">Rez.</th>
                  <th className="px-5 py-3">Durum</th>
                  <th className="px-5 py-3">Kayıt</th>
                  <th className="px-5 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className="table-row">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ backgroundColor: c.primaryColor }}>
                          {c.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/s/${c.slug}`} target="_blank" className="inline-flex items-center gap-1 font-mono text-xs text-indigo-600 hover:underline">
                        /s/{c.slug} <ExternalLink size={12} />
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{c.city}</td>
                    <td className="px-5 py-3 text-slate-600">{c._count.cars}</td>
                    <td className="px-5 py-3 text-slate-600">{c._count.reservations}</td>
                    <td className="px-5 py-3"><span className={`badge ${STATUS_STYLE[c.status]}`}>{COMPANY_STATUS_TR[c.status]}</span></td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(c.createdAt, "tr")}</td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/companies/${c.id}`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
                        Yönet <ChevronRight size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
