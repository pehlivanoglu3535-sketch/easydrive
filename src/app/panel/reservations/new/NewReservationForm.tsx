"use client";

import { useActionState, useState } from "react";
import { AlertCircle } from "lucide-react";
import { createReservationAction } from "@/lib/actions/panel-reservations";
import { computeRental, computeMonthly, type PricingRuleLite } from "@/lib/pricing";
import type { PanelDict } from "@/lib/i18n/panel-dict";

type CarLite = { id: string; label: string; pricePerDay: number; monthlyPrice: number | null; category: string; branchId: string | null };

export function NewReservationForm({
  cars, locations, branches, rules, minDate, labels, statusLabels, commonLabels,
}: {
  cars: CarLite[];
  locations: { id: string; name: string }[];
  branches: { id: string; name: string }[];
  rules: PricingRuleLite[];
  minDate: string;
  labels: PanelDict["resNew"];
  statusLabels: PanelDict["status"];
  commonLabels: PanelDict["common"];
}) {
  const [state, action, pending] = useActionState(createReservationAction, undefined);
  const N = labels;
  const [carId, setCarId] = useState(cars[0]?.id || "");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [mode, setMode] = useState<"DAILY" | "MONTHLY">("DAILY");
  const [pickupBranch, setPickupBranch] = useState(cars[0]?.branchId || "");
  const [dropoffBranch, setDropoffBranch] = useState(cars[0]?.branchId || "");

  const car = cars.find((c) => c.id === carId);

  function onCar(id: string) {
    setCarId(id);
    const c = cars.find((x) => x.id === id);
    setPickupBranch(c?.branchId || "");
    setDropoffBranch(c?.branchId || "");
  }
  const oneWay = pickupBranch !== dropoffBranch;
  const money = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  let calc: { count: number; unit: string; total: number } | null = null;
  if (car && start && end && new Date(end) > new Date(start)) {
    const s = new Date(start), e = new Date(end);
    if (mode === "MONTHLY" && car.monthlyPrice) {
      const m = computeMonthly(car.monthlyPrice, s, e);
      calc = { count: m.months, unit: N.monthUnit, total: m.total };
    } else {
      const r = computeRental(car.pricePerDay, car.category, s, e, rules);
      calc = { count: r.days, unit: N.dayUnit, total: r.total };
    }
  }

  return (
    <form action={action} className="flex max-w-3xl flex-col gap-6">
      {state?.error && <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-red-600/10"><AlertCircle size={16} /> {state.error}</div>}

      <div className="card p-6">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-400">{N.carDate}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">{N.car} *</label>
            <select name="carId" className="input" value={carId} onChange={(e) => onCar(e.target.value)} required>
              {cars.map((c) => <option key={c.id} value={c.id}>{c.label} — {money(c.pricePerDay)}{N.perDay}{c.monthlyPrice ? ` · ${money(c.monthlyPrice)}${N.perMonth}` : ""}</option>)}
            </select>
          </div>
          {car?.monthlyPrice ? (
            <div className="sm:col-span-2 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
              {(["DAILY", "MONTHLY"] as const).map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-md py-1.5 text-sm font-medium transition ${mode === m ? "bg-white shadow-sm" : "text-slate-500"}`}>
                  {m === "DAILY" ? N.daily : N.monthly}
                </button>
              ))}
            </div>
          ) : null}
          <input type="hidden" name="rentalType" value={mode} />
          <div>
            <label className="label">{N.startDate} *</label>
            <input name="startDate" type="date" className="input" min={minDate} value={start} onChange={(e) => setStart(e.target.value)} required />
          </div>
          <div>
            <label className="label">{N.endDate} *</label>
            <input name="endDate" type="date" className="input" min={start || minDate} value={end} onChange={(e) => setEnd(e.target.value)} required />
          </div>
          {locations.length > 0 && (
            <>
              <div>
                <label className="label">{N.pickupPlace}</label>
                <select name="pickupLocationId" className="input"><option value="">—</option>{locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
              </div>
              <div>
                <label className="label">{N.dropoffPlace}</label>
                <select name="dropoffLocationId" className="input"><option value="">—</option>{locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
              </div>
            </>
          )}
          {branches.length > 0 && (
            <>
              <div>
                <label className="label">{N.pickupBranch}</label>
                <select name="pickupBranchId" className="input" value={pickupBranch} onChange={(e) => setPickupBranch(e.target.value)}>
                  <option value="">{N.noBranch}</option>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">{N.dropoffBranch}</label>
                <select name="dropoffBranchId" className="input" value={dropoffBranch} onChange={(e) => setDropoffBranch(e.target.value)}>
                  <option value="">{N.noBranch}</option>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              {oneWay && (
                <div className="rounded-lg bg-amber-50 px-3.5 py-2.5 text-sm text-amber-700 ring-1 ring-amber-600/10 sm:col-span-2">
                  🔁 {N.oneWayNote.replace("{b}", branches.find((b) => b.id === dropoffBranch)?.name || N.dropoffBranchFallback)}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-400">{N.customer}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="label">{N.fullName} *</label><input name="name" className="input" required /></div>
          <div><label className="label">{N.phone}</label><input name="phone" className="input" placeholder="+383 …" /></div>
          <div><label className="label">{N.email}</label><input name="email" type="email" className="input" placeholder={commonLabels.optional} /></div>
          <div><label className="label">{N.idNo}</label><input name="idNumber" className="input" /></div>
          <div><label className="label">{N.licenseNo}</label><input name="licenseNo" className="input" /></div>
          <div>
            <label className="label">{N.status}</label>
            <select name="status" className="input" defaultValue="CONFIRMED">
              <option value="CONFIRMED">{statusLabels.CONFIRMED}</option>
              <option value="PENDING">{statusLabels.PENDING}</option>
              <option value="ACTIVE">{statusLabels.ACTIVE}</option>
            </select>
          </div>
          <div className="sm:col-span-2"><label className="label">{N.note}</label><input name="note" className="input" placeholder={commonLabels.optional} /></div>
        </div>
      </div>

      {calc && (
        <div className="card flex items-center justify-between p-5">
          <div className="text-sm text-slate-500">{mode === "MONTHLY" ? money(car!.monthlyPrice!) : money(car!.pricePerDay)} × {calc.count} {calc.unit}</div>
          <div className="text-xl font-bold text-[var(--brand-600)]">{money(calc.total)}</div>
        </div>
      )}

      <div>
        <button type="submit" className="btn-primary" disabled={pending || !calc}>{pending ? N.creating : N.create}</button>
      </div>
    </form>
  );
}
