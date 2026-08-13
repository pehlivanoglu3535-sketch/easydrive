"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createCompanyAction } from "@/lib/actions/companies";

const LOCALES = [
  { value: "sq", label: "Shqip (Arnavutça)" },
  { value: "en", label: "English" },
  { value: "sr", label: "Srpski (Sırpça)" },
  { value: "tr", label: "Türkçe" },
];

export function CompanyForm() {
  const [state, action, pending] = useActionState(createCompanyAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-6">
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="card p-6">
        <h2 className="mb-4 font-semibold">Firma Bilgileri</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">Firma Adı *</label>
            <input id="name" name="name" className="input" placeholder="Prishtina Rent a Car" required />
          </div>
          <div>
            <label className="label" htmlFor="slug">Site Adresi (/s/…)</label>
            <input id="slug" name="slug" className="input" placeholder="prishtina-rent (boş bırak = otomatik)" />
          </div>
          <div>
            <label className="label" htmlFor="city">Şehir</label>
            <input id="city" name="city" className="input" defaultValue="Prishtinë" />
          </div>
          <div>
            <label className="label" htmlFor="defaultLocale">Varsayılan Dil</label>
            <select id="defaultLocale" name="defaultLocale" className="input" defaultValue="sq">
              {LOCALES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="contactEmail">İletişim E-posta</label>
            <input id="contactEmail" name="contactEmail" type="email" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="contactPhone">İletişim Telefon</label>
            <input id="contactPhone" name="contactPhone" className="input" placeholder="+383 …" />
          </div>
          <div>
            <label className="label" htmlFor="address">Adres</label>
            <input id="address" name="address" className="input" placeholder="Cadde, No, Şehir" />
          </div>
          <div>
            <label className="label" htmlFor="taxId">Vergi No (NUI)</label>
            <input id="taxId" name="taxId" className="input" placeholder="Fiscal / NUI" />
          </div>
          <div>
            <label className="label" htmlFor="primaryColor">Marka Rengi</label>
            <input id="primaryColor" name="primaryColor" type="color" className="input h-11 p-1" defaultValue="#2563eb" />
          </div>
          <div>
            <label className="label" htmlFor="status">Abonelik Durumu</label>
            <select id="status" name="status" className="input" defaultValue="TRIAL">
              <option value="TRIAL">Deneme</option>
              <option value="ACTIVE">Aktif</option>
              <option value="SUSPENDED">Askıda</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="logoFile">Logo</label>
            <input id="logoFile" name="logoFile" type="file" accept="image/*" className="input py-1.5" />
            <p className="mt-1 text-xs text-slate-400">Yüklenen logo panelde ve tüm basılı evraklarda görünür.</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-semibold">Web & Sosyal Hesaplar</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="website">Web Sitesi</label>
            <input id="website" name="website" className="input" placeholder="www.firma.com" />
          </div>
          <div>
            <label className="label" htmlFor="whatsapp">WhatsApp</label>
            <input id="whatsapp" name="whatsapp" className="input" placeholder="+383 …" />
          </div>
          <div>
            <label className="label" htmlFor="instagram">Instagram</label>
            <input id="instagram" name="instagram" className="input" placeholder="@kullaniciadi" />
          </div>
          <div>
            <label className="label" htmlFor="facebook">Facebook</label>
            <input id="facebook" name="facebook" className="input" placeholder="facebook.com/sayfa" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-1 font-semibold">Firma Yöneticisi (İlk Hesap)</h2>
        <p className="mb-4 text-sm text-slate-500">
          Bu hesapla firma yetkilisi panele giriş yapacak.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="adminName">Ad Soyad *</label>
            <input id="adminName" name="adminName" className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="adminEmail">E-posta *</label>
            <input id="adminEmail" name="adminEmail" type="email" className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="adminPassword">Şifre *</label>
            <input id="adminPassword" name="adminPassword" type="text" className="input" placeholder="En az 6 karakter" required minLength={6} />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Oluşturuluyor…" : "Firmayı Oluştur"}
        </button>
        <Link href="/admin" className="btn-outline">Vazgeç</Link>
      </div>
    </form>
  );
}
