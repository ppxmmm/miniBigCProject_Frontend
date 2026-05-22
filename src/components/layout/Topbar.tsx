"use client";

import { Bell, Globe, Moon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b pl-4 pr-0 md:pl-6 md:pr-0">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <div className="relative hidden md:block w-full max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ค้นหาสินค้า, ออเดอร์, ลูกค้า…"
          className="pl-9 pr-16 bg-muted/50 h-9"
        />
      </div>

      <div className="flex-1" />

      <div className="flex shrink-0 items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Globe className="size-4" />
          <span className="font-mono text-xs uppercase">TH</span>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          <Moon className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
        >
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive ring-2 ring-background" />
        </Button>

        <Separator orientation="vertical" className="mx-0 h-9" />

        <div className="flex items-center gap-2 pl-0">
          <Avatar>
            <AvatarFallback className="bg-emerald-500 text-white text-xs font-semibold">
              PT
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-sm font-semibold">ปริญญา</span>
            <span className="text-xs text-muted-foreground">ผู้จัดการสาขา</span>
          </div>
        </div>
      </div>
    </header>
  );
}