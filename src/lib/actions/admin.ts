"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { contactMessage, appointment, post, service } from "@/lib/schema";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { MessageStatus, AppointmentStatus } from "@/lib/schema";

const MESSAGE_STATUSES: MessageStatus[] = ["NEW", "READ", "REPLIED", "ARCHIVED"];
const APPOINTMENT_STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

// ─────────── Mesajlar ───────────

export async function setMessageStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as MessageStatus;
  if (!id || !MESSAGE_STATUSES.includes(status)) return;
  await getDb().update(contactMessage).set({ status }).where(eq(contactMessage.id, id));
  revalidatePath("/admin/mesajlar");
  revalidatePath("/admin");
}

export async function deleteMessageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await getDb().delete(contactMessage).where(eq(contactMessage.id, id));
  revalidatePath("/admin/mesajlar");
  revalidatePath("/admin");
}

// ─────────── Randevular ───────────

export async function setAppointmentStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as AppointmentStatus;
  if (!id || !APPOINTMENT_STATUSES.includes(status)) return;
  await getDb().update(appointment).set({ status }).where(eq(appointment.id, id));
  revalidatePath("/admin/randevular");
  revalidatePath("/admin");
}

export async function deleteAppointmentAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await getDb().delete(appointment).where(eq(appointment.id, id));
  revalidatePath("/admin/randevular");
  revalidatePath("/admin");
}

// ─────────── Yazılar (Blog) ───────────

export async function togglePostPublishedAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const db = getDb();
  const row = await db.query.post.findFirst({ where: (p, { eq: e }) => e(p.id, id), columns: { published: true } });
  if (!row) return;
  await db.update(post).set({ published: !row.published }).where(eq(post.id, id));
  revalidatePath("/admin/yazilar");
  revalidatePath("/blog");
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await getDb().delete(post).where(eq(post.id, id));
  revalidatePath("/admin/yazilar");
  revalidatePath("/blog");
  redirect("/admin/yazilar");
}

export async function savePostAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const author = String(formData.get("author") || "").trim() || "ProKosova Solutions";
  const published = formData.get("published") === "on";

  if (!title || !excerpt || !content) {
    redirect(`/admin/yazilar/${id || "yeni"}?hata=1`);
  }

  const db = getDb();
  let slug = String(formData.get("slug") || "").trim();
  slug = slug ? slugify(slug) : slugify(title);

  // Slug çakışmasını (bu kaydın kendisi hariç) benzersizleştir
  let unique = slug;
  let n = 1;
  for (;;) {
    const clash = await db.query.post.findFirst({
      where: (p, { and, eq: e, ne }) => (id ? and(e(p.slug, unique), ne(p.id, id)) : e(p.slug, unique)),
      columns: { id: true },
    });
    if (!clash) break;
    unique = `${slug}-${++n}`;
  }

  const values = { title, excerpt, content, category: category || null, author, published, slug: unique };
  if (id) {
    await db.update(post).set(values).where(eq(post.id, id));
  } else {
    await db.insert(post).values(values);
  }

  revalidatePath("/admin/yazilar");
  revalidatePath("/blog");
  redirect("/admin/yazilar");
}

// ─────────── Hizmetler ───────────

export async function toggleServicePublishedAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const db = getDb();
  const row = await db.query.service.findFirst({ where: (s, { eq: e }) => e(s.id, id), columns: { published: true } });
  if (!row) return;
  await db.update(service).set({ published: !row.published }).where(eq(service.id, id));
  revalidatePath("/admin/hizmetler");
  revalidatePath("/hizmetler");
}

export async function saveServiceAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const features = String(formData.get("features") || "").trim();
  const icon = String(formData.get("icon") || "Briefcase").trim();
  const order = parseInt(String(formData.get("order") || "0"), 10) || 0;
  const published = formData.get("published") === "on";

  if (!id || !title || !summary || !description) {
    redirect(`/admin/hizmetler/${id}?hata=1`);
  }

  await getDb()
    .update(service)
    .set({ title, summary, description, features, icon, order, published })
    .where(eq(service.id, id));

  revalidatePath("/admin/hizmetler");
  revalidatePath("/hizmetler");
  redirect("/admin/hizmetler");
}
