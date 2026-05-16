"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BBCodeText } from "@/components/bbcode-text";

interface EnchantmentDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  extraCardText: string | null;
  isStackable: boolean;
  imageUrl: string | null;
  createdAt: string;
}

export default function EnchantmentDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [enchantment, setEnchantment] = useState<EnchantmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/enchantments/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("获取失败");
        return res.json();
      })
      .then((data) => {
        setEnchantment(data);
        setLoading(false);
      })
      .catch(() => {
        setError("加载附魔详情失败");
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="text-center py-20 text-muted-foreground">加载中...</div>
    );
  }

  if (error || !enchantment) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">{error || "附魔不存在"}</p>
        <Link href="/enchantments">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回附魔列表
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/enchantments">
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
              <CardTitle className="text-2xl">{enchantment.name}</CardTitle>
              <Badge variant="outline">{enchantment.isStackable ? "可叠加" : "不可叠加"}</Badge>
            </div>
            {enchantment.imageUrl && (
              <img
                src={enchantment.imageUrl}
                alt={enchantment.name}
                className="w-32 h-32 object-cover rounded-lg border border-border"
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">描述</h3>
            <div className="text-base leading-relaxed">
              <BBCodeText text={enchantment.description} />
            </div>
          </div>

          {enchantment.extraCardText && (
            <div className="pt-2 border-t border-dashed border-border/50">
              <h3 className="text-sm font-semibold text-emerald-400 mb-1">卡牌额外文本</h3>
              <div className="text-base leading-relaxed text-muted-foreground">
                <BBCodeText text={enchantment.extraCardText} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
