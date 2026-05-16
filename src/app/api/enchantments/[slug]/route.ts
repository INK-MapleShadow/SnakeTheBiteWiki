import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const enchantment = await prisma.enchantment.findUnique({
      where: { slug },
      include: { createdBy: { select: { name: true, email: true } } },
    });
    if (!enchantment) {
      return NextResponse.json({ error: "附魔不存在" }, { status: 404 });
    }
    return NextResponse.json(enchantment);
  } catch {
    return NextResponse.json({ error: "获取附魔失败" }, { status: 500 });
  }
}
