import Link from "next/link";
import { Pencil, Eye, EyeOff, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { ServiceIcon } from "@/components/ServiceIcon";
import { toggleServicePublishedAction } from "@/lib/actions/admin";

export default async function ServicesAdminPage() {
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hizmetler</h1>
        <p className="mt-1 text-slate-500">Hizmet içeriklerini düzenleyin ve yayın durumlarını yönetin.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((s) => {
          return (
            <div key={s.id} className="card flex flex-col p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><ServiceIcon name={s.icon} size={22} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{s.title}</h3>
                    <span className={`badge ${s.published ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-500 ring-slate-200"}`}>
                      {s.published ? "Yayında" : "Gizli"}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{s.summary}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 border-t pt-3">
                {s.published && (
                  <Link href={`/hizmetler/${s.slug}`} target="_blank" className="btn-ghost btn-sm" title="Görüntüle"><ExternalLink size={15} /></Link>
                )}
                <form action={toggleServicePublishedAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" className="btn-ghost btn-sm" title={s.published ? "Gizle" : "Yayınla"}>
                    {s.published ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </form>
                <Link href={`/admin/hizmetler/${s.id}`} className="btn-ghost btn-sm ml-auto"><Pencil size={15} /> Düzenle</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
