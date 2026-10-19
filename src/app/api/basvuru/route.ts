import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { application } from "@/lib/schema";
import {
  getUploadsBucket,
  buildFileKey,
  ALLOWED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/lib/r2";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FileField = { field: "passport" | "criminalRecord" | "utilityBill"; required: boolean };
const FILE_FIELDS: FileField[] = [
  { field: "passport", required: true },
  { field: "criminalRecord", required: false },
  { field: "utilityBill", required: false },
];

function str(fd: FormData, key: string): string {
  return String(fd.get(key) || "").trim();
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Form verisi okunamadı." }, { status: 400 });
  }

  // Bal küpü (bot koruması)
  if (str(form, "website")) {
    return NextResponse.json({ ok: true });
  }

  const applicantName = str(form, "applicantName");
  const applicantEmail = str(form, "applicantEmail").toLowerCase();
  const applicantPhone = str(form, "applicantPhone");

  if (!applicantName || !applicantEmail) {
    return NextResponse.json({ error: "Lütfen ad soyad ve e-posta alanlarını doldurun." }, { status: 400 });
  }
  if (!EMAIL_RE.test(applicantEmail)) {
    return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
  }

  // Dosyaları doğrula (yüklemeden önce — hatada R2'ye yazmayalım)
  const toUpload: { field: string; file: File }[] = [];
  for (const { field, required } of FILE_FIELDS) {
    const f = form.get(field);
    const isFile = f instanceof File && f.size > 0;
    if (!isFile) {
      if (required) {
        return NextResponse.json({ error: "Pasaportun resimli sayfası zorunludur (net görüntü)." }, { status: 400 });
      }
      continue;
    }
    const file = f as File;
    if (!ALLOWED_UPLOAD_TYPES[file.type]) {
      return NextResponse.json(
        { error: "Belgeler yalnızca PDF, JPG, PNG veya WEBP olabilir." },
        { status: 400 }
      );
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Her belge en fazla 8 MB olabilir." }, { status: 400 });
    }
    toUpload.push({ field, file });
  }

  const appId = crypto.randomUUID();

  // R2'ye yükle
  const keys: Record<string, string> = {};
  try {
    const bucket = getUploadsBucket();
    for (const { field, file } of toUpload) {
      const key = buildFileKey(appId, field, file.type);
      await bucket.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type },
      });
      keys[field] = key;
    }
  } catch (err) {
    console.error("R2 upload hatası:", err);
    return NextResponse.json(
      { error: "Belgeler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin." },
      { status: 500 }
    );
  }

  // Kaydı oluştur
  try {
    await getDb().insert(application).values({
      id: appId,
      serviceSlug: str(form, "serviceSlug") || "sirket-kurulusu",
      applicantName,
      applicantEmail,
      applicantPhone: applicantPhone || null,
      companyName: str(form, "companyName") || null,
      companyEmail: str(form, "companyEmail") || null,
      capital: str(form, "capital") || null,
      directorName: str(form, "directorName") || null,
      companyAddress: str(form, "companyAddress") || null,
      naceCodes: str(form, "naceCodes") || null,
      partnerAddress: str(form, "partnerAddress") || null,
      notes: str(form, "notes") || null,
      passportKey: keys.passport ?? null,
      criminalRecordKey: keys.criminalRecord ?? null,
      utilityBillKey: keys.utilityBill ?? null,
    });
  } catch (err) {
    console.error("Başvuru kaydı hatası:", err);
    return NextResponse.json(
      { error: "Başvurunuz kaydedilemedi. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
