import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireOffice } from "@/lib/auth";
import { PrintButton } from "@/components/PrintButton";
import { T, dmy, DOC } from "@/components/DocI18n";

const FUEL_ORDER: Record<string, number> = { Rezerv: 0, "1/4": 1, "1/2": 2, "3/4": 3, Dolu: 4 };

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-200 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="pt-[1px] text-right font-medium text-slate-900">{value ?? "—"}</span>
    </div>
  );
}

type InspPhotos = { photoFront: string | null; photoBack: string | null; photoLeft: string | null; photoRight: string | null; photoInteriorFront: string | null; photoInteriorBack: string | null };

function Photos({ insp }: { insp: InspPhotos | null | undefined }) {
  const photos = insp
    ? ([["Ön", insp.photoFront], ["Arka", insp.photoBack], ["Sol", insp.photoLeft], ["Sağ", insp.photoRight], ["Ön İç", insp.photoInteriorFront], ["Arka İç", insp.photoInteriorBack]].filter(([, u]) => u) as [string, string][])
    : [];
  if (photos.length === 0) return <p className="text-[10px] text-slate-400">{DOC.noPhoto.join(" · ")}</p>;
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {photos.map(([label, url]) => (
        <div key={label}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={label} className="aspect-square w-full rounded border object-cover" />
        </div>
      ))}
    </div>
  );
}

export default async function ReturnDocument({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireOffice();
  const { id } = await params;

  const r = await prisma.reservation.findFirst({
    where: { id, companyId: session.companyId },
    include: { car: true, customer: true, company: true, contract: true, inspections: { orderBy: { createdAt: "asc" } } },
  });
  if (!r) notFound();

  const c = r.company;
  const pickup = r.inspections.find((i) => i.kind === "PICKUP");
  const ret = r.inspections.find((i) => i.kind === "RETURN");
  const kmDriven = pickup?.mileage != null && ret?.mileage != null ? ret.mileage - pickup.mileage : null;
  const fuelDiff =
    pickup?.fuelLevel && ret?.fuelLevel && FUEL_ORDER[pickup.fuelLevel] != null && FUEL_ORDER[ret.fuelLevel] != null
      ? FUEL_ORDER[ret.fuelLevel] - FUEL_ORDER[pickup.fuelLevel]
      : null;
  const fuelText = fuelDiff == null ? "—" : fuelDiff < 0 ? `${DOC.fuelMissing.join(" / ")} (${Math.abs(fuelDiff)})` : fuelDiff > 0 ? DOC.fuelExtra.join(" / ") : DOC.fuelSame.join(" / ");

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
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold uppercase text-slate-800"><T k="returnTitle" className="items-end" /></div>
            <div className="mt-1 flex items-center justify-end gap-1 text-xs text-slate-500"><T k="contractNo" className="items-end" />: <span className="font-mono font-semibold text-slate-800">{r.contract?.contractNo ?? "—"}</span></div>
            <div className="flex items-center justify-end gap-1 text-xs text-slate-500"><T k="date" className="items-end" />: {dmy(new Date())}</div>
          </div>
        </div>

        {/* Araç + müşteri */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase text-slate-500"><T k="vehicleShort" /></h3>
            <Row label={<T k="makeModel" />} value={`${r.car.make} ${r.car.model}`} />
            <Row label={<T k="plate" />} value={r.car.plate} />
          </div>
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase text-slate-500"><T k="lessee" /></h3>
            <Row label={<T k="fullName" />} value={r.customer.name} />
            <Row label={<T k="phone" />} value={r.customer.phone} />
          </div>
        </div>

        {/* Çıkış vs İade */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="mb-2 text-sm font-bold text-blue-700"><T k="handoverOut" /></h3>
            <Row label={<T k="date" />} value={pickup ? dmy(pickup.createdAt) : "—"} />
            <Row label={<T k="mileage" />} value={pickup?.mileage?.toLocaleString("tr-TR")} />
            <Row label={<T k="fuel" />} value={pickup?.fuelLevel} />
            <Row label={<T k="damage" />} value={pickup?.damageNote} />
            <div className="mt-2"><Photos insp={pickup} /></div>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="mb-2 text-sm font-bold text-indigo-700"><T k="returnIn" /></h3>
            <Row label={<T k="date" />} value={ret ? dmy(ret.createdAt) : "—"} />
            <Row label={<T k="mileage" />} value={ret?.mileage?.toLocaleString("tr-TR")} />
            <Row label={<T k="fuel" />} value={ret?.fuelLevel} />
            <Row label={<T k="damage" />} value={ret?.damageNote} />
            <div className="mt-2"><Photos insp={ret} /></div>
          </div>
        </div>

        {/* Özet */}
        <div className="mt-6 rounded-lg bg-slate-50 p-4 print:bg-white print:p-0">
          <h3 className="mb-2 text-xs font-bold uppercase text-slate-500"><T k="summary" /></h3>
          <div className="grid grid-cols-2 gap-x-6">
            <Row label={<T k="kmDriven" />} value={kmDriven != null ? `${kmDriven.toLocaleString("tr-TR")} km` : "—"} />
            <Row label={<T k="fuelStatus" />} value={fuelText} />
          </div>
        </div>

        {/* İmzalar */}
        <div className="mt-10 grid grid-cols-2 gap-10">
          <div>
            <div className="h-16 border-b border-slate-400" />
            <div className="mt-1 text-[11px] text-slate-500"><T k="receivedBy" /></div>
          </div>
          <div>
            <div className="flex h-16 items-end border-b border-slate-400">
              {ret?.signatureUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ret.signatureUrl} alt="" className="max-h-14" />
              )}
            </div>
            <div className="mt-1 text-[11px] text-slate-500"><T k="returnedBy" /></div>
          </div>
        </div>

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
