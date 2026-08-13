import Link from "next/link";
import { ShieldCheck, ShieldAlert, Wrench, ClipboardCheck, CheckCircle2 } from "lucide-react";
import type { FleetAlert, AlertType } from "@/lib/alerts";

const TYPE_ICON: Record<AlertType, typeof ShieldCheck> = {
  insurance: ShieldAlert,
  kasko: ShieldCheck,
  inspection: ClipboardCheck,
  service: Wrench,
};

const SEV_STYLE: Record<string, { row: string; badge: string; text: string }> = {
  overdue: { row: "bg-red-50/60", badge: "bg-red-100 text-red-700 ring-red-600/20", text: "text-red-600" },
  urgent: { row: "bg-orange-50/60", badge: "bg-orange-100 text-orange-700 ring-orange-600/20", text: "text-orange-600" },
  warning: { row: "bg-amber-50/50", badge: "bg-amber-100 text-amber-700 ring-amber-600/20", text: "text-amber-600" },
};

export type AlertsLabels = {
  title: string; word: string; allGood: string; seeAll: string;
  dLeft: string; dOver: string; kmLeft: string; kmOver: string; today: string;
  types: Record<AlertType, string>;
};

function timeText(a: FleetAlert, l: AlertsLabels): string {
  if (a.daysLeft != null) {
    if (a.daysLeft < 0) return `${Math.abs(a.daysLeft)} ${l.dOver}`;
    if (a.daysLeft === 0) return l.today;
    return `${a.daysLeft} ${l.dLeft}`;
  }
  if (a.kmLeft != null) {
    if (a.kmLeft < 0) return `${Math.abs(a.kmLeft).toLocaleString("tr-TR")} ${l.kmOver}`;
    return `${a.kmLeft.toLocaleString("tr-TR")} ${l.kmLeft}`;
  }
  return "";
}

export function AlertsPanel({ alerts, labels }: { alerts: FleetAlert[]; labels: AlertsLabels }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="font-semibold">{labels.title}</h2>
        {alerts.length > 0 && (
          <span className="badge bg-red-100 text-red-700 ring-red-600/20">{alerts.length} {labels.word}</span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={22} /></div>
          <p className="text-sm text-slate-500">{labels.allGood}</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {alerts.slice(0, 8).map((a, i) => {
            const Icon = TYPE_ICON[a.type];
            const s = SEV_STYLE[a.severity];
            return (
              <li key={i} className={`flex items-center gap-3 px-5 py-3 ${s.row}`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.badge}`}><Icon size={17} /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-900">
                    {a.carLabel} <span className="font-mono text-xs text-slate-400">{a.plate}</span>
                  </div>
                  <div className="text-xs text-slate-500">{labels.types[a.type]}</div>
                </div>
                <div className={`shrink-0 text-right text-sm font-semibold ${s.text}`}>
                  {timeText(a, labels)}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {alerts.length > 8 && (
        <div className="border-t px-5 py-3 text-center">
          <Link href="/panel/cars" className="text-sm font-medium text-[var(--brand-600)] hover:text-[var(--brand-700)]">
            {labels.seeAll} →
          </Link>
        </div>
      )}
    </div>
  );
}
