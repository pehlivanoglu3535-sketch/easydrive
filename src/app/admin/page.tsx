import Link from "next/link";
import { MessageSquare, Calendar, Newspaper, Briefcase, ArrowRight } from "lucide-react";
import { eq, count } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { contactMessage, appointment, post, service } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { formatDateTime, formatRelativeShort } from "@/lib/utils";

export default async function AdminDashboard() {
  const session = await getSession();
  const now = new Date();

  const db = getDb();
  const [[nm], [pa], [pc], [sc], recentMessages, upcoming] = await Promise.all([
    db.select({ c: count() }).from(contactMessage).where(eq(contactMessage.status, "NEW")),
    db.select({ c: count() }).from(appointment).where(eq(appointment.status, "PENDING")),
    db.select({ c: count() }).from(post),
    db.select({ c: count() }).from(service),
    db.query.contactMessage.findMany({ orderBy: (m, { desc }) => desc(m.createdAt), limit: 5, with: { service: true } }),
    db.query.appointment.findMany({
      where: (a, { and, gte, inArray }) => and(gte(a.slot, now), inArray(a.status, ["PENDING", "CONFIRMED"])),
      orderBy: (a, { asc }) => asc(a.slot),
      limit: 5,
    }),
  ]);
  const newMessages = nm?.c ?? 0;
  const pendingAppts = pa?.c ?? 0;
  const postCount = pc?.c ?? 0;
  const serviceCount = sc?.c ?? 0;

  const stats = [
    { label: "Yeni mesaj", value: newMessages, icon: MessageSquare, href: "/admin/mesajlar" },
    { label: "Bekleyen randevu", value: pendingAppts, icon: Calendar, href: "/admin/randevular" },
    { label: "Blog yazısı", value: postCount, icon: Newspaper, href: "/admin/yazilar" },
    { label: "Hizmet", value: serviceCount, icon: Briefcase, href: "/admin/hizmetler" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Merhaba, {session?.name?.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-slate-500">Sitenizin güncel durumuna hızlı bir bakış.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card card-hover p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><s.icon size={20} /></div>
              <ArrowRight size={16} className="text-slate-300" />
            </div>
            <div className="mt-4 text-3xl font-bold">{s.value}</div>
            <div className="text-sm text-slate-500">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between border-b p-5">
            <h2 className="font-semibold">Son mesajlar</h2>
            <Link href="/admin/mesajlar" className="text-sm font-medium text-brand-700">Tümü</Link>
          </div>
          <div className="divide-y">
            {recentMessages.length === 0 && <p className="p-5 text-sm text-slate-400">Henüz mesaj yok.</p>}
            {recentMessages.map((m) => (
              <Link key={m.id} href="/admin/mesajlar" className="flex items-start justify-between gap-3 p-4 hover:bg-slate-50">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{m.name}</span>
                    {m.kind === "quote" && <span className="badge bg-accent-50 text-accent-600 ring-accent/30">Teklif</span>}
                    {m.status === "NEW" && <span className="h-2 w-2 rounded-full bg-accent" />}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-slate-500">{m.subject || m.message}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{formatRelativeShort(m.createdAt)}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between border-b p-5">
            <h2 className="font-semibold">Yaklaşan randevular</h2>
            <Link href="/admin/randevular" className="text-sm font-medium text-brand-700">Tümü</Link>
          </div>
          <div className="divide-y">
            {upcoming.length === 0 && <p className="p-5 text-sm text-slate-400">Yaklaşan randevu yok.</p>}
            {upcoming.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="font-medium text-slate-900">{a.name}</div>
                  <div className="truncate text-sm text-slate-500">{formatDateTime(a.slot)}</div>
                </div>
                <span className={`badge ${a.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200"}`}>
                  {a.status === "CONFIRMED" ? "Onaylı" : "Bekliyor"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
