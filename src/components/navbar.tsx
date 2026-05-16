"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sword, FlaskConical, Sparkles, Shield, Scroll, BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/cards", label: "卡牌", icon: Sword },

  { href: "/relics", label: "遗物", icon: Shield },
  { href: "/potions", label: "药水", icon: FlaskConical },
  { href: "/enchantments", label: "附魔", icon: Scroll },
  { href: "/ancients", label: "先古之民", icon: BookOpen },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:text-primary/90 transition-colors">
            <span className="text-emerald-400">🐍</span>
            <span>SnakeTheBite Wiki</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {session.user.name || session.user.email}
                </span>
                {session.user.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      后台管理
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  退出
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">登录</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">注册</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-card px-4 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-border/50 flex flex-col gap-2">
            {session?.user ? (
              <>
                <span className="text-sm text-muted-foreground px-3">
                  {session.user.name || session.user.email}
                </span>
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      后台管理
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" className="w-full" onClick={() => signOut()}>
                  退出
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">登录</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">注册</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
