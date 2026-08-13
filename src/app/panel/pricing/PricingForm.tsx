"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Plus } from "lucide-react";
import { createPricingRuleAction } from "@/lib/actions/pricing";
import type { PanelDict } from "@/lib/i18n/panel-dict";

export function PricingForm({ categories, labels, commonLabels }: { categories: string[]; labels: PanelDict["pricing"]; commonLabels: PanelDict["common"] }) {
  const [state, action, pending] = useActionState(createPricingRuleAction, undefined);
  const P = labels;
  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-red-600/10"><AlertCircle size={16} /> {state.error}</div>}
      {state?.ok && <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700 ring-1 ring-emerald-600/10"><CheckCircle2 size={16} /> {P.ruleAdded}</div>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="label">{P.ruleName} *</label>
          <input name="name" className="input" placeholder="Yaz Sezonu" required />
        </div>
        <div>
          <label className="label">{P.category}</label>
          <select name="category" className="input" defaultValue="">
            <option value="">{P.allCats}</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{P.priority}</label>
          <input name="priority" type="number" className="input" defaultValue={0} />
        </div>
        <div>
          <label className="label">{P.start} *</label>
          <input name="startDate" type="date" className="input" required />
        </div>
        <div>
          <label className="label">{P.end} *</label>
          <input name="endDate" type="date" className="input" required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">{P.kind}</label>
            <select name="kind" className="input" defaultValue="PERCENT">
              <option value="PERCENT">{P.percent}</option>
              <option value="ABSOLUTE">{P.absolute}</option>
            </select>
          </div>
          <div>
            <label className="label">{P.value} *</label>
            <input name="value" type="number" step="0.01" className="input" placeholder="30" required />
          </div>
        </div>
      </div>
      <div>
        <button type="submit" className="btn-primary" disabled={pending}><Plus size={16} /> {pending ? commonLabels.saving : P.addRule}</button>
      </div>
      <p className="text-xs text-slate-400">{P.hint}</p>
    </form>
  );
}
