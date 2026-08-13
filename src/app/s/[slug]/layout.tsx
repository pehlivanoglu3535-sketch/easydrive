import Link from "next/link";
import { Car, Phone, Mail } from "lucide-react";
import { getCompanyContext } from "@/lib/site";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { company, locale, dict } = await getCompanyContext(slug);

  return (
    <div className="flex min-h-screen flex-col">
      <header style={{ backgroundColor: company.primaryColor }} className="text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href={`/s/${slug}`} className="flex items-center gap-2 text-lg font-bold">
            {company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoUrl} alt={company.name} className="h-8 w-auto" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20"><Car size={18} /></span>
            )}
            {company.name}
          </Link>
          <LocaleSwitcher current={locale} />
        </div>
      </header>

      <main className="flex-1 bg-slate-50">{children}</main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-sm text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} {company.name}</span>
          <span className="flex items-center gap-4">
            {company.contactPhone && <a href={`tel:${company.contactPhone}`} className="inline-flex items-center gap-1.5 hover:text-slate-900"><Phone size={14} /> {company.contactPhone}</a>}
            {company.contactEmail && <a href={`mailto:${company.contactEmail}`} className="inline-flex items-center gap-1.5 hover:text-slate-900"><Mail size={14} /> {company.contactEmail}</a>}
          </span>
          <span className="text-xs text-slate-400">{dict.footer.poweredBy} RentFlow</span>
        </div>
      </footer>
    </div>
  );
}
