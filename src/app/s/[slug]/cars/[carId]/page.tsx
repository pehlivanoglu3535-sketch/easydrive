import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Settings2, Fuel, Users, Hash } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCompanyContext } from "@/lib/site";
import { formatMoney, toDateInput } from "@/lib/utils";
import { BookingForm } from "./BookingForm";

export default async function SiteCarDetail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; carId: string }>;
  searchParams: Promise<{ start?: string; end?: string; loc?: string }>;
}) {
  const { slug, carId } = await params;
  const { company, dict } = await getCompanyContext(slug);
  const sp = await searchParams;

  const car = await prisma.car.findFirst({ where: { id: carId, companyId: company.id } });
  if (!car) notFound();

  const [locations, rules] = await Promise.all([
    prisma.location.findMany({ where: { companyId: company.id }, select: { id: true, name: true } }),
    prisma.pricingRule.findMany({ where: { companyId: company.id }, select: { id: true, name: true, startDate: true, endDate: true, category: true, kind: true, value: true, priority: true } }),
  ]);
  const today = toDateInput(new Date());
  const c = company.currency;
  const brand = company.primaryColor;

  const specs = [
    { icon: Settings2, label: dict.car.transmission, value: car.transmission },
    { icon: Fuel, label: dict.car.fuel, value: car.fuel },
    { icon: Users, label: dict.car.seats, value: `${car.seats}` },
    { icon: Hash, label: "Plaka", value: car.plate },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <Link href={`/s/${slug}`} className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft size={15} /> {dict.booking.backToCars}
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="card overflow-hidden">
            <div className="aspect-[16/10] bg-slate-100">
              {car.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="h-full w-full object-cover" />
              ) : null}
            </div>
          </div>

          <div className="mt-6">
            <span className="badge" style={{ backgroundColor: `${brand}14`, color: brand }}>{car.category}</span>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">{car.make} {car.model}</h1>
            <p className="text-slate-500">{car.year}</p>

            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {specs.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="card p-3 text-center">
                    <Icon size={18} className="mx-auto text-slate-400" />
                    <dt className="mt-1.5 text-xs text-slate-400">{s.label}</dt>
                    <dd className="text-sm font-semibold text-slate-900">{s.value}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>

        <div>
          <div className="card sticky top-6 p-6">
            <div className="mb-5 flex items-baseline justify-between border-b border-slate-100 pb-5">
              <span className="text-sm text-slate-500">{dict.common.perDay}</span>
              <span className="text-2xl font-semibold" style={{ color: brand }}>{formatMoney(car.pricePerDay, c)}</span>
            </div>

            {car.status !== "AVAILABLE" ? (
              <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700 ring-1 ring-amber-600/10">{dict.car.unavailable}</div>
            ) : (
              <BookingForm
                slug={slug} carId={car.id} pricePerDay={car.pricePerDay} monthlyPrice={car.monthlyPrice}
                category={car.category} currency={c} minDate={today} defaultStart={sp.start} defaultEnd={sp.end}
                color={brand} locations={locations} rules={rules as never} defaultPickup={sp.loc} dict={dict}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
