import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "connected" });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "DB error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
