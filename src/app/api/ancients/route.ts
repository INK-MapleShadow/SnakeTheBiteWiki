import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const ancients = await prisma.ancient.findMany({
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { name: true, email: true } } },
    });
    return NextResponse.json(ancients);
  } catch {
    return NextResponse.json({ error: "获取先古之民失败" }, { status: 500 });
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

    const ancient = await prisma.ancient.create({
      data: { ...body, createdById: user.id },
    });

    await prisma.editHistory.create({
      data: {
        entityType: "ANCIENT",
        entityId: ancient.id,
        entityName: ancient.name,
        action: "CREATE",
        userId: user.id,
      },
    });

    return NextResponse.json(ancient, { status: 201 });
  } catch {
    return NextResponse.json({ error: "创建先古之民失败" }, { status: 500 });
  }
}
