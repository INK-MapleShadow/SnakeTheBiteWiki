import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const relics = await prisma.relic.findMany({
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { name: true, email: true } } },
    });
    return NextResponse.json(relics);
  } catch {
    return NextResponse.json({ error: "获取遗物失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const relic = await prisma.relic.create({
      data: { ...body, createdById: user.id },
    });

    await prisma.editHistory.create({
      data: {
        entityType: "RELIC",
        entityId: relic.id,
        entityName: relic.name,
        action: "CREATE",
        userId: user.id,
      },
    });

    return NextResponse.json(relic, { status: 201 });
  } catch {
    return NextResponse.json({ error: "创建遗物失败" }, { status: 500 });
  }
}
