"use client";

import { useRef, useState } from "react";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";

const VEHICLES = ["Motosiklet", "Bisiklet", "Araba", "Elektrikli scooter", "Aracım yok"];
const LICENSE = ["Evet", "Hayır"];

export function CourierForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch("/api/kurye", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setDone(true);
        formRef.current?.reset();
      } else {
        setError(data.error || "Başvuru gönderilemedi. Lütfen tekrar deneyin.");
      }
    } catch {
      setError("Bağlantı hatası. İnternetinizi kontrol edip tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="card flex flex-col items-center p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={30} />
        </div>
        <h3 className="mt-5 text-xl font-semibold">Başvurun alındı!</h3>
        <p className="mt-2 max-w-md text-slate-500">
          Ekibimiz en kısa sürede seninle iletişime geçecek. Teşekkürler!
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="card space-y-4 p-6 sm:p-7">
      {/* bal küpü */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Ad Soyad *</label>
          <input id="name" name="name" required className="input" placeholder="Adın Soyadın" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Telefon *</label>
          <input id="phone" name="phone" required className="input" placeholder="+383 / +90 ..." />
        </div>
        <div>
          <label className="label" htmlFor="city">Şehir</label>
          <input id="city" name="city" className="input" placeholder="Priştine, Prizren ..." defaultValue="Priştine" />
        </div>
        <div>
          <label className="label" htmlFor="age">Yaş</label>
          <input id="age" name="age" inputMode="numeric" className="input" placeholder="Örn. 24" />
        </div>
        <div>
          <label className="label" htmlFor="vehicle">Aracın</label>
          <select id="vehicle" name="vehicle" className="input" defaultValue="">
            <option value="">Seçiniz</option>
            {VEHICLES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="drivingLicense">Ehliyetin var mı?</label>
          <select id="drivingLicense" name="drivingLicense" className="input" defaultValue="">
            <option value="">Seçiniz</option>
            {LICENSE.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="email">E-posta (opsiyonel)</label>
          <input id="email" name="email" type="email" className="input" placeholder="ornek@mail.com" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="notes">Eklemek istedikleriniz</label>
          <textarea id="notes" name="notes" rows={3} className="input resize-y" placeholder="Deneyim, müsait olduğun saatler veya soruların." />
        </div>
      </div>

      <button type="submit" disabled={pending} className="btn-accent w-full">
        {pending ? "Gönderiliyor…" : (<><Send size={16} /> Başvuruyu Gönder</>)}
      </button>
      <p className="text-center text-xs text-slate-400">
        Bilgilerin yalnızca kurye başvurunu değerlendirmek için kullanılır.
      </p>
    </form>
  );
}
