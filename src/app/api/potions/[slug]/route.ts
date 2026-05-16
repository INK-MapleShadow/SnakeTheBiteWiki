import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const potion = await prisma.potion.findUnique({
      where: { slug },
      include: { createdBy: { select: { name: true, email: true } } },
    });
    if (!potion) {
      return NextResponse.json({ error: "药水不存在" }, { status: 404 });
    }
    return NextResponse.json(potion);
  } catch {
    return NextResponse.json({ error: "获取药水失败" }, { status: 500 });
  }
}
