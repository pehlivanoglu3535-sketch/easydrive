// Basılı evraklar için üç dilli metinler (Arnavutça / İngilizce / Türkçe — alt alta).
// Değerler (isim, plaka, sayı) dile bağlı değildir; yalnızca etiket/başlık/şartlar çevrilir.

type Tri = [sq: string, en: string, tr: string];

export const DOC: Record<string, Tri> = {
  // Başlıklar
  contractTitle: ["Kontrata e Qirasë së Veturës", "Vehicle Rental Agreement", "Araç Kiralama Sözleşmesi"],
  returnTitle: ["Procesverbali i Kthimit të Veturës", "Vehicle Return Report", "Araç İade Tutanağı"],
  contractNo: ["Nr. i Kontratës", "Contract No", "Sözleşme No"],
  date: ["Data", "Date", "Tarih"],

  // Taraflar
  lessor: ["Qiradhënësi (Firma)", "Lessor (Company)", "Kiralayan (Firma)"],
  lessee: ["Qiramarrësi (Klienti)", "Lessee (Customer)", "Kiracı (Müşteri)"],
  title2: ["Emërtimi", "Name", "Ünvan"],
  city: ["Qyteti", "City", "Şehir"],
  phone: ["Telefoni", "Phone", "Telefon"],
  taxNo: ["Nr. Fiskal", "Tax No", "Vergi No"],
  fullName: ["Emri dhe Mbiemri", "Full Name", "Ad Soyad"],
  idNo: ["ID / Pasaporta", "ID / Passport", "Kimlik / Pasaport"],
  licenseNo: ["Nr. i Patentës", "License No", "Ehliyet No"],

  // Araç
  vehicle: ["Të dhënat e Veturës", "Vehicle Details", "Araç Bilgileri"],
  makeModel: ["Marka / Modeli", "Make / Model", "Marka / Model"],
  plate: ["Targa", "Plate", "Plaka"],
  year: ["Viti", "Year", "Yıl"],
  category: ["Kategoria", "Category", "Kategori"],

  // Kiralama
  rentalInfo: ["Të dhënat e Qirasë", "Rental Details", "Kiralama Bilgileri"],
  pickupDate: ["Data e Marrjes", "Pick-up Date", "Alış Tarihi"],
  returnDate: ["Data e Kthimit", "Return Date", "İade Tarihi"],
  pickupPlace: ["Vendi i Marrjes", "Pick-up Location", "Alış Yeri"],
  returnPlace: ["Vendi i Kthimit", "Return Location", "İade Yeri"],
  duration: ["Kohëzgjatja", "Duration", "Süre"],
  dailyRate: ["Çmimi Ditor", "Daily Rate", "Günlük Ücret"],
  pickupKm: ["Km në Dorëzim", "Pick-up Mileage", "Teslim Km"],
  returnKm: ["Km në Kthim", "Return Mileage", "İade Km"],
  fuelOut: ["Karburanti (dalje)", "Fuel (out)", "Yakıt (çıkış)"],
  fuelIn: ["Karburanti (kthim)", "Fuel (in)", "Yakıt (iade)"],
  deposit: ["Depozita", "Deposit", "Depozito"],
  rentalAmount: ["Vlera e Qirasë", "Rental Amount", "Kiralama Bedeli"],
  insurance: ["Sigurimi", "Insurance", "Sigorta"],
  extras: ["Shërbime Shtesë", "Extra Services", "Ek Hizmet"],
  grandTotal: ["Totali i Përgjithshëm", "Grand Total", "Genel Toplam"],
  days: ["ditë", "days", "gün"],

  // Ek sürücü & hasar
  extraDriver: ["Shofer Shtesë", "Additional Driver", "Ek Sürücü"],
  damageCond: ["Dëmi / Gjendja", "Damage / Condition", "Hasar / Durum"],
  note: ["Shënim", "Note", "Not"],

  // Şartlar
  termsTitle: ["Kushtet e Kontratës (përmbledhje)", "Contract Terms (summary)", "Sözleşme Şartları (özet)"],
  terms: [
    "Qiramarrësi pranon ta kthejë veturën në datën dhe orën e caktuar, në gjendjen që e mori. Karburanti duhet të kthehet në të njëjtin nivel. Gjobat, dëmet dhe karburanti i munguar i takojnë qiramarrësit. Vetura mund të drejtohet vetëm nga zotëruesi i patentës valide. Depozita kthehet nëse nuk ka dëm/mungesë.",
    "The lessee agrees to return the vehicle at the agreed date and time in the condition received. Fuel must be returned at the same level. Traffic fines, damage and missing fuel are the lessee's responsibility. The vehicle may only be driven by a valid license holder. The deposit is refunded if there is no damage/shortage.",
    "Kiracı, aracı sözleşmede belirtilen tarih ve saatte, teslim aldığı durumda iade etmeyi kabul eder. Yakıt aynı seviyede teslim edilmelidir. Trafik cezaları, hasar ve eksik yakıt kiracıya aittir. Araç yalnızca geçerli ehliyet sahibi tarafından kullanılabilir. Depozito, hasar/eksik yoksa iade edilir.",
  ],

  // İmza
  signCompany: ["Firma · Nënshkrimi", "Company · Signature", "Firma · İmza"],
  signCustomer: ["Klienti · Nënshkrimi", "Customer · Signature", "Kiracı · İmza"],
  signedOn: ["U nënshkrua më", "Signed on", "İmzalandı"],

  // İade tutanağı
  vehicleShort: ["Vetura", "Vehicle", "Araç"],
  handoverOut: ["DORËZIMI (Dalje)", "HANDOVER (Out)", "TESLİM (Çıkış)"],
  returnIn: ["KTHIMI (Dönüş)", "RETURN", "İADE (Dönüş)"],
  mileage: ["Kilometrazhi", "Mileage", "Kilometre"],
  fuel: ["Karburanti", "Fuel", "Yakıt"],
  damage: ["Dëmi", "Damage", "Hasar"],
  noPhoto: ["Nuk ka foto.", "No photos.", "Fotoğraf yok."],
  summary: ["Përmbledhje", "Summary", "Özet"],
  kmDriven: ["Km e Përshkuar", "Km Driven", "Katedilen Km"],
  fuelStatus: ["Gjendja e Karburantit", "Fuel Status", "Yakıt Durumu"],
  fuelMissing: ["I munguar", "Missing", "Eksik"],
  fuelExtra: ["I tepërt", "Extra", "Fazla"],
  fuelSame: ["I njëjtë", "Same", "Aynı"],
  receivedBy: ["Pranoi (Firma) · Nënshkrimi", "Received by (Company) · Signature", "Teslim Alan (Firma) · İmza"],
  returnedBy: ["Dorëzoi (Klienti) · Nënshkrimi", "Returned by (Customer) · Signature", "Teslim Eden (Kiracı) · İmza"],
};

/** Üç dilli etiket — alt alta (sq / en / tr). */
export function T({ k, className = "" }: { k: keyof typeof DOC; className?: string }) {
  const [sq, en, tr] = DOC[k];
  return (
    <span className={`flex flex-col leading-tight ${className}`}>
      <span>{sq}</span>
      <span className="opacity-80">{en}</span>
      <span className="opacity-80">{tr}</span>
    </span>
  );
}

/** Üç dilli paragraf bloğu (şartlar). */
export function TBlock({ k, className = "" }: { k: keyof typeof DOC; className?: string }) {
  const [sq, en, tr] = DOC[k];
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <p>{sq}</p>
      <p>{en}</p>
      <p>{tr}</p>
    </div>
  );
}

/** Değerlere dilden bağımsız tarih (GG.AA.YYYY). */
export function dmy(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const x = new Date(d);
  if (isNaN(x.getTime())) return "—";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(x.getDate())}.${p(x.getMonth() + 1)}.${x.getFullYear()}`;
}
