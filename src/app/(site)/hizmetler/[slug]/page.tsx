import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, CalendarCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { ServiceIcon } from "@/components/ServiceIcon";
import { RichText } from "@/components/RichText";
import { toLines } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/hizmetler/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service) return { title: "Hizmet bulunamadı" };
  return { title: service.title, description: service.summary };
}

export default async function ServiceDetailPage({ params }: PageProps<"/hizmetler/[slug]">) {
  const { slug } = await params;
  const service = await prisma.service.findFirst({ where: { slug, published: true } });
  if (!service) notFound();

  const features = toLines(service.features);
  const others = await prisma.service.findMany({
    where: { published: true, NOT: { id: service.id } },
    orderBy: { order: "asc" },
    take: 3,
  });

  return (
    <>
      <section className="border-b bg-brand-50/60">
        <div className="container-site py-16 md:py-20">
          <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
            <Link href="/hizmetler" className="hover:text-brand-700">Hizmetler</Link>
            <span>/</span>
            <span className="text-slate-700">{service.title}</span>
          </nav>
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
              <ServiceIcon name={service.icon} size={30} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{service.title}</h1>
              <p className="mt-3 max-w-2xl text-lg text-slate-600">{service.summary}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-site grid gap-12 py-16 md:py-20 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RichText text={service.description} />
        </div>

        <aside className="space-y-6">
          {features.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold">Kapsamında neler var?</h3>
              <ul className="mt-4 space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-accent-600" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="card bg-brand-700 p-6 text-white">
            <h3 className="text-lg font-semibold">Bu hizmetle ilgileniyor musunuz?</h3>
            <p className="mt-2 text-sm text-brand-100">İlk görüşme ücretsiz. Size en uygun çözümü birlikte belirleyelim.</p>
            <div className="mt-5 flex flex-col gap-2.5">
              <Link href={`/iletisim?tur=teklif&hizmet=${service.slug}`} className="btn-accent w-full">
                Teklif İsteyin <ArrowRight size={16} />
              </Link>
              <Link href={`/randevu?hizmet=${service.slug}`} className="btn w-full border border-white/30 text-white hover:bg-white/10">
                <CalendarCheck size={16} /> Randevu Al
              </Link>
            </div>
          </div>
        </aside>
      </section>

      {others.length > 0 && (
        <section className="border-t bg-slate-50">
          <div className="container-site py-16">
            <h2 className="text-2xl font-bold tracking-tight">Diğer hizmetler</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {others.map((o) => {
                return (
                  <Link key={o.id} href={`/hizmetler/${o.slug}`} className="card card-hover flex flex-col p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                      <ServiceIcon name={o.icon} size={22} />
                    </div>
                    <h3 className="mt-4 font-semibold">{o.title}</h3>
                    <p className="mt-1.5 text-sm text-slate-500">{o.summary}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
