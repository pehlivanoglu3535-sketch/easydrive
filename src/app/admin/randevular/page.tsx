import { Mail, Phone, Trash2, Check, X, CheckCheck } from "lucide-react";
import { getDb } from "@/lib/db";
import { formatDateTime, APPOINTMENT_STATUS_TR } from "@/lib/utils";
import { setAppointmentStatusAction, deleteAppointmentAction } from "@/lib/actions/admin";
import type { AppointmentStatus } from "@/lib/schema";

const badgeClass: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 ring-red-200",
  COMPLETED: "bg-slate-100 text-slate-500 ring-slate-200",
};

type Appt = Awaited<ReturnType<typeof getData>>["upcoming"][number];

async function getData() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const all = await getDb().query.appointment.findMany({
    orderBy: (a, { asc }) => asc(a.slot),
    with: { service: true },
  });
  const upcoming = all.filter((a) => a.slot >= startOfToday && a.status !== "CANCELLED" && a.status !== "COMPLETED");
  const past = all
    .filter((a) => !(a.slot >= startOfToday && a.status !== "CANCELLED" && a.status !== "COMPLETED"))
    .reverse();
  return { upcoming, past };
}

function Card({ a }: { a: Appt }) {
  const actions: { status: AppointmentStatus; label: string; icon: typeof Check; cls: string }[] = [
    { status: "CONFIRMED", label: "Onayla", icon: Check, cls: "text-emerald-700 hover:bg-emerald-50" },
    { status: "COMPLETED", label: "Tamamlandı", icon: CheckCheck, cls: "text-slate-600 hover:bg-slate-100" },
    { status: "CANCELLED", label: "İptal", icon: X, cls: "text-red-600 hover:bg-red-50" },
  ];
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{a.name}</h3>
            <span className={`badge ${badgeClass[a.status]}`}>{APPOINTMENT_STATUS_TR[a.status]}</span>
            {a.service && <span className="badge bg-brand-50 text-brand-700 ring-brand-100">{a.service.title}</span>}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            <a href={`mailto:${a.email}`} className="inline-flex items-center gap-1.5 hover:text-brand-700"><Mail size={14} /> {a.email}</a>
            {a.phone && <a href={`tel:${a.phone}`} className="inline-flex items-center gap-1.5 hover:text-brand-700"><Phone size={14} /> {a.phone}</a>}
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-brand-700">{formatDateTime(a.slot)}</div>
        </div>
      </div>
      {a.note && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{a.note}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
        {actions.filter((act) => act.status !== a.status).map((act) => (
          <form key={act.status} action={setAppointmentStatusAction}>
            <input type="hidden" name="id" value={a.id} />
            <input type="hidden" name="status" value={act.status} />
            <button type="submit" className={`btn-ghost btn-sm ${act.cls}`}><act.icon size={14} /> {act.label}</button>
          </form>
        ))}
        <form action={deleteAppointmentAction} className="ml-auto">
          <input type="hidden" name="id" value={a.id} />
          <button type="submit" className="btn-ghost btn-sm text-red-600 hover:bg-red-50"><Trash2 size={14} /> Sil</button>
        </form>
      </div>
    </div>
  );
}

export default async function AppointmentsPage() {
  const { upcoming, past } = await getData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Randevular</h1>
        <p className="mt-1 text-slate-500">Online randevu talepleri.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Yaklaşan ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <div className="card p-8 text-center text-slate-400">Yaklaşan randevu yok.</div>
        ) : (
          upcoming.map((a) => <Card key={a.id} a={a} />)
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Geçmiş & diğer</h2>
          {past.map((a) => <Card key={a.id} a={a} />)}
        </section>
      )}
    </div>
  );
}
