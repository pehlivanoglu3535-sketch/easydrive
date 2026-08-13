"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Car,
  Users,
  Settings,
  Tag,
  BarChart3,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";

type NavKey = "dashboard" | "handover" | "reservations" | "cars" | "customers" | "pricing" | "reports" | "settings";
type Item = { href: string; key: NavKey; icon: LucideIcon; exact?: boolean; adminOnly?: boolean; office?: boolean };

const LINKS: Item[] = [
  { href: "/panel", key: "dashboard", icon: LayoutDashboard, exact: true, office: true },
  { href: "/panel/handover", key: "handover", icon: ClipboardCheck },
  { href: "/panel/reservations", key: "reservations", icon: CalendarCheck, office: true },
  { href: "/panel/cars", key: "cars", icon: Car, office: true },
  { href: "/panel/customers", key: "customers", icon: Users, office: true },
  { href: "/panel/pricing", key: "pricing", icon: Tag, office: true },
  { href: "/panel/reports", key: "reports", icon: BarChart3, office: true },
  { href: "/panel/settings", key: "settings", icon: Settings, adminOnly: true },
];

export function PanelNav({ isAdmin, isHandover, labels }: { isAdmin: boolean; isHandover: boolean; labels: Record<NavKey, string> }) {
  const pathname = usePathname();
  const links = LINKS.filter((l) => {
    if (isHandover) return !l.office && !l.adminOnly; // teslim personeli: yalnızca teslim
    if (l.adminOnly) return isAdmin;
    return true;
  });
  return (
    <nav className="flex flex-col gap-1">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            title={labels[l.key]}
            className={`nav-link justify-center md:justify-start ${active ? "nav-link-active" : ""}`}
          >
            <Icon size={18} strokeWidth={2} className="shrink-0" />
            <span className="hidden md:inline">{labels[l.key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
