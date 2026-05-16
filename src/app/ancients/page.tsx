"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AddDialog } from "@/components/add-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface AncientItem {
  id: string;
  name: string;
  slug: string;
  title: string;
  epithet: string | null;
  description: string;
  scenePath: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export default function AncientsPage() {
  const { data: session } = useSession();
  const [ancients, setAncients] = useState<AncientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/ancients")
      .then((res) => res.json())
      .then((data) => { setAncients(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredAncients = useMemo(() => {
    return ancients.filter((ancient) => {
      if (search && !ancient.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [ancients, search]);

  const handleAdd = async (data: Record<string, string | null>) => {
    const res = await fetch("/api/ancients", {
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
          <h1 className="text-3xl font-bold">先古之民</h1>
          <p className="text-muted-foreground mt-1">浏览所有自定义事件与对话</p>
        </div>
        {session?.user && (
          <AddDialog
            title="添加先古之民"
            fields={[
              { name: "name", label: "名称", type: "text", required: true },
              { name: "slug", label: "标识符（英文）", type: "text", required: true },
              { name: "title", label: "事件标题", type: "text", required: true },
              { name: "epithet", label: "称号/副标题", type: "text" },
              { name: "description", label: "描述", type: "textarea", required: true },
              { name: "scenePath", label: "场景路径", type: "text" },
              { name: "imageUrl", label: "图片 URL", type: "text" },
            ]}
            onSubmit={handleAdd}
          />
        )}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索先古之民..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">加载中...</div>
      ) : filteredAncients.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">暂无先古之民数据</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAncients.map((ancient) => (
            <Link key={ancient.id} href={`/ancients/${ancient.slug}`} className="block">
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{ancient.name}</CardTitle>
                    {ancient.epithet && (
                      <Badge variant="outline">{ancient.epithet}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{ancient.title}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
