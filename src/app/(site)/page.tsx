import Link from "next/link";
import {
  ArrowRight, Check, CheckCircle2, Quote, Target, Lightbulb,
  TrendingUp, ShieldCheck, Users, ChevronRight,
} from "lucide-react";
import { getDb } from "@/lib/db";
import { ServiceIcon } from "@/components/ServiceIcon";
import { site } from "@/lib/site-config";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TRUST = [
  "İlk görüşme ücretsiz",
  "Uçtan uca takip",
  "Kosova'da yerel uzmanlık",
];

const APPROACH = [
  { icon: Target, title: "Hedef odaklı", desc: "Her projeye ölçülebilir hedefler ve net bir yol haritasıyla başlıyoruz." },
  { icon: Lightbulb, title: "Veriye dayalı", desc: "Kararlarımızı sezgiyle değil, analiz ve gerçek verilerle alıyoruz." },
  { icon: ShieldCheck, title: "Güvenilir", desc: "Gizlilik, şeffaflık ve mevzuata tam uyum çalışma biçimimizin temeli." },
  { icon: Users, title: "Uçtan uca", desc: "Strateji aşamasından uygulamaya kadar yanınızda olan bir ekip." },
];

const STEPS = [
  { n: "01", title: "Keşif & Analiz", desc: "İhtiyaçlarınızı dinler, mevcut durumu ve fırsatları analiz ederiz." },
  { n: "02", title: "Strateji & Plan", desc: "Size özel, uygulanabilir bir yol haritası ve aksiyon planı hazırlarız." },
  { n: "03", title: "Uygulama", desc: "Planı adım adım, ekibinizle birlikte hayata geçiririz." },
  { n: "04", title: "Takip & İyileştirme", desc: "Sonuçları ölçer, düzenli raporlarla sürekli iyileştirme sağlarız." },
];

const TESTIMONIALS = [
  { quote: "Türkiye'den gelip Kosova'da şirketimi günler içinde kurdular; her adımda yanımdaydılar.", name: "Okan Demir", role: "Kurucu, Demir Yazılım" },
  { quote: "Oturum sürecimi sıfır stresle tamamladılar. Ben işimi büyütmeye odaklandım.", name: "Ayşe Kılıç", role: "Yatırımcı" },
  { quote: "Muhasebe ve vergi tarafını onlara emanet ettim; artık mevzuat derdim yok.", name: "Mehmet Aras", role: "Aras Lojistik" },
];

export default async function HomePage() {
  const db = getDb();
  const [services, posts] = await Promise.all([
    db.query.service.findMany({ where: (s, { eq }) => eq(s.published, true), orderBy: (s, { asc }) => asc(s.order), limit: 6 }),
    db.query.post.findMany({ where: (p, { eq }) => eq(p.published, true), orderBy: (p, { desc }) => desc(p.publishedAt), limit: 3 }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/80 via-white to-white" />
        <div className="absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-accent-50 blur-3xl" />
        <div className="container-site grid items-center gap-14 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="eyebrow">Kosova • Kurumsal Danışmanlık</span>
            <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              Kosova&apos;da <span className="text-brand-700">şirketinizi</span> kurun, oturumunuzu alın
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Şirket kuruluşundan oturuma, muhasebeden yatırıma kadar; 6 yıllık saha
              tecrübemizle Kosova&apos;da iş yapmanın her adımında yanınızdayız.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/iletisim?tur=teklif" className="btn-accent">
                Ücretsiz Danışma Alın <ArrowRight size={16} />
              </Link>
              <Link href="/hizmetler" className="btn-outline">Hizmetleri Keşfedin</Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              {TRUST.map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Check size={16} className="text-accent-600" /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Görsel kart */}
          <div className="relative">
            <div className="card p-6 shadow-xl shadow-brand-100/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Başarı Panosu</span>
                <span className="badge bg-emerald-50 text-emerald-700 ring-emerald-200">6+ yıl Kosova</span>
              </div>
              <div className="mt-5 flex items-end gap-2.5">
                {[38, 52, 46, 64, 58, 78, 92].map((h, i) => (
                  <div key={i} className="flex-1">
                    <div className="rounded-t-md bg-gradient-to-t from-brand-600 to-brand-700/80" style={{ height: `${h}px` }} />
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[["Kurulan şirket", "600+", "text-brand-700"], ["Alınan oturum", "820+", "text-emerald-600"]].map(([l, v, c]) => (
                  <div key={l} className="rounded-xl border bg-slate-50/60 p-4">
                    <div className="text-xs text-slate-400">{l}</div>
                    <div className={`mt-1 text-xl font-bold ${c}`}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card absolute -bottom-6 -left-6 hidden items-center gap-3 p-4 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">600+ şirket</div>
                <div className="text-xs text-slate-500">başarıyla kuruldu</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hizmetler */}
      <section className="container-site py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Hizmetlerimiz</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Tek çatı altında uzmanlık</h2>
          <p className="mt-4 text-slate-600">
            Farklı alanlarda, kurumunuzun her ihtiyacına yanıt veren bütüncül danışmanlık.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            return (
              <Link key={s.id} href={`/hizmetler/${s.slug}`} className="card card-hover group flex flex-col p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <ServiceIcon name={s.icon} size={24} />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{s.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                  Detaylar <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
          {/* Tüm hizmetler CTA kartı */}
          <Link href="/hizmetler" className="card card-hover group flex flex-col justify-center bg-brand-700 p-6 text-white">
            <h3 className="text-lg font-semibold">Tüm hizmetlerimiz</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-100">
              İhtiyacınıza en uygun çözümü birlikte belirleyelim.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
              Hizmetleri keşfedin <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* Yaklaşım */}
      <section className="border-y bg-slate-50">
        <div className="container-site py-20 md:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="eyebrow">Neden {site.shortName}?</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Kosova&apos;yı ve mevzuatı içeriden bilen bir ekip
              </h2>
              <p className="mt-4 text-slate-600">
                {site.foundedYear} yılından bu yana Kosova&apos;da yabancı girişimci ve yatırımcılarla
                çalışıyoruz. Hazır şablonlar değil; sizin durumunuza uygun, uçtan uca takip edilen
                çözümler üretiyoruz.
              </p>
              <ul className="mt-6 space-y-3">
                {["Yerel mevzuata tam hâkimiyet", "Vekaletle uzaktan işlem imkânı", "Kuruluş sonrası sürekli destek"].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-slate-700">
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-accent-600" /> {t}
                  </li>
                ))}
              </ul>
              <Link href="/hakkimizda" className="btn-primary mt-8">Hakkımızda <ArrowRight size={16} /></Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {APPROACH.map((a) => (
                <div key={a.title} className="card p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                    <a.icon size={22} />
                  </div>
                  <h3 className="mt-4 font-semibold">{a.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Süreç */}
      <section className="container-site py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Nasıl Çalışırız</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Dört adımda sonuç</h2>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="relative">
              <div className="text-4xl font-bold text-brand-100">{s.n}</div>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* İstatistik bandı */}
      <section className="bg-brand-700 text-white">
        <div className="container-site grid grid-cols-2 gap-8 py-14 text-center lg:grid-cols-4">
          {site.stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-bold tracking-tight">{s.value}</div>
              <div className="mt-1.5 text-sm text-brand-100">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Referanslar */}
      <section className="container-site py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Referanslar</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Müşterilerimiz ne diyor?</h2>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="card flex flex-col p-6">
              <Quote size={28} className="text-brand-100" />
              <blockquote className="mt-3 flex-1 text-slate-700">“{t.quote}”</blockquote>
              <figcaption className="mt-5 border-t pt-4">
                <div className="font-semibold text-slate-900">{t.name}</div>
                <div className="text-sm text-slate-500">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Blog */}
      {posts.length > 0 && (
        <section className="border-t bg-slate-50">
          <div className="container-site py-20 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Blog</span>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Güncel içgörüler</h2>
              </div>
              <Link href="/blog" className="btn-outline btn-sm">Tüm yazılar <ArrowRight size={15} /></Link>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {posts.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="card card-hover group flex flex-col overflow-hidden">
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-brand-600 to-brand-700">
                    <span className="px-6 text-center text-lg font-semibold text-white/90">{p.title}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    {p.category && <span className="text-xs font-semibold uppercase tracking-wide text-accent-600">{p.category}</span>}
                    <h3 className="mt-1 font-semibold leading-snug group-hover:text-brand-700">{p.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{p.excerpt}</p>
                    <span className="mt-4 text-xs text-slate-400">{formatDate(p.publishedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-site py-20">
        <div className="relative overflow-hidden rounded-3xl bg-brand-700 px-8 py-16 text-center text-white md:px-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-white/5" />
          <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">Bir sonraki adımı birlikte atalım</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-brand-100">
            İlk görüşme ücretsiz. İhtiyaçlarınızı dinleyelim, size özel bir yol haritası çıkaralım.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/randevu" className="btn-accent">Randevu Al</Link>
            <a href={`tel:${site.phoneHref}`} className="btn border border-white/30 text-white hover:bg-white/10">
              {site.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
