import "server-only";
import { prisma } from "./db";

export type AlertType = "insurance" | "kasko" | "inspection" | "service";
export type AlertSeverity = "overdue" | "urgent" | "warning";

export type FleetAlert = {
  carId: string;
  carLabel: string;
  plate: string;
  type: AlertType;
  label: string;
  dueDate: Date | null;
  daysLeft: number | null;
  kmLeft?: number | null;
  severity: AlertSeverity;
};

const DAY = 24 * 60 * 60 * 1000;
const WARN_DAYS = 30; // bu kadar gün kala uyar
const URGENT_DAYS = 10; // bu kadar gün kala "acil"
const SERVICE_KM_THRESHOLD = 1000; // bakıma bu kadar km kala uyar

export const ALERT_LABELS: Record<AlertType, string> = {
  insurance: "Trafik Sigortası",
  kasko: "Kasko",
  inspection: "Muayene",
  service: "Bakım",
};

function startOfToday(): number {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t.getTime();
}

function daysUntil(date: Date): number {
  return Math.ceil((new Date(date).getTime() - startOfToday()) / DAY);
}

function severityForDays(daysLeft: number): AlertSeverity {
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= URGENT_DAYS) return "urgent";
  return "warning";
}

type CarLike = {
  id: string;
  make: string;
  model: string;
  plate: string;
  mileage: number;
  insuranceDate: Date | null;
  kaskoDate: Date | null;
  inspectionDate: Date | null;
  nextServiceDate: Date | null;
  nextServiceKm: number | null;
};

/** Tek bir araç için (eşik içindeki veya süresi geçmiş) uyarıları üretir. */
export function computeCarAlerts(car: CarLike): FleetAlert[] {
  const label = `${car.make} ${car.model}`;
  const out: FleetAlert[] = [];

  const dateChecks: { type: AlertType; date: Date | null }[] = [
    { type: "insurance", date: car.insuranceDate },
    { type: "kasko", date: car.kaskoDate },
    { type: "inspection", date: car.inspectionDate },
    { type: "service", date: car.nextServiceDate },
  ];

  for (const { type, date } of dateChecks) {
    if (!date) continue;
    const daysLeft = daysUntil(date);
    if (daysLeft <= WARN_DAYS) {
      out.push({
        carId: car.id, carLabel: label, plate: car.plate,
        type, label: ALERT_LABELS[type], dueDate: date, daysLeft,
        severity: severityForDays(daysLeft),
      });
    }
  }

  // Km bazlı bakım (tarih bazlı bakım yoksa)
  if (!car.nextServiceDate && car.nextServiceKm != null) {
    const kmLeft = car.nextServiceKm - car.mileage;
    if (kmLeft <= SERVICE_KM_THRESHOLD) {
      out.push({
        carId: car.id, carLabel: label, plate: car.plate,
        type: "service", label: ALERT_LABELS.service, dueDate: null, daysLeft: null,
        kmLeft, severity: kmLeft < 0 ? "overdue" : "urgent",
      });
    }
  }

  return out;
}

const SEV_ORDER: Record<AlertSeverity, number> = { overdue: 0, urgent: 1, warning: 2 };

/** Firmanın tüm filo uyarıları — en kritikten sıralı. */
export async function getFleetAlerts(companyId: string): Promise<FleetAlert[]> {
  const cars = await prisma.car.findMany({
    where: { companyId, status: { not: "RETIRED" } },
    select: {
      id: true, make: true, model: true, plate: true, mileage: true,
      insuranceDate: true, kaskoDate: true, inspectionDate: true,
      nextServiceDate: true, nextServiceKm: true,
    },
  });

  const alerts = cars.flatMap(computeCarAlerts);
  alerts.sort((a, b) => {
    if (SEV_ORDER[a.severity] !== SEV_ORDER[b.severity]) return SEV_ORDER[a.severity] - SEV_ORDER[b.severity];
    return (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999);
  });
  return alerts;
}

/** İnsan-okur kalan süre metni. */
export function alertTimeText(a: FleetAlert): string {
  if (a.daysLeft != null) {
    if (a.daysLeft < 0) return `${Math.abs(a.daysLeft)} gün geçti`;
    if (a.daysLeft === 0) return "bugün";
    return `${a.daysLeft} gün kaldı`;
  }
  if (a.kmLeft != null) {
    if (a.kmLeft < 0) return `${Math.abs(a.kmLeft).toLocaleString("tr-TR")} km geçti`;
    return `${a.kmLeft.toLocaleString("tr-TR")} km kaldı`;
  }
  return "";
}
