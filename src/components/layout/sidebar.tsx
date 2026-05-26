"use client";

import * as React from "react";
import {
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  Truck,
  Sparkles,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { BrandMark } from "@/components/brand-mark";
import {
  alertBadgeCount,
  openDeliveryBadgeCount,
} from "@/lib/branch-data";
import { getT } from "@/lib/i18n";
import { navigateMainNav } from "@/lib/navigate";
import { useBranchData } from "@/providers/branch-data-provider";
import type { CurrentUser, Lang, Role } from "@/types";

interface NavItemDef {
  href: string;
  icon: LucideIcon;
  label: string;
  allow: Role[];
  badge?: number;
}

interface SidebarProps {
  pathname: string;
  lang: Lang;
  role: Role;
  sbOpen: boolean;
  setSbOpen: (open: boolean) => void;
  sbCollapsed: boolean;
  setSbCollapsed: (c: boolean) => void;
  currentUser: CurrentUser;
  onSignOut: () => void;
}

export function Sidebar({
  pathname,
  lang,
  role,
  sbOpen,
  setSbOpen,
  sbCollapsed,
  setSbCollapsed,
  currentUser,
  onSignOut,
}: SidebarProps) {
  const router = useRouter();
  const tx = getT(lang);
  const { data: branch } = useBranchData();
  const alertCount = alertBadgeCount(branch);
  const deliveryCount = openDeliveryBadgeCount(branch);

  const NAV: NavItemDef[] = [
    { href: "/dashboard", icon: LayoutDashboard, label: tx.nav.dashboard, allow: ["manager", "staff"] },
    { href: "/revenue", icon: TrendingUp, label: tx.nav.revenue, allow: ["manager"] },
    {
      href: "/alerts",
      icon: AlertTriangle,
      label: tx.nav.alerts,
      allow: ["manager", "staff"],
      badge: alertCount > 0 ? alertCount : undefined,
    },
    {
      href: "/deliveries",
      icon: Truck,
      label: tx.nav.delivery,
      allow: ["manager", "staff"],
      badge: deliveryCount > 0 ? deliveryCount : undefined,
    },
    { href: "/suggestions", icon: Sparkles, label: tx.nav.suggestions, allow: ["manager"] },
  ];
  const ACCOUNT: NavItemDef[] = [
    { href: "/profile", icon: User, label: tx.nav.profile, allow: ["manager", "staff"] },
  ];

  const inner = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <BrandMark size={32} />
        {!sbCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold leading-tight tracking-tight">
              {tx.appName}
            </div>
            <div className="text-[11px] font-medium text-muted-foreground">
              {tx.appSub}
            </div>
          </div>
        )}
        {/* mobile close */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setSbOpen(false)}
          className="md:hidden"
        >
          <X />
        </Button>
      </div>

      {/* Store selector */}
      {!sbCollapsed && (
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2.5 rounded-md border bg-muted px-3 py-2.5 text-[12.5px]">
            <div className="size-2 shrink-0 rounded-full bg-primary" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{branch.store.short[lang]}</div>
              <div className="mono text-[10.5px] text-muted-foreground">
                {branch.store.code}
              </div>
            </div>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2">
        {!sbCollapsed && (
          <div className="px-3 pb-1.5 pt-2.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {tx.nav.main}
          </div>
        )}
        {NAV.map((n) => (
          <NavItem
            key={n.href}
            item={n}
            active={pathname === n.href || pathname.startsWith(`${n.href}/`)}
            disabled={!n.allow.includes(role)}
            collapsed={sbCollapsed}
            onClick={() => {
              setSbOpen(false);
              navigateMainNav(router, pathname, n.href);
            }}
          />
        ))}

        {!sbCollapsed && (
          <div className="px-3 pb-1.5 pt-4 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {tx.nav.account}
          </div>
        )}
        {ACCOUNT.map((n) => (
          <NavItem
            key={n.href}
            item={n}
            active={pathname === n.href || pathname.startsWith(`${n.href}/`)}
            collapsed={sbCollapsed}
            onClick={() => {
              setSbOpen(false);
              navigateMainNav(router, pathname, n.href);
            }}
          />
        ))}
      </nav>

      {/* User */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8 bg-primary-50 text-primary">
                <AvatarFallback className="bg-primary-50 text-[12px] font-semibold text-primary">
              {currentUser.initials}
            </AvatarFallback>
          </Avatar>
          {!sbCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {currentUser.role}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onSignOut}
                title="Sign out"
              >
                <LogOut />
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200 md:flex",
          sbCollapsed ? "w-16" : "w-62",
        )}
      >
        {inner}
        {/* collapse toggle */}
        <button
          onClick={() => setSbCollapsed(!sbCollapsed)}
          type="button"
          className="absolute -right-3 top-7 z-10 flex size-6 items-center justify-center rounded-full border bg-card shadow-sm hover:bg-accent"
        >
          {sbCollapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronLeft className="size-3.5" />
          )}
        </button>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={sbOpen} onOpenChange={setSbOpen}>
        <SheetContent
          side="left"
          className="w-72 bg-sidebar p-0 [&>button]:hidden"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-full flex-col">{inner}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}

interface NavItemProps {
  item: NavItemDef;
  active: boolean;
  disabled?: boolean;
  collapsed: boolean;
  onClick: () => void;
}

function NavItem({ item, active, disabled, collapsed, onClick }: NavItemProps) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={collapsed ? item.label : undefined}
      type="button"
      className={cn(
        "mb-0.5 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13.5px] transition-colors",
        active
          ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
          : "font-medium text-sidebar-foreground hover:bg-accent",
        disabled && "opacity-50 hover:bg-transparent",
        collapsed && "justify-center px-2",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge != null && (
            <span
              className={cn(
                "min-w-4.5 rounded-full px-1.5 py-0.5 text-center text-[10.5px] font-semibold text-white",
                active ? "bg-primary" : "bg-destructive",
              )}
            >
              {item.badge}
            </span>
          )}
          {disabled && (
            <Lock className="size-3 shrink-0 opacity-60" />
          )}
        </>
      )}
    </button>
  );
}
