import Link from "next/link";
import { site } from "@/lib/site-config";

export function Logo({ className = "", mark = "#16305c", text = "text-slate-900" }: { className?: string; mark?: string; text?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`} aria-label={site.name}>
      <svg viewBox="0 0 64 64" className="h-9 w-9 shrink-0" aria-hidden>
        <rect width="64" height="64" rx="14" fill={mark} />
        <path d="M16 46V20l16 14 16-14v26" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="32" cy="50" r="3.2" fill="#c0922e" />
      </svg>
      <span className={`text-lg font-bold tracking-tight ${text}`}>
        {site.shortName}
        <span className="font-normal opacity-70"> Danışmanlık</span>
      </span>
    </Link>
  );
}
