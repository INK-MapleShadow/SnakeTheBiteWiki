"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AddDialog } from "@/components/add-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const rarityLabels: Record<string, string> = {
  COMMON: "普通",
  UNCOMMON: "罕见",
  RARE: "稀有",
  SPECIAL: "特殊",
};

const rarityColors: Record<string, string> = {
  COMMON: "bg-gray-500",
  UNCOMMON: "bg-blue-500",
  RARE: "bg-yellow-500",
  SPECIAL: "bg-purple-500",
};

const usageLabels: Record<string, string> = {
  CombatOnly: "仅限战斗",
  AnyTime: "任意时刻",
  Automatic: "自动触发",
};

interface PotionItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  rarity: string;
  usage: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function PotionsPage() {
  const { data: session } = useSession();
  const [potions, setPotions] = useState<PotionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/potions")
      .then((res) => res.json())
      .then((data) => { setPotions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredPotions = useMemo(() => {
    return potions.filter((potion) => {
      if (search && !potion.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [potions, search]);

  const handleAdd = async (data: Record<string, string | null>) => {
    const res = await fetch("/api/potions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("创建失败");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">药水图鉴</h1>
          <p className="text-muted-foreground mt-1">浏览所有自定义药水</p>
        </div>
        {session?.user && (
          <AddDialog
            title="添加药水"
            fields={[
              { name: "name", label: "名称", type: "text", required: true },
              { name: "slug", label: "标识符（英文）", type: "text", required: true },
              { name: "rarity", label: "稀有度", type: "select", required: true, options: [{ value: "COMMON", label: "普通" }, { value: "UNCOMMON", label: "罕见" }, { value: "RARE", label: "稀有" }, { value: "SPECIAL", label: "特殊" }] },
              { name: "usage", label: "使用时机", type: "select", required: true, options: [{ value: "CombatOnly", label: "仅限战斗" }, { value: "AnyTime", label: "任意时刻" }, { value: "Automatic", label: "自动触发" }] },
              { name: "description", label: "描述", type: "textarea", required: true },
              { name: "imageUrl", label: "图片 URL", type: "text" },
            ]}
            onSubmit={handleAdd}
          />
        )}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索药水..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">加载中...</div>
      ) : filteredPotions.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">暂无药水数据</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPotions.map((potion) => (
            <Link key={potion.id} href={`/potions/${potion.slug}`} className="block">
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{potion.name}</CardTitle>
                    <Badge className={rarityColors[potion.rarity] || "bg-gray-500"}>
                      {rarityLabels[potion.rarity] || potion.rarity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-xs">
                    {usageLabels[potion.usage] || potion.usage}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
