import Link from "next/link";
import { Mail, Phone, Download, Trash2, FileText } from "lucide-react";
import { getDb } from "@/lib/db";
import { formatDateTime, MESSAGE_STATUS_TR } from "@/lib/utils";
import { setApplicationStatusAction, deleteApplicationAction } from "@/lib/actions/admin";
import type { MessageStatus } from "@/lib/schema";

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

function dosyaUrl(key: string) {
  return `/api/admin/dosya?key=${encodeURIComponent(key)}`;
}

export default async function ApplicationsPage({ searchParams }: PageProps<"/admin/basvurular">) {
  const sp = await searchParams;
  const filter = typeof sp?.durum === "string" ? sp.durum : "all";
  const valid = FILTERS.some((f) => f.key === filter) && filter !== "all";

  const items = await getDb().query.application.findMany({
    where: valid ? (a, { eq }) => eq(a.status, filter as MessageStatus) : undefined,
    orderBy: (a, { desc }) => desc(a.createdAt),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Başvurular</h1>
        <p className="mt-1 text-slate-500">Şirket kuruluşu başvuru formundan gelen talepler ve belgeler.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/basvurular" : `/admin/basvurular?durum=${f.key}`}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${filter === f.key ? "border-brand-600 bg-brand-50 text-brand-700" : "bg-white text-slate-600 hover:border-slate-300"}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">Bu filtrede başvuru yok.</div>
      ) : (
        <div className="space-y-4">
          {items.map((a) => {
            const docs = [
              { label: "Pasaport", key: a.passportKey },
              { label: "Sabıka kaydı", key: a.criminalRecordKey },
              { label: "Ev faturası", key: a.utilityBillKey },
            ].filter((d) => d.key) as { label: string; key: string }[];

            const info = [
              ["Şirket ismi", a.companyName],
              ["Şirket maili", a.companyEmail],
              ["Sermaye", a.capital],
              ["Müdür", a.directorName],
              ["Şirket adresi", a.companyAddress],
              ["NACE kodları", a.naceCodes],
              ["Ortağın Türkiye adresi", a.partnerAddress],
            ].filter(([, v]) => v) as [string, string][];

            return (
              <div key={a.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{a.applicantName}</h3>
                      <span className="badge bg-brand-50 text-brand-700 ring-brand-100">Başvuru</span>
                      <span className={`badge ${badgeClass[a.status]}`}>{MESSAGE_STATUS_TR[a.status]}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      <a href={`mailto:${a.applicantEmail}`} className="inline-flex items-center gap-1.5 hover:text-brand-700"><Mail size={14} /> {a.applicantEmail}</a>
                      {a.applicantPhone && <a href={`tel:${a.applicantPhone}`} className="inline-flex items-center gap-1.5 hover:text-brand-700"><Phone size={14} /> {a.applicantPhone}</a>}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{formatDateTime(a.createdAt)}</span>
                </div>

                {info.length > 0 && (
                  <dl className="mt-4 grid gap-x-6 gap-y-2 border-t pt-4 text-sm sm:grid-cols-2">
                    {info.map(([k, v]) => (
                      <div key={k} className="flex flex-col">
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{k}</dt>
                        <dd className="whitespace-pre-wrap text-slate-700">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {a.notes && (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Not: </span>
                    <span className="whitespace-pre-wrap">{a.notes}</span>
                  </div>
                )}

                <div className="mt-4 border-t pt-4">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                    <FileText size={13} /> Belgeler
                  </div>
                  {docs.length === 0 ? (
                    <p className="text-sm text-slate-400">Belge yüklenmemiş.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {docs.map((d) => (
                        <a key={d.key} href={dosyaUrl(d.key)} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">
                          <Download size={14} /> {d.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
                  {(["READ", "REPLIED", "ARCHIVED"] as MessageStatus[])
                    .filter((s) => s !== a.status)
                    .map((s) => (
                      <form key={s} action={setApplicationStatusAction}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value={s} />
                        <button type="submit" className="btn-ghost btn-sm">{MESSAGE_STATUS_TR[s]} olarak işaretle</button>
                      </form>
                    ))}
                  <form action={deleteApplicationAction} className="ml-auto">
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className="btn-ghost btn-sm text-red-600 hover:bg-red-50"><Trash2 size={14} /> Sil</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
