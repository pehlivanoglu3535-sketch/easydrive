import type { Metadata } from "next";
import { eq, count } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { contactMessage, appointment } from "@/lib/schema";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  robots: { index: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  const db = getDb();
  const [[m], [a]] = await Promise.all([
    db.select({ c: count() }).from(contactMessage).where(eq(contactMessage.status, "NEW")),
    db.select({ c: count() }).from(appointment).where(eq(appointment.status, "PENDING")),
  ]);
  const messages = m?.c ?? 0;
  const appointments = a?.c ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r bg-white lg:block">
        <AdminNav badges={{ messages, appointments }} />
      </aside>
      {/* Mobil üst bar */}
      <div className="border-b bg-white lg:hidden">
        <AdminNav badges={{ messages, appointments }} />
      </div>
      <main className="min-w-0 p-5 sm:p-8">{children}</main>
    </div>
  );
}
