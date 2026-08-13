import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: true, time: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: "error", db: false }, { status: 503 });
  }
}
