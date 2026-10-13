import Link from "next/link";
import { Plus, Pencil, Eye, EyeOff, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { togglePostPublishedAction } from "@/lib/actions/admin";

export default async function PostsAdminPage() {
  const posts = await prisma.post.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Yazılar</h1>
          <p className="mt-1 text-slate-500">Blog içeriklerini yönetin.</p>
        </div>
        <Link href="/admin/yazilar/yeni" className="btn-primary"><Plus size={16} /> Yeni yazı</Link>
      </div>

      {posts.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">Henüz yazı yok.</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-5 py-3">Başlık</th>
                <th className="hidden px-5 py-3 sm:table-cell">Kategori</th>
                <th className="hidden px-5 py-3 md:table-cell">Tarih</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="table-row">
                  <td className="px-5 py-3 font-medium text-slate-900">{p.title}</td>
                  <td className="hidden px-5 py-3 text-slate-500 sm:table-cell">{p.category || "—"}</td>
                  <td className="hidden px-5 py-3 text-slate-500 md:table-cell">{formatDate(p.publishedAt)}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${p.published ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-500 ring-slate-200"}`}>
                      {p.published ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {p.published && (
                        <Link href={`/blog/${p.slug}`} target="_blank" className="btn-ghost btn-sm" title="Görüntüle"><ExternalLink size={15} /></Link>
                      )}
                      <form action={togglePostPublishedAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="btn-ghost btn-sm" title={p.published ? "Yayından kaldır" : "Yayınla"}>
                          {p.published ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </form>
                      <Link href={`/admin/yazilar/${p.id}`} className="btn-ghost btn-sm" title="Düzenle"><Pencil size={15} /></Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
