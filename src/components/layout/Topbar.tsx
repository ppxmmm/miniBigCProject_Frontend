"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Search, Globe, Moon, Sun, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getT } from "@/lib/i18n";
import type { CurrentUser, Lang } from "@/types";

interface TopbarProps {
  lang: Lang;
  toggleLang: () => void;
  showSearch: boolean;
  currentUser: CurrentUser;
  onOpenSidebar: () => void;
  right?: React.ReactNode;
}

export function Topbar({
  lang,
  toggleLang,
  showSearch,
  currentUser,
  onOpenSidebar,
  right,
}: TopbarProps) {
  const tx = getT(lang);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-30 flex h-15 items-center gap-3 border-b bg-card px-5 md:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onOpenSidebar}
        className="md:hidden"
      >
        <Menu />
      </Button>

      {showSearch && (
        <div className="relative hidden flex-1 md:block md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tx.common.search}
            className="h-9.5 bg-muted pl-9 pr-12"
          />
        </div>
      )}
      <div className="flex-1 md:hidden" />

      <div className="ml-auto flex items-center gap-1.5">
        {right}
        <Button size="sm" variant="ghost" onClick={toggleLang} title="Language">
          <Globe />
          <span className="font-mono text-[11px] uppercase">{lang}</span>
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          title="Theme"
        >
          {isDark ? <Sun /> : <Moon />}
        </Button>
        <div className="relative">
          <Button size="icon-sm" variant="ghost">
            <Bell />
          </Button>
          <span className="absolute right-1.5 top-1.5 size-1.75 rounded-full bg-destructive ring-2 ring-card" />
        </div>
        <Separator orientation="vertical" className="mx-1 hidden h-5 md:block" />
        <div className="hidden items-center gap-2 md:flex">
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary-50 text-[11px] font-semibold text-primary">
              {currentUser.initials}
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <div className="text-[12.5px] font-semibold">
              {currentUser.name.split(" ")[0]}
            </div>
            <div className="text-[10.5px] text-muted-foreground">
              {currentUser.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
