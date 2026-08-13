"use client";

import { useActionState, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Upload, ImageIcon, X } from "lucide-react";
import { updateCompanySettingsAction } from "@/lib/actions/settings";
import type { PanelDict } from "@/lib/i18n/panel-dict";

type Company = {
  name: string;
  primaryColor: string;
  logoUrl: string | null;
  defaultLocale: string;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  city: string;
  taxId: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  whatsapp: string | null;
};

const LOCALES = [
  { value: "sq", label: "Shqip" },
  { value: "en", label: "English" },
  { value: "sr", label: "Srpski" },
  { value: "tr", label: "Türkçe" },
];

export function BrandingForm({ company, labels, commonLabels }: { company: Company; labels: PanelDict["settings"]; commonLabels: PanelDict["common"] }) {
  const [state, action, pending] = useActionState(updateCompanySettingsAction, undefined);
  const S = labels;
  const [color, setColor] = useState(company.primaryColor);
  const [preview, setPreview] = useState<string | null>(company.logoUrl);
  const [removed, setRemoved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setPreview(URL.createObjectURL(f));
      setRemoved(false);
    }
  }

  function removeLogo() {
    setPreview(null);
    setRemoved(true);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-red-600/10">
          <AlertCircle size={16} /> {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700 ring-1 ring-emerald-600/10">
          <CheckCircle2 size={16} /> {S.savedOk}
        </div>
      )}

      {/* Logo + marka rengi */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Logo */}
        <div>
          <label className="label">{S.logo}</label>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-slate-50">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <ImageIcon size={26} className="text-slate-300" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline btn-sm">
                <Upload size={14} /> {S.uploadLogo}
              </button>
              {preview && (
                <button type="button" onClick={removeLogo} className="btn-ghost btn-sm text-red-600">
                  <X size={14} /> {S.removeLogo}
                </button>
              )}
              <p className="text-xs text-slate-400">{S.logoHint}</p>
            </div>
          </div>
          <input ref={fileRef} type="file" name="logoFile" accept="image/*" onChange={onFile} className="hidden" />
          <input type="hidden" name="removeLogo" value={removed ? "1" : "0"} />
        </div>

        {/* Marka rengi */}
        <div>
          <label className="label">{S.brandColor}</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="primaryColor"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-11 w-14 cursor-pointer rounded-lg border p-1"
            />
            <span className="rounded-lg border px-3 py-2 font-mono text-sm text-slate-600">{color.toUpperCase()}</span>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg border p-2.5" style={{ backgroundColor: `${color}12` }}>
            <span className="h-6 w-6 rounded-md" style={{ backgroundColor: color }} />
            <span className="text-xs text-slate-500">{S.brandColorHint}</span>
          </div>
        </div>
      </div>

      {/* Genel bilgiler */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">{S.companyName} *</label>
          <input id="name" name="name" className="input" defaultValue={company.name} required />
        </div>
        <div>
          <label className="label" htmlFor="city">{S.city}</label>
          <input id="city" name="city" className="input" defaultValue={company.city} />
        </div>
        <div>
          <label className="label" htmlFor="defaultLocale">{S.defaultLang}</label>
          <select id="defaultLocale" name="defaultLocale" className="input" defaultValue={company.defaultLocale}>
            {LOCALES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="contactPhone">{S.contactPhone}</label>
          <input id="contactPhone" name="contactPhone" className="input" defaultValue={company.contactPhone ?? ""} placeholder="+383 …" />
        </div>
        <div>
          <label className="label" htmlFor="contactEmail">{S.contactEmail}</label>
          <input id="contactEmail" name="contactEmail" type="email" className="input" defaultValue={company.contactEmail ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="address">{S.address}</label>
          <input id="address" name="address" className="input" defaultValue={company.address ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="taxId">{S.taxId}</label>
          <input id="taxId" name="taxId" className="input" defaultValue={company.taxId ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="website">{S.website}</label>
          <input id="website" name="website" className="input" defaultValue={company.website ?? ""} placeholder="www.firma.com" />
        </div>
        <div>
          <label className="label" htmlFor="whatsapp">{S.whatsapp}</label>
          <input id="whatsapp" name="whatsapp" className="input" defaultValue={company.whatsapp ?? ""} placeholder="+383 …" />
        </div>
        <div>
          <label className="label" htmlFor="instagram">{S.instagram}</label>
          <input id="instagram" name="instagram" className="input" defaultValue={company.instagram ?? ""} placeholder="@kullaniciadi" />
        </div>
        <div>
          <label className="label" htmlFor="facebook">{S.facebook}</label>
          <input id="facebook" name="facebook" className="input" defaultValue={company.facebook ?? ""} placeholder="facebook.com/sayfa" />
        </div>
      </div>

      <div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? commonLabels.saving : commonLabels.saveChanges}
        </button>
      </div>
    </form>
  );
}
