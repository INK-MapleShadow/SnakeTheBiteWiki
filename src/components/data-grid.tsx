"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { BBCodeText } from "@/components/bbcode-text";

interface DataGridProps {
  items: Record<string, any>[];
  typeLabel: string;
  renderExtra?: (item: Record<string, any>) => React.ReactNode;
}

const rarityColors: Record<string, string> = {
  COMMON: "bg-gray-500",
  UNCOMMON: "bg-blue-500",
  RARE: "bg-yellow-500",
  SPECIAL: "bg-purple-500",
};

const typeLabels: Record<string, string> = {
  ATTACK: "攻击",
  SKILL: "技能",
  POWER: "能力",
  STATUS: "状态",
  CURSE: "诅咒",
  BUFF: "增益",
  DEBUFF: "减益",
};

const rarityLabels: Record<string, string> = {
  COMMON: "普通",
  UNCOMMON: "罕见",
  RARE: "稀有",
  SPECIAL: "特殊",
};

export function DataGrid({ items, typeLabel, renderExtra }: DataGridProps) {
  const [search, setSearch] = useState("");

  const filtered = items.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={`搜索${typeLabel}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          暂无{typeLabel}数据
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <div className="flex gap-1">
                    {item.rarity && (
                      <Badge className={rarityColors[item.rarity] || "bg-gray-500"}>
                        {rarityLabels[item.rarity] || item.rarity}
                      </Badge>
                    )}
                    {item.type && (
                      <Badge variant="outline">{typeLabels[item.type] || item.type}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    <BBCodeText text={item.description || ""} />
                  </p>
                  {item.upgradedDescription && (
                    <div className="mt-2 pt-2 border-t border-dashed border-border/30">
                      <span className="text-xs text-emerald-400 font-medium">升级后：</span>
                      <p className="text-sm text-muted-foreground line-clamp-4 mt-0.5">
                        <BBCodeText text={item.upgradedDescription} />
                      </p>
                    </div>
                  )}
                </div>
                {renderExtra?.(item)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
