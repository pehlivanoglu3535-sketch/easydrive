import { Tag, Trash2, Percent, Euro } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import { deletePricingRuleAction } from "@/lib/actions/pricing";
import { getPanelT } from "@/lib/i18n/panel";
import { formatDate, formatMoney } from "@/lib/utils";
import { PricingForm } from "./PricingForm";

export default async function PricingPage() {
  const session = await requireOffice();
  const { t } = await getPanelT();
  const P = t.pricing;
  const [rules, cats] = await Promise.all([
    prisma.pricingRule.findMany({ where: { companyId: session.companyId }, orderBy: [{ priority: "desc" }, { startDate: "asc" }] }),
    prisma.car.findMany({ where: { companyId: session.companyId }, distinct: ["category"], select: { category: true } }),
  ]);
  const categories = cats.map((c) => c.category);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{P.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{P.subtitle}</p>
      </div>

      <section className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold"><Tag size={18} className="text-[var(--brand-600)]" /> {P.newRule}</h2>
        <PricingForm categories={categories} labels={P} commonLabels={t.common} />
      </section>

      <section className="card overflow-x-auto">
        <div className="border-b px-5 py-4"><h2 className="font-semibold">{P.rules} ({rules.length})</h2></div>
        {rules.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-400">{P.empty}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-head">
                <th className="px-5 py-3">{P.rule}</th>
                <th className="px-5 py-3">{P.category}</th>
                <th className="px-5 py-3">{P.period}</th>
                <th className="px-5 py-3">{P.effect}</th>
                <th className="px-5 py-3">{P.priority}</th>
                <th className="px-5 py-3 text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="table-row">
                  <td className="px-5 py-3 font-medium text-slate-900">{r.name}</td>
                  <td className="px-5 py-3 text-slate-600">{r.category || <span className="text-slate-400">{t.common.all}</span>}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(r.startDate, "tr")} → {formatDate(r.endDate, "tr")}</td>
                  <td className="px-5 py-3">
                    {r.kind === "PERCENT" ? (
                      <span className={`badge ${r.value >= 0 ? "bg-orange-50 text-orange-700 ring-orange-600/20" : "bg-emerald-50 text-emerald-700 ring-emerald-600/20"}`}>
                        <Percent size={12} /> {r.value >= 0 ? "+" : ""}{r.value}%
                      </span>
                    ) : (
                      <span className="badge bg-blue-50 text-blue-700 ring-blue-600/20"><Euro size={12} /> {formatMoney(r.value)}{t.common.perDay}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{r.priority}</td>
                  <td className="px-5 py-3 text-right">
                    <form action={deletePricingRuleAction} className="inline">
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" title={t.common.delete} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
