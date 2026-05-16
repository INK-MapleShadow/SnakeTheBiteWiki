import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();
const CARDS_DIR = "D:/SlayTheSpire2Mod_develop/slay-the-spire-2/Scripts/cards";

interface CardMeta {
  slug: string;
  type: string;
  rarity: string;
  cost: number | null;
  pool: string;
}

function toSlug(className: string): string {
  // PascalCase -> SNAKE_CASE
  return className
    .replace(/([A-Z])/g, "_$1")
    .toUpperCase()
    .substring(1);
}

function parseCardFile(filePath: string): CardMeta | null {
  const content = fs.readFileSync(filePath, "utf-8");

  // 提取类名
  const classMatch = content.match(/class\s+(\w+Card)/);
  if (!classMatch) return null;
  const className = classMatch[1];
  const slug = toSlug(className).toLowerCase();

  // 提取卡池
  const poolMatch = content.match(/\[Pool\(typeof\((\w+)\)\)\]/);
  const poolRaw = poolMatch ? poolMatch[1] : "Unknown";
  const poolMap: Record<string, string> = {
    IroncladCardPool: "铁甲战士",
    ColorlessCardPool: "无色",
    CurseCardPool: "诅咒",
    StatusCardPool: "状态",
    TokenCardPool: "衍生",
    EventCardPool: "事件",
  };
  const pool = poolMap[poolRaw] || poolRaw;

  // 提取类型和稀有度（方式1：base 构造函数）
  const baseMatch = content.match(
    /base\s*\(\s*([-\d]+)\s*,\s*CardType\.(\w+)\s*,\s*CardRarity\.(\w+)/
  );

  // 提取稀有度（方式2：const 字段）
  const rarityConstMatch = content.match(
    /private\s+const\s+CardRarity\s+rarity\s*=\s*CardRarity\.(\w+)/
  );

  let type = "SKILL";
  let rarity = "COMMON";
  let cost: number | null = null;

  if (baseMatch) {
    cost = parseInt(baseMatch[1]);
    type = baseMatch[2].toUpperCase();
    rarity = baseMatch[3].toUpperCase();
  }

  if (rarityConstMatch) {
    rarity = rarityConstMatch[1].toUpperCase();
  }

  // 映射稀有度到数据库值
  const rarityMap: Record<string, string> = {
    COMMON: "COMMON",
    UNCOMMON: "UNCOMMON",
    RARE: "RARE",
    CURSE: "SPECIAL",
    STATUS: "SPECIAL",
    TOKEN: "SPECIAL",
    ANCIENT: "SPECIAL",
  };

  return {
    slug,
    type,
    rarity: rarityMap[rarity] || "COMMON",
    cost: cost === -1 ? null : cost,
    pool,
  };
}

async function main() {
  console.log("开始从 C# 源码提取卡牌元数据...");

  const files = fs
    .readdirSync(CARDS_DIR)
    .filter((f) => f.endsWith(".cs"));

  let updated = 0;
  let failed = 0;

  for (const file of files) {
    const meta = parseCardFile(path.join(CARDS_DIR, file));
    if (!meta) {
      failed++;
      continue;
    }

    const existing = await prisma.card.findUnique({
      where: { slug: meta.slug },
    });

    if (existing) {
      await prisma.card.update({
        where: { slug: meta.slug },
        data: {
          type: meta.type,
          rarity: meta.rarity,
          cost: meta.cost,
        },
      });
      updated++;
    }
  }

  console.log(`更新完成: ${updated} 张卡牌, ${failed} 个文件解析失败`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
