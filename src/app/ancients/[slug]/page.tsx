"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BBCodeText } from "@/components/bbcode-text";

interface AncientDetail {
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

export default function AncientDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [ancient, setAncient] = useState<AncientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/ancients/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("获取失败");
        return res.json();
      })
      .then((data) => {
        setAncient(data);
        setLoading(false);
      })
      .catch(() => {
        setError("加载先古之民详情失败");
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="text-center py-20 text-muted-foreground">加载中...</div>
    );
  }

  if (error || !ancient) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">{error || "先古之民不存在"}</p>
        <Link href="/ancients">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回先古之民列表
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ancients">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{ancient.name}</CardTitle>
              <div className="text-sm text-muted-foreground">{ancient.title}</div>
              {ancient.epithet && (
                <Badge variant="outline">{ancient.epithet}</Badge>
              )}
            </div>
            {ancient.imageUrl && (
              <img
                src={ancient.imageUrl}
                alt={ancient.name}
                className="w-32 h-32 object-cover rounded-lg border border-border"
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">描述</h3>
            <div className="text-base leading-relaxed">
              <BBCodeText text={ancient.description} />
            </div>
          </div>

          {ancient.scenePath && (
            <div className="pt-2 border-t border-dashed border-border/50">
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">场景路径</h3>
              <p className="text-base text-muted-foreground">{ancient.scenePath}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
