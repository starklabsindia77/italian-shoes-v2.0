// app/api/products/[id]/sizes/all/route.ts
import { prisma } from "@/lib/prisma";
import { ok, bad, server, requireAdmin } from "@/lib/api-helpers";


type ShoeWidth = "STANDARD" | "WIDE" | "EXTRA_WIDE" | "NARROW";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin?.();

    const body = await req.json().catch(() => ({} as any));
    const width = (body?.width as ShoeWidth) ?? "STANDARD";

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!product) return bad("Product not found", 404);

    const sizes = await prisma.size.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    if (sizes.length === 0) return ok({ created: 0, total: 0, items: [] });

    const existing = await prisma.productSize.findMany({
      where: { productId: params.id, width },
      select: { sizeId: true },
    });
    const existingSet = new Set(existing.map((e: any) => e.sizeId));

    const toCreate = sizes
      .filter((s: any) => !existingSet.has(s.id))
      .map((s: any) => ({ productId: params.id, sizeId: s.id, width }));

    if (toCreate.length) {
      await prisma.productSize.createMany({ data: toCreate, skipDuplicates: true });
    }

    const items = await prisma.productSize.findMany({
      where: { productId: params.id, width },
    });

    return ok({ created: toCreate.length, total: items.length, items });
  } catch (e) {
    return server(e);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin?.();

    const body = await req.json().catch(() => ({} as any));
    const width = (body?.width as ShoeWidth) ?? "STANDARD";

    const out = await prisma.productSize.deleteMany({
      where: { productId: params.id, width },
    });
    return ok({ deleted: out.count });
  } catch (e) {
    return server(e);
  }
}
