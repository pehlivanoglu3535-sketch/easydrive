import Link from "next/link";
import { Search, Settings2, Fuel, Users, MapPin, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCompanyContext } from "@/lib/site";
import { findCompanyCars, formatMoney, toDateInput } from "@/lib/utils";

export default async function SiteHome({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ start?: string; end?: string; category?: string; loc?: string }>;
}) {
  const { slug } = await params;
  const { company, dict } = await getCompanyContext(slug);
  const sp = await searchParams;

  const start = sp.start ? new Date(sp.start) : undefined;
  const end = sp.end ? new Date(sp.end) : undefined;
  const validRange = start && end && end > start;

  const [cars, categories, locations] = await Promise.all([
    findCompanyCars(company.id, { start: validRange ? start : undefined, end: validRange ? end : undefined, category: sp.category || undefined }),
    prisma.car.findMany({ where: { companyId: company.id, status: "AVAILABLE" }, distinct: ["category"], select: { category: true } }),
    prisma.location.findMany({ where: { companyId: company.id } }),
  ]);

  const query = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]).toString();
  const today = toDateInput(new Date());
  const c = company.currency;
  const brand = company.primaryColor;

  return (
    <div>
      {/* Hero + arama */}
      <section className="relative text-white">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${brand}, ${brand}dd)` }} />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{dict.hero.title}</h1>
          <p className="mt-3 max-w-xl text-white/85">{dict.hero.subtitle}</p>

          <form method="get" className="mt-8 grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 text-slate-900 shadow-xl sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
            {locations.length > 0 && (
              <div>
                <label className="label" htmlFor="loc">{dict.search.pickupLocation}</label>
                <select id="loc" name="loc" className="input" defaultValue={sp.loc || ""}>
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="label" htmlFor="start">{dict.search.pickupDate}</label>
              <input id="start" name="start" type="date" className="input" min={today} defaultValue={sp.start || ""} />
            </div>
            <div>
              <label className="label" htmlFor="end">{dict.search.dropoffDate}</label>
              <input id="end" name="end" type="date" className="input" min={sp.start || today} defaultValue={sp.end || ""} />
            </div>
            <div>
              <label className="label" htmlFor="category">{dict.search.category}</label>
              <select id="category" name="category" className="input" defaultValue={sp.category || ""}>
                <option value="">{dict.common.all}</option>
                {categories.map((cat) => <option key={cat.category} value={cat.category}>{cat.category}</option>)}
              </select>
            </div>
            <button type="submit" className="btn h-[46px] w-full text-white shadow-sm" style={{ backgroundColor: brand }}>
              <Search size={16} /> {dict.common.search}
            </button>
          </form>
        </div>
      </section>

      {/* Araç listesi */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        {cars.length === 0 ? (
          <div className="card p-12 text-center text-sm text-slate-400">{dict.common.noResults}</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => {
              const href = `/s/${slug}/cars/${car.id}${query ? `?${query}` : ""}`;
              const unavailable = car.available === false;
              return (
                <div key={car.id} className="card card-hover flex flex-col overflow-hidden">
                  <div className="relative aspect-[16/10] bg-slate-100">
                    {car.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="h-full w-full object-cover" />
                    ) : null}
                    <span className="badge absolute left-3 top-3 bg-white/95 text-slate-700 ring-black/5">{car.category}</span>
                    {unavailable && <span className="badge absolute right-3 top-3 bg-red-600 text-white ring-red-700/20">{dict.car.unavailable}</span>}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{car.make} {car.model}</h3>
                      <p className="text-xs text-slate-400">{car.year}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1"><Settings2 size={13} /> {car.transmission}</span>
                      <span className="inline-flex items-center gap-1"><Fuel size={13} /> {car.fuel}</span>
                      <span className="inline-flex items-center gap-1"><Users size={13} /> {car.seats}</span>
                    </div>
                    <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3">
                      <div>
                        <span className="text-xl font-semibold" style={{ color: brand }}>{formatMoney(car.pricePerDay, c)}</span>
                        <span className="text-xs text-slate-400"> {dict.common.perDay}</span>
                      </div>
                      {unavailable ? (
                        <span className="btn-outline btn-sm pointer-events-none opacity-50">{dict.car.unavailable}</span>
                      ) : (
                        <Link href={href} className="btn btn-sm text-white" style={{ backgroundColor: brand }}>
                          {dict.common.details} <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
