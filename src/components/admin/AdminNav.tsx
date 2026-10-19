"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MessageSquare, FileText, Calendar, Newspaper, Briefcase, LogOut, ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/admin/mesajlar", label: "Mesajlar", icon: MessageSquare, badgeKey: "messages" as const },
  { href: "/admin/basvurular", label: "Başvurular", icon: FileText, badgeKey: "applications" as const },
  { href: "/admin/randevular", label: "Randevular", icon: Calendar, badgeKey: "appointments" as const },
  { href: "/admin/yazilar", label: "Yazılar", icon: Newspaper },
  { href: "/admin/hizmetler", label: "Hizmetler", icon: Briefcase },
];

export function AdminNav({ badges }: { badges: { messages: number; appointments: number; applications: number } }) {
  const pathname = usePathname();
  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {LINKS.map((l) => {
          const count = l.badgeKey ? badges[l.badgeKey] : 0;
          return (
            <Link key={l.href} href={l.href} className={cn("nav-link", active(l.href, l.exact) && "nav-link-active")}>
              <l.icon size={18} />
              <span className="flex-1">{l.label}</span>
              {count > 0 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">{count}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t p-3">
        <Link href="/" target="_blank" className="nav-link">
          <ExternalLink size={18} /> Siteyi görüntüle
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="nav-link w-full text-left">
            <LogOut size={18} /> Çıkış yap
          </button>
        </form>
      </div>
    </div>
  );
}
