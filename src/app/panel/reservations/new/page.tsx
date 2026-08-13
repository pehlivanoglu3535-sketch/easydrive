import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import { getPanelT } from "@/lib/i18n/panel";
import { toDateInput } from "@/lib/utils";
import { BackLink } from "@/components/BackLink";
import { NewReservationForm } from "./NewReservationForm";

export default async function NewReservationPage() {
  const session = await requireOffice();
  const { t } = await getPanelT();
  const N = t.resNew;
  const [cars, locations, rules, branches] = await Promise.all([
    prisma.car.findMany({ where: { companyId: session.companyId, status: "AVAILABLE" }, orderBy: [{ make: "asc" }], select: { id: true, make: true, model: true, plate: true, pricePerDay: true, monthlyPrice: true, category: true, branchId: true } }),
    prisma.location.findMany({ where: { companyId: session.companyId }, select: { id: true, name: true } }),
    prisma.pricingRule.findMany({ where: { companyId: session.companyId }, select: { id: true, name: true, startDate: true, endDate: true, category: true, kind: true, value: true, priority: true } }),
    prisma.branch.findMany({ where: { companyId: session.companyId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const carLite = cars.map((c) => ({ id: c.id, label: `${c.make} ${c.model} (${c.plate})`, pricePerDay: c.pricePerDay, monthlyPrice: c.monthlyPrice, category: c.category, branchId: c.branchId }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/panel/reservations">{t.resDetail.back}</BackLink>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{N.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{N.subtitle}</p>
      </div>
      {carLite.length === 0 ? (
        <div className="card p-10 text-center text-sm text-slate-400">{N.noCars}</div>
      ) : (
        <NewReservationForm cars={carLite} locations={locations} branches={branches} rules={rules as never} minDate={toDateInput(new Date())} labels={N} statusLabels={t.status} commonLabels={t.common} />
      )}
    </div>
  );
}
