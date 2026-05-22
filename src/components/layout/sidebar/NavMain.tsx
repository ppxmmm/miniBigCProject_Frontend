"use client";

import {
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  Truck,
  Sparkles,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "หน้าหลัก", url: "/", icon: LayoutDashboard },
  { title: "รายได้", url: "/revenue", icon: TrendingUp },
  { title: "การแจ้งเตือนสต็อก", url: "/alerts", icon: AlertTriangle, badge: "7" },
  { title: "การจัดส่ง", url: "/delivery", icon: Truck, badge: "4" },
  { title: "ข้อเสนอแนะ", url: "/suggestions", icon: Sparkles },
];

const accountNav = [{ title: "โปรไฟล์", url: "/profile", icon: User }];

export function NavMain() {
  const pathname = usePathname();

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>เมนูหลัก</SidebarGroupLabel>
        <SidebarMenu>
          {mainNav.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                render={<Link href={item.url} />}
                isActive={pathname === item.url}
                tooltip={item.title}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
              {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>บัญชี</SidebarGroupLabel>
        <SidebarMenu>
          {accountNav.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                render={<Link href={item.url} />}
                isActive={pathname === item.url}
                tooltip={item.title}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
