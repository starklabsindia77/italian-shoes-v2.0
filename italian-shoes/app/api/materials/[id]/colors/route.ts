import { prisma } from "@/lib/prisma";
import { ok, bad, server, requireAdmin } from "@/lib/api-helpers";
import { MaterialColorCreateSchema } from "@/lib/validators";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const list = await prisma.materialColor.findMany({ where: { materialId: params.id } });
    return ok(list);
  } catch (e) { return server(e); }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const p = MaterialColorCreateSchema.safeParse({ ...body, materialId: params.id });
    if (!p.success) return bad(p.error.message);
    const c = await prisma.materialColor.create({ data: p.data });
    return ok(c, 201);
  } catch (e) { return server(e); }
}
