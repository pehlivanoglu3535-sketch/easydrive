import { CompanyForm } from "./CompanyForm";
import { BackLink } from "@/components/BackLink";

export default function NewCompanyPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/admin">Firmalara dön</BackLink>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Yeni Firma Ekle</h1>
        <p className="mt-1 text-sm text-slate-500">Firma ve ilk yönetici hesabını oluşturun.</p>
      </div>
      <CompanyForm />
    </div>
  );
}
