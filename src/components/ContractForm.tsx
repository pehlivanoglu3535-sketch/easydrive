"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { saveContractAction } from "@/lib/actions/contracts";
import type { PanelDict } from "@/lib/i18n/panel-dict";

const FUEL = ["Dolu", "3/4", "1/2", "1/4", "Rezerv"];
const INSURANCE = ["Yok", "Mini Hasar (Muafiyetli)", "Tam Kasko", "Süper Kasko"];

type Defaults = {
  startMileage?: number | null;
  endMileage?: number | null;
  fuelLevelOut?: string | null;
  fuelLevelIn?: string | null;
  depositAmount?: number | null;
  signedAt?: Date | string | null;
  extraDriverName?: string | null;
  extraDriverLicense?: string | null;
  insurancePackage?: string | null;
  insuranceFee?: number | null;
  extras?: string | null;
  extrasFee?: number | null;
  damageNote?: string | null;
  damagePhotoUrl?: string | null;
};

export function ContractForm({ reservationId, defaults = {}, labels, commonLabels }: { reservationId: string; defaults?: Defaults; labels: PanelDict["contractForm"]; commonLabels: PanelDict["common"] }) {
  const [state, action, pending] = useActionState(saveContractAction, undefined);
  const F = labels;

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="reservationId" value={reservationId} />

      {state?.error && <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-red-600/10"><AlertCircle size={16} /> {state.error}</div>}
      {state?.ok && <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700 ring-1 ring-emerald-600/10"><CheckCircle2 size={16} /> {F.savedOk}</div>}

      {/* Teslim / iade */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div><label className="label">{F.startKm}</label><input name="startMileage" type="number" min={0} className="input" defaultValue={defaults.startMileage ?? ""} /></div>
        <div><label className="label">{F.endKm}</label><input name="endMileage" type="number" min={0} className="input" defaultValue={defaults.endMileage ?? ""} /></div>
        <div>
          <label className="label">{F.fuelOut}</label>
          <select name="fuelLevelOut" className="input" defaultValue={defaults.fuelLevelOut ?? ""}><option value="">—</option>{FUEL.map((f) => <option key={f} value={f}>{f}</option>)}</select>
        </div>
        <div>
          <label className="label">{F.fuelIn}</label>
          <select name="fuelLevelIn" className="input" defaultValue={defaults.fuelLevelIn ?? ""}><option value="">—</option>{FUEL.map((f) => <option key={f} value={f}>{f}</option>)}</select>
        </div>
      </div>

      {/* Ek sürücü */}
      <div className="border-t border-slate-100 pt-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{F.extraDriver}</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="label">{F.fullName}</label><input name="extraDriverName" className="input" defaultValue={defaults.extraDriverName ?? ""} /></div>
          <div><label className="label">{F.licenseNo}</label><input name="extraDriverLicense" className="input" defaultValue={defaults.extraDriverLicense ?? ""} /></div>
        </div>
      </div>

      {/* Güvence + ek hizmet + depozito */}
      <div className="border-t border-slate-100 pt-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{F.insuranceExtras}</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">{F.insurancePkg}</label>
            <select name="insurancePackage" className="input" defaultValue={defaults.insurancePackage ?? ""}><option value="">—</option>{INSURANCE.map((i) => <option key={i} value={i}>{i}</option>)}</select>
          </div>
          <div><label className="label">{F.insuranceFee}</label><input name="insuranceFee" type="number" step="0.01" min={0} className="input" defaultValue={defaults.insuranceFee ?? ""} /></div>
          <div><label className="label">{F.deposit}</label><input name="depositAmount" type="number" step="0.01" min={0} className="input" defaultValue={defaults.depositAmount ?? ""} /></div>
          <div className="sm:col-span-2"><label className="label">{F.extras}</label><input name="extras" className="input" defaultValue={defaults.extras ?? ""} placeholder={F.extrasPlaceholder} /></div>
          <div><label className="label">{F.extrasFee}</label><input name="extrasFee" type="number" step="0.01" min={0} className="input" defaultValue={defaults.extrasFee ?? ""} /></div>
        </div>
      </div>

      {/* Hasar */}
      <div className="border-t border-slate-100 pt-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{F.damageSection}</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="label">{F.damageNote}</label><input name="damageNote" className="input" defaultValue={defaults.damageNote ?? ""} placeholder={F.damagePlaceholder} /></div>
          <div>
            <label className="label">{F.damagePhoto}</label>
            <input name="damagePhoto" type="file" accept="image/*" className="input py-1.5" />
            {defaults.damagePhotoUrl && <a href={defaults.damagePhotoUrl} target="_blank" className="mt-1 inline-block text-xs text-[var(--brand-600)] hover:underline">{F.seePhoto}</a>}
          </div>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-700">
        <input type="checkbox" name="signed" value="1" defaultChecked={!!defaults.signedAt} className="h-4 w-4 rounded border-slate-300" />
        {F.signedCheckbox}
      </label>

      <div>
        <button type="submit" className="btn-primary" disabled={pending}>{pending ? commonLabels.saving : F.saveContract}</button>
      </div>
    </form>
  );
}
