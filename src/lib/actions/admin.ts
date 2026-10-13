"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { MessageStatus, AppointmentStatus } from "@prisma/client";

const MESSAGE_STATUSES: MessageStatus[] = ["NEW", "READ", "REPLIED", "ARCHIVED"];
const APPOINTMENT_STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

// ─────────── Mesajlar ───────────

export async function setMessageStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as MessageStatus;
  if (!id || !MESSAGE_STATUSES.includes(status)) return;
  await prisma.contactMessage.update({ where: { id }, data: { status } });
  revalidatePath("/admin/mesajlar");
  revalidatePath("/admin");
}

export async function deleteMessageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/mesajlar");
  revalidatePath("/admin");
}

// ─────────── Randevular ───────────

export async function setAppointmentStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as AppointmentStatus;
  if (!id || !APPOINTMENT_STATUSES.includes(status)) return;
  await prisma.appointment.update({ where: { id }, data: { status } });
  revalidatePath("/admin/randevular");
  revalidatePath("/admin");
}

export async function deleteAppointmentAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/admin/randevular");
  revalidatePath("/admin");
}

// ─────────── Yazılar (Blog) ───────────

export async function togglePostPublishedAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const post = await prisma.post.findUnique({ where: { id }, select: { published: true } });
  if (!post) return;
  await prisma.post.update({ where: { id }, data: { published: !post.published } });
  revalidatePath("/admin/yazilar");
  revalidatePath("/blog");
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.post.delete({ where: { id } });
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
  const author = String(formData.get("author") || "").trim() || "Meridyen Ekibi";
  const published = formData.get("published") === "on";

  if (!title || !excerpt || !content) {
    redirect(`/admin/yazilar/${id || "yeni"}?hata=1`);
  }

  let slug = String(formData.get("slug") || "").trim();
  slug = slug ? slugify(slug) : slugify(title);

  // Slug çakışmasını (bu kaydın kendisi hariç) benzersizleştir
  let unique = slug;
  let n = 1;
  while (true) {
    const clash = await prisma.post.findFirst({ where: { slug: unique, NOT: id ? { id } : undefined }, select: { id: true } });
    if (!clash) break;
    unique = `${slug}-${++n}`;
  }

  if (id) {
    await prisma.post.update({
      where: { id },
      data: { title, excerpt, content, category: category || null, author, published, slug: unique },
    });
  } else {
    await prisma.post.create({
      data: { title, excerpt, content, category: category || null, author, published, slug: unique },
    });
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
  const service = await prisma.service.findUnique({ where: { id }, select: { published: true } });
  if (!service) return;
  await prisma.service.update({ where: { id }, data: { published: !service.published } });
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

  await prisma.service.update({
    where: { id },
    data: { title, summary, description, features, icon, order, published },
  });

  revalidatePath("/admin/hizmetler");
  revalidatePath("/hizmetler");
  revalidatePath(`/hizmetler`);
  redirect("/admin/hizmetler");
}
