import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(session.role === "SUPER_ADMIN" ? "/admin" : "/panel");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="EasyDrive" className="h-10 w-10 object-contain" />
          <span className="text-xl font-semibold tracking-tight">EasyDrive</span>
        </Link>

        <div className="card p-6 sm:p-8">
          <h1 className="text-lg font-semibold">Panele Giriş</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">Firma personeli ve yöneticileri için.</p>
          <LoginForm />
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white/50 p-4 text-xs text-slate-500">
          <p className="mb-1.5 font-semibold text-slate-600">Demo hesapları</p>
          <div className="flex flex-col gap-0.5 font-mono">
            <span>admin@platform.com · super123</span>
            <span>admin@prishtinarent.com · firma123</span>
            <span>admin@prizrencars.com · firma123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
