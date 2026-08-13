import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import { updateCarAction } from "@/lib/actions/cars";
import { getPanelT } from "@/lib/i18n/panel";
import { CarForm } from "@/components/CarForm";
import { BackLink } from "@/components/BackLink";

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireOffice();
  const { t } = await getPanelT();
  const { id } = await params;
  const [car, branches] = await Promise.all([
    prisma.car.findFirst({ where: { id, companyId: session.companyId } }),
    prisma.branch.findMany({ where: { companyId: session.companyId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!car) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/panel/cars">{t.carForm.backToFleet}</BackLink>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{car.make} {car.model} — {t.common.edit}</h1>
      </div>
      <CarForm
        action={updateCarAction}
        defaults={car}
        submitLabel={t.common.saveChanges}
        branches={branches}
        labels={t.carForm}
        statusLabels={t.carStatus}
        conditionLabels={t.condition}
        savingLabel={t.common.saving}
        cancelLabel={t.common.cancel}
      />
    </div>
  );
}
