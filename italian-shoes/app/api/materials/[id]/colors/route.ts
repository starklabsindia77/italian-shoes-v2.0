import { prisma } from "@/lib/prisma";
import { ok, bad, server, requireAdmin } from "@/lib/api-helpers";
import { MaterialColorCreateSchema } from "@/lib/validators";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const list = await prisma.materialColor.findMany({ where: { materialId: id } });
    return ok(list);
  } catch (e) { return server(e); }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id } = await params;
    const p = MaterialColorCreateSchema.safeParse({ ...body, materialId: id });
    if (!p.success) return bad(p.error.message);
    const c = await prisma.materialColor.create({ data: p.data });
    return ok(c, 201);
  } catch (e) { return server(e); }
}
