import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Yönetim Girişi",
  robots: { index: false },
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="container-site flex h-16 items-center">
        <Logo />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="card p-8">
            <h1 className="text-xl font-bold">Yönetim Paneli</h1>
            <p className="mt-1 text-sm text-slate-500">Devam etmek için giriş yapın.</p>
            <div className="mt-6">
              <LoginForm />
            </div>
          </div>
          <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-700">
            <ArrowLeft size={15} /> Siteye dön
          </Link>
        </div>
      </div>
    </div>
  );
}
