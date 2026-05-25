"use client";

import * as React from "react";
import {
  Filter,
  Download,
  RotateCcw,
  Search,
  Check,
  Clock,
  Package,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, Empty } from "@/components/page-helpers";
import { fmtD, fmtMoney, daysBetween } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/app-shell";
import { useBranchData } from "@/providers/branch-data-provider";

type Tab = "expired" | "low";
type Severity = "urgent" | "warning" | "info";

export function AlertsPage() {
  const { lang, role } = useAppShell();
  const { data: branch } = useBranchData();
  const t = getT(lang);
  const [tab, setTab] = React.useState<Tab>("expired");
  const [q, setQ] = React.useState("");
  const [acknowledged, setAcknowledged] = React.useState<Set<string>>(new Set());

  const { expiring: EXPIRING, lowStock: LOW_STOCK } = branch;

  const expiringList = EXPIRING.map((e) => {
    const daysLeft = daysBetween(e.exp);
    const severity: Severity =
      daysLeft <= 1 ? "urgent" : daysLeft <= 3 ? "warning" : "info";
    return { ...e, daysLeft, severity };
  });
  const lowList = LOW_STOCK.map((l) => {
    const pct = l.stock / l.reorder;
    const severity: Severity =
      pct < 0.2 ? "urgent" : pct < 0.4 ? "warning" : "info";
    return { ...l, pct, severity };
  });

  const list = tab === "expired" ? expiringList : lowList;
  const filtered = q
    ? list.filter(
        (x) =>
          (x[lang] || "").toLowerCase().includes(q.toLowerCase()) ||
          x.sku.toLowerCase().includes(q.toLowerCase()),
      )
    : list;

  const counts = {
    expired: expiringList.filter((e) => e.severity !== "info").length,
    low: lowList.filter((l) => l.severity !== "info").length,
  };

  const sevBadge = (s: Severity) => {
    if (s === "urgent")
      return (
        <Badge variant="destructive">
          <span className="size-1.5 rounded-full bg-current" />
          {t.alert.urgent}
        </Badge>
      );
    if (s === "warning")
      return (
        <Badge variant="outline">
          <span className="size-1.5 rounded-full bg-current" />
          {t.alert.warning}
        </Badge>
      );
    return (
      <Badge variant="secondary">
        <span className="size-1.5 rounded-full bg-current" />
        {t.alert.info}
      </Badge>
    );
  };

  const ack = (sku: string) => {
    setAcknowledged((s) => new Set([...s, sku]));
    toast.success(lang === "th" ? `รับทราบ ${sku} แล้ว` : `Acknowledged ${sku}`);
  };

  return (
    <div className="fade-in">
      <PageHeader
        title={t.alert.title}
        sub={t.alert.sub}
        right={
          <>
            <Button size="sm" variant="outline">
              <Filter />
              {t.common.filter}
            </Button>
            <Button size="sm" variant="outline">
              <Download />
              {t.common.export}
            </Button>
            {role === "manager" && (
              <Button size="sm">
                <RotateCcw />
                {lang === "th" ? "ซิงค์สต็อก" : "Sync stock"}
              </Button>
            )}
          </>
        }
      />

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-[var(--color-destructive)]/10 text-destructive">
                <Clock className="size-5" />
              </div>
              <div>
                <div className="text-[12.5px] text-muted-foreground">
                  {lang === "th" ? "หมดอายุภายใน 1 วัน" : "Expiring within 1 day"}
                </div>
                <div className="num text-[26px] font-semibold tracking-tight">
                  {expiringList.filter((e) => e.daysLeft <= 1).length}
                </div>
                <div className="text-[11.5px] text-muted-foreground">
                  {lang === "th" ? "มูลค่าเสี่ยงสูญเสีย" : "Value at risk"} ·{" "}
                  <span className="num font-semibold text-destructive">
                    {fmtMoney(
                      expiringList
                        .filter((e) => e.daysLeft <= 1)
                        .reduce((s, e) => s + e.stock * e.price, 0),
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-[var(--warn-50)] text-[color:oklch(0.45_0.13_70)] dark:text-[var(--warn)]">
                <Package className="size-5" />
              </div>
              <div>
                <div className="text-[12.5px] text-muted-foreground">
                  {lang === "th"
                    ? "สต็อกต่ำกว่าจุดสั่งซื้อ"
                    : "Below reorder point"}
                </div>
                <div className="num text-[26px] font-semibold tracking-tight">
                  {lowList.length}
                </div>
                <div className="text-[11.5px] text-muted-foreground">
                  {lang === "th" ? "ต้องสั่งทันที" : "Need immediate reorder"} ·{" "}
                  <span className="num font-semibold text-destructive">
                    {lowList.filter((l) => l.pct < 0.2).length}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-[var(--primary-50)] text-primary">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <div className="text-[12.5px] text-muted-foreground">
                  {lang === "th" ? "ดำเนินการแล้ว วันนี้" : "Resolved today"}
                </div>
                <div className="num text-[26px] font-semibold tracking-tight">
                  {12 + acknowledged.size}
                </div>
                <div className="text-[11.5px] text-muted-foreground">
                  {lang === "th" ? "เฉลี่ยเวลา" : "Avg resolution"} · 8{" "}
                  {lang === "th" ? "น." : "min"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap items-center gap-3 p-4.5">
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            <TabsList>
              <TabsTrigger value="expired">
                {t.alert.expired} · {counts.expired}
              </TabsTrigger>
              <TabsTrigger value="low">
                {t.alert.low} · {counts.low}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative min-w-60 max-w-90 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.common.search}
              className="pl-8"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="ml-auto text-[12.5px] text-muted-foreground">
            {t.common.showing} <b>{filtered.length}</b> {t.common.of}{" "}
            <b>{list.length}</b>
          </div>
        </div>
        <Separator />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.alert.sku}</TableHead>
                <TableHead>{t.alert.product}</TableHead>
                <TableHead>{t.alert.category}</TableHead>
                {tab === "expired" ? (
                  <>
                    <TableHead>{t.alert.expiry}</TableHead>
                    <TableHead>{t.alert.daysLeft}</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>{t.alert.stock}</TableHead>
                    <TableHead>{t.alert.reorder}</TableHead>
                  </>
                )}
                <TableHead>{t.alert.location}</TableHead>
                <TableHead>{t.alert.severity}</TableHead>
                <TableHead className="text-right">{t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const isAcked = acknowledged.has(item.sku);
                const isExpiredRow = tab === "expired";
                return (
                  <TableRow
                    key={item.sku}
                    className={cn(isAcked && "opacity-50")}
                  >
                    <TableCell className="mono text-xs">{item.sku}</TableCell>
                    <TableCell className="font-medium">{item[lang]}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.cat[lang]}</Badge>
                    </TableCell>
                    {isExpiredRow ? (
                      <>
                        <TableCell className="num">
                          {fmtD((item as { exp: Date }).exp, lang)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "num font-semibold",
                              (item as { daysLeft: number }).daysLeft <= 1 &&
                                "text-destructive",
                              (item as { daysLeft: number }).daysLeft > 1 &&
                                (item as { daysLeft: number }).daysLeft <= 3 &&
                                "text-[color:oklch(0.45_0.13_70)] dark:text-[var(--warn)]",
                            )}
                          >
                            {(item as { daysLeft: number }).daysLeft === 0
                              ? lang === "th"
                                ? "วันนี้"
                                : "today"
                              : `${(item as { daysLeft: number }).daysLeft} ${t.alert.days}`}
                          </span>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <span className="num min-w-6.5 font-semibold">
                              {item.stock}
                            </span>
                            <div className="max-w-20 flex-1">
                              <Progress
                                value={(item as { pct: number }).pct * 100}
                                className={cn(
                                  (item as { pct: number }).pct < 0.2 &&
                                    "[&>div]:bg-destructive",
                                  (item as { pct: number }).pct >= 0.2 &&
                                    (item as { pct: number }).pct < 0.4 &&
                                    "[&>div]:bg-[var(--warn)]",
                                )}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="num">
                          {(item as { reorder: number }).reorder}
                        </TableCell>
                      </>
                    )}
                    <TableCell className="mono text-xs text-muted-foreground">
                      {item.loc}
                    </TableCell>
                    <TableCell>{sevBadge(item.severity)}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1.5">
                        {!isAcked && role === "manager" && (
                          <Button size="sm" variant="outline">
                            {tab === "expired" ? t.alert.markdown : t.alert.reorderNow}
                          </Button>
                        )}
                        {!isAcked ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => ack(item.sku)}
                          >
                            <Check />
                            {t.common.acknowledge}
                          </Button>
                        ) : (
                          <Badge variant="default">
                            <Check />
                            {lang === "th" ? "รับทราบแล้ว" : "Acknowledged"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Empty
                      title={t.common.noData}
                      sub={
                        lang === "th"
                          ? "ไม่พบสินค้าตามคำค้นหา"
                          : "No items match your search"
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
