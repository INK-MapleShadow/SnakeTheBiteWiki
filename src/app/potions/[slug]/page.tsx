"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BBCodeText } from "@/components/bbcode-text";

interface PotionDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  rarity: string;
  usage: string;
  imageUrl: string | null;
  createdAt: string;
}

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

export default function PotionDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [potion, setPotion] = useState<PotionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/potions/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("获取失败");
        return res.json();
      })
      .then((data) => {
        setPotion(data);
        setLoading(false);
      })
      .catch(() => {
        setError("加载药水详情失败");
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="text-center py-20 text-muted-foreground">加载中...</div>
    );
  }

  if (error || !potion) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">{error || "药水不存在"}</p>
        <Link href="/potions">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回药水列表
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/potions">
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
              <CardTitle className="text-2xl">{potion.name}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={rarityColors[potion.rarity] || "bg-gray-500"}>
                  {rarityLabels[potion.rarity] || potion.rarity}
                </Badge>
                <Badge variant="outline">{usageLabels[potion.usage] || potion.usage}</Badge>
              </div>
            </div>
            {potion.imageUrl && (
              <img
                src={potion.imageUrl}
                alt={potion.name}
                className="w-32 h-32 object-cover rounded-lg border border-border"
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">描述</h3>
            <div className="text-base leading-relaxed">
              <BBCodeText text={potion.description} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
