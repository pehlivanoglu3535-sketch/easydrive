import Link from "next/link";
import { Home } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="container-site flex h-16 items-center">
        <Logo />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="text-7xl font-bold text-brand-100">404</div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Sayfa bulunamadı</h1>
        <p className="mt-2 max-w-sm text-slate-500">
          Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.
        </p>
        <Link href="/" className="btn-primary mt-7"><Home size={16} /> Ana sayfaya dön</Link>
      </div>
    </div>
  );
}
