"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import type { CarState } from "@/lib/actions/cars";
import type { PanelDict } from "@/lib/i18n/panel-dict";

type CarDefaults = {
  id?: string;
  make?: string; model?: string; year?: number; plate?: string;
  category?: string; transmission?: string; fuel?: string; seats?: number;
  pricePerDay?: number; monthlyPrice?: number | null; imageUrl?: string | null; status?: string;
  branchId?: string | null;
  mileage?: number; condition?: string; conditionNote?: string | null;
  inspectionDate?: Date | string | null; insuranceDate?: Date | string | null;
  kaskoDate?: Date | string | null; nextServiceDate?: Date | string | null;
  nextServiceKm?: number | null;
};

const CATEGORIES = ["Ekonomik", "Orta", "Lüks", "SUV", "Ticari"];
const TRANSMISSIONS = ["Manuel", "Otomatik"];
const FUELS = ["Benzin", "Dizel", "Hibrit", "Elektrik", "LPG"];
const STATUS_VALUES = ["AVAILABLE", "MAINTENANCE", "RETIRED"] as const;
const CONDITION_VALUES = ["EXCELLENT", "GOOD", "FAIR", "POOR"] as const;

function dateVal(v: Date | string | null | undefined): string {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export function CarForm({
  action,
  defaults = {},
  submitLabel,
  branches = [],
  labels,
  statusLabels,
  conditionLabels,
  savingLabel,
  cancelLabel,
}: {
  action: (prev: CarState, formData: FormData) => Promise<CarState>;
  defaults?: CarDefaults;
  submitLabel: string;
  branches?: { id: string; name: string }[];
  labels: PanelDict["carForm"];
  statusLabels: PanelDict["carStatus"];
  conditionLabels: PanelDict["condition"];
  savingLabel: string;
  cancelLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const L = labels;

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-red-600/10">
          <AlertCircle size={16} /> {state.error}
        </div>
      )}

      <div className="card p-6">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-400">{L.info}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={`${L.make} *`}><input name="make" className="input" defaultValue={defaults.make} required /></Field>
          <Field label={`${L.model} *`}><input name="model" className="input" defaultValue={defaults.model} required /></Field>
          <Field label={L.year}><input name="year" type="number" className="input" defaultValue={defaults.year ?? 2024} min={1990} max={2030} /></Field>
          <Field label={`${L.plate} *`}><input name="plate" className="input uppercase" defaultValue={defaults.plate} placeholder="01-234-AB" required /></Field>
          <Field label={L.category}>
            <select name="category" className="input" defaultValue={defaults.category ?? "Ekonomik"}>
              {CATEGORIES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
          <Field label={`${L.dailyRate} *`}><input name="pricePerDay" type="number" step="0.01" className="input" defaultValue={defaults.pricePerDay} required /></Field>
          <Field label={L.monthlyRate}><input name="monthlyPrice" type="number" step="0.01" className="input" defaultValue={defaults.monthlyPrice ?? ""} placeholder={L.monthlyHint} /></Field>
          {branches.length > 0 && (
            <Field label={L.branch}>
              <select name="branchId" className="input" defaultValue={defaults.branchId ?? ""}>
                <option value="">{L.noBranch}</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-400">{L.technical}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={L.transmission}>
            <select name="transmission" className="input" defaultValue={defaults.transmission ?? "Manuel"}>
              {TRANSMISSIONS.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
          <Field label={L.fuel}>
            <select name="fuel" className="input" defaultValue={defaults.fuel ?? "Benzin"}>
              {FUELS.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
          <Field label={L.seats}><input name="seats" type="number" className="input" defaultValue={defaults.seats ?? 5} min={1} max={9} /></Field>
          <Field label={L.status}>
            <select name="status" className="input" defaultValue={defaults.status ?? "AVAILABLE"}>
              {STATUS_VALUES.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label={L.imageUrl}><input name="imageUrl" className="input" defaultValue={defaults.imageUrl ?? ""} placeholder="https://…" /></Field>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">{L.docsService}</h2>
        <p className="mb-5 text-xs text-slate-400">{L.docsHint}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={L.mileage}><input name="mileage" type="number" min={0} className="input" defaultValue={defaults.mileage ?? 0} /></Field>
          <Field label={L.condition}>
            <select name="condition" className="input" defaultValue={defaults.condition ?? "GOOD"}>
              {CONDITION_VALUES.map((x) => <option key={x} value={x}>{conditionLabels[x]}</option>)}
            </select>
          </Field>
          <Field label={L.insurance}><input name="insuranceDate" type="date" className="input" defaultValue={dateVal(defaults.insuranceDate)} /></Field>
          <Field label={L.kasko}><input name="kaskoDate" type="date" className="input" defaultValue={dateVal(defaults.kaskoDate)} /></Field>
          <Field label={L.inspection}><input name="inspectionDate" type="date" className="input" defaultValue={dateVal(defaults.inspectionDate)} /></Field>
          <Field label={L.nextService}><input name="nextServiceDate" type="date" className="input" defaultValue={dateVal(defaults.nextServiceDate)} /></Field>
          <Field label={L.nextServiceKm}><input name="nextServiceKm" type="number" min={0} className="input" defaultValue={defaults.nextServiceKm ?? ""} placeholder="Örn. 90000" /></Field>
          <div className="sm:col-span-2">
            <Field label={L.conditionNote}><input name="conditionNote" className="input" defaultValue={defaults.conditionNote ?? ""} /></Field>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? savingLabel : submitLabel}
        </button>
        <Link href="/panel/cars" className="btn-outline">{cancelLabel}</Link>
      </div>
    </form>
  );
}
