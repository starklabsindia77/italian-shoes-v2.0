import { NextResponse } from "next/server";
import { requireAdmin, server } from "@/lib/api-helpers";
import { getDashboardMetrics } from "@/lib/dashboard-service";

export async function GET() {
  return server(async () => {
    await requireAdmin();
    const data = await getDashboardMetrics();
    return NextResponse.json(data);
  });
}
