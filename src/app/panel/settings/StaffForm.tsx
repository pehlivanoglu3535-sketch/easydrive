"use client";

import { useActionState } from "react";
import { createStaffAction } from "@/lib/actions/settings";
import type { PanelDict } from "@/lib/i18n/panel-dict";

export function StaffForm({ branches, labels }: { branches: { id: string; name: string }[]; labels: PanelDict["settings"] }) {
  const [state, action, pending] = useActionState(createStaffAction, undefined);
  const S = labels;

  return (
    <form action={action} className="flex flex-col gap-3">
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>
      )}
      {state?.ok && (
        <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">✅ {S.staffAdded}</div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="name" className="input" placeholder={S.staffName} required />
        <input name="email" type="email" className="input" placeholder={S.staffEmail} required />
        <input name="password" type="text" className="input" placeholder={S.staffPass} required minLength={6} />
        <select name="role" className="input" defaultValue="STAFF">
          <option value="STAFF">{S.roleOffice}</option>
          <option value="HANDOVER">{S.roleHandover}</option>
          <option value="COMPANY_ADMIN">{S.roleAdmin}</option>
        </select>
        {branches.length > 0 && (
          <select name="branchId" className="input sm:col-span-2" defaultValue="">
            <option value="">{S.branchAll}</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{S.branchPrefix} {b.name}</option>)}
          </select>
        )}
      </div>
      <div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? S.addStaff + "…" : "+ " + S.addStaff}
        </button>
      </div>
    </form>
  );
}
