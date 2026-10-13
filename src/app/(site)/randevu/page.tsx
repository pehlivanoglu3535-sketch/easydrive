import type { Metadata } from "next";
import { CalendarCheck, Clock, Video, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAvailableSlots } from "@/lib/appointments";
import { AppointmentForm } from "@/components/AppointmentForm";
import { site } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Randevu Al",
  description: "Uzman danışmanlarımızla ücretsiz ön görüşme için online randevu oluşturun.",
};

const INFO = [
  { icon: Clock, title: "45 dakika", desc: "İhtiyacınızı anlamak için ayrılan süre" },
  { icon: Video, title: "Yüz yüze veya online", desc: "Ofiste ya da görüntülü görüşme" },
  { icon: ShieldCheck, title: "Taahhütsüz", desc: "İlk görüşme tamamen ücretsiz" },
];

export default async function AppointmentPage({ searchParams }: PageProps<"/randevu">) {
  const sp = await searchParams;
  const defaultService = typeof sp?.hizmet === "string" ? sp.hizmet : "";

  const [days, services] = await Promise.all([
    getAvailableSlots(),
    prisma.service.findMany({ where: { published: true }, orderBy: { order: "asc" }, select: { slug: true, title: true } }),
  ]);

  return (
    <>
      <section className="border-b bg-brand-50/60">
        <div className="container-site py-16 md:py-20">
          <span className="eyebrow"><CalendarCheck size={15} /> Randevu</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Ücretsiz ön görüşme planlayın</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Size uygun bir gün ve saat seçin; uzman danışmanlarımız sizinle iletişime geçsin.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {INFO.map((i) => (
              <div key={i.title} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-700 shadow-sm"><i.icon size={20} /></div>
                <div>
                  <div className="font-semibold text-slate-900">{i.title}</div>
                  <div className="text-sm text-slate-500">{i.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-site grid gap-10 py-16 md:py-20 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AppointmentForm days={days} services={services} defaultService={defaultService} />
        </div>
        <aside className="lg:col-span-2">
          <div className="card p-6">
            <h3 className="font-semibold">Nasıl işliyor?</h3>
            <ol className="mt-4 space-y-4">
              {[
                "Size uygun gün ve saati seçin.",
                "İletişim bilgilerinizi bırakın.",
                "Randevunuzu onaylayıp detayları e-posta ile paylaşalım.",
              ].map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
                  <span className="text-sm text-slate-600">{t}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
              Telefonla da randevu oluşturabilirsiniz:{" "}
              <a href={`tel:${site.phoneHref}`} className="font-semibold text-brand-700">{site.phone}</a>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
