import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const ancient = await prisma.ancient.findUnique({
      where: { slug },
      include: { createdBy: { select: { name: true, email: true } } },
    });
    if (!ancient) {
      return NextResponse.json({ error: "先古之民不存在" }, { status: 404 });
    }
    return NextResponse.json(ancient);
  } catch {
    return NextResponse.json({ error: "获取先古之民失败" }, { status: 500 });
  }
}
