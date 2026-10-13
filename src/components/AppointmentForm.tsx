"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle, CalendarCheck } from "lucide-react";
import { bookAppointmentAction, type AppointmentState } from "@/lib/actions/appointment";
import type { SlotDay } from "@/lib/appointments";
import { cn } from "@/lib/utils";

type ServiceOpt = { slug: string; title: string };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className="btn-accent w-full">
      {pending ? "Gönderiliyor…" : (<><CalendarCheck size={16} /> Randevuyu Oluştur</>)}
    </button>
  );
}

export function AppointmentForm({
  days,
  services,
  defaultService = "",
}: {
  days: SlotDay[];
  services: ServiceOpt[];
  defaultService?: string;
}) {
  const [state, action] = useActionState<AppointmentState, FormData>(bookAppointmentAction, undefined);
  const [dayIndex, setDayIndex] = useState(0);
  const [slot, setSlot] = useState("");

  if (state?.ok) {
    return (
      <div className="card flex flex-col items-center p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={30} />
        </div>
        <h3 className="mt-5 text-xl font-semibold">Randevu talebiniz alındı!</h3>
        <p className="mt-2 max-w-sm text-slate-500">
          Seçtiğiniz saati onayladıktan sonra size e-posta ile dönüş yapacağız. Teşekkürler!
        </p>
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="card p-8 text-center text-slate-500">
        Şu an uygun randevu saati bulunmuyor. Lütfen iletişim sayfasından bize ulaşın.
      </div>
    );
  }

  const activeDay = days[Math.min(dayIndex, days.length - 1)];

  return (
    <form action={action} className="card space-y-6 p-6 sm:p-7">
      <input type="hidden" name="slot" value={slot} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {state?.error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> {state.error}
        </div>
      )}

      {/* Gün seçimi */}
      <div>
        <span className="label">1. Gün seçin</span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d, i) => (
            <button
              key={d.date}
              type="button"
              onClick={() => { setDayIndex(i); setSlot(""); }}
              className={cn(
                "shrink-0 rounded-lg border px-3.5 py-2 text-sm font-medium transition",
                i === dayIndex ? "border-brand-600 bg-brand-50 text-brand-700" : "bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Saat seçimi */}
      <div>
        <span className="label">2. Saat seçin</span>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {activeDay.slots.map((s) => (
            <button
              key={s.iso}
              type="button"
              onClick={() => setSlot(s.iso)}
              className={cn(
                "rounded-lg border py-2.5 text-sm font-medium transition",
                slot === s.iso ? "border-accent bg-accent text-white" : "bg-white text-slate-700 hover:border-slate-300"
              )}
            >
              {s.time}
            </button>
          ))}
        </div>
      </div>

      {/* Bilgiler */}
      <div className="space-y-4 border-t pt-5">
        <span className="label">3. Bilgileriniz</span>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="ap-name">Ad Soyad *</label>
            <input id="ap-name" name="name" required className="input" placeholder="Adınız Soyadınız" />
          </div>
          <div>
            <label className="label" htmlFor="ap-email">E-posta *</label>
            <input id="ap-email" name="email" type="email" required className="input" placeholder="ornek@firma.com" />
          </div>
          <div>
            <label className="label" htmlFor="ap-phone">Telefon</label>
            <input id="ap-phone" name="phone" className="input" placeholder="+90 5xx xxx xx xx" />
          </div>
          {services.length > 0 && (
            <div>
              <label className="label" htmlFor="ap-service">Hizmet</label>
              <select id="ap-service" name="serviceSlug" defaultValue={defaultService} className="input">
                <option value="">Genel görüşme</option>
                {services.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div>
          <label className="label" htmlFor="ap-note">Not</label>
          <textarea id="ap-note" name="note" rows={3} className="input resize-y" placeholder="Görüşmek istediğiniz konu hakkında kısa bir not (opsiyonel)" />
        </div>
      </div>

      <SubmitButton disabled={!slot} />
      {!slot && <p className="text-center text-xs text-slate-400">Devam etmek için bir gün ve saat seçin.</p>}
    </form>
  );
}
