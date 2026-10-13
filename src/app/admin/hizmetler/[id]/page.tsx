import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { saveServiceAction } from "@/lib/actions/admin";

const ICONS = ["Briefcase", "Calculator", "Plane", "Code2", "TrendingUp", "Scale", "Users", "LineChart", "ShieldCheck", "Globe", "Building2", "Lightbulb", "Target", "FileText"];

export default async function ServiceEditorPage({ params, searchParams }: PageProps<"/admin/hizmetler/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/hizmetler" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-700">
        <ArrowLeft size={15} /> Hizmetler
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Hizmeti düzenle</h1>

      {sp?.hata && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> Başlık, özet ve açıklama zorunludur.
        </div>
      )}

      <form action={saveServiceAction} className="card space-y-4 p-6">
        <input type="hidden" name="id" value={service.id} />

        <div>
          <label className="label" htmlFor="title">Başlık *</label>
          <input id="title" name="title" required defaultValue={service.title} className="input" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="icon">İkon</label>
            <select id="icon" name="icon" defaultValue={service.icon} className="input">
              {ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="order">Sıra</label>
            <input id="order" name="order" type="number" defaultValue={service.order} className="input" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="summary">Özet *</label>
          <textarea id="summary" name="summary" required rows={2} defaultValue={service.summary} className="input resize-y" />
        </div>

        <div>
          <label className="label" htmlFor="description">Açıklama *</label>
          <textarea id="description" name="description" required rows={12} defaultValue={service.description} className="input resize-y font-mono text-[13px]" />
          <p className="mt-1.5 text-xs text-slate-400">Boş satır = paragraf, <code className="rounded bg-slate-100 px-1">## </code> = alt başlık, <code className="rounded bg-slate-100 px-1">- </code> = liste.</p>
        </div>

        <div>
          <label className="label" htmlFor="features">Kapsam maddeleri (her satır bir madde)</label>
          <textarea id="features" name="features" rows={5} defaultValue={service.features} className="input resize-y" placeholder={"Örnek madde 1\nÖrnek madde 2"} />
        </div>

        <label className="flex items-center gap-2.5">
          <input type="checkbox" name="published" defaultChecked={service.published} className="h-4 w-4 rounded border-slate-300" />
          <span className="text-sm font-medium text-slate-700">Yayında</span>
        </label>

        <div className="border-t pt-4">
          <button type="submit" className="btn-primary"><Save size={16} /> Kaydet</button>
        </div>
      </form>
    </div>
  );
}
