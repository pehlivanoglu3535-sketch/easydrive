import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import { getPanelT } from "@/lib/i18n/panel";
import { formatDate, formatMoney } from "@/lib/utils";

export default async function CustomersPage() {
  const session = await requireOffice();
  const { t } = await getPanelT();
  const C = t.customers;
  const customers = await prisma.customer.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
    include: { reservations: { select: { totalPrice: true, status: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{C.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{customers.length} {C.count}</p>
      </div>

      {customers.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Users size={22} /></div>
          <p className="text-sm text-slate-500">{C.empty}</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-head">
                <th className="px-5 py-3">{C.name}</th>
                <th className="px-5 py-3">{C.email}</th>
                <th className="px-5 py-3">{C.phone}</th>
                <th className="px-5 py-3">{C.registered}</th>
                <th className="px-5 py-3">{C.resCol}</th>
                <th className="px-5 py-3">{C.spend}</th>
                <th className="px-5 py-3 text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const spend = c.reservations
                  .filter((r) => ["CONFIRMED", "ACTIVE", "COMPLETED"].includes(r.status))
                  .reduce((s, r) => s + r.totalPrice, 0);
                const isWalkin = c.email.endsWith("@rentflow.local");
                return (
                  <tr key={c.id} className="table-row">
                    <td className="px-5 py-3">
                      <Link href={`/panel/customers/${c.id}`} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-50)] text-xs font-semibold text-[var(--brand-600)]">
                          {c.name.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900 hover:text-[var(--brand-600)]">{c.name}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{isWalkin ? <span className="text-slate-400">{C.walkin}</span> : c.email}</td>
                    <td className="px-5 py-3 text-slate-600">{c.phone || "—"}</td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(c.createdAt, "tr")}</td>
                    <td className="px-5 py-3 text-slate-600">{c.reservations.length}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">{formatMoney(spend)}</td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/panel/customers/${c.id}`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">{t.common.details} <ChevronRight size={15} /></Link>
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
