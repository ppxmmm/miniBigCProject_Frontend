"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  PackageX,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  alertBadgeCount,
  openDeliveryBadgeCount,
  type BranchData,
} from "@/lib/branch-data";
import { daysBetween, fmtNum } from "@/lib/format";
import { useBranchData } from "@/providers/branch-data-provider";
import type { Lang } from "@/types";

type NotificationKind = "expiring" | "lowStock" | "delivery";

interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
}

function buildNotifications(data: BranchData, lang: Lang): NotificationItem[] {
  const isTh = lang === "th";
  const items: NotificationItem[] = [];

  for (const item of data.expiring.slice(0, 5)) {
    const days = daysBetween(item.exp);
    items.push({
      id: `exp-${item.sku}-${item.exp.getTime()}-${item.loc}`,
      kind: "expiring",
      title: isTh ? item.th : item.en,
      subtitle: isTh
        ? `หมดอายุใน ${days} วัน · คงเหลือ ${fmtNum(item.stock)}`
        : `Expires in ${days}d · ${fmtNum(item.stock)} in stock`,
      href: "/alerts",
      icon: AlertTriangle,
    });
  }

  for (const item of data.lowStock.slice(0, 5)) {
    items.push({
      id: `low-${item.sku}-${item.loc}`,
      kind: "lowStock",
      title: isTh ? item.th : item.en,
      subtitle: isTh
        ? `คงเหลือ ${fmtNum(item.stock)} / จุดสั่ง ${fmtNum(item.reorder)}`
        : `Stock ${fmtNum(item.stock)} / reorder ${fmtNum(item.reorder)}`,
      href: "/alerts",
      icon: PackageX,
    });
  }

  for (const delivery of data.deliveries.filter((d) => d.status !== "delivered").slice(0, 4)) {
    items.push({
      id: `del-${delivery.id}`,
      kind: "delivery",
      title: delivery.customer[lang],
      subtitle: isTh
        ? `${delivery.items} รายการ · ETA ${delivery.eta}`
        : `${delivery.items} items · ETA ${delivery.eta}`,
      href: "/deliveries",
      icon: Truck,
    });
  }

  return items.slice(0, 10);
}

interface NotificationBellProps {
  lang: Lang;
}

export function NotificationBell({ lang }: NotificationBellProps) {
  const router = useRouter();
  const { data } = useBranchData();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const isTh = lang === "th";

  const alertCount = alertBadgeCount(data);
  const deliveryCount = openDeliveryBadgeCount(data);
  const totalCount = alertCount + deliveryCount;
  const items = React.useMemo(() => buildNotifications(data, lang), [data, lang]);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleNavigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div ref={rootRef} className="relative">
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label={isTh ? "การแจ้งเตือน" : "Notifications"}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell />
      </Button>
      {totalCount > 0 && (
        <span
          className="pointer-events-none absolute right-1.5 top-1.5 flex min-w-[14px] items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-bold leading-none text-white ring-2 ring-card"
          aria-hidden
        >
          {totalCount > 9 ? "9+" : totalCount}
        </span>
      )}

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-(--sh-2)"
        >
          <div className="border-b border-border px-3.5 py-2.5">
            <div className="text-[13px] font-semibold">
              {isTh ? "การแจ้งเตือน" : "Notifications"}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {totalCount > 0
                ? isTh
                  ? `${totalCount} รายการที่ต้องติดตาม`
                  : `${totalCount} items need attention`
                : isTh
                  ? "ไม่มีรายการใหม่"
                  : "You're all caught up"}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-3.5 py-6 text-center text-[12.5px] text-muted-foreground">
                {isTh
                  ? "ไม่มีการแจ้งเตือนจาก backend ในขณะนี้"
                  : "No alerts from the backend right now"}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-muted/60"
                        onClick={() => handleNavigate(item.href)}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
                            item.kind === "delivery"
                              ? "bg-info-50 text-info"
                              : item.kind === "expiring"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-warn-50 text-warn",
                          )}
                        >
                          <Icon className="size-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-medium">
                            {item.title}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-muted-foreground">
                            {item.subtitle}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-3 py-2">
            <Link
              href="/alerts"
              className="text-[11.5px] font-medium text-primary hover:underline"
              onClick={() => setOpen(false)}
            >
              {isTh ? "ดูการแจ้งเตือนสต็อก" : "View stock alerts"}
            </Link>
            {deliveryCount > 0 && (
              <Link
                href="/deliveries"
                className="text-[11.5px] font-medium text-primary hover:underline"
                onClick={() => setOpen(false)}
              >
                {isTh ? "ดูการจัดส่ง" : "View deliveries"}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
