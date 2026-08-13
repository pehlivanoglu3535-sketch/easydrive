import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPanelT } from "@/lib/i18n/panel";
import { PanelLocaleSwitcher } from "@/components/PanelLocaleSwitcher";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(session.role === "SUPER_ADMIN" ? "/admin" : "/panel");

  const { locale, t } = await getPanelT();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <PanelLocaleSwitcher current={locale} />
        </div>

        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="EasyDrive" className="h-10 w-10 object-contain" />
          <span className="text-xl font-semibold tracking-tight">EasyDrive</span>
        </Link>

        <div className="card p-6 sm:p-8">
          <h1 className="text-lg font-semibold">{t.login.title}</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">{t.login.subtitle}</p>
          <LoginForm labels={t.login} />
        </div>
      </div>
    </div>
  );
}
