import { prisma } from "@/lib/prisma";
import { ok, bad, notFound, server, requireAdmin } from "@/lib/api-helpers";
import { ProductPanelUpsertSchema, ProductPanelColorsSetSchema } from "@/lib/validators";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id }, // ✅ string ID is correct for your schema
      include: {
        panels: {
          include: {
            panel: true,
            defaultMaterialColor: true,
            allowedColors: { include: { materialColor: true } },
          },
          orderBy: { panel: { sortOrder: "asc" } },
        },
      },
    });

    // If product exists but has no panels → return empty array instead of 404
    if (!product) return notFound("Product not found");

    return ok(product.panels ?? []);
  } catch (e) {
    return server(e);
  }
}



export async function POST(req: Request, { params }: { params: { id: string } }) {
  // Upsert one panel (meta only: customizable, modelUrl, default color)
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = ProductPanelUpsertSchema.safeParse(body);
    if (!parsed.success) return bad(parsed.error.message);
    const { panelId, ...rest } = parsed.data;

    const panel = await prisma.panel.findUnique({ where: { panelId } });
    if (!panel) return notFound("Panel not found");

    const pp = await prisma.productPanel.upsert({
      where: { productId_panelId: { productId: params.id, panelId: panel.id } },
      update: rest,
      create: { productId: params.id, panelId: panel.id, ...rest }
    });
    return ok(pp, 201);
  } catch (e: any) {
    if (e?.code === 401 || e?.code === 403) return bad(e.message, e.code);
    return server(e);
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  // Set allowed colors for a panel (replace all)
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = ProductPanelColorsSetSchema.safeParse(body);
    if (!parsed.success) return bad(parsed.error.message);

    const panel = await prisma.panel.findUnique({ where: { panelId: parsed.data.panelId } });
    if (!panel) return notFound("Panel not found");

    const pp = await prisma.productPanel.findUnique({
      where: { productId_panelId: { productId: params.id, panelId: panel.id } }
    });
    if (!pp) return notFound("ProductPanel not found, create via POST first");

    await prisma.$transaction([
      prisma.productPanelColor.deleteMany({ where: { productPanelId: pp.id } }),
      prisma.productPanelColor.createMany({
        data: parsed.data.materialColorIds.map((mcId) => ({ productPanelId: pp.id, materialColorId: mcId })),
        skipDuplicates: true
      })
    ]);

    const withColors = await prisma.productPanel.findUnique({
      where: { id: pp.id },
      include: { allowedColors: { include: { materialColor: true } } }
    });
    return ok(withColors);
  } catch (e: any) {
    if (e?.code === 401 || e?.code === 403) return bad(e.message, e.code);
    return server(e);
  }
}
