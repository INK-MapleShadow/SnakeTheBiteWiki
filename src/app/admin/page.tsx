"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sword, Sparkles, Shield, FlaskConical, Scroll, BookOpen, FileText } from "lucide-react";

interface Stats {
  cards: number;
  powers: number;
  relics: number;
  potions: number;
  enchantments: number;
  ancients: number;
  changelogs: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }

    Promise.all([
      fetch("/api/cards").then((r) => r.json()),
      fetch("/api/powers").then((r) => r.json()),
      fetch("/api/relics").then((r) => r.json()),
      fetch("/api/potions").then((r) => r.json()),
      fetch("/api/enchantments").then((r) => r.json()),
      fetch("/api/ancients").then((r) => r.json()),
      fetch("/api/changelogs").then((r) => r.json()),
    ]).then(([cards, powers, relics, potions, enchantments, ancients, changelogs]) => {
      setStats({
        cards: cards.length || 0,
        powers: powers.length || 0,
        relics: relics.length || 0,
        potions: potions.length || 0,
        enchantments: enchantments.length || 0,
        ancients: ancients.length || 0,
        changelogs: changelogs.length || 0,
      });
    });
  }, [session, status, router]);

  if (status === "loading") {
    return <div className="text-center py-20">加载中...</div>;
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  const statCards = [
    { label: "卡牌", value: stats?.cards ?? 0, icon: Sword, color: "text-red-400" },
    { label: "能力", value: stats?.powers ?? 0, icon: Sparkles, color: "text-yellow-400" },
    { label: "遗物", value: stats?.relics ?? 0, icon: Shield, color: "text-blue-400" },
    { label: "药水", value: stats?.potions ?? 0, icon: FlaskConical, color: "text-green-400" },
    { label: "附魔", value: stats?.enchantments ?? 0, icon: Scroll, color: "text-purple-400" },
    { label: "先古之民", value: stats?.ancients ?? 0, icon: BookOpen, color: "text-orange-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">后台管理</h1>
        <p className="text-muted-foreground mt-1">Wiki 数据统计与维护</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${s.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. 登录后，在任意图鉴页面点击右上角「添加」按钮即可录入新数据。</p>
          <p>2. 所有编辑操作都会记录到编辑历史中。</p>
          <p>3. 当前使用 SQLite 本地数据库，生产环境建议迁移到 PostgreSQL。</p>
          <p>4. 管理员可在用户数据库中手动修改 role 字段为 ADMIN 来赋予管理员权限。</p>
        </CardContent>
      </Card>
    </div>
  );
}
