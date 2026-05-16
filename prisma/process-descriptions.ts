import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();
const MOD_SCRIPTS = "D:/SlayTheSpire2Mod_develop/slay-the-spire-2/Scripts";
const MOD_LOCALIZATION =
  "D:/SlayTheSpire2Mod_develop/slay-the-spire-2/SnakeTheBite/localization/zhs";

// 解析 C# 文件中的 CanonicalVars 和 Upgrade 信息
function parseCSharpFile(filePath: string): {
  slug: string;
  vars: Record<string, { base: number; upgrade: number }>;
  costUpgrade: number;
} | null {
  const content = fs.readFileSync(filePath, "utf-8");

  // 提取类名
  const classMatch = content.match(/class\s+(\w+)/);
  if (!classMatch) return null;
  const slug = classMatch[1]
    .replace(/([A-Z])/g, "_$1")
    .toUpperCase()
    .substring(1)
    .toLowerCase();

  const vars: Record<string, { base: number; upgrade: number }> = {};
  let costUpgrade = 0;

  // 提取 const 定义（用于 RepeatVar(baseRepeat) 等）
  const constMap: Record<string, number> = {};
  const constMatches = content.matchAll(
    /private\s+const\s+\w+\s+(\w+)\s*=\s*(\d+)/g
  );
  for (const m of constMatches) {
    constMap[m[1]] = parseInt(m[2]);
  }

  // 提取 CanonicalVars
  const canonicalMatch = content.match(
    /CanonicalVars\s*=>\s*\[?([\s\S]*?)\]?;?\s*\n\s*\/?\/\//
  );
  if (!canonicalMatch) {
    // 尝试匹配单行格式
    const singleMatch = content.match(/CanonicalVars\s*=>\s*\[([^\]]+)\]/);
    if (singleMatch) {
      parseVars(singleMatch[1], constMap, vars);
    }
  } else {
    parseVars(canonicalMatch[1], constMap, vars);
  }

  // 提取 UpgradeValueBy
  const upgradeMatches = content.matchAll(
    /DynamicVars\.(\w+)\.UpgradeValueBy\((\d+)m?\)/g
  );
  for (const m of upgradeMatches) {
    const varName = m[1];
    const delta = parseInt(m[2]);
    if (vars[varName]) {
      vars[varName].upgrade += delta;
    } else {
      // 尝试 PowerVar<XXX> 的映射
      for (const key of Object.keys(vars)) {
        if (key.toLowerCase() === varName.toLowerCase()) {
          vars[key].upgrade += delta;
        }
      }
    }
  }

  // 提取 EnergyCost.UpgradeBy
  const costMatch = content.match(/EnergyCost\.UpgradeBy\((-?\d+)\)/);
  if (costMatch) {
    costUpgrade = parseInt(costMatch[1]);
  }

  return { slug, vars, costUpgrade };
}

function parseVars(
  varsBlock: string,
  constMap: Record<string, number>,
  result: Record<string, { base: number; upgrade: number }>
) {
  // new PowerVar<PoisonPower>(5m)
  const powerMatches = varsBlock.matchAll(
    /new\s+PowerVar<(\w+)>\(([^)]+)\)/g
  );
  for (const m of powerMatches) {
    const varName = m[1];
    let val = m[2].trim();
    if (val.endsWith("m")) val = val.slice(0, -1);
    const num = constMap[val] ?? parseFloat(val);
    if (!isNaN(num)) {
      result[varName] = { base: num, upgrade: num };
    }
  }

  // new DamageVar(14, ...)
  const damageMatches = varsBlock.matchAll(/new\s+(\w+)Var\(([^,)]+)/g);
  for (const m of damageMatches) {
    const typeName = m[1];
    let val = m[2].trim();
    if (val.endsWith("m")) val = val.slice(0, -1);
    const num = constMap[val] ?? parseFloat(val);
    if (!isNaN(num)) {
      let varName = typeName;
      if (typeName === "Power") {
        // 需要推断具体 Power 类型，从泛型参数获取
        continue;
      }
      // 映射常见类型名
      const nameMap: Record<string, string> = {
        Damage: "Damage",
        Block: "Block",
        Energy: "Energy",
        Heal: "Heal",
        HpLoss: "HpLoss",
        MaxHp: "MaxHp",
        Gold: "Gold",
        Cards: "Cards",
        Repeat: "Repeat",
        Stars: "Stars",
      };
      varName = nameMap[typeName] || typeName;
      result[varName] = { base: num, upgrade: num };
    }
  }

  // new EnergyVar(1)
  const simpleMatches = varsBlock.matchAll(
    /new\s+(\w+)Var\(([^)]+)\)/g
  );
  for (const m of simpleMatches) {
    const typeName = m[1];
    let val = m[2].trim();
    if (val.endsWith("m")) val = val.slice(0, -1);
    const num = constMap[val] ?? parseFloat(val);
    if (!isNaN(num)) {
      const nameMap: Record<string, string> = {
        Energy: "Energy",
        Gold: "Gold",
        Repeat: "Repeat",
        Heal: "Heal",
        Block: "Block",
        Damage: "Damage",
        Cards: "Cards",
        Stars: "Stars",
      };
      const varName = nameMap[typeName] || typeName;
      if (!result[varName]) {
        result[varName] = { base: num, upgrade: num };
      }
    }
  }

  // new DynamicVar("Cooldown", 3m)
  const dynamicMatches = varsBlock.matchAll(
    /new\s+DynamicVar\("([^"]+)"\s*,\s*([^)]+)\)/g
  );
  for (const m of dynamicMatches) {
    const varName = m[1];
    let val = m[2].trim();
    if (val.endsWith("m")) val = val.slice(0, -1);
    const num = constMap[val] ?? parseFloat(val);
    if (!isNaN(num)) {
      result[varName] = { base: num, upgrade: num };
    }
  }
}

// 处理 IfUpgraded
function parseIfUpgraded(text: string): { base: string; upgraded: string } {
  let base = text;
  let upgraded = text;

  // {IfUpgraded:show:升级文本|默认文本}
  const matches = text.matchAll(/\{IfUpgraded:show:([^|]+)\|([^}]+)\}/g);
  for (const m of matches) {
    const up = m[1];
    const def = m[2];
    base = base.replace(m[0], def);
    upgraded = upgraded.replace(m[0], up);
  }

  return { base, upgraded };
}

// 替换变量为数值
function replaceVars(
  text: string,
  vars: Record<string, { base: number; upgrade: number }>,
  isUpgraded: boolean
): string {
  let result = text;

  // {VarName:diff()} -> 数值
  const diffMatches = result.matchAll(/\{(\w+):diff\(\)\}/g);
  for (const m of diffMatches) {
    const varName = m[1];
    const val = vars[varName];
    if (val) {
      const num = isUpgraded ? val.upgrade : val.base;
      result = result.replace(m[0], String(num));
    }
  }

  // {VarName:energyIcons()} -> 数值
  const energyMatches = result.matchAll(/\{(\w+):energyIcons\(\)\}/g);
  for (const m of energyMatches) {
    const varName = m[1];
    const val = vars[varName];
    if (val) {
      const num = isUpgraded ? val.upgrade : val.base;
      result = result.replace(m[0], String(num));
    } else if (varName === "Energy") {
      // 尝试从 vars 中找 Energy
      const e = vars["Energy"];
      if (e) {
        result = result.replace(m[0], String(isUpgraded ? e.upgrade : e.base));
      }
    }
  }

  // {VarName:percentLess()} -> 保留原样（太复杂）
  result = result.replace(/\{([^}:]+):percentLess\(\)\}/g, "{$1}%");
  result = result.replace(/\{([^}:]+):percentMore\(\)\}/g, "{$1}%");

  // {VarName:starIcons()} -> 数值
  const starMatches = result.matchAll(/\{(\w+):starIcons\(\)\}/g);
  for (const m of starMatches) {
    const varName = m[1];
    const val = vars[varName];
    if (val) {
      const num = isUpgraded ? val.upgrade : val.base;
      result = result.replace(m[0], String(num));
    }
  }

  // {VarName:cond:...} -> 简化处理，去掉条件
  result = result.replace(/\{([^}:]+):cond:[^}]+\}/g, "");

  // {VarName:plural:...} -> 保留变量名
  result = result.replace(/\{([^}:]+):plural:[^}]+\}/g, "{$1}");

  // {VarName} -> 数值
  const simpleMatches = result.matchAll(/\{(\w+)\}/g);
  for (const m of simpleMatches) {
    const varName = m[1];
    const val = vars[varName];
    if (val) {
      const num = isUpgraded ? val.upgrade : val.base;
      result = result.replace(m[0], String(num));
    }
  }

  return result;
}

async function main() {
  console.log("开始处理描述文本...");

  // 1. 收集所有 C# 文件的变量信息
  const allVars: Record<
    string,
    { vars: Record<string, { base: number; upgrade: number }>; costUpgrade: number }
  > = {};

  const cardsDir = path.join(MOD_SCRIPTS, "cards");
  const files = fs.readdirSync(cardsDir).filter((f) => f.endsWith(".cs"));
  for (const file of files) {
    const meta = parseCSharpFile(path.join(cardsDir, file));
    if (meta) {
      allVars[meta.slug] = { vars: meta.vars, costUpgrade: meta.costUpgrade };
    }
  }

  // 2. 读取 localization
  const cardsJson = JSON.parse(
    fs.readFileSync(path.join(MOD_LOCALIZATION, "cards.json"), "utf-8").replace(/^\uFEFF/, "")
  );

  // 3. 处理每张卡牌
  const cards = await prisma.card.findMany();
  let updated = 0;

  for (const card of cards) {
    const key = `SNAKETHEBITE-${card.slug.toUpperCase()}.description`;
    const rawDesc = cardsJson[key] || card.description;
    if (!rawDesc) continue;

    const meta = allVars[card.slug];
    const vars = meta?.vars || {};

    // 解析 IfUpgraded
    const { base, upgraded } = parseIfUpgraded(rawDesc);

    // 替换变量
    const baseDesc = replaceVars(base, vars, false);
    const upDesc = replaceVars(upgraded, vars, true);

    // 清理空条件残留
    const cleanBase = baseDesc.replace(/\s*\n\s*\n\s*\n/g, "\n\n").trim();
    const cleanUp = upDesc.replace(/\s*\n\s*\n\s*\n/g, "\n\n").trim();

    await prisma.card.update({
      where: { id: card.id },
      data: {
        description: cleanBase,
        upgradedDescription: cleanUp !== cleanBase ? cleanUp : null,
      },
    });
    updated++;
  }

  console.log(`卡牌描述处理完成: ${updated} 张`);

  // 4. 处理遗物（只替换变量，不区分升级）
  const relicsJson = JSON.parse(
    fs.readFileSync(path.join(MOD_LOCALIZATION, "relics.json"), "utf-8").replace(/^\uFEFF/, "")
  );
  const relics = await prisma.relic.findMany();
  for (const relic of relics) {
    const key = `SNAKETHEBITE-${relic.slug.toUpperCase()}.description`;
    let desc = relicsJson[key] || relic.description;
    if (!desc) continue;

    // 遗物变量简化替换（没有 CanonicalVars，保留常见变量）
    desc = desc.replace(/\{(\w+):diff\(\)\}/g, "{$1}");
    desc = desc.replace(/\{(\w+):energyIcons\(\)\}/g, "{$1}");
    desc = desc.replace(/\{([^}:]+):percentLess\(\)\}/g, "{$1}%");
    desc = desc.replace(/\{([^}:]+):cond:[^}]+\}/g, "");

    await prisma.relic.update({
      where: { id: relic.id },
      data: { description: desc },
    });
  }
  console.log(`遗物描述处理完成: ${relics.length} 个`);

  // 5. 处理药水
  const potionsJson = JSON.parse(
    fs.readFileSync(path.join(MOD_LOCALIZATION, "potions.json"), "utf-8").replace(/^\uFEFF/, "")
  );
  const potions = await prisma.potion.findMany();
  for (const potion of potions) {
    const key = `SNAKETHEBITE-${potion.slug.toUpperCase()}.description`;
    let desc = potionsJson[key] || potion.description;
    if (!desc) continue;

    desc = desc.replace(/\{(\w+):diff\(\)\}/g, "{$1}");
    desc = desc.replace(/\{(\w+):energyIcons\(\)\}/g, "{$1}");
    desc = desc.replace(/\{([^}:]+):percentLess\(\)\}/g, "{$1}%");
    desc = desc.replace(/\{([^}:]+):cond:[^}]+\}/g, "");

    await prisma.potion.update({
      where: { id: potion.id },
      data: { description: desc },
    });
  }
  console.log(`药水描述处理完成: ${potions.length} 个`);

  console.log("全部处理完成！");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
