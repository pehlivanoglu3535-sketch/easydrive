import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import { createCarAction } from "@/lib/actions/cars";
import { getPanelT } from "@/lib/i18n/panel";
import { CarForm } from "@/components/CarForm";
import { BackLink } from "@/components/BackLink";

export default async function NewCarPage() {
  const session = await requireOffice();
  const { t } = await getPanelT();
  const branches = await prisma.branch.findMany({ where: { companyId: session.companyId }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/panel/cars">{t.carForm.backToFleet}</BackLink>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t.carForm.newCar}</h1>
      </div>
      <CarForm
        action={createCarAction}
        submitLabel={t.carForm.saveCar}
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
