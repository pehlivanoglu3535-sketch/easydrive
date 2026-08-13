import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCompanyContext } from "@/lib/site";
import { formatDate, formatMoney } from "@/lib/utils";

export default async function BookingSuccess({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ r?: string }>;
}) {
  const { slug } = await params;
  const { company, locale, dict } = await getCompanyContext(slug);
  const { r } = await searchParams;

  const reservation = r
    ? await prisma.reservation.findFirst({
        where: { id: r, companyId: company.id },
        include: { car: true, customer: true },
      })
    : null;
  if (!reservation) notFound();

  const c = company.currency;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 size={32} />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{dict.booking.reservationReceived}</h1>
      <p className="mt-2 text-slate-500">{dict.booking.reservationReceivedInfo}</p>
      <p className="mt-1 font-mono text-lg font-bold" style={{ color: company.primaryColor }}>
        #{reservation.id.slice(-8).toUpperCase()}
      </p>

      <div className="card mt-6 p-6 text-left">
        <div className="flex items-center gap-3">
          <div className="h-16 w-24 shrink-0 overflow-hidden rounded bg-slate-100">
            {reservation.car.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={reservation.car.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl">🚗</div>
            )}
          </div>
          <div>
            <div className="font-semibold">{reservation.car.make} {reservation.car.model}</div>
            <div className="text-sm text-slate-500">
              {formatDate(reservation.startDate, locale)} → {formatDate(reservation.endDate, locale)}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 font-bold">
          <span>{dict.common.total}</span>
          <span style={{ color: company.primaryColor }}>{formatMoney(reservation.totalPrice, c)}</span>
        </div>
      </div>

      <Link href={`/s/${slug}`} className="btn-primary mt-6" style={{ backgroundColor: company.primaryColor }}>
        <ArrowLeft size={16} /> {dict.booking.backToCars}
      </Link>
    </div>
  );
}
