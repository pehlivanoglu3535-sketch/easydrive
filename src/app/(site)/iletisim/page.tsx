import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { site } from "@/lib/site-config";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "İletişim",
  description: `${site.name} ile iletişime geçin — ücretsiz ön görüşme için bize yazın.`,
};

export default async function ContactPage({ searchParams }: PageProps<"/iletisim">) {
  const sp = await searchParams;
  const kind = sp?.tur === "teklif" ? "quote" : "contact";
  const defaultService = typeof sp?.hizmet === "string" ? sp.hizmet : "";

  const services = await prisma.service.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    select: { slug: true, title: true },
  });

  const waNumber = site.whatsapp.replace(/[^0-9]/g, "");

  return (
    <>
      <section className="border-b bg-brand-50/60">
        <div className="container-site py-16 md:py-20">
          <span className="eyebrow">İletişim</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            {kind === "quote" ? "Size özel teklif alın" : "Konuşalım"}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            {kind === "quote"
              ? "İhtiyacınızı paylaşın; en kısa sürede size özel, şeffaf bir teklif hazırlayalım."
              : "Sorularınız için formu doldurun veya aşağıdaki kanallardan bize ulaşın. İlk görüşme ücretsiz."}
          </p>
        </div>
      </section>

      <section className="container-site grid gap-10 py-16 md:py-20 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="space-y-5">
            <a href={`tel:${site.phoneHref}`} className="card card-hover flex items-start gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Phone size={20} /></div>
              <div>
                <div className="text-sm text-slate-400">Telefon</div>
                <div className="font-semibold text-slate-900">{site.phone}</div>
              </div>
            </a>
            <a href={`mailto:${site.email}`} className="card card-hover flex items-start gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Mail size={20} /></div>
              <div>
                <div className="text-sm text-slate-400">E-posta</div>
                <div className="font-semibold text-slate-900">{site.email}</div>
              </div>
            </a>
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="card card-hover flex items-start gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><MessageCircle size={20} /></div>
              <div>
                <div className="text-sm text-slate-400">WhatsApp</div>
                <div className="font-semibold text-slate-900">{site.whatsapp}</div>
              </div>
            </a>
            <div className="card flex items-start gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><MapPin size={20} /></div>
              <div>
                <div className="text-sm text-slate-400">Adres</div>
                <div className="font-medium text-slate-900">{site.address}</div>
              </div>
            </div>
            <div className="card flex items-start gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Clock size={20} /></div>
              <div>
                <div className="text-sm text-slate-400">Çalışma saatleri</div>
                <div className="font-medium text-slate-900">{site.workingHours}</div>
              </div>
            </div>
          </div>

          <div className="card mt-5 overflow-hidden">
            <iframe
              title="Konum"
              className="h-56 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`}
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <ContactForm services={services} defaultKind={kind} defaultService={defaultService} />
        </div>
      </section>
    </>
  );
}
