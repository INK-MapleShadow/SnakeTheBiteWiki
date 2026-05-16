"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AddDialog } from "@/components/add-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EnchantmentItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  extraCardText: string | null;
  isStackable: boolean;
  imageUrl: string | null;
  createdAt: string;
}

export default function EnchantmentsPage() {
  const { data: session } = useSession();
  const [enchantments, setEnchantments] = useState<EnchantmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/enchantments")
      .then((res) => res.json())
      .then((data) => { setEnchantments(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredEnchantments = useMemo(() => {
    return enchantments.filter((enchantment) => {
      if (search && !enchantment.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [enchantments, search]);

  const handleAdd = async (data: Record<string, string | null>) => {
    const res = await fetch("/api/enchantments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        isStackable: data.isStackable === "true",
      }),
    });
    if (!res.ok) throw new Error("创建失败");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">附魔图鉴</h1>
          <p className="text-muted-foreground mt-1">浏览所有自定义附魔效果</p>
        </div>
        {session?.user && (
          <AddDialog
            title="添加附魔"
            fields={[
              { name: "name", label: "名称", type: "text", required: true },
              { name: "slug", label: "标识符（英文）", type: "text", required: true },
              { name: "description", label: "描述", type: "textarea", required: true },
              { name: "extraCardText", label: "卡牌额外文本", type: "text" },
              { name: "isStackable", label: "可叠加", type: "select", options: [{ value: "true", label: "是" }, { value: "false", label: "否" }] },
              { name: "imageUrl", label: "图片 URL", type: "text" },
            ]}
            onSubmit={handleAdd}
          />
        )}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索附魔..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">加载中...</div>
      ) : filteredEnchantments.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">暂无附魔数据</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEnchantments.map((enchantment) => (
            <Link key={enchantment.id} href={`/enchantments/${enchantment.slug}`} className="block">
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{enchantment.name}</CardTitle>
                    <Badge variant="outline">{enchantment.isStackable ? "可叠加" : "不可叠加"}</Badge>
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
