"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BBCodeText } from "@/components/bbcode-text";

interface CardDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  upgradedDescription: string | null;
  keywords: string | null;
  rarity: string;
  type: string;
  cost: number | null;
  imageUrl: string | null;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  ATTACK: "攻击",
  SKILL: "技能",
  POWER: "能力",
  STATUS: "状态",
  CURSE: "诅咒",
};

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

function guessPool(card: { name: string; type: string }): string {
  const colorlessNames = [
    "数据库", "游魂", "荒疫", "冲刺", "废弃设计图", "此战方休",
    "前进！前进！", "点燃星海", "血肉加身", "升魔", "苦痛轮回",
  ];
  if (colorlessNames.some((n) => card.name.includes(n))) return "无色";
  if (card.type === "CURSE") return "诅咒";
  if (card.type === "STATUS") return "状态";
  if (card.name.includes("缺陷机器人")) return "无色";
  return "铁甲战士";
}

export default function CardDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [card, setCard] = useState<CardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/cards/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("获取失败");
        return res.json();
      })
      .then((data) => {
        setCard(data);
        setLoading(false);
      })
      .catch(() => {
        setError("加载卡牌详情失败");
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="text-center py-20 text-muted-foreground">加载中...</div>
    );
  }

  if (error || !card) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">{error || "卡牌不存在"}</p>
        <Link href="/cards">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回卡牌列表
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cards">
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
              <CardTitle className="text-2xl">{card.name}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={rarityColors[card.rarity] || "bg-gray-500"}>
                  {rarityLabels[card.rarity] || card.rarity}
                </Badge>
                <Badge variant="outline">{typeLabels[card.type] || card.type}</Badge>
                {card.cost !== null && (
                  <Badge variant="outline">费用 {card.cost}</Badge>
                )}
                <Badge variant="outline">{guessPool(card)}</Badge>
              </div>
            </div>
            {card.imageUrl && (
              <img
                src={card.imageUrl}
                alt={card.name}
                className="w-32 h-32 object-cover rounded-lg border border-border"
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">描述</h3>
            <div className="text-base leading-relaxed">
              <BBCodeText text={card.description} />
            </div>
          </div>

          {card.upgradedDescription && (
            <div className="pt-2 border-t border-dashed border-border/50">
              <h3 className="text-sm font-semibold text-emerald-400 mb-1">升级后</h3>
              <div className="text-base leading-relaxed text-muted-foreground">
                <BBCodeText text={card.upgradedDescription} />
              </div>
            </div>
          )}

          {card.keywords && (
            <div className="pt-2 border-t border-border/50">
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">关键词</h3>
              <div className="flex flex-wrap gap-2">
                {card.keywords.split(",").map((k) => (
                  <Badge key={k} variant="secondary">
                    {k.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
