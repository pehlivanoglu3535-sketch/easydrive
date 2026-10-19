"use client";

import { useRef, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Send,
  Building2,
  User,
  FileText,
  Landmark,
} from "lucide-react";

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,image/*,application/pdf";

export function ApplicationForm({ serviceSlug = "sirket-kurulusu" }: { serviceSlug?: string }) {
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
      const res = await fetch("/api/basvuru", { method: "POST", body: fd });
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
        <h3 className="mt-5 text-xl font-semibold">Başvurunuz alındı!</h3>
        <p className="mt-2 max-w-md text-slate-500">
          Belgeleriniz ve bilgileriniz bize ulaştı. Ekibimiz en kısa sürede (genellikle 1 iş günü
          içinde) sizinle iletişime geçecek. Teşekkür ederiz.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="card space-y-7 p-6 sm:p-8">
      <input type="hidden" name="serviceSlug" value={serviceSlug} />
      {/* bal küpü */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* Başvuran */}
      <fieldset className="space-y-4">
        <legend className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <User size={16} className="text-brand-600" /> Başvuran bilgileri
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="applicantName">Ad Soyad *</label>
            <input id="applicantName" name="applicantName" required className="input" placeholder="Adınız Soyadınız" />
          </div>
          <div>
            <label className="label" htmlFor="applicantPhone">Telefon</label>
            <input id="applicantPhone" name="applicantPhone" className="input" placeholder="+90 / +383 ..." />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="applicantEmail">E-posta *</label>
            <input id="applicantEmail" name="applicantEmail" type="email" required className="input" placeholder="ornek@mail.com" />
          </div>
        </div>
      </fieldset>

      {/* Şirket bilgileri */}
      <fieldset className="space-y-4 border-t pt-6">
        <legend className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Building2 size={16} className="text-brand-600" /> Şirket bilgileri
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="companyName">Şirket ismi</label>
            <input id="companyName" name="companyName" className="input" placeholder="Kurulacak şirketin adı" />
          </div>
          <div>
            <label className="label" htmlFor="companyEmail">Şirket maili</label>
            <input id="companyEmail" name="companyEmail" type="email" className="input" placeholder="info@sirket.com" />
          </div>
          <div>
            <label className="label" htmlFor="capital">Şirket sermayesi</label>
            <input id="capital" name="capital" className="input" placeholder="Örn. 1.000 €" />
          </div>
          <div>
            <label className="label" htmlFor="directorName">Şirket müdürü kim olacak?</label>
            <input id="directorName" name="directorName" className="input" placeholder="Müdür ad soyad" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="companyAddress">Şirket adresi</label>
            <input id="companyAddress" name="companyAddress" className="input" placeholder="Kosova'daki şirket adresi" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="naceCodes">NACE kodları (faaliyet alanları)</label>
            <textarea id="naceCodes" name="naceCodes" rows={3} className="input resize-y" placeholder="İstediğiniz kadar faaliyet alanı yazabilirsiniz (her birini ayrı satıra yazın)." />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="partnerAddress">Şirket ortağının Türkiye açık adresi</label>
            <textarea id="partnerAddress" name="partnerAddress" rows={2} className="input resize-y" placeholder="Ortağın Türkiye'deki açık ikamet adresi" />
          </div>
        </div>
      </fieldset>

      {/* Belgeler */}
      <fieldset className="space-y-4 border-t pt-6">
        <legend className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <FileText size={16} className="text-brand-600" /> Belgeler
        </legend>
        <p className="text-xs text-slate-400">PDF, JPG, PNG veya WEBP · her dosya en fazla 8 MB.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="passport">Pasaport resimli sayfa fotokopisi (net görüntü) *</label>
            <input id="passport" name="passport" type="file" accept={ACCEPT} required className="file-input" />
          </div>
          <div>
            <label className="label" htmlFor="criminalRecord">Sabıka kaydı</label>
            <input id="criminalRecord" name="criminalRecord" type="file" accept={ACCEPT} className="file-input" />
          </div>
          <div>
            <label className="label" htmlFor="utilityBill">Ev adresine ait fatura</label>
            <input id="utilityBill" name="utilityBill" type="file" accept={ACCEPT} className="file-input" />
          </div>
        </div>
      </fieldset>

      {/* Banka adımı bilgisi */}
      <div className="flex items-start gap-3 rounded-xl bg-brand-50/70 p-4 text-sm text-slate-600">
        <Landmark size={18} className="mt-0.5 shrink-0 text-brand-600" />
        <p>
          <span className="font-medium text-slate-800">Banka hesabı adımı:</span> Oturum ve çalışma
          kartı süreci için birlikte banka hesabı açıyoruz, hesaba 1.500 € yatırılıyor ve ardından
          hesap ekstresi alınıyor. Bu adımı başvurunuzu aldıktan sonra sizinle birlikte planlıyoruz.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="notes">Eklemek istedikleriniz</label>
        <textarea id="notes" name="notes" rows={3} className="input resize-y" placeholder="Varsa notlarınız, özel talepleriniz veya sorularınız." />
      </div>

      <button type="submit" disabled={pending} className="btn-accent w-full">
        {pending ? "Gönderiliyor…" : (<><Send size={16} /> Başvuruyu Gönder</>)}
      </button>
      <p className="text-center text-xs text-slate-400">
        Belgeleriniz güvenli şekilde saklanır ve yalnızca başvurunuzu değerlendirmek için kullanılır.
      </p>
    </form>
  );
}
