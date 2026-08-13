"use client";

import { useActionState } from "react";
import { AlertCircle, Camera } from "lucide-react";
import { saveInspectionAction } from "@/lib/actions/handover";
import { SignaturePad } from "@/components/SignaturePad";
import type { PanelDict } from "@/lib/i18n/panel-dict";

const FUEL = ["Dolu", "3/4", "1/2", "1/4", "Rezerv"];

export function HandoverForm({
  reservationId,
  kind,
  defaultMileage,
  labels,
}: {
  reservationId: string;
  kind: "PICKUP" | "RETURN";
  defaultMileage: number;
  labels: PanelDict["handover"];
}) {
  const [state, action, pending] = useActionState(saveInspectionAction, undefined);
  const h = labels;
  const PHOTOS = [
    { name: "photoFront", label: h.front },
    { name: "photoBack", label: h.back },
    { name: "photoLeft", label: h.left },
    { name: "photoRight", label: h.right },
    { name: "photoInteriorFront", label: h.intFront },
    { name: "photoInteriorBack", label: h.intBack },
  ];

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="reservationId" value={reservationId} />

      {state?.error && <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-red-600/10"><AlertCircle size={16} /> {state.error}</div>}

      {/* Fotoğraflar */}
      <div className="card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400"><Camera size={15} /> {h.photos}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {PHOTOS.map((p) => (
            <label key={p.name} className="flex cursor-pointer flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">{p.label}</span>
              <div className="flex aspect-[4/3] items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-[var(--brand-600)] hover:text-[var(--brand-600)]">
                <Camera size={26} />
              </div>
              <input type="file" name={p.name} accept="image/*" capture="environment" className="hidden" />
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">{h.photoHint}</p>
      </div>

      {/* Km + yakıt + hasar */}
      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">{h.statusInfo}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">{h.mileage}</label>
            <input name="mileage" type="number" min={0} className="input" defaultValue={defaultMileage || ""} />
          </div>
          <div>
            <label className="label">{h.fuel}</label>
            <select name="fuelLevel" className="input" defaultValue="Dolu">
              {FUEL.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">{h.damageNote}</label>
            <input name="damageNote" className="input" placeholder={h.damageHint} />
          </div>
        </div>
      </div>

      {/* İmza */}
      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{h.signature}</h2>
        <SignaturePad name="signature" hint={h.signHint} done={h.signed} clear={h.clear} />
      </div>

      <div>
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending}>
          {pending ? "…" : kind === "PICKUP" ? h.completePickup : h.completeReturn}
        </button>
      </div>
    </form>
  );
}
