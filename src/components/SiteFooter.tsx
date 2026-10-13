import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "./Logo";
import { site, nav } from "@/lib/site-config";

const socialIconClass = "flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-slate-500 transition hover:text-brand-700";

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.82-2.05 3.75-2.05C20.4 8.65 21 11 21 14.1V21h-4v-6.1c0-1.45-.03-3.3-2-3.3-2 0-2.3 1.57-2.3 3.2V21H9z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
      <path d="M18.9 2H22l-7.5 8.6L23.3 22h-6.9l-5.4-7-6.2 7H1.7l8-9.2L.9 2h7.1l4.9 6.5L18.9 2zm-2.4 18h1.9L7.6 4H5.6z" />
    </svg>
  );
}

const services = [
  { href: "/hizmetler/is-yonetim-danismanligi", label: "İş & Yönetim" },
  { href: "/hizmetler/mali-musavirlik", label: "Mali Müşavirlik" },
  { href: "/hizmetler/gocmenlik-vize", label: "Göçmenlik & Vize" },
  { href: "/hizmetler/yazilim-bt-danismanligi", label: "Yazılım & BT" },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-slate-50">
      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            {site.description}
          </p>
          <div className="mt-5 flex gap-3">
            <a href={site.social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className={socialIconClass}>
              <LinkedInIcon />
            </a>
            <a href={site.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className={socialIconClass}>
              <InstagramIcon />
            </a>
            <a href={site.social.twitter} target="_blank" rel="noreferrer" aria-label="X" className={socialIconClass}>
              <XIcon />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Sayfalar</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-brand-700">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Hizmetler</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
            {services.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-brand-700">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">İletişim</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand-600" />
              <span>{site.address}</span>
            </li>
            <li>
              <a href={`tel:${site.phoneHref}`} className="flex items-center gap-2.5 transition hover:text-brand-700">
                <Phone size={16} className="shrink-0 text-brand-600" /> {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex items-center gap-2.5 transition hover:text-brand-700">
                <Mail size={16} className="shrink-0 text-brand-600" /> {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} {site.name}. Tüm hakları saklıdır.</span>
          <span>{site.workingHours}</span>
        </div>
      </div>
    </footer>
  );
}
