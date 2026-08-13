import Link from "next/link";
import {
  Car, Cloud, Globe, CalendarCheck, Palette, Euro, ShieldCheck,
  ArrowRight, Check, LayoutDashboard, Users, FileText,
} from "lucide-react";

const FEATURES = [
  { icon: Cloud, title: "Bulut Tabanlı", desc: "Kurulum yok. Tarayıcıdan anında erişim, otomatik güncellemeler." },
  { icon: Globe, title: "4 Dil Desteği", desc: "Arnavutça, İngilizce, Sırpça ve Türkçe — Kosova pazarına hazır." },
  { icon: Car, title: "Filo Yönetimi", desc: "Araçlar, müsaitlik, fiyatlandırma ve bakım tek panelde." },
  { icon: CalendarCheck, title: "Rezervasyon & Sözleşme", desc: "Online rezervasyon, onay akışı ve dijital kira sözleşmeleri." },
  { icon: Palette, title: "Markalı Web Sitesi", desc: "Her firmaya kendi logo ve renkleriyle rezervasyon sitesi." },
  { icon: Euro, title: "Euro & Yerel", desc: "€ fiyatlandırma, Kosova şehirleri ve havalimanı lokasyonları." },
];

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="EasyDrive" className="h-9 w-9 object-contain" />
            <span className="text-lg font-semibold tracking-tight">EasyDrive</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="hover:text-slate-900">Özellikler</a>
            <a href="#how" className="hover:text-slate-900">Nasıl Çalışır</a>
            <a href="#demo" className="hover:text-slate-900">Demo</a>
          </nav>
          <Link href="/login" className="btn-primary btn-sm">Giriş Yap <ArrowRight size={15} /></Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/70 to-white" />
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                <ShieldCheck size={14} /> Kosova için Rent a Car Yazılımı
              </span>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
                Araç kiralama işinizi tek platformdan yönetin
              </h1>
              <p className="mt-5 max-w-lg text-lg text-slate-600">
                Filo, rezervasyon, kira sözleşmesi ve markalı web siteniz bir arada. Bulut tabanlı, çok dilli ve Euro uyumlu.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className="btn-accent">Hemen Başla <ArrowRight size={16} /></Link>
                <a href="#demo" className="btn-outline">Canlı Demoyu Gör</a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                {["Kurulum ücreti yok", "Dakikalar içinde kurulum", "Kesintisiz destek"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5"><Check size={15} className="text-emerald-600" /> {t}</span>
                ))}
              </div>
            </div>

            {/* Ürün mock */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border bg-white shadow-2xl shadow-blue-100">
                <div className="flex items-center gap-1.5 border-b bg-slate-50 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex">
                  <div className="hidden w-40 shrink-0 flex-col gap-1 border-r bg-white p-3 sm:flex">
                    {[LayoutDashboard, CalendarCheck, Car, Users].map((Icon, i) => (
                      <div key={i} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${i === 0 ? "bg-blue-50 text-blue-700" : "text-slate-500"}`}>
                        <Icon size={14} /> <span className="h-2 w-14 rounded bg-current opacity-30" />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 space-y-3 bg-slate-50/50 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[["Müsait Araç", "12/14", "text-blue-600"], ["Ciro", "8.450 €", "text-emerald-600"]].map(([l, v, c]) => (
                        <div key={l} className="rounded-lg border bg-white p-3">
                          <div className="text-[10px] text-slate-400">{l}</div>
                          <div className={`text-lg font-semibold ${c}`}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border bg-white p-3">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-9 rounded bg-slate-100" />
                            <div className="h-2 w-16 rounded bg-slate-200" />
                          </div>
                          <div className="h-4 w-14 rounded-full bg-emerald-100" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-slate-50">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 py-10 text-center sm:grid-cols-4">
          {[["4", "Dil"], ["€", "Euro uyumlu"], ["∞", "Firma / Filo"], ["7/24", "Erişim"]].map(([v, l]) => (
            <div key={l}>
              <div className="text-3xl font-semibold tracking-tight text-blue-600">{v}</div>
              <div className="mt-1 text-sm text-slate-500">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">İhtiyacınız olan her şey</h2>
          <p className="mt-3 text-slate-600">Uluslararası markalar gibi yönetin — pratik, hızlı, ölçeklenebilir.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card card-hover p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Icon size={22} /></div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Üç adımda yayında</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: FileText, step: "1", title: "Firmanızı kaydedin", desc: "Logo, renk ve lokasyonlarınızı girin — dakikalar içinde hazır." },
              { icon: Car, step: "2", title: "Filonuzu ekleyin", desc: "Araçları, fiyatları ve müsaitliği tek panelden yönetin." },
              { icon: Globe, step: "3", title: "Rezervasyon alın", desc: "Markalı, çok dilli sitenizden online rezervasyonlar gelsin." },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white"><Icon size={22} /></div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600">ADIM {s.step}</span>
                  </div>
                  <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-semibold tracking-tight">Canlı demoyu inceleyin</h2>
          <p className="mx-auto mt-3 max-w-xl text-blue-100">Örnek firmaların markalı müşteri sitelerini keşfedin.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/s/prishtina" className="btn bg-white text-blue-700 hover:bg-blue-50">Prishtina Rent a Car</Link>
            <Link href="/login" className="btn border border-white/40 text-white hover:bg-white/10">Yönetim Paneli</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row md:px-6">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="EasyDrive" className="h-7 w-7 object-contain" />
            <span className="font-semibold text-slate-700">EasyDrive</span>
          </div>
          <span>© {new Date().getFullYear()} EasyDrive — Kosova Araç Kiralama Platformu</span>
        </div>
      </footer>
    </div>
  );
}
