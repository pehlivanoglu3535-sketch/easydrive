import { RESERVATION_STATUS_TR } from "@/lib/utils";

const STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
  CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-600/20",
  ACTIVE: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  CANCELLED: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

const DOT: Record<string, string> = {
  PENDING: "bg-amber-500",
  CONFIRMED: "bg-blue-500",
  ACTIVE: "bg-indigo-500",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-slate-400",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={`badge ${STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-500/20"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status] || "bg-slate-400"}`} />
      {label || RESERVATION_STATUS_TR[status] || status}
    </span>
  );
}
