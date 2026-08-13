import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type Tone = "brand" | "emerald" | "amber" | "indigo" | "slate";

const TONE: Record<Tone, string> = {
  brand: "bg-[var(--brand-50)] text-[var(--brand-600)]",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  indigo: "bg-[var(--brand-50)] text-[var(--brand-600)]",
  slate: "bg-slate-100 text-slate-600",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  hint,
  href,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <div className={`card p-5 ${href ? "card-hover" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${TONE[tone]}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
