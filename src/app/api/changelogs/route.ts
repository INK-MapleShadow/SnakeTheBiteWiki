import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const changelogs = await prisma.changelog.findMany({
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { name: true, email: true } } },
    });
    return NextResponse.json(changelogs);
  } catch {
    return NextResponse.json({ error: "获取更新日志失败" }, { status: 500 });
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

    const changelog = await prisma.changelog.create({
      data: { ...body, createdById: user.id },
    });

    await prisma.editHistory.create({
      data: {
        entityType: "CHANGELOG",
        entityId: changelog.id,
        entityName: changelog.version,
        action: "CREATE",
        userId: user.id,
      },
    });

    return NextResponse.json(changelog, { status: 201 });
  } catch {
    return NextResponse.json({ error: "创建更新日志失败" }, { status: 500 });
  }
}
