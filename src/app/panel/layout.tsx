import Link from "next/link";
import { ExternalLink, Bell } from "lucide-react";
import { requireCompany } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { brandVars } from "@/lib/color";
import { getFleetAlerts } from "@/lib/alerts";
import { getPanelT } from "@/lib/i18n/panel";
import { PanelNav } from "@/components/PanelNav";
import { LogoutButton } from "@/components/LogoutButton";
import { PanelLocaleSwitcher } from "@/components/PanelLocaleSwitcher";
import type { CSSProperties } from "react";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireCompany();
  const { locale, t } = await getPanelT();
  const company = await prisma.company.findUnique({
    where: { id: session.companyId },
    select: { name: true, slug: true, primaryColor: true, logoUrl: true },
  });

  const initials = (company?.name || "F")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const alertCount = (await getFleetAlerts(session.companyId)).length;
  const brandStyle = brandVars(company?.primaryColor || "#4f46e5") as CSSProperties;

  return (
    <div className="min-h-screen bg-[var(--background)]" style={brandStyle}>
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-16 flex-col border-r bg-white md:w-64">
        {/* Marka */}
        <div className="flex h-16 items-center gap-2.5 border-b px-3 md:px-5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: company?.primaryColor || "#4f46e5" }}
          >
            {company?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              initials
            )}
          </div>
          <span className="hidden truncate text-sm font-semibold md:block">{company?.name}</span>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-2 py-4 md:px-3">
          <PanelNav isAdmin={session.role === "COMPANY_ADMIN"} isHandover={session.role === "HANDOVER"} labels={t.nav} />
        </div>

        {/* Kullanıcı */}
        <div className="border-t p-2 md:p-3">
          <div className="hidden items-center gap-2.5 rounded-lg px-2 py-1.5 md:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
              {session.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{session.name}</div>
              <div className="truncate text-xs text-slate-400">
                {session.role === "COMPANY_ADMIN" ? t.topbar.admin : session.role === "HANDOVER" ? t.topbar.handoverStaff : t.topbar.staff}
              </div>
            </div>
          </div>
          <div className="mt-1">
            <LogoutButton className="btn-ghost w-full justify-center md:justify-start" label={t.topbar.logout} />
          </div>
        </div>
      </aside>

      {/* İçerik */}
      <div className="pl-16 md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/80 px-4 backdrop-blur md:px-8">
          <span className="text-sm font-medium text-slate-400">{t.topbar.title}</span>
          <div className="flex items-center gap-2">
            <PanelLocaleSwitcher current={locale} />
            {session.role !== "HANDOVER" && (
              <Link href="/panel" title={t.dashboard.docAlerts} className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                <Bell size={18} />
                {alertCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {alertCount}
                  </span>
                )}
              </Link>
            )}
            {company && (
              <Link href={`/s/${company.slug}`} target="_blank" className="btn-outline btn-sm">
                <ExternalLink size={14} />
                <span className="hidden sm:inline">{t.topbar.viewSite}</span>
                <span className="sm:hidden">{t.topbar.site}</span>
              </Link>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
