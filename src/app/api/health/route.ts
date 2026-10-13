import { NextResponse } from "next/server";
import { count } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { service } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [row] = await getDb().select({ c: count() }).from(service);
    return NextResponse.json({ status: "ok", db: true, services: row?.c ?? 0, time: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { status: "error", db: false, message: String((e as Error)?.message ?? e) },
      { status: 503 }
    );
  }
}
