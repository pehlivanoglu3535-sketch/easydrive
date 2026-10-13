import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  robots: { index: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  const [messages, appointments] = await Promise.all([
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
  ]);

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
