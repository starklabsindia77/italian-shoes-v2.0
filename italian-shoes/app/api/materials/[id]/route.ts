import { prisma } from "@/lib/prisma";
import { ok, notFound, server, requireAdmin } from "@/lib/api-helpers";
import { Prisma } from "@prisma/client";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const m = await prisma.material.findUnique({ where: { id: id }, include: { colors: true } });
    return m ? ok(m) : notFound();
  } catch (e: unknown) {
    return server(e);
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const data = await req.json();
    const { id } = params;
    const m = await prisma.material.update({ where: { id: id }, data });
    return ok(m);
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return notFound();
    }
    return server(e);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    console.log("DELETE color API called with:", params);
    const { id } = params;
    await prisma.material.delete({ where: { id: id} });
    return ok({ ok: true });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return notFound();
    }
    return server(e);
  }
}
