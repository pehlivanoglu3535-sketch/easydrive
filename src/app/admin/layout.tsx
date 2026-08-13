import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="EasyDrive" className="h-8 w-8 object-contain" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">EasyDrive</div>
              <div className="text-xs text-slate-400">Platform Yönetimi</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                {session.name.slice(0, 1).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700">{session.name}</span>
            </div>
            <LogoutButton className="btn-outline btn-sm" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}
