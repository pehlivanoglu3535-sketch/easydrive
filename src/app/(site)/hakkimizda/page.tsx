import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Target, Eye, Heart, ArrowRight } from "lucide-react";
import { site } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: `${site.name} — ${site.foundedYear}'den bu yana Kosova'da şirket kuruluşu, oturum ve yatırım danışmanlığı.`,
};

const VALUES = [
  { icon: Target, title: "Misyonumuz", desc: "Kosova'da iş kurmak ve yaşamak isteyenlerin yolunu açmak; süreçleri sade, hızlı ve güvenilir kılmak." },
  { icon: Eye, title: "Vizyonumuz", desc: "Kosova'da yabancı girişimciler için ilk akla gelen, en güvenilir danışmanlık markası olmak." },
  { icon: Heart, title: "Değerlerimiz", desc: "Dürüstlük, gizlilik, yerel uzmanlık ve müşterimizin başarısını kendi başarımız sayma anlayışı." },
];

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function AboutPage() {
  return (
    <>
      <section className="border-b bg-brand-50/60">
        <div className="container-site py-16 md:py-20">
          <span className="eyebrow">Hakkımızda</span>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            {site.foundedYear}&apos;den bu yana Kosova&apos;da yanınızdayız
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            {site.name}; Kosova&apos;da şirket kuruluşu, oturum ve çalışma izni, muhasebe ve yatırım
            danışmanlığı alanlarında uzmanlaşmış bir ekiptir. Yabancı girişimci ve yatırımcıların
            Kosova&apos;daki tüm süreçlerini uçtan uca, tek muhatapla yönetiyoruz.
          </p>
        </div>
      </section>

      {/* Hikaye + istatistik */}
      <section className="container-site grid gap-12 py-16 md:py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Biz kimiz?</h2>
          <div className="prose-site mt-5">
            <p>
              Kosova&apos;nın iş dünyasına ve mevzuatına dair saha tecrübesiyle yola çıktık.
              Bugün yüzlerce yabancı girişimciye hizmet vermiş; 600&apos;den fazla şirketin
              kuruluşuna ve 820&apos;den fazla oturum başvurusuna liderlik etmiş bir ekibiz.
            </p>
            <p>
              Başarımızın sırrı basit: her müşteriyi dinler, gerçek ihtiyacı anlar ve süreci
              baştan sona biz yönetiriz. Kosova&apos;da bulunmanıza gerek kalmadan, vekaletle
              birçok işlemi sizin adınıza tamamlayabiliriz.
            </p>
          </div>
          <Link href="/iletisim" className="btn-primary mt-7">Bizimle çalışın <ArrowRight size={16} /></Link>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {site.stats.map((s) => (
            <div key={s.label} className="card flex flex-col items-center justify-center p-8 text-center">
              <div className="text-4xl font-bold text-brand-700">{s.value}</div>
              <div className="mt-2 text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Kurucu */}
      <section className="border-y bg-slate-50">
        <div className="container-site py-16 md:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="card flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-brand-600 text-3xl font-bold text-white">
                {initials(site.owner.name)}
              </div>
              <div>
                <span className="eyebrow">Kurucu</span>
                <h3 className="mt-1 text-2xl font-bold">{site.owner.name}</h3>
                <p className="text-accent-600">{site.owner.title}</p>
                <p className="mt-3 text-slate-600">{site.owner.bio}</p>
                <a href={`mailto:${site.email}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
                  <Mail size={15} /> {site.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Değerler */}
      <section className="container-site py-16 md:py-20">
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
      </section>
    </>
  );
}
