import { prisma } from "@/lib/prisma";
import { ok, bad, server, requireAdmin } from "@/lib/api-helpers";
import { ProductSizeLinkSchema } from "@/lib/validators";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const sizes = await prisma.productSize.findMany({ where: { productId: params.id }, include: { size: true } });
    return ok(sizes);
  } catch (e) { return server(e); }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = ProductSizeLinkSchema.safeParse(body);
    if (!parsed.success) return bad(parsed.error.message);

    const linked = await prisma.productSize.upsert({
      where: { productId_sizeId_width: { productId: params.id, sizeId: parsed.data.sizeId, width: parsed.data.width } },
      update: {},
      create: { productId: params.id, sizeId: parsed.data.sizeId, width: parsed.data.width }
    });
    return ok(linked, 201);
  } catch (e: any) {
    if (e?.code === 401 || e?.code === 403) return bad(e.message, e.code);
    return server(e);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const { sizeId, width } = await req.json();
    if (!sizeId || !width) return bad("sizeId and width required");
    await prisma.productSize.delete({ where: { productId_sizeId_width: { productId: params.id, sizeId, width } } });
    return ok({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") return bad("Link not found", 404);
    if (e?.code === 401 || e?.code === 403) return bad(e.message, e.code);
    return server(e);
  }
}
