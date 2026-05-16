"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AddDialog } from "@/components/add-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CardItem {
  id: string;
  name: string;
  slug: string;
  description: string;
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

export default function CardsPage() {
  const { data: session } = useSession();
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rarityFilter, setRarityFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [poolFilter, setPoolFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/cards")
      .then((res) => res.json())
      .then((data) => {
        setCards(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 从描述中推断卡池（基于关键词）
  function guessPool(card: Record<string, any>): string {
    const name = card.name;
    const desc = card.description;
    // 无色卡池特征
    const colorlessNames = [
      "数据库", "游魂", "荒疫", "冲刺", "废弃设计图", "此战方休",
      "前进！前进！", "点燃星海", "血肉加身", "升魔", "苦痛轮回",
    ];
    if (colorlessNames.some((n) => name.includes(n))) return "无色";
    // 诅咒卡池
    if (card.type === "CURSE") return "诅咒";
    // 状态卡池
    if (card.type === "STATUS") return "状态";
    // 缺陷机器人系列
    if (name.includes("缺陷机器人")) return "无色";
    // 蛇主题默认铁甲战士
    return "铁甲战士";
  }

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (rarityFilter !== "ALL" && card.rarity !== rarityFilter) return false;
      if (typeFilter !== "ALL" && card.type !== typeFilter) return false;
      if (poolFilter !== "ALL" && guessPool(card) !== poolFilter) return false;
      if (search && !card.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [cards, rarityFilter, typeFilter, poolFilter, search]);

  const handleAdd = async (data: Record<string, string | null>) => {
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        cost: data.cost ? parseInt(data.cost) : null,
      }),
    });
    if (!res.ok) throw new Error("创建失败");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">卡牌图鉴</h1>
          <p className="text-muted-foreground mt-1">
            共 {cards.length} 张卡牌
            {filteredCards.length !== cards.length &&
              `（筛选后 ${filteredCards.length} 张）`}
          </p>
        </div>
        {session?.user && (
          <AddDialog
            title="添加卡牌"
            fields={[
              { name: "name", label: "名称", type: "text", required: true },
              { name: "slug", label: "标识符（英文）", type: "text", required: true },
              {
                name: "type",
                label: "类型",
                type: "select",
                required: true,
                options: [
                  { value: "ATTACK", label: "攻击" },
                  { value: "SKILL", label: "技能" },
                  { value: "POWER", label: "能力" },
                  { value: "STATUS", label: "状态" },
                  { value: "CURSE", label: "诅咒" },
                ],
              },
              { name: "cost", label: "费用", type: "number" },
              {
                name: "rarity",
                label: "稀有度",
                type: "select",
                required: true,
                options: [
                  { value: "COMMON", label: "普通" },
                  { value: "UNCOMMON", label: "罕见" },
                  { value: "RARE", label: "稀有" },
                  { value: "SPECIAL", label: "特殊" },
                ],
              },
              { name: "description", label: "描述", type: "textarea", required: true },
              { name: "keywords", label: "关键词（逗号分隔）", type: "text" },
              { name: "imageUrl", label: "图片 URL", type: "text" },
            ]}
            onSubmit={handleAdd}
          />
        )}
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">稀有度:</span>
          <Select value={rarityFilter} onValueChange={(v) => v && setRarityFilter(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">全部</SelectItem>
              <SelectItem value="COMMON">普通</SelectItem>
              <SelectItem value="UNCOMMON">罕见</SelectItem>
              <SelectItem value="RARE">稀有</SelectItem>
              <SelectItem value="SPECIAL">特殊</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">类型:</span>
          <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">全部</SelectItem>
              <SelectItem value="ATTACK">攻击</SelectItem>
              <SelectItem value="SKILL">技能</SelectItem>
              <SelectItem value="POWER">能力</SelectItem>
              <SelectItem value="STATUS">状态</SelectItem>
              <SelectItem value="CURSE">诅咒</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">卡池:</span>
          <Select value={poolFilter} onValueChange={(v) => v && setPoolFilter(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">全部</SelectItem>
              <SelectItem value="铁甲战士">铁甲战士</SelectItem>
              <SelectItem value="无色">无色</SelectItem>
              <SelectItem value="诅咒">诅咒</SelectItem>
              <SelectItem value="状态">状态</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(rarityFilter !== "ALL" || typeFilter !== "ALL" || poolFilter !== "ALL") && (
          <button
            onClick={() => {
              setRarityFilter("ALL");
              setTypeFilter("ALL");
              setPoolFilter("ALL");
            }}
            className="text-sm text-emerald-400 hover:text-emerald-300 underline"
          >
            重置筛选
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索卡牌..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">加载中...</div>
      ) : filteredCards.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">暂无卡牌数据</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCards.map((card) => (
            <Link key={card.id} href={`/cards/${card.slug}`} className="block">
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{card.name}</CardTitle>
                    <Badge className={rarityColors[card.rarity] || "bg-gray-500"}>
                      {rarityLabels[card.rarity] || card.rarity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {card.cost !== null && (
                      <Badge variant="outline" className="text-xs">
                        费用 {card.cost}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {typeLabels[card.type] || card.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {guessPool(card)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
