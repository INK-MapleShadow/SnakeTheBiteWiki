import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const relic = await prisma.relic.findUnique({
      where: { slug },
      include: { createdBy: { select: { name: true, email: true } } },
    });
    if (!relic) {
      return NextResponse.json({ error: "遗物不存在" }, { status: 404 });
    }
    return NextResponse.json(relic);
  } catch {
    return NextResponse.json({ error: "获取遗物失败" }, { status: 500 });
  }
}
