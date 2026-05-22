"use client";

import * as React from "react";
import { ShoppingBag } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/layout/sidebar/NavMain";
import { NavUser } from "@/components/layout/sidebar/NavUser";

// mock data
const data = {
  user: {
    name: "ปริญญา ทวีศักดิ์",
    role: "ผู้จัดการสาขา",
    email: "parinya.t@minibigc.example",
    initials: "PT",
  },
  store: { code: "MBC-0421", name: "ทองหล่อ ซ.13" },
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="/" />}>
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <ShoppingBag className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Mini BigC</span>
                <span className="truncate text-xs text-muted-foreground">
                  {data.store.name}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
