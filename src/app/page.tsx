import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Sword, Sparkles, Shield, FlaskConical, Scroll, BookOpen, ExternalLink, Globe, Code } from "lucide-react";

const categories = [
  {
    title: "卡牌总览",
    desc: "查看所有自定义卡牌的效果、升级与搭配",
    href: "/cards",
    icon: Sword,
    bg: "bg-red-900/40",
    border: "border-red-500/30",
    iconColor: "text-red-400",
  },

  {
    title: "遗物收藏",
    desc: "探索所有自定义遗物的被动效果",
    href: "/relics",
    icon: Shield,
    bg: "bg-blue-900/40",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
  },
  {
    title: "药水研究所",
    desc: "了解所有自定义药水的使用时机与效果",
    href: "/potions",
    icon: FlaskConical,
    bg: "bg-green-900/40",
    border: "border-green-500/30",
    iconColor: "text-green-400",
  },
  {
    title: "附魔",
    desc: "查看卡牌附魔效果与强化机制",
    href: "/enchantments",
    icon: Scroll,
    bg: "bg-purple-900/40",
    border: "border-purple-500/30",
    iconColor: "text-purple-400",
  },
  {
    title: "先古之民",
    desc: "阅读所有自定义事件与对话链",
    href: "/ancients",
    icon: BookOpen,
    bg: "bg-orange-900/40",
    border: "border-orange-500/30",
    iconColor: "text-orange-400",
  },
];

export default function HomePage() {
  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -my-8 min-h-screen">
      {/* 全屏背景图 */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-20"
        style={{ backgroundImage: "url(/Snake_the_Bite.png)" }}
      />
      {/* 暗色遮罩 */}
      <div className="fixed inset-0 bg-black/75 -z-10" />

      {/* 内容区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero 区域 */}
        <section className="relative rounded-xl border border-emerald-500/20 bg-black/50 backdrop-blur-sm p-6 md:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* 左侧标题 */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-5xl md:text-6xl">🐍</span>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                    SnakeTheBite
                  </h1>
                  <p className="text-xl text-emerald-400 font-medium">
                    杀戮尖塔2 Mod 百科
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>131 次编辑</span>
                <span className="text-border">|</span>
                <span>131 篇文章</span>
                <span className="text-border">|</span>
                <span>0 张图片</span>
              </div>
              <p className="text-sm text-yellow-400/90 max-w-2xl">
                Mod 版本：v0.10.2 · 当前在抢先体验阶段，本站内容持续更新中，欢迎协助 Wiki 维护。
              </p>
            </div>
          </div>
        </section>

        {/* 主体内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧分类网格 */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link key={cat.href} href={cat.href} className="group">
                    <Card className={`h-full border ${cat.border} bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all overflow-hidden`}>
                      {/* 卡片顶部图标区域 */}
                      <div className={`h-32 ${cat.bg} flex items-center justify-center relative overflow-hidden`}>
                        <Icon className={`w-16 h-16 ${cat.iconColor} opacity-80 group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                          {cat.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {cat.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-4">
            {/* 关于 Mod */}
            <Card className="border-border/50 bg-black/50 backdrop-blur-sm">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-white">关于 SnakeTheBite</h3>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                  <li>SnakeTheBite 是由社区开发者制作的杀戮尖塔2 Mod。</li>
                  <li>本 Wiki 旨在建立完备的 Mod 内容百科，包含卡牌、能力、遗物、药水、附魔与先古之民事件。</li>
                  <li>注册账号后即可参与编辑，协助我们完善内容。</li>
                </ul>
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card className="border-border/50 bg-black/50 backdrop-blur-sm">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-white">快速开始</h3>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/cards"
                    className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Sword className="w-4 h-4" />
                    浏览卡牌
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    登录编辑
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 相关链接 */}
            <Card className="border-border/50 bg-black/50 backdrop-blur-sm">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-white">相关链接</h3>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://store.steampowered.com/app/3004100/Slay_the_Spire_2/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Steam 商店页面
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                  <a
                    href="https://github.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
                  >
                    <Code className="w-4 h-4" />
                    Mod 源码仓库
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
