import { prisma } from "@/lib/prisma";
import { ok, bad, server, notFound, requireAdmin } from "@/lib/api-helpers";
import { ProductOptionCreateSchema } from "@/lib/validators";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const list = await prisma.productOption.findMany({
      where: { productId: params.id },
      include: { values: true },
      orderBy: { position: "asc" }
    });
    return ok(list);
  } catch (e) { return server(e); }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = ProductOptionCreateSchema.safeParse(body);
    if (!parsed.success) return bad(parsed.error.message);
    const o = await prisma.productOption.create({ data: { productId: params.id, ...parsed.data } });
    return ok(o, 201);
  } catch (e: any) {
    if (e?.code === 401 || e?.code === 403) return bad(e.message, e.code);
    return server(e);
  }
}
