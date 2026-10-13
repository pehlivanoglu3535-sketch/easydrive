import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Target, Eye, Heart, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { site } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: `${site.name} — ${site.foundedYear}'den bu yana kurumlara stratejik danışmanlık.`,
};

const VALUES = [
  { icon: Target, title: "Misyonumuz", desc: "Kurumların doğru kararlar almasını sağlayan, uygulanabilir ve ölçülebilir danışmanlık sunmak." },
  { icon: Eye, title: "Vizyonumuz", desc: "Türkiye'de ve bölgede, çok disiplinli danışmanlıkta ilk akla gelen güvenilir marka olmak." },
  { icon: Heart, title: "Değerlerimiz", desc: "Dürüstlük, gizlilik, uzmanlık ve müşterimizin başarısını kendi başarımız sayma anlayışı." },
];

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default async function AboutPage() {
  const team = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <section className="border-b bg-brand-50/60">
        <div className="container-site py-16 md:py-20">
          <span className="eyebrow">Hakkımızda</span>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            {site.foundedYear}&apos;den bu yana kurumların yanında
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            {site.shortName} Danışmanlık; iş & yönetim, finans, hukuk ve teknoloji alanlarında
            uzmanlaşmış kadrosuyla, farklı ölçeklerdeki kurumlara uçtan uca danışmanlık sunar.
            İşinizi büyütürken yanınızda olan, çözüm üreten bir ortak olmayı hedefliyoruz.
          </p>
        </div>
      </section>

      {/* Hikaye + istatistik */}
      <section className="container-site grid gap-12 py-16 md:py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Biz kimiz?</h2>
          <div className="prose-site mt-5">
            <p>
              Küçük bir uzman ekiple yola çıktık; bugün yüzlerce kuruma hizmet veren,
              çok disiplinli bir danışmanlık şirketiyiz. Başarımızın sırrı basit: her müşteriyi
              dinleriz, gerçek sorunu anlarız ve hazır reçeteler yerine o kuruma özel çözümler üretiriz.
            </p>
            <p>
              Mali müşavirlikten yurt dışı açılıma, süreç yönetiminden dijital dönüşüme kadar
              geniş bir yelpazede; tek bir muhatapla, bütüncül bir yaklaşımla çalışmanın
              rahatlığını sunuyoruz.
            </p>
          </div>
          <Link href="/iletisim" className="btn-primary mt-7">Bizimle çalışın <ArrowRight size={16} /></Link>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {[["13+", "yıllık tecrübe"], ["450+", "proje"], ["200+", "kurumsal müşteri"], ["20+", "uzman danışman"]].map(([v, l]) => (
            <div key={l} className="card flex flex-col items-center justify-center p-8 text-center">
              <div className="text-4xl font-bold text-brand-700">{v}</div>
              <div className="mt-2 text-sm text-slate-500">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Değerler */}
      <section className="border-y bg-slate-50">
        <div className="container-site py-16 md:py-20">
          <div className="grid gap-6 md:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="card p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                  <v.icon size={24} />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-slate-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ekip */}
      {team.length > 0 && (
        <section className="container-site py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Ekibimiz</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Uzman kadromuz</h2>
            <p className="mt-4 text-slate-600">Alanında deneyimli danışmanlardan oluşan ekibimizle tanışın.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <div key={m.id} className="card flex flex-col items-center p-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white">
                  {initials(m.name)}
                </div>
                <h3 className="mt-4 font-semibold">{m.name}</h3>
                <p className="text-sm text-accent-600">{m.title}</p>
                {m.bio && <p className="mt-2 text-sm leading-relaxed text-slate-500">{m.bio}</p>}
                {m.email && (
                  <a href={`mailto:${m.email}`} className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand-700">
                    <Mail size={14} /> E-posta
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
