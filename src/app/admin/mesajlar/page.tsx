import Link from "next/link";
import { Mail, Phone, Building2, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDateTime, MESSAGE_STATUS_TR } from "@/lib/utils";
import { setMessageStatusAction, deleteMessageAction } from "@/lib/actions/admin";
import type { MessageStatus } from "@prisma/client";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "NEW", label: "Yeni" },
  { key: "READ", label: "Okundu" },
  { key: "REPLIED", label: "Yanıtlandı" },
  { key: "ARCHIVED", label: "Arşiv" },
];

const badgeClass: Record<string, string> = {
  NEW: "bg-accent-50 text-accent-600 ring-accent/30",
  READ: "bg-slate-100 text-slate-600 ring-slate-200",
  REPLIED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ARCHIVED: "bg-slate-100 text-slate-400 ring-slate-200",
};

export default async function MessagesPage({ searchParams }: PageProps<"/admin/mesajlar">) {
  const sp = await searchParams;
  const filter = typeof sp?.durum === "string" ? sp.durum : "all";
  const where = FILTERS.some((f) => f.key === filter) && filter !== "all" ? { status: filter as MessageStatus } : {};

  const messages = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { service: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mesajlar</h1>
        <p className="mt-1 text-slate-500">İletişim ve teklif talepleri.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/mesajlar" : `/admin/mesajlar?durum=${f.key}`}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${filter === f.key ? "border-brand-600 bg-brand-50 text-brand-700" : "bg-white text-slate-600 hover:border-slate-300"}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {messages.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">Bu filtrede mesaj yok.</div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{m.name}</h3>
                    {m.kind === "quote" && <span className="badge bg-accent-50 text-accent-600 ring-accent/30">Teklif</span>}
                    <span className={`badge ${badgeClass[m.status]}`}>{MESSAGE_STATUS_TR[m.status]}</span>
                    {m.service && <span className="badge bg-brand-50 text-brand-700 ring-brand-100">{m.service.title}</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                    <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 hover:text-brand-700"><Mail size={14} /> {m.email}</a>
                    {m.phone && <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1.5 hover:text-brand-700"><Phone size={14} /> {m.phone}</a>}
                    {m.company && <span className="inline-flex items-center gap-1.5"><Building2 size={14} /> {m.company}</span>}
                  </div>
                </div>
                <span className="text-xs text-slate-400">{formatDateTime(m.createdAt)}</span>
              </div>

              {m.subject && <p className="mt-3 text-sm font-medium text-slate-700">{m.subject}</p>}
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{m.message}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
                {(["READ", "REPLIED", "ARCHIVED"] as MessageStatus[])
                  .filter((s) => s !== m.status)
                  .map((s) => (
                    <form key={s} action={setMessageStatusAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="status" value={s} />
                      <button type="submit" className="btn-ghost btn-sm">{MESSAGE_STATUS_TR[s]} olarak işaretle</button>
                    </form>
                  ))}
                <form action={deleteMessageAction} className="ml-auto">
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit" className="btn-ghost btn-sm text-red-600 hover:bg-red-50"><Trash2 size={14} /> Sil</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
