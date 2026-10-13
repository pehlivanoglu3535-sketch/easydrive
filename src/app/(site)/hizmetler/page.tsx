import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { ServiceIcon } from "@/components/ServiceIcon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hizmetler",
  description: "İş & yönetim, mali müşavirlik, göçmenlik ve yazılım danışmanlığı hizmetlerimiz.",
};

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });

  return (
    <>
      <section className="border-b bg-brand-50/60">
        <div className="container-site py-16 md:py-20">
          <span className="eyebrow">Hizmetlerimiz</span>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            İhtiyacınıza uygun danışmanlık çözümleri
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Her hizmetimiz, kurumunuzun gerçek ihtiyaçlarına göre uyarlanır. Aşağıdan
            detayları inceleyin veya doğrudan bizimle iletişime geçin.
          </p>
        </div>
      </section>

      <section className="container-site py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((s) => {
            const features = s.features.split("\n").map((f) => f.trim()).filter(Boolean).slice(0, 4);
            return (
              <div key={s.id} className="card flex flex-col p-7">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <ServiceIcon name={s.icon} size={26} />
                  </div>
                  <h2 className="text-xl font-semibold">{s.title}</h2>
                </div>
                <p className="mt-4 text-slate-600">{s.summary}</p>
                {features.length > 0 && (
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                        <ChevronRight size={15} className="mt-0.5 shrink-0 text-accent-600" /> {f}
                      </li>
                    ))}
                  </ul>
                )}
                <Link href={`/hizmetler/${s.slug}`} className="btn-outline btn-sm mt-6 self-start">
                  Detaylı bilgi <ArrowRight size={15} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
