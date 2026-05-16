import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const MOD_LOCALIZATION_PATH =
  "D:/SlayTheSpire2Mod_develop/slay-the-spire-2/SnakeTheBite/localization/zhs";

function readJson(filename: string): Record<string, string> {
  const filePath = path.join(MOD_LOCALIZATION_PATH, filename);
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, "utf-8");
  // 去掉 BOM
  const clean = raw.replace(/^\uFEFF/, "");
  return JSON.parse(clean);
}

// 从 localization key 中提取 snake_case 类名
// 例如 SNAKETHEBITE-SNAKE_BITE_CARD.title -> snake_bite_card
function extractSlug(key: string): string | null {
  const match = key.match(/^SNAKETHEBITE-(.+?)\.(title|description|epithet)$/);
  if (!match) return null;
  return match[1].toLowerCase();
}

// 对 ancients 提取 slug（可能包含 talk 等后缀）
function extractAncientSlug(key: string): string | null {
  const match = key.match(/^SNAKETHEBITE-(.+?)\./);
  if (!match) return null;
  return match[1].toLowerCase();
}

// 收集同一实体的 title + description
function collectEntities(data: Record<string, string>) {
  const entities: Record<
    string,
    { title: string; description: string; extra: Record<string, string> }
  > = {};

  for (const [key, value] of Object.entries(data)) {
    const slug = extractSlug(key);
    if (!slug) continue;
    if (!entities[slug]) {
      entities[slug] = { title: "", description: "", extra: {} };
    }
    if (key.endsWith(".title")) entities[slug].title = value;
    if (key.endsWith(".description")) entities[slug].description = value;
    if (key.endsWith(".flavor")) entities[slug].extra.flavor = value;
    if (key.endsWith(".epithet")) entities[slug].extra.epithet = value;
  }
  return entities;
}

// 收集 ancients（包含 talk 字段）
function collectAncients(data: Record<string, string>) {
  const ancients: Record<
    string,
    { title: string; description: string; epithet: string; talks: string[] }
  > = {};

  for (const [key, value] of Object.entries(data)) {
    const slug = extractAncientSlug(key);
    if (!slug) continue;
    if (!ancients[slug]) {
      ancients[slug] = { title: "", description: "", epithet: "", talks: [] };
    }
    if (key.endsWith(".title")) ancients[slug].title = value;
    if (key.endsWith(".epithet")) ancients[slug].epithet = value;
    if (key.includes(".talk.")) {
      ancients[slug].talks.push(value);
    }
  }

  // 把 talks 合并成 description
  for (const slug of Object.keys(ancients)) {
    ancients[slug].description = ancients[slug].talks.join("\n\n");
  }
  return ancients;
}

// 判断卡牌类型（基于类名关键词）
function guessCardType(slug: string): string {
  if (slug.includes("status") || slug.includes("plague") || slug.includes("wandering")) return "STATUS";
  if (slug.includes("curse")) return "CURSE";
  if (slug.includes("power")) return "POWER";
  return "SKILL"; // 默认
}

async function main() {
  console.log("开始导入 Mod 本地化数据...");

  // 创建系统用户
  const systemUser = await prisma.user.upsert({
    where: { email: "system@snakethebite.wiki" },
    update: {},
    create: {
      email: "system@snakethebite.wiki",
      name: "系统自动导入",
      role: "ADMIN",
    },
  });
  const userId = systemUser.id;

  // 导入卡牌
  const cardsData = readJson("cards.json");
  const cards = collectEntities(cardsData);
  for (const [slug, data] of Object.entries(cards)) {
    if (!data.title) continue;
    await prisma.card.upsert({
      where: { slug },
      update: {
        name: data.title,
        description: data.description,
      },
      create: {
        name: data.title,
        slug,
        description: data.description,
        type: guessCardType(slug),
        rarity: "COMMON",
        createdById: userId,
      },
    });
  }
  console.log(`导入卡牌: ${Object.keys(cards).length} 张`);

  // 导入能力
  const powersData = readJson("powers.json");
  const powers = collectEntities(powersData);
  for (const [slug, data] of Object.entries(powers)) {
    if (!data.title) continue;
    await prisma.power.upsert({
      where: { slug },
      update: {
        name: data.title,
        description: data.description,
      },
      create: {
        name: data.title,
        slug,
        description: data.description,
        type: "BUFF",
        stackType: "Counter",
        createdById: userId,
      },
    });
  }
  console.log(`导入能力: ${Object.keys(powers).length} 个`);

  // 导入遗物
  const relicsData = readJson("relics.json");
  const relics = collectEntities(relicsData);
  for (const [slug, data] of Object.entries(relics)) {
    if (!data.title) continue;
    const desc = data.extra.flavor
      ? `${data.description}\n\n[i]${data.extra.flavor}[/i]`
      : data.description;
    await prisma.relic.upsert({
      where: { slug },
      update: {
        name: data.title,
        description: desc,
      },
      create: {
        name: data.title,
        slug,
        description: desc,
        rarity: "COMMON",
        createdById: userId,
      },
    });
  }
  console.log(`导入遗物: ${Object.keys(relics).length} 个`);

  // 导入药水
  const potionsData = readJson("potions.json");
  const potions = collectEntities(potionsData);
  for (const [slug, data] of Object.entries(potions)) {
    if (!data.title) continue;
    await prisma.potion.upsert({
      where: { slug },
      update: {
        name: data.title,
        description: data.description,
      },
      create: {
        name: data.title,
        slug,
        description: data.description,
        rarity: "COMMON",
        usage: "CombatOnly",
        createdById: userId,
      },
    });
  }
  console.log(`导入药水: ${Object.keys(potions).length} 个`);

  // 导入附魔
  const enchantmentsData = readJson("enchantments.json");
  const enchantments = collectEntities(enchantmentsData);
  for (const [slug, data] of Object.entries(enchantments)) {
    if (!data.title) continue;
    await prisma.enchantment.upsert({
      where: { slug },
      update: {
        name: data.title,
        description: data.description,
      },
      create: {
        name: data.title,
        slug,
        description: data.description,
        createdById: userId,
      },
    });
  }
  console.log(`导入附魔: ${Object.keys(enchantments).length} 个`);

  // 导入先古之民
  const ancientsData = readJson("ancients.json");
  const ancients = collectAncients(ancientsData);
  for (const [slug, data] of Object.entries(ancients)) {
    if (!data.title) continue;
    await prisma.ancient.upsert({
      where: { slug },
      update: {
        name: data.title,
        description: data.description,
        epithet: data.epithet,
      },
      create: {
        name: data.title,
        slug,
        title: data.title,
        epithet: data.epithet,
        description: data.description,
        createdById: userId,
      },
    });
  }
  console.log(`导入先古之民: ${Object.keys(ancients).length} 个`);

  // 创建一条更新日志
  const existingLog = await prisma.changelog.findFirst({
    where: { version: "0.10.2" },
  });
  if (!existingLog) {
    await prisma.changelog.create({
      data: {
        version: "0.10.2",
        content: "从 Mod 本地化文件导入初始数据。",
        createdById: userId,
      },
    });
  }

  console.log("导入完成！");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
