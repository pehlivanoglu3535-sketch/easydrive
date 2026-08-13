"use client";

import { useActionState, useState } from "react";
import { createPublicBookingAction } from "@/lib/actions/booking";
import { computeRental, computeMonthly, type PricingRuleLite } from "@/lib/pricing";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function BookingForm({
  slug, carId, pricePerDay, monthlyPrice, category, currency, minDate,
  defaultStart, defaultEnd, color, locations, rules, defaultPickup, dict,
}: {
  slug: string;
  carId: string;
  pricePerDay: number;
  monthlyPrice: number | null;
  category: string;
  currency: string;
  minDate: string;
  defaultStart?: string;
  defaultEnd?: string;
  color: string;
  locations: { id: string; name: string }[];
  rules: PricingRuleLite[];
  defaultPickup?: string;
  dict: Dictionary;
}) {
  const [state, action, pending] = useActionState(createPublicBookingAction, undefined);
  const [start, setStart] = useState(defaultStart || "");
  const [end, setEnd] = useState(defaultEnd || "");
  const [mode, setMode] = useState<"DAILY" | "MONTHLY">("DAILY");

  const money = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  let calc: { unit: string; count: number; total: number } | null = null;
  if (start && end && new Date(end) > new Date(start)) {
    const s = new Date(start), e = new Date(end);
    if (mode === "MONTHLY" && monthlyPrice) {
      const m = computeMonthly(monthlyPrice, s, e);
      calc = { unit: "ay", count: m.months, total: m.total };
    } else {
      const r = computeRental(pricePerDay, category, s, e, rules);
      calc = { unit: dict.common.day, count: r.days, total: r.total };
    }
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="carId" value={carId} />
      <input type="hidden" name="rentalType" value={mode} />

      {state?.error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}

      {monthlyPrice && (
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          {(["DAILY", "MONTHLY"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`rounded-md py-1.5 text-sm font-medium transition ${mode === m ? "bg-white shadow-sm" : "text-slate-500"}`}>
              {m === "DAILY" ? "Günlük" : "Uzun Dönem"}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="startDate">{dict.search.pickupDate}</label>
          <input id="startDate" name="startDate" type="date" className="input" min={minDate} value={start} onChange={(e) => setStart(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="endDate">{dict.search.dropoffDate}</label>
          <input id="endDate" name="endDate" type="date" className="input" min={start || minDate} value={end} onChange={(e) => setEnd(e.target.value)} required />
        </div>
      </div>

      {locations.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="pickupLocationId">{dict.search.pickupLocation}</label>
            <select id="pickupLocationId" name="pickupLocationId" className="input" defaultValue={defaultPickup || ""}>{locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
          </div>
          <div>
            <label className="label" htmlFor="dropoffLocationId">{dict.search.dropoffLocation}</label>
            <select id="dropoffLocationId" name="dropoffLocationId" className="input">{locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 pt-4">
        <h3 className="mb-3 font-semibold">{dict.booking.yourDetails}</h3>
        <div className="flex flex-col gap-3">
          <input name="name" className="input" placeholder={dict.booking.fullName} required />
          <div className="grid grid-cols-2 gap-3">
            <input name="email" type="email" className="input" placeholder={dict.booking.email} required />
            <input name="phone" className="input" placeholder={dict.booking.phone} />
          </div>
          <textarea name="note" className="input" rows={2} placeholder={dict.booking.notePlaceholder} />
        </div>
      </div>

      {calc && (
        <div className="rounded-lg bg-slate-50 p-4 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>{mode === "MONTHLY" ? money(monthlyPrice!) : money(pricePerDay)} × {calc.count} {calc.unit}</span>
            <span>{money(calc.total)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-bold">
            <span>{dict.common.total}</span>
            <span style={{ color }}>{money(calc.total)}</span>
          </div>
        </div>
      )}

      <button type="submit" className="btn-primary w-full" style={{ backgroundColor: color }} disabled={pending || !calc}>
        {pending ? dict.common.loading : dict.booking.completeBooking}
      </button>
    </form>
  );
}
