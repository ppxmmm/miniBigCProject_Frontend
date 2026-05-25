"use client";

import * as React from "react";
import {
  Calendar,
  Download,
  Banknote,
  ShoppingBag,
  Package,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPI } from "@/components/kpi";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { Donut } from "@/components/charts/donut";
import { PageHeader, Restricted } from "@/components/page-helpers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CATEGORY,
  DAILY,
  DAILY_LAST,
  HOURS,
  HOURLY,
  HOURLY_YEST,
  MONTHLY,
  PAYMENTS,
  TOP_PRODUCTS,
} from "@/lib/mock/data";
import { fmtMoney, fmtNum, fmtPct } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { useAppShell } from "@/components/layout/app-shell";

type Range = "day" | "week" | "month" | "year";

export function RevenuePage() {
  const { lang, role } = useAppShell();
  const t = getT(lang);
  const [range, setRange] = React.useState<Range>("day");

  if (role === "staff")
    return (
      <>
        <PageHeader title={t.rev.title} sub={t.rev.sub} />
        <Restricted lang={lang} />
      </>
    );

  const series =
    range === "day"
      ? HOURLY
      : range === "week"
        ? DAILY
        : range === "month"
          ? null
          : MONTHLY;
  const compare =
    range === "day" ? HOURLY_YEST : range === "week" ? DAILY_LAST : null;

  const monthly =
    range === "month"
      ? Array.from(
          { length: 22 },
          (_, i) => 180000 + Math.sin(i * 0.6) * 38000 + i * 4200 + (i % 3) * 1800,
        )
      : null;
  const monthlyData = monthly ? monthly.map((v) => Math.round(v)) : null;

  const labels =
    range === "day"
      ? HOURS.map((h) => `${String(h).padStart(2, "0")}:00`)
      : range === "week"
        ? t.weekdays
        : range === "year"
          ? t.months
          : Array.from({ length: 22 }, (_, i) => String(i + 1));

  const activeSeries = (series || monthlyData) as number[];
  const total = activeSeries.reduce((s, v) => s + v, 0);
  const compTotal = compare ? compare.reduce((s, v) => s + v, 0) : null;
  const trxs = Math.round(total / 480);
  const growth = compTotal ? (total - compTotal) / compTotal : 0.082;

  const paymentColor = (i: number) =>
    i === 0
      ? "var(--primary)"
      : i === 1
        ? "oklch(0.62 0.14 200)"
        : i === 2
          ? "oklch(0.62 0.14 280)"
          : i === 3
            ? "oklch(0.72 0.15 65)"
            : "oklch(0.66 0.04 95)";

  return (
    <div className="fade-in">
      <PageHeader
        title={t.rev.title}
        sub={t.rev.sub}
        right={
          <>
            <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
              <TabsList>
                <TabsTrigger value="day">{t.common.day}</TabsTrigger>
                <TabsTrigger value="week">{t.common.week}</TabsTrigger>
                <TabsTrigger value="month">{t.common.month}</TabsTrigger>
                <TabsTrigger value="year">{t.common.year}</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button size="sm" variant="outline">
              <Calendar />22 {t.months[4]} 2026
            </Button>
            <Button size="sm" variant="outline">
              <Download />
              {t.common.export}
            </Button>
          </>
        }
      />

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <KPI
          icon={Banknote}
          label={t.rev.total}
          value={fmtMoney(total, { compact: true })}
          sub={compTotal ? `vs ${fmtMoney(compTotal, { compact: true })}` : undefined}
          delta={growth}
          deltaLabel={t.common.compareYesterday}
          sparkData={activeSeries}
        />
        <KPI
          icon={ShoppingBag}
          label={t.rev.trxs}
          value={fmtNum(trxs)}
          sub={`${(trxs / activeSeries.length).toFixed(0)} ${
            lang === "th" ? "ต่อชั่วโมง" : "per hour"
          }`}
          delta={0.067}
          deltaLabel={t.common.compareYesterday}
        />
        <KPI
          icon={Package}
          label={t.rev.avg}
          value={fmtMoney(total / trxs)}
          delta={0.024}
          deltaLabel={t.common.compareYesterday}
        />
        <KPI
          icon={TrendingUp}
          label={t.rev.growth}
          value={fmtPct(growth, { sign: true })}
          delta={0.012}
          deltaLabel={lang === "th" ? "เทียบเดือนก่อน" : "vs last month"}
          sparkData={[2.1, 3.4, 4.8, 5.2, 6.4, 7.1, 8.2]}
        />
      </div>

      <Card className="mb-3.5">
        <CardHeader>
          <CardTitle className="text-[13.5px]">{t.rev.byHour}</CardTitle>
          <CardDescription className="text-xs">
            {range === "day"
              ? t.common.today
              : range === "week"
                ? t.common.thisWeek
                : range === "month"
                  ? t.common.thisMonth
                  : t.common.thisYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart
            data={activeSeries}
            compare={compare}
            labels={labels}
            height={300}
            formatY={(v) => fmtMoney(v, { compact: true })}
          />
        </CardContent>
      </Card>

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-[13.5px]">{t.rev.byCategory}</CardTitle>
            <CardDescription className="text-xs">{t.common.today}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3.5">
              {CATEGORY.map((c, i) => (
                <div key={i}>
                  <div className="mb-1.5 flex justify-between">
                    <div className="flex items-center gap-2 text-[13px] font-medium">
                      <span
                        className="size-2.5 rounded-sm"
                        style={{ background: c.color }}
                      />
                      {c[lang]}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="num text-[13px] font-semibold">
                        {fmtMoney(c.v)}
                      </span>
                      <Badge variant={c.trend >= 0 ? "default" : "destructive"}>
                        {c.trend >= 0 ? "+" : ""}
                        {c.trend.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${c.share * 100}%`,
                        background: c.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[13.5px]">{t.rev.byPayment}</CardTitle>
            <CardDescription className="text-xs">{t.common.today}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-[auto_1fr] items-center gap-5">
            <Donut
              data={PAYMENTS.map((p, i) => ({
                value: p.v,
                color: paymentColor(i),
              }))}
              size={150}
            />
            <div className="flex flex-col gap-2">
              {PAYMENTS.map((p, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[12px_1fr_auto] items-center gap-2.5"
                >
                  <span
                    className="size-2.5 rounded-sm"
                    style={{ background: paymentColor(i) }}
                  />
                  <span className="text-[13px]">{p[lang]}</span>
                  <span className="num text-[13px] font-semibold">
                    {(p.v * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-[13.5px]">{t.rev.forecast}</CardTitle>
            <CardDescription className="text-xs">
              {lang === "th"
                ? "พยากรณ์รายวัน · ความเชื่อมั่น 84%"
                : "Daily forecast · 84% confidence"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={[268000, 282000, 296000, 318000, 304000, 286000, 312000]}
              labels={t.weekdays.slice(0, 7)}
              height={200}
              formatY={(v) => fmtMoney(v, { compact: true })}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden gap-0 py-0">
          <CardHeader className="py-4">
            <CardTitle className="text-[13.5px]">
              {lang === "th" ? "สินค้าทำรายได้สูงสุด" : "Top revenue products"}
            </CardTitle>
            <CardDescription className="text-xs">{t.common.today}</CardDescription>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.alert.product}</TableHead>
                <TableHead className="text-right">
                  {lang === "th" ? "จำนวน" : "Qty"}
                </TableHead>
                <TableHead className="text-right">{t.rev.total}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TOP_PRODUCTS.map((p) => (
                <TableRow key={p.sku}>
                  <TableCell>
                    <div className="text-[13px] font-medium">{p[lang]}</div>
                    <div className="mono text-[11.5px] text-muted-foreground">
                      {p.sku}
                    </div>
                  </TableCell>
                  <TableCell className="num text-right font-medium">
                    {p.sold}
                  </TableCell>
                  <TableCell className="num text-right font-semibold">
                    {fmtMoney(p.value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
