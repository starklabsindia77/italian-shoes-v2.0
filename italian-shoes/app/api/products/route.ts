import { prisma } from "@/lib/prisma";
import { ok, bad, server, pagination, getSearchParams, requireAdmin } from "@/lib/api-helpers";
import { ProductCreateSchema } from "@/lib/validators";

export async function GET(req: Request) {
  try {
    const sp = getSearchParams(req);
    const q = sp.get("q")?.trim();
    const { skip, limit } = pagination(req);
    const where = q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { productId: { contains: q, mode: "insensitive" } }] } : {};
    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.product.count({ where })
    ]);
    return ok({ items, total, limit });
  } catch (e) { return server(e); }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = ProductCreateSchema.safeParse(body);
    if (!parsed.success) return bad(parsed.error.message);
    const d = parsed.data;

    const created = await prisma.$transaction(async (tx) => {
      // Create the product
      const product = await tx.product.create({
        data: {
          productId: d.productId,
          title: d.title, vendor: d.vendor ?? null, description: d.description,
          metaTitle: d.metaTitle, metaDescription: d.metaDescription, metaKeywords: d.metaKeywords,
          metaImage: d.metaImage, metaImageAlt: d.metaImageAlt ?? null, metaImageTitle: d.metaImageTitle ?? null,
          metaImageDescription: d.metaImageDescription ?? null, metaImageWidth: d.metaImageWidth ?? null, metaImageHeight: d.metaImageHeight ?? null,
          price: d.price, currency: d.currency, compareAtPrice: d.compareAtPrice ?? null,
          assets: d.assets ?? {},
          isActive: d.isActive ?? true
        }
      });

      // Handle material selections if provided
      if (d.selectedMaterials && d.selectedMaterials.length > 0) {
        // Get all panels to create material associations
        const panels = await tx.panel.findMany({ where: { isActive: true } });
        
        for (const selectedMaterial of d.selectedMaterials) {
          // Create a product panel for each panel with this material
          for (const panel of panels) {
            const productPanel = await tx.productPanel.create({
              data: {
                productId: product.id,
                panelId: panel.id,
                isCustomizable: true,
                defaultMaterialColorId: selectedMaterial.selectedColorIds[0] || null
              }
            });

            // Add allowed colors for this panel
            if (selectedMaterial.selectedColorIds.length > 0) {
              await tx.productPanelColor.createMany({
                data: selectedMaterial.selectedColorIds.map(colorId => ({
                  productPanelId: productPanel.id,
                  materialColorId: colorId
                }))
              });
            }
          }
        }
      }

      // Handle style selections if provided
      if (d.selectedStyles && d.selectedStyles.length > 0) {
        await tx.productStyle.createMany({
          data: d.selectedStyles.map(style => ({
            productId: product.id,
            styleId: style.id
          }))
        });
      }

      // Handle sole selections if provided
      if (d.selectedSoles && d.selectedSoles.length > 0) {
        await tx.productSole.createMany({
          data: d.selectedSoles.map(sole => ({
            productId: product.id,
            soleId: sole.id
          }))
        });
      }

      return product;
    });

    return ok(created, 201);
  } catch (e: any) {
    if (e?.code === 401 || e?.code === 403) return bad(e.message, e.code);
    return server(e);
  }
}


