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

interface RelicItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  rarity: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function RelicsPage() {
  const { data: session } = useSession();
  const [relics, setRelics] = useState<RelicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/relics")
      .then((res) => res.json())
      .then((data) => { setRelics(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredRelics = useMemo(() => {
    return relics.filter((relic) => {
      if (search && !relic.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [relics, search]);

  const handleAdd = async (data: Record<string, string | null>) => {
    const res = await fetch("/api/relics", {
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
          <h1 className="text-3xl font-bold">遗物图鉴</h1>
          <p className="text-muted-foreground mt-1">浏览所有自定义遗物</p>
        </div>
        {session?.user && (
          <AddDialog
            title="添加遗物"
            fields={[
              { name: "name", label: "名称", type: "text", required: true },
              { name: "slug", label: "标识符（英文）", type: "text", required: true },
              { name: "rarity", label: "稀有度", type: "select", required: true, options: [{ value: "COMMON", label: "普通" }, { value: "UNCOMMON", label: "罕见" }, { value: "RARE", label: "稀有" }, { value: "SPECIAL", label: "特殊" }] },
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
          placeholder="搜索遗物..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">加载中...</div>
      ) : filteredRelics.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">暂无遗物数据</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRelics.map((relic) => (
            <Link key={relic.id} href={`/relics/${relic.slug}`} className="block">
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{relic.name}</CardTitle>
                    <Badge className={rarityColors[relic.rarity] || "bg-gray-500"}>
                      {rarityLabels[relic.rarity] || relic.rarity}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
