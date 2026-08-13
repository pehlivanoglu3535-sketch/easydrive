import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import { formatMoney } from "@/lib/utils";
import { PrintButton } from "@/components/PrintButton";
import { T, TBlock, dmy } from "@/components/DocI18n";

function Field({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-200 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="pt-[1px] text-right font-medium text-slate-900">{value ?? "—"}</span>
    </div>
  );
}

export default async function ContractDocument({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireOffice();
  const { id } = await params;

  const r = await prisma.reservation.findFirst({
    where: { id, companyId: session.companyId },
    include: { car: true, customer: true, contract: true, company: true, pickupLocation: true, dropoffLocation: true },
  });
  if (!r) notFound();

  const c = r.company;
  const k = r.contract;
  const grand = r.totalPrice + (k?.insuranceFee || 0) + (k?.extrasFee || 0);

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-[210mm] items-center justify-between px-4 print:hidden">
        <a href={`/panel/reservations/${r.id}`} className="text-sm text-slate-500 hover:text-slate-900">← Rezervasyona dön</a>
        <PrintButton label="Yazdır / PDF" />
      </div>

      <div className="mx-auto max-w-[210mm] bg-white p-10 shadow-sm print:max-w-none print:p-0 print:shadow-none">
        {/* Başlık */}
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            {c.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.logoUrl} alt="" className="h-14 w-14 object-contain" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-lg text-lg font-bold text-white" style={{ backgroundColor: c.primaryColor }}>
                {c.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-lg font-bold text-slate-900">{c.name}</div>
              <div className="text-xs text-slate-500">{c.address || c.city}</div>
              <div className="text-xs text-slate-500">{[c.contactPhone, c.contactEmail].filter(Boolean).join(" · ")}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold uppercase text-slate-800"><T k="contractTitle" className="items-end" /></div>
            <div className="mt-1 flex items-center justify-end gap-1 text-xs text-slate-500"><T k="contractNo" className="items-end" />: <span className="font-mono font-semibold text-slate-800">{k?.contractNo ?? "—"}</span></div>
            <div className="flex items-center justify-end gap-1 text-xs text-slate-500"><T k="date" className="items-end" />: {dmy(new Date())}</div>
          </div>
        </div>

        {/* Taraflar */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase text-slate-500"><T k="lessor" /></h3>
            <Field label={<T k="title2" />} value={c.name} />
            <Field label={<T k="city" />} value={c.city} />
            <Field label={<T k="phone" />} value={c.contactPhone} />
            <Field label={<T k="taxNo" />} value={c.taxId} />
          </div>
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase text-slate-500"><T k="lessee" /></h3>
            <Field label={<T k="fullName" />} value={r.customer.name} />
            <Field label={<T k="phone" />} value={r.customer.phone} />
            <Field label={<T k="idNo" />} value={r.customer.idNumber} />
            <Field label={<T k="licenseNo" />} value={r.customer.licenseNo} />
          </div>
        </div>

        {/* Araç */}
        <div className="mt-6">
          <h3 className="mb-2 text-xs font-bold uppercase text-slate-500"><T k="vehicle" /></h3>
          <div className="grid grid-cols-2 gap-x-6">
            <Field label={<T k="makeModel" />} value={`${r.car.make} ${r.car.model}`} />
            <Field label={<T k="plate" />} value={r.car.plate} />
            <Field label={<T k="year" />} value={r.car.year} />
            <Field label={<T k="category" />} value={r.car.category} />
          </div>
        </div>

        {/* Kiralama */}
        <div className="mt-6">
          <h3 className="mb-2 text-xs font-bold uppercase text-slate-500"><T k="rentalInfo" /></h3>
          <div className="grid grid-cols-2 gap-x-6">
            <Field label={<T k="pickupDate" />} value={dmy(r.startDate)} />
            <Field label={<T k="returnDate" />} value={dmy(r.endDate)} />
            <Field label={<T k="pickupPlace" />} value={r.pickupLocation?.name} />
            <Field label={<T k="returnPlace" />} value={r.dropoffLocation?.name} />
            <Field label={<T k="duration" />} value={<>{r.days} <T k="days" className="inline" /></>} />
            <Field label={<T k="dailyRate" />} value={formatMoney(r.car.pricePerDay)} />
            <Field label={<T k="pickupKm" />} value={k?.startMileage?.toLocaleString("tr-TR")} />
            <Field label={<T k="returnKm" />} value={k?.endMileage?.toLocaleString("tr-TR")} />
            <Field label={<T k="fuelOut" />} value={k?.fuelLevelOut} />
            <Field label={<T k="fuelIn" />} value={k?.fuelLevelIn} />
            <Field label={<T k="deposit" />} value={k?.depositAmount != null ? formatMoney(k.depositAmount) : "—"} />
            <Field label={<T k="rentalAmount" />} value={formatMoney(r.totalPrice)} />
            {k?.insuranceFee ? <Field label={<T k="insurance" />} value={formatMoney(k.insuranceFee)} /> : null}
            {k?.extrasFee ? <Field label={<T k="extras" />} value={formatMoney(k.extrasFee)} /> : null}
            <Field label={<T k="grandTotal" className="font-bold" />} value={<span className="font-bold">{formatMoney(grand)}</span>} />
          </div>
        </div>

        {/* Ek sürücü & hasar */}
        {(k?.extraDriverName || k?.damageNote || k?.damagePhotoUrl) && (
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase text-slate-500"><T k="extraDriver" /></h3>
              <Field label={<T k="fullName" />} value={k?.extraDriverName} />
              <Field label={<T k="licenseNo" />} value={k?.extraDriverLicense} />
            </div>
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase text-slate-500"><T k="damageCond" /></h3>
              <Field label={<T k="note" />} value={k?.damageNote} />
              {k?.damagePhotoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={k.damagePhotoUrl} alt="" className="mt-2 h-24 rounded-lg border object-cover" />
              )}
            </div>
          </div>
        )}

        {/* Şartlar */}
        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-[10px] leading-relaxed text-slate-600 print:bg-white print:p-0">
          <p className="font-semibold text-slate-700"><T k="termsTitle" className="inline" /></p>
          <TBlock k="terms" className="mt-1" />
        </div>

        {/* İmza */}
        <div className="mt-10 grid grid-cols-2 gap-10">
          <div>
            <div className="h-16 border-b border-slate-400" />
            <div className="mt-1 text-[11px] text-slate-500"><T k="signCompany" /></div>
          </div>
          <div>
            <div className="h-16 border-b border-slate-400" />
            <div className="mt-1 text-[11px] text-slate-500"><T k="signCustomer" /></div>
          </div>
        </div>

        {k?.signedAt && (
          <p className="mt-4 flex items-center gap-1 text-[11px] text-emerald-600">✓ <T k="signedOn" className="inline" /> {dmy(k.signedAt)}</p>
        )}

        {/* Firma künyesi altbilgisi */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-slate-200 pt-3 text-[10px] text-slate-500">
          {c.contactPhone && <span>📞 {c.contactPhone}</span>}
          {c.contactEmail && <span>✉ {c.contactEmail}</span>}
          {c.website && <span>🌐 {c.website}</span>}
          {c.whatsapp && <span>WhatsApp: {c.whatsapp}</span>}
          {c.instagram && <span>IG: {c.instagram}</span>}
          {c.facebook && <span>FB: {c.facebook}</span>}
          {c.taxId && <span>NUI: {c.taxId}</span>}
        </div>
      </div>
    </div>
  );
}
