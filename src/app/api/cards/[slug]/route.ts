import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const card = await prisma.card.findUnique({
      where: { slug },
      include: { createdBy: { select: { name: true, email: true } } },
    });
    if (!card) {
      return NextResponse.json({ error: "卡牌不存在" }, { status: 404 });
    }
    return NextResponse.json(card);
  } catch {
    return NextResponse.json({ error: "获取卡牌失败" }, { status: 500 });
  }
}
