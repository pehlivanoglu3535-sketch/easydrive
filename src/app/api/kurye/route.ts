import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { application } from "@/lib/schema";

export const dynamic = "force-dynamic";

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

  const name = str(form, "name");
  const phone = str(form, "phone");
  if (!name || !phone) {
    return NextResponse.json({ error: "Lütfen ad soyad ve telefon alanlarını doldurun." }, { status: 400 });
  }
  if (phone.replace(/[^0-9]/g, "").length < 7) {
    return NextResponse.json({ error: "Geçerli bir telefon numarası girin." }, { status: 400 });
  }

  try {
    await getDb().insert(application).values({
      serviceSlug: "wolt-kurye",
      applicantName: name,
      applicantEmail: str(form, "email").toLowerCase(),
      applicantPhone: phone,
      city: str(form, "city") || null,
      age: str(form, "age") || null,
      vehicle: str(form, "vehicle") || null,
      drivingLicense: str(form, "drivingLicense") || null,
      notes: str(form, "notes") || null,
    });
  } catch (err) {
    console.error("Kurye başvuru kaydı hatası:", err);
    return NextResponse.json({ error: "Başvurunuz kaydedilemedi. Lütfen tekrar deneyin." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
