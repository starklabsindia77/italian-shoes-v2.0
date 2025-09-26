import { prisma } from "@/lib/prisma";
import { ok, bad, server, pagination, getSearchParams, requireAdmin } from "@/lib/api-helpers";
import { ProductCreateSchema } from "@/lib/validators";

export async function GET(req: Request) {
  try {
    const sp = getSearchParams(req);
    const q = sp.get("q")?.trim();
    const { skip, limit } = pagination(req);
    const where = q ? { 
      OR: [
        { title: { contains: q, mode: "insensitive" as const } }, 
        { productId: { contains: q, mode: "insensitive" as const } }
      ] 
    } : {};
    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.product.count({ where })
    ]);
    return ok({ items, total, limit });
  } catch (e) { return server(e); }
}

export async function POST(req: Request) {
  try {
    // Require admin authentication
    const admin = await requireAdmin();
    if (!admin) return bad("Unauthorized", 401);

    const body = await req.json();
    const validatedData = ProductCreateSchema.parse(body);

    // Check if productId already exists
    const existingProduct = await prisma.product.findUnique({
      where: { productId: validatedData.productId }
    });
    if (existingProduct) {
      return bad("Product with this ID already exists", 400);
    }

    // Create the product with all related data
    const product = await prisma.product.create({
      data: {
        productId: validatedData.productId,
        title: validatedData.title,
        vendor: validatedData.vendor,
        description: validatedData.description,
        metaTitle: validatedData.metaTitle,
        metaDescription: validatedData.metaDescription,
        metaKeywords: validatedData.metaKeywords,
        metaImage: validatedData.metaImage,
        metaImageWidth: validatedData.metaImageWidth,
        metaImageHeight: validatedData.metaImageHeight,
        metaImageAlt: validatedData.metaImageAlt,
        metaImageTitle: validatedData.metaImageTitle,
        metaImageDescription: validatedData.metaImageDescription,
        price: validatedData.price,
        currency: validatedData.currency as any,
        compareAtPrice: validatedData.compareAtPrice,
        assets: validatedData.assets,
        isActive: validatedData.isActive ?? true,
        
        // Create related styles if provided
        styles: validatedData.selectedStyles ? {
          create: validatedData.selectedStyles.map(style => ({
            style: {
              connect: { id: style.id }
            }
          }))
        } : undefined,
        
        // Create related soles if provided
        soles: validatedData.selectedSoles ? {
          create: validatedData.selectedSoles.map(sole => ({
            sole: {
              connect: { id: sole.id }
            }
          }))
        } : undefined,
      },
      include: {
        styles: {
          include: {
            style: true
          }
        },
        soles: {
          include: {
            sole: true
          }
        },
        panels: {
          include: {
            panel: true,
            defaultMaterialColor: true,
            allowedColors: {
              include: {
                materialColor: true
              }
            }
          }
        }
      }
    });

    // Handle material selections and create panels if provided
    if (validatedData.selectedMaterials && validatedData.selectedMaterials.length > 0) {
      for (const materialSelection of validatedData.selectedMaterials) {
        // Find or create panels for this material
        const material = await prisma.material.findUnique({
          where: { id: materialSelection.materialId },
          include: { colors: true }
        });

        if (!material) {
          continue; // Skip if material doesn't exist
        }

        // Get all panels that can use this material
        const panels = await prisma.panel.findMany({
          where: { isActive: true }
        });

        for (const panel of panels) {
          // Create product panel
          const productPanel = await prisma.productPanel.create({
            data: {
              productId: product.id,
              panelId: panel.id,
              isCustomizable: true,
              defaultMaterialColorId: materialSelection.selectedColorIds[0] || null
            }
          });

          // Add allowed colors for this panel
          if (materialSelection.selectAllColors) {
            // Add all colors from this material
            const materialColors = await prisma.materialColor.findMany({
              where: { 
                materialId: materialSelection.materialId,
                isActive: true 
              }
            });

            await prisma.productPanelColor.createMany({
              data: materialColors.map(color => ({
                productPanelId: productPanel.id,
                materialColorId: color.id
              }))
            });
          } else if (materialSelection.selectedColorIds.length > 0) {
            // Add only selected colors
            await prisma.productPanelColor.createMany({
              data: materialSelection.selectedColorIds.map(colorId => ({
                productPanelId: productPanel.id,
                materialColorId: colorId
              }))
            });
          }
        }
      }
    }

    return ok(product, 201);
  } catch (e) {
    if (e instanceof Error && e.name === 'ZodError') {
      return bad("Validation error", 400);
    }
    return server(e);
  }
}



