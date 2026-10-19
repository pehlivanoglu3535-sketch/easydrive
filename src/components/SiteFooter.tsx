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
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79v8.44C19.61 23.08 24 18.09 24 12.07z" />
    </svg>
  );
}
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.73-.85-2-.95-.27-.1-.47-.15-.67.15-.2.3-.77.95-.95 1.15-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.73-.71 1.98-1.39.24-.68.24-1.26.17-1.39-.07-.12-.27-.2-.57-.35zM12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2z" />
    </svg>
  );
}

const services = [
  { href: "/hizmetler/sirket-kurulusu", label: "Şirket Kuruluşu" },
  { href: "/hizmetler/oturum-calisma-izni", label: "Oturum & Çalışma İzni" },
  { href: "/hizmetler/muhasebe-vergi", label: "Muhasebe & Vergi" },
  { href: "/hizmetler/yatirim-is-danismanligi", label: "Yatırım & İş Danışmanlığı" },
  { href: "/hizmetler/soy-bagi-ile-vatandaslik", label: "Soy Bağı ile Vatandaşlık" },
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
            <a href={site.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className={socialIconClass}>
              <FacebookIcon />
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
              <a href={`https://wa.me/${site.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 transition hover:text-brand-700">
                <span className="shrink-0 text-brand-600"><WhatsAppIcon /></span> {site.whatsapp}
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
