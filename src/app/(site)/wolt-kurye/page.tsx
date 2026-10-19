import type { Metadata } from "next";
import { Bike, Clock, HandCoins, BadgeCheck, Zap, MessageCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { CourierForm } from "@/components/CourierForm";
import { site } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Wolt Kurye Başvurusu — Fleet Delivery (Priştine Resmi Wolt Acentesi)",
  description:
    "Priştine'de Wolt kuryesi olun. Fleet Delivery, resmi Wolt acentesi olarak kurye alımı yapıyor: esnek çalışma, düzenli kazanç, hızlı başvuru. Hemen başvur.",
  alternates: { canonical: "/wolt-kurye" },
};

const BENEFITS = [
  { icon: Clock, title: "Esnek çalışma", desc: "Kendi saatlerini sen belirle; tam veya yarı zamanlı çalış." },
  { icon: HandCoins, title: "Düzenli kazanç", desc: "Şeffaf ve zamanında ödeme; çalıştıkça kazan." },
  { icon: BadgeCheck, title: "Resmi acente desteği", desc: "Tüm kayıt, evrak ve başvuru işlemleri bizden." },
  { icon: Zap, title: "Hızlı başvuru", desc: "Kısa sürede onaylan, hemen sahaya çık." },
];

const STEPS = [
  { n: "1", title: "Başvur", desc: "Aşağıdaki formu doldur veya WhatsApp'tan yaz." },
  { n: "2", title: "Görüşme & kayıt", desc: "Seninle iletişime geçip kayıt ve evrak işlemlerini biz hallederiz." },
  { n: "3", title: "Ekipman & eğitim", desc: "Kısa bir bilgilendirmeyle her şeyi anlatırız." },
  { n: "4", title: "Kazanmaya başla", desc: "Onay sonrası sahaya çık, teslimat yaptıkça kazan." },
];

const waHref = `https://wa.me/${site.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Merhaba, Fleet Delivery - Wolt kurye başvurusu yapmak istiyorum.")}`;

export default function WoltKuryePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#00c2e8] to-[#008fcf] text-white">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="container-site grid items-center gap-12 py-16 md:py-20 lg:grid-cols-2">
          <div>
            <div className="inline-flex rounded-2xl bg-white p-3.5 shadow-xl ring-1 ring-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fleet-delivery-logo.png" alt="Fleet Delivery — Wolt Resmi Acentesi" width={120} height={124} className="h-24 w-auto" />
            </div>
            <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/90">
              <Bike size={15} /> Priştine · Resmi Wolt Acentesi
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
              Priştine&apos;de Wolt kuryesi ol, kazanmaya hemen başla
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/90">
              <span className="font-semibold">Fleet Delivery</span>, Priştine&apos;nin resmi Wolt
              acentesidir. Kurye alımını biz yürütüyoruz; başvurudan kayıt, evrak ve ekipmana kadar
              tüm süreçte yanındayız.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#basvuru" className="btn bg-white font-semibold text-slate-900 hover:bg-white/90">
                Hemen Başvur <ArrowRight size={16} />
              </a>
              <a href={waHref} target="_blank" rel="noreferrer" className="btn border border-white/50 text-white hover:bg-white/10">
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/20">
                  <b.icon size={22} />
                </div>
                <h3 className="mt-4 font-semibold">{b.title}</h3>
                <p className="mt-1 text-sm text-white/85">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section className="container-site py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Nasıl başlıyorum?</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">4 adımda sahadasın</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00c2e8]/10 text-lg font-bold text-[#0092cf]">
                {s.n}
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kimler başvurabilir */}
      <section className="border-y bg-slate-50">
        <div className="container-site grid gap-10 py-16 md:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Kimler başvurabilir?</h2>
            <ul className="mt-6 space-y-3 text-slate-600">
              {[
                "18 yaşını doldurmuş herkes",
                "Motosiklet, bisiklet, araba veya scooter ile çalışabilen",
                "Priştine ve çevresinde yaşayan",
                "Esnek saatlerle ek ya da tam zamanlı kazanmak isteyen",
                "Tam zamanlı iş arayan veya öğrenciyken kazanmak isteyen",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#0092cf]" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-[#00c2e8] to-[#008fcf] p-8 text-white">
            <h3 className="text-xl font-semibold">Resmi acente güvencesi</h3>
            <p className="mt-3 text-white/90">
              Fleet Delivery olarak tüm kayıt, evrak ve başvuru sürecini senin adına yönetiyoruz.
              Kafana takılan her soruyu yanıtlıyor, işe başlamanı hızlandırıyoruz.
            </p>
            <a href={waHref} target="_blank" rel="noreferrer" className="btn mt-6 bg-white font-semibold text-slate-900 hover:bg-white/90">
              <MessageCircle size={16} /> WhatsApp&apos;tan sor
            </a>
          </div>
        </div>
      </section>

      {/* Başvuru formu */}
      <section id="basvuru" className="scroll-mt-24 container-site py-16 md:py-20">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Kurye Başvuru Formu</h2>
            <p className="mt-3 text-slate-600">
              Bilgilerini doldur, başvurunu alıp en kısa sürede sana dönelim.
            </p>
          </div>
          <CourierForm />
        </div>
      </section>
    </>
  );
}
