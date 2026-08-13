import { notFound } from "next/navigation";
import { Palette, MapPin, UserCog, Trash2, Plus, Building2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireCompanyAdmin } from "@/lib/auth";
import { createLocationAction, deleteLocationAction, deleteStaffAction, createBranchAction, deleteBranchAction } from "@/lib/actions/settings";
import { getPanelT } from "@/lib/i18n/panel";
import { BrandingForm } from "./BrandingForm";
import { StaffForm } from "./StaffForm";

function SectionHeader({ icon: Icon, title, desc }: { icon: typeof Palette; title: string; desc: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]"><Icon size={18} /></div>
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const session = await requireCompanyAdmin();
  const { t } = await getPanelT();
  const S = t.settings;
  const company = await prisma.company.findUnique({
    where: { id: session.companyId },
    include: {
      locations: { orderBy: { createdAt: "asc" } },
      branches: { orderBy: { createdAt: "asc" } },
      users: { orderBy: { createdAt: "asc" }, include: { branch: { select: { name: true } } } },
    },
  });
  if (!company) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{S.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{S.subtitle}</p>
      </div>

      <section className="card p-6">
        <SectionHeader icon={Palette} title={S.brandGeneral} desc={S.brandDesc} />
        <BrandingForm company={company} labels={S} commonLabels={t.common} />
      </section>

      <section className="card p-6">
        <SectionHeader icon={MapPin} title={S.locations} desc={S.locationsDesc} />
        <ul className="mb-4 flex flex-col gap-2">
          {company.locations.map((l) => (
            <li key={l.id} className="flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm">
              <span>
                <span className="font-medium text-slate-900">{l.name}</span>
                <span className="text-slate-400"> · {l.city}{l.address ? ` · ${l.address}` : ""}</span>
              </span>
              <form action={deleteLocationAction}>
                <input type="hidden" name="id" value={l.id} />
                <button type="submit" title={t.common.delete} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
              </form>
            </li>
          ))}
          {company.locations.length === 0 && <li className="text-sm text-slate-400">{S.noLocations}</li>}
        </ul>
        <form action={createLocationAction} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <input name="name" className="input" placeholder={S.locationName} required />
          <input name="city" className="input" placeholder={S.city} required />
          <input name="address" className="input" placeholder={S.addrOptional} />
          <button type="submit" className="btn-primary"><Plus size={16} /> {t.common.add}</button>
        </form>
      </section>

      <section className="card p-6">
        <SectionHeader icon={Building2} title={S.branches} desc={S.branchesDesc} />
        <ul className="mb-4 flex flex-col gap-2">
          {company.branches.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm">
              <span>
                <span className="font-medium text-slate-900">{b.name}</span>
                <span className="text-slate-400"> · {b.city}{b.phone ? ` · ${b.phone}` : ""}</span>
              </span>
              <form action={deleteBranchAction}>
                <input type="hidden" name="id" value={b.id} />
                <button type="submit" title={t.common.delete} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
              </form>
            </li>
          ))}
          {company.branches.length === 0 && <li className="text-sm text-slate-400">{S.noBranches}</li>}
        </ul>
        <form action={createBranchAction} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <input name="name" className="input" placeholder={S.branchName} required />
          <input name="city" className="input" placeholder={S.city} required />
          <input name="phone" className="input" placeholder={S.phoneOptional} />
          <button type="submit" className="btn-primary"><Plus size={16} /> {t.common.add}</button>
        </form>
      </section>

      <section className="card p-6">
        <SectionHeader icon={UserCog} title={S.staff} desc={S.staffDesc} />
        <ul className="mb-4 flex flex-col gap-2">
          {company.users.map((u) => (
            <li key={u.id} className="flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm">
              <span className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{u.name.slice(0,1).toUpperCase()}</span>
                <span>
                  <span className="font-medium text-slate-900">{u.name}</span>
                  <span className="text-slate-400"> · {u.email}</span>
                </span>
                <span className={`badge ${u.role === "COMPANY_ADMIN" ? "bg-[var(--brand-50)] text-[var(--brand-700)] ring-[var(--brand-600)]/20" : u.role === "HANDOVER" ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20" : "bg-slate-100 text-slate-600 ring-slate-500/20"}`}>
                  {u.role === "COMPANY_ADMIN" ? S.roleAdmin : u.role === "HANDOVER" ? t.topbar.handoverStaff : t.topbar.staff}
                </span>
                {u.branch && <span className="badge bg-slate-100 text-slate-500 ring-slate-500/20">{u.branch.name}</span>}
                {u.id === session.userId && <span className="text-xs text-[var(--brand-600)]">{S.you}</span>}
              </span>
              {u.id !== session.userId && (
                <form action={deleteStaffAction}>
                  <input type="hidden" name="id" value={u.id} />
                  <button type="submit" title={t.common.delete} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                </form>
              )}
            </li>
          ))}
        </ul>
        <StaffForm branches={company.branches.map((b) => ({ id: b.id, name: b.name }))} labels={S} />
      </section>
    </div>
  );
}
