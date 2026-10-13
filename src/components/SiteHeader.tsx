"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, CalendarCheck } from "lucide-react";
import { Logo } from "./Logo";
import { nav } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/85 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "text-brand-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link href="/randevu" className="btn-accent btn-sm">
            <CalendarCheck size={15} /> Randevu Al
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="btn-ghost -mr-2 md:hidden"
          aria-label="Menü"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-white md:hidden">
          <nav className="container-site flex flex-col gap-1 py-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  isActive(item.href) ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/randevu" onClick={() => setOpen(false)} className="btn-accent mt-2">
              <CalendarCheck size={16} /> Randevu Al
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
