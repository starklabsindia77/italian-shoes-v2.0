import { prisma } from "@/lib/prisma";
import { ok, bad, server, requireAdmin, getSearchParams } from "@/lib/api-helpers";
import { GenerateVariantsSchema } from "@/lib/validators";
import crypto from "crypto";
import type { ProductOptionValue } from "@prisma/client";
// Typed cartesian helper
function cartesian<T>(...arrs: T[][]): T[][] {
  return arrs.reduce((a, b) => a.flatMap(x => b.map(y => [...x, y])), [[]] as T[][]);
}
const hash = (ids: string[]) =>
  crypto.createHash("sha1").update([...ids].sort().join("|")).digest("hex");

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const sp = getSearchParams(req);
    const q = sp.get("q") ?? undefined;
    const list = await prisma.productVariant.findMany({
      where: { productId: params.id, ...(q ? { sku: { contains: q, mode: "insensitive" } } : {}) },
      include: { options: { include: { option: true, value: true } } },
      orderBy: { createdAt: "desc" }
    });
    return ok(list);
  } catch (e) {
    return server(e);
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = GenerateVariantsSchema.safeParse(body);
    if (!parsed.success) return bad(parsed.error.message);

    const desired = parsed.data.optionCodes;

    // Load options in the exact order of `desired`, with typed values
    const options = await prisma.productOption.findMany({
      where: { productId: params.id, code: { in: desired } },
      include: { values: true },
      orderBy: { position: "asc" }
    });

    // Build typed grids (each array is ProductOptionValue[])
    const grids: ProductOptionValue[][] = desired.map((code) => {
      const opt = options.find((o) => o.code === code);
      return opt?.values ?? [];
    });

    if (grids.length === 0 || grids.some((g) => g.length === 0)) {
      return bad("Missing values for one or more option codes");
    }

    // Compute cartesian combos, typed
    const combos: ProductOptionValue[][] = cartesian<ProductOptionValue>(...grids);

    // Fallback price from product
    const p = await prisma.product.findUnique({
      where: { id: params.id },
      select: { price: true }
    });
    if (!p) return bad("Product not found", 404);

    const basePrice = parsed.data.priceOverride ?? p.price;
    const skuPrefix = (parsed.data.skuPrefix || "SKU").toUpperCase();

    await prisma.$transaction(async (tx) => {
      for (const combo of combos) {
        // combo is ProductOptionValue[]
        const optionValueIds = combo.map((v) => v.id);
        const optionsHash = hash(optionValueIds);
        const sku = `${skuPrefix}-${optionsHash.slice(0, 8).toUpperCase()}`;

        const variant = await tx.productVariant.upsert({
          where: { optionsHash },
          update: {},
          create: {
            productId: params.id,
            sku,
            price: basePrice,
            optionsHash
          }
        });

        // Link each chosen value to its option on this variant
        for (const opt of options) {
          // find value chosen for this option (by FK)
          const chosen = combo.find((v) => v.productOptionId === opt.id);
          if (!chosen) {
            throw new Error(`No value chosen for option ${opt.code}`);
          }

          await tx.productVariantOption.upsert({
            where: {
              productVariantId_productOptionId: {
                productVariantId: variant.id,
                productOptionId: opt.id
              }
            },
            update: { productOptionValueId: chosen.id },
            create: {
              productVariantId: variant.id,
              productOptionId: opt.id,
              productOptionValueId: chosen.id
            }
          });
        }
      }
    });

    return ok({ ok: true });
  } catch (e: any) {
    if (e?.code === 401 || e?.code === 403) return bad(e.message, e.code);
    return server(e);
  }
}
