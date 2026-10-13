import { prisma } from "@/lib/db";
import { APPOINTMENT_HOURS, APPOINTMENT_WINDOW_DAYS } from "@/lib/site-config";

export type SlotDay = {
  date: string; // YYYY-MM-DD
  label: string; // "15 Ekim Çarşamba"
  slots: { iso: string; time: string }[];
};

function dayLabel(d: Date): string {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", weekday: "long" }).format(d);
}

/**
 * Önümüzdeki iş günleri için (hafta sonu hariç) boş randevu slotlarını üretir.
 * Dolu (bekleyen/onaylı) slotlar ve geçmiş saatler elenir.
 */
export async function getAvailableSlots(): Promise<SlotDay[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + APPOINTMENT_WINDOW_DAYS);

  const booked = await prisma.appointment.findMany({
    where: {
      slot: { gte: start, lte: end },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { slot: true },
  });
  const bookedSet = new Set(booked.map((b) => b.slot.getTime()));

  const days: SlotDay[] = [];
  for (let i = 0; i <= APPOINTMENT_WINDOW_DAYS; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    const dow = day.getDay();
    if (dow === 0 || dow === 6) continue; // hafta sonu kapalı

    const slots: { iso: string; time: string }[] = [];
    for (const hour of APPOINTMENT_HOURS) {
      const slot = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, 0, 0);
      if (slot.getTime() <= now.getTime()) continue; // geçmiş
      if (bookedSet.has(slot.getTime())) continue; // dolu
      slots.push({
        iso: slot.toISOString(),
        time: `${String(hour).padStart(2, "0")}:00`,
      });
    }
    if (slots.length > 0) {
      days.push({
        date: `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`,
        label: dayLabel(day),
        slots,
      });
    }
  }
  return days;
}

/** Bir ISO slotun geçerli (iş günü, çalışma saati, gelecekte) olup olmadığını doğrular. */
export function isValidSlot(iso: string): boolean {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  if (d.getTime() <= Date.now()) return false;
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return false;
  if (!(APPOINTMENT_HOURS as readonly number[]).includes(d.getHours())) return false;
  if (d.getMinutes() !== 0) return false;
  return true;
}
