import { prisma } from "@/lib/prisma";
import { ok, notFound, bad, server, requireAdmin } from "@/lib/api-helpers";
import { MaterialColorCreateSchema } from "@/lib/validators";

// ✅ GET all colors for a material
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ await here
    const m = await prisma.material.findUnique({
      where: { id },
      include: { colors: true },
    });
    return m ? ok(m) : notFound();
  } catch (e) {
    return server(e);
  }
}

// ✅ POST create a new color for a material
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id } = await params; // ✅ must await

    const p = MaterialColorCreateSchema.safeParse({
      ...body,
      materialId: id,
    });
    if (!p.success) return bad(p.error.message);

    const color = await prisma.materialColor.create({
      data: p.data,
    });

    return ok(color, 201);
  } catch (e) {
    return server(e);
  }
}

