import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save, Trash2, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { savePostAction, deletePostAction } from "@/lib/actions/admin";

export default async function PostEditorPage({ params, searchParams }: PageProps<"/admin/yazilar/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "yeni";

  const post = isNew ? null : await prisma.post.findUnique({ where: { id } });
  if (!isNew && !post) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/yazilar" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-700">
        <ArrowLeft size={15} /> Yazılar
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">{isNew ? "Yeni yazı" : "Yazıyı düzenle"}</h1>

      {sp?.hata && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> Başlık, özet ve içerik alanları zorunludur.
        </div>
      )}

      <form action={savePostAction} className="card space-y-4 p-6">
        {!isNew && <input type="hidden" name="id" value={post!.id} />}

        <div>
          <label className="label" htmlFor="title">Başlık *</label>
          <input id="title" name="title" required defaultValue={post?.title} className="input" placeholder="Yazı başlığı" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="category">Kategori</label>
            <input id="category" name="category" defaultValue={post?.category ?? ""} className="input" placeholder="İş Dünyası, Vergi…" />
          </div>
          <div>
            <label className="label" htmlFor="author">Yazar</label>
            <input id="author" name="author" defaultValue={post?.author ?? "ProKosova Solutions"} className="input" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="slug">URL (slug)</label>
          <input id="slug" name="slug" defaultValue={post?.slug ?? ""} className="input" placeholder="boş bırakılırsa başlıktan üretilir" />
        </div>

        <div>
          <label className="label" htmlFor="excerpt">Özet *</label>
          <textarea id="excerpt" name="excerpt" required rows={2} defaultValue={post?.excerpt} className="input resize-y" placeholder="Listeleme ve önizlemede görünecek kısa özet." />
        </div>

        <div>
          <label className="label" htmlFor="content">İçerik *</label>
          <textarea id="content" name="content" required rows={16} defaultValue={post?.content} className="input resize-y font-mono text-[13px]" placeholder={"Paragrafları boş satırla ayırın.\n\n## Alt başlık\n\n- Madde 1\n- Madde 2"} />
          <p className="mt-1.5 text-xs text-slate-400">Biçimlendirme: boş satır = yeni paragraf, <code className="rounded bg-slate-100 px-1">## </code> = alt başlık, <code className="rounded bg-slate-100 px-1">- </code> = liste.</p>
        </div>

        <label className="flex items-center gap-2.5">
          <input type="checkbox" name="published" defaultChecked={post?.published ?? true} className="h-4 w-4 rounded border-slate-300" />
          <span className="text-sm font-medium text-slate-700">Yayında</span>
        </label>

        <div className="flex items-center justify-between border-t pt-4">
          <button type="submit" className="btn-primary"><Save size={16} /> Kaydet</button>
        </div>
      </form>

      {!isNew && (
        <form action={deletePostAction} className="card flex items-center justify-between p-5">
          <div>
            <div className="font-medium text-slate-900">Yazıyı sil</div>
            <div className="text-sm text-slate-500">Bu işlem geri alınamaz.</div>
          </div>
          <input type="hidden" name="id" value={post!.id} />
          <button type="submit" className="btn-danger"><Trash2 size={15} /> Sil</button>
        </form>
      )}
    </div>
  );
}
