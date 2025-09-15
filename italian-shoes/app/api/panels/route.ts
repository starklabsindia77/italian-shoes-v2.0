import { prisma } from "@/lib/prisma";
import { ok, bad, server, pagination, getSearchParams, requireAdmin } from "@/lib/api-helpers";
import { PanelCreateSchema } from "@/lib/validators";

export async function GET(req: Request) {
  try {
    const sp = getSearchParams(req);
    const q = sp.get("q")?.trim();
    const { skip, limit } = pagination(req);

    const where = q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { panelId: { contains: q, mode: "insensitive" } }] }
      : {};

    const [items, total] = await Promise.all([
      prisma.panel.findMany({ where, skip, take: limit, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
      prisma.panel.count({ where })
    ]);
    return ok({ items, total, limit });
  } catch (e) { return server(e); }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = PanelCreateSchema.safeParse(body);
    if (!parsed.success) return bad(parsed.error.message);

    const created = await prisma.panel.create({ data: parsed.data });
    return ok(created, 201);
  } catch (e) { return server(e); }
}
