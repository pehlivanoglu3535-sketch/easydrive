"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { updateCustomerAction } from "@/lib/actions/panel-reservations";
import type { PanelDict } from "@/lib/i18n/panel-dict";

type C = { id: string; name: string; phone: string | null; idNumber: string | null; licenseNo: string | null };

export function CustomerEditForm({ customer, labels, commonLabels }: { customer: C; labels: PanelDict["customers"]; commonLabels: PanelDict["common"] }) {
  const [state, action, pending] = useActionState(updateCustomerAction, undefined);
  const C = labels;
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="customerId" value={customer.id} />
      {state?.error && <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-red-600/10"><AlertCircle size={16} /> {state.error}</div>}
      {state?.ok && <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700 ring-1 ring-emerald-600/10"><CheckCircle2 size={16} /> {C.savedOk}</div>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div><label className="label">{C.name} *</label><input name="name" className="input" defaultValue={customer.name} required /></div>
        <div><label className="label">{C.phone}</label><input name="phone" className="input" defaultValue={customer.phone ?? ""} /></div>
        <div><label className="label">{C.idNumber}</label><input name="idNumber" className="input" defaultValue={customer.idNumber ?? ""} /></div>
        <div><label className="label">{C.licenseNo}</label><input name="licenseNo" className="input" defaultValue={customer.licenseNo ?? ""} /></div>
      </div>
      <div><button type="submit" className="btn-primary" disabled={pending}>{pending ? commonLabels.saving : commonLabels.save}</button></div>
    </form>
  );
}
