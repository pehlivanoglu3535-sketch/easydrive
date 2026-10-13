import Link from "next/link";
import { site } from "@/lib/site-config";

export function Logo({ className = "h-9", href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center" aria-label={site.name}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt={site.name} className={`${className} w-auto`} />
    </Link>
  );
}
