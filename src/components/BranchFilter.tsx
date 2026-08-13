"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";

export function BranchFilter({ branches, current, allLabel = "Tüm Şubeler" }: { branches: { id: string; name: string }[]; current?: string; allLabel?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function onChange(v: string) {
    const params = new URLSearchParams(sp.toString());
    if (v) params.set("branch", v);
    else params.delete("branch");
    router.push(`${pathname}?${params.toString()}`);
  }

  if (branches.length === 0) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm shadow-sm">
      <Building2 size={16} className="text-slate-400" />
      <select value={current || ""} onChange={(e) => onChange(e.target.value)} className="cursor-pointer bg-transparent font-medium text-slate-700 outline-none">
        <option value="">{allLabel}</option>
        {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
    </div>
  );
}
