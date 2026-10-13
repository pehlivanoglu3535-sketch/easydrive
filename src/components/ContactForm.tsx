"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";
import { submitContactAction, type ContactState } from "@/lib/actions/contact";

type ServiceOpt = { slug: string; title: string };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-accent w-full">
      {pending ? "Gönderiliyor…" : (<><Send size={16} /> {label}</>)}
    </button>
  );
}

export function ContactForm({
  services,
  defaultKind = "contact",
  defaultService = "",
}: {
  services: ServiceOpt[];
  defaultKind?: "contact" | "quote";
  defaultService?: string;
}) {
  const [state, action] = useActionState<ContactState, FormData>(submitContactAction, undefined);
  const isQuote = defaultKind === "quote";

  if (state?.ok) {
    return (
      <div className="card flex flex-col items-center p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={30} />
        </div>
        <h3 className="mt-5 text-xl font-semibold">Teşekkürler, mesajınız alındı!</h3>
        <p className="mt-2 max-w-sm text-slate-500">
          Ekibimiz en kısa sürede (genellikle 1 iş günü içinde) size geri dönecek.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-4 p-6 sm:p-7">
      <input type="hidden" name="kind" value={defaultKind} />
      {/* bal küpü */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {state?.error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> {state.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Ad Soyad *</label>
          <input id="name" name="name" required className="input" placeholder="Adınız Soyadınız" />
        </div>
        <div>
          <label className="label" htmlFor="company">Firma</label>
          <input id="company" name="company" className="input" placeholder="Firma adı (varsa)" />
        </div>
        <div>
          <label className="label" htmlFor="email">E-posta *</label>
          <input id="email" name="email" type="email" required className="input" placeholder="ornek@firma.com" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Telefon</label>
          <input id="phone" name="phone" className="input" placeholder="+90 5xx xxx xx xx" />
        </div>
      </div>

      {services.length > 0 && (
        <div>
          <label className="label" htmlFor="serviceSlug">İlgilendiğiniz hizmet</label>
          <select id="serviceSlug" name="serviceSlug" defaultValue={defaultService} className="input">
            <option value="">Seçiniz (opsiyonel)</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>{s.title}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="label" htmlFor="subject">Konu</label>
        <input
          id="subject"
          name="subject"
          className="input"
          defaultValue={isQuote ? "Teklif talebi" : ""}
          placeholder={isQuote ? "Teklif talebi" : "Mesajınızın konusu"}
        />
      </div>

      <div>
        <label className="label" htmlFor="message">Mesajınız *</label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="input resize-y"
          placeholder={isQuote ? "İhtiyacınızı ve beklentilerinizi kısaca anlatın; size özel bir teklif hazırlayalım." : "Size nasıl yardımcı olabiliriz?"}
        />
      </div>

      <SubmitButton label={isQuote ? "Teklif İste" : "Mesajı Gönder"} />
      <p className="text-center text-xs text-slate-400">
        Bilgileriniz yalnızca talebinizi yanıtlamak için kullanılır.
      </p>
    </form>
  );
}
