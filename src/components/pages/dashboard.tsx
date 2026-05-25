"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Download,
  RotateCcw,
  ChevronRight,
  Flame,
  Package,
  ShoppingBag,
  Users,
  ArrowUp,
  ArrowDown,
  Banknote,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPI } from "@/components/kpi";
import { LineChart } from "@/components/charts/line-chart";
import { Donut } from "@/components/charts/donut";
import { PageHeader } from "@/components/page-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CATEGORY,
  DAILY,
  DAILY_LAST,
  DELIVERIES,
  EXPIRING,
  HOURS,
  HOURLY,
  HOURLY_YEST,
  LOW_STOCK,
  MONTHLY,
  STORE,
  TOP_PRODUCTS,
} from "@/lib/mock/data";
import { fmtMoney, fmtNum, daysBetween } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/app-shell";

type ChartRange = "hourly" | "weekly" | "monthly";

export function DashboardPage() {
  const router = useRouter();
  const { lang, role } = useAppShell();
  const t = getT(lang);
  const isStaff = role === "staff";
  const [chartRange, setChartRange] = React.useState<ChartRange>("hourly");

  const todayTotal = HOURLY.reduce((s, v) => s + v, 0);
  const yestTotal = HOURLY_YEST.reduce((s, v) => s + v, 0);
  const trxs = 412;
  const trxsY = 387;
  const basket = todayTotal / trxs;
  const basketY = yestTotal / trxsY;
  const visitors = 1284;
  const visitorsY = 1198;

  const urgentAlerts = [
    ...EXPIRING.filter((e) => daysBetween(e.exp) <= 1),
    ...LOW_STOCK.filter((l) => l.stock / l.reorder < 0.25),
  ].slice(0, 5);

  const chartData =
    chartRange === "hourly" ? HOURLY : chartRange === "weekly" ? DAILY : MONTHLY;
  const chartCompare =
    chartRange === "hourly"
      ? HOURLY_YEST
      : chartRange === "weekly"
        ? DAILY_LAST
        : null;
  const chartLabels =
    chartRange === "hourly"
      ? HOURS.map((h) => `${String(h).padStart(2, "0")}:00`)
      : chartRange === "weekly"
        ? t.weekdays
        : t.months;

  const greeting = (() => {
    const h = 14;
    if (lang === "th")
      return h < 12 ? "อรุณสวัสดิ์" : h < 17 ? "สวัสดียามบ่าย" : "สวัสดียามเย็น";
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();
  const userName = isStaff ? STORE.staff[lang] : STORE.manager[lang];

  return (
    <div className="fade-in">
      <PageHeader
        title={`${greeting}, ${userName.split(" ")[0]} 👋`}
        sub={`${t.dash.welcomeSub} · ${STORE.name[lang]}`}
        right={
          <>
            <Badge variant="secondary">
              <Clock />
              {t.common.lastUpdated} 14:02
            </Badge>
            <Button size="sm" variant="outline">
              <RotateCcw />
              {t.common.refresh}
            </Button>
            <Button size="sm" variant="outline">
              <Download />
              {t.common.export}
            </Button>
          </>
        }
      />

      {/* KPI grid */}
      <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <KPI
          icon={Banknote}
          label={t.dash.revenueToday}
          value={fmtMoney(todayTotal, { compact: true })}
          sub={`${t.common.compareYesterday} · ${fmtMoney(yestTotal)}`}
          delta={(todayTotal - yestTotal) / yestTotal}
          deltaLabel={t.common.compareYesterday}
          sparkData={HOURLY}
          restricted={isStaff}
        />
        <KPI
          icon={ShoppingBag}
          label={t.dash.transactions}
          value={fmtNum(trxs)}
          sub={`${trxsY} ${t.common.yesterday.toLowerCase()}`}
          delta={(trxs - trxsY) / trxsY}
          deltaLabel={t.common.compareYesterday}
          sparkData={[28, 31, 35, 32, 38, 42, 48, 52, 49, 44, 40, 51, 62, 71, 64, 51, 39, 28]}
        />
        <KPI
          icon={Package}
          label={t.dash.basket}
          value={fmtMoney(basket)}
          sub={`${fmtMoney(basketY)} ${t.common.yesterday.toLowerCase()}`}
          delta={(basket - basketY) / basketY}
          deltaLabel={t.common.compareYesterday}
          sparkData={[110, 118, 132, 119, 124, 128, 142, 138, 145, 134, 128, 138]}
          restricted={isStaff}
        />
        <KPI
          icon={Users}
          label={t.dash.visitors}
          value={fmtNum(visitors)}
          sub={`${fmtNum(visitorsY)} ${t.common.yesterday.toLowerCase()}`}
          delta={(visitors - visitorsY) / visitorsY}
          deltaLabel={t.common.compareYesterday}
          sparkData={[42, 51, 68, 84, 96, 88, 102, 121, 116, 98, 89, 124, 156, 168, 142, 118, 96, 78]}
        />
      </div>

      {/* Chart + Alerts */}
      <div className="mb-3.5 grid grid-cols-1 gap-3.5 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-[13.5px]">{t.dash.revenueChart}</CardTitle>
            <CardDescription className="text-xs">{STORE.name[lang]}</CardDescription>
            <CardAction>
              <Tabs value={chartRange} onValueChange={(v) => setChartRange(v as ChartRange)}>
                <TabsList>
                  <TabsTrigger value="hourly">{t.dash.hourly}</TabsTrigger>
                  <TabsTrigger value="weekly">{t.dash.weekly}</TabsTrigger>
                  <TabsTrigger value="monthly">{t.dash.monthly}</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardAction>
          </CardHeader>
          <CardContent>
            <LineChart
              data={chartData}
              compare={chartCompare}
              labels={chartLabels}
              height={264}
              formatY={(v) => fmtMoney(v, { compact: true })}
            />
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="h-0.75 w-2.5 rounded-sm bg-primary" />
                {t.common.today}
              </div>
              {chartCompare && (
                <div className="flex items-center gap-1.5">
                  <span className="h-0.75 w-2.5 rounded-sm bg-muted-foreground/55" />
                  {chartRange === "hourly" ? t.common.yesterday : t.common.thisWeek}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[13.5px]">
              <span className="pulse-dot" />
              {t.dash.alertsTitle}
            </CardTitle>
            <CardDescription className="text-xs">{t.dash.alertsSub}</CardDescription>
            <CardAction>
              <Button size="sm" variant="ghost" onClick={() => router.push("/alerts")}>
                {t.common.viewAll}
                <ChevronRight />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="pt-1.5">
            <div className="flex flex-col">
              {urgentAlerts.map((a, i) => {
                const isExpiry = "exp" in a;
                const days = isExpiry ? daysBetween(a.exp as Date) : null;
                return (
                  <div
                    key={a.sku + i}
                    className={cn(
                      "flex items-center gap-2.5 py-2.5",
                      i > 0 && "border-t",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-md",
                        isExpiry
                          ? "bg-destructive/10 text-destructive"
                          : "bg-warn-50 text-[oklch(0.45_0.13_70)] dark:text-warn",
                      )}
                    >
                      {isExpiry ? <Clock className="size-4" /> : <Package className="size-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium">{a[lang]}</div>
                      <div className="mt-0.5 flex gap-2 text-[11.5px] text-muted-foreground">
                        <span className="mono">{a.sku}</span>
                        <span>·</span>
                        {isExpiry ? (
                          <span>
                            {lang === "th" ? "หมดอายุใน" : "expires in"}{" "}
                            <b className="text-destructive">
                              {days === 0
                                ? lang === "th" ? "วันนี้" : "today"
                                : `${days}${t.alert.days}`}
                            </b>
                          </span>
                        ) : (
                          <span>
                            {lang === "th" ? "เหลือ" : "only"}{" "}
                            <b className="text-[oklch(0.45_0.13_70)] dark:text-warn">
                              {(a as { stock: number }).stock}
                            </b>
                            {lang === "th" ? "" : " left"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deliveries + Top Products */}
      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-[2fr_1fr]">
        <Card className="overflow-hidden gap-0 py-0">
          <CardHeader className="py-4">
            <CardTitle className="text-[13.5px]">{t.dash.deliveriesToday}</CardTitle>
            <CardDescription className="text-xs">
              {`${DELIVERIES.filter((d) => d.status !== "delivered").length} ${
                lang === "th" ? "กำลังดำเนินการ" : "in progress"
              } · ${DELIVERIES.filter((d) => d.status === "delivered").length} ${
                lang === "th" ? "เสร็จสิ้น" : "completed"
              }`}
            </CardDescription>
            <CardAction>
              <Button size="sm" variant="ghost" onClick={() => router.push("/deliveries")}>
                {t.common.viewAll}
                <ChevronRight />
              </Button>
            </CardAction>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.deliv.orderId}</TableHead>
                <TableHead>{t.deliv.customer}</TableHead>
                <TableHead>{t.deliv.status}</TableHead>
                <TableHead className="text-right">{t.deliv.eta}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DELIVERIES.slice(0, 5).map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="mono text-xs">{d.id.slice(-6)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{d.customer[lang]}</div>
                    <div className="text-[11.5px] text-muted-foreground">
                      {d.addr[lang]} · {d.items} {lang === "th" ? "ชิ้น" : "items"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {d.status === "delivered" && (
                      <Badge variant="default">
                        <span className="size-1.5 rounded-full bg-current" />
                        {t.deliv.delivered}
                      </Badge>
                    )}
                    {d.status === "enRoute" && (
                      <Badge variant={d.late ? "destructive" : "default"}>
                        <span className="size-1.5 rounded-full bg-current" />
                        {t.deliv.enRoute}
                      </Badge>
                    )}
                    {d.status === "preparing" && (
                      <Badge variant="secondary">
                        <span className="size-1.5 rounded-full bg-current" />
                        {t.deliv.preparing}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right num">
                    {d.eta}
                    {d.late && (
                      <Badge variant="destructive" className="ml-1.5">
                        {t.deliv.late}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[13.5px]">{t.dash.topProducts}</CardTitle>
            <CardDescription className="text-xs">{t.common.today}</CardDescription>
            <CardAction>
              <Badge variant="secondary">
                <Flame />
                {lang === "th" ? "ขายดี" : "Trending"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="pt-1.5">
            <div className="flex flex-col gap-3">
              {TOP_PRODUCTS.slice(0, 5).map((p, i) => (
                <div key={p.sku} className="flex items-center gap-3">
                  <div className="flex size-6.5 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium">{p[lang]}</div>
                    <div className="text-[11.5px] text-muted-foreground">
                      <span className="mono">{p.sku}</span> · {p.sold}{" "}
                      {lang === "th" ? "ชิ้น" : "sold"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="num text-[13px] font-semibold">
                      {isStaff ? "—" : fmtMoney(p.value)}
                    </div>
                    <div
                      className={cn(
                        "num text-[11px] font-semibold",
                        p.trend > 0 ? "text-primary" : "text-destructive",
                      )}
                    >
                      {p.trend > 0 ? "+" : ""}
                      {p.trend}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown (manager only) */}
      {!isStaff && (
        <Card className="mt-3.5">
          <CardHeader>
            <CardTitle className="text-[13.5px]">{t.dash.categoryBreakdown}</CardTitle>
            <CardDescription className="text-xs">{t.common.today}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 items-center gap-7 md:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center gap-1.5">
              <Donut
                data={CATEGORY.map((c) => ({
                  value: c.v,
                  color: c.color,
                  label: c[lang],
                }))}
                size={160}
              />
              <div className="text-xs text-muted-foreground">
                <span className="num block text-[22px] font-semibold tracking-tight text-foreground">
                  {fmtMoney(CATEGORY.reduce((s, c) => s + c.v, 0), { compact: true })}
                </span>
                {lang === "th" ? "ยอดรวม" : "Total"}
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-2.5">
              {CATEGORY.map((c, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[16px_1fr_auto_auto] items-center gap-3"
                >
                  <span
                    className="size-3 rounded-sm"
                    style={{ background: c.color }}
                  />
                  <div className="text-[13px]">{c[lang]}</div>
                  <div className="num text-[13px] font-medium">{fmtMoney(c.v)}</div>
                  <Badge variant={c.trend >= 0 ? "default" : "destructive"}>
                    {c.trend >= 0 ? <ArrowUp /> : <ArrowDown />}
                    {Math.abs(c.trend).toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
