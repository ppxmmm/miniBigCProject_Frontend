"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Banknote,
  CheckCircle2,
  Download,
  Flame,
  Package,
  ReceiptText,
  RefreshCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart } from "@/components/charts/line-chart";
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
import { fmtMoney, fmtNum, fmtPct } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { useAppShell } from "@/components/layout/app-shell";
import { useBranchData } from "@/providers/branch-data-provider";
import { useHashScroll } from "@/hooks/use-hash-scroll";
import type { PaymentShare } from "@/lib/branch-data";
import type { Category, Lang, Product } from "@/types";

type Range = "day" | "week" | "month" | "year";

type CategoryPacing = Category & {
  comparison: number;
  gap: number;
};

type ProductMover = Product & {
  lift: number;
  rate: number;
};

export function RevenuePage() {
  const { lang, role } = useAppShell();
  const { data, loading, error, refetch } = useBranchData();
  const t = getT(lang);
  const [range, setRange] = React.useState<Range>("day");
  const [exported, setExported] = React.useState(false);

  const hasRevenueData =
    data.hourly.length > 0 ||
    data.daily.length > 0 ||
    data.monthly.length > 0 ||
    data.category.length > 0;
  const branch = data;
  const snapshot = getRevenueSnapshot(branch, range);
  const hasRenderableData = hasRevenueData && snapshot.actual.length > 0;

  useHashScroll(role !== "staff");

  if (role === "staff")
    return (
      <>
        <PageHeader title={t.rev.title} sub={t.rev.sub} />
        <Restricted lang={lang} />
      </>
    );

  const total = sum(snapshot.actual);
  const comparisonTotal = sum(snapshot.comparison);
  const gap = total - comparisonTotal;
  const gapPct = comparisonTotal > 0 ? gap / comparisonTotal : 0;
  const ytdTotal = sum(branch.monthly);
  const monthlyAverage = branch.monthly.length
    ? ytdTotal / branch.monthly.length
    : 0;
  const latestMonth = branch.monthly.at(-1) ?? 0;
  const transactions = Math.max(0, Math.round(total / 480));
  const comparisonTransactions = Math.max(0, Math.round(comparisonTotal / 480));
  const avgBasket = transactions ? total / transactions : 0;
  const comparisonBasket = comparisonTransactions
    ? comparisonTotal / comparisonTransactions
    : 0;
  const basketDelta =
    comparisonBasket > 0
      ? (avgBasket - comparisonBasket) / comparisonBasket
      : 0;
  const uniqueProducts = branch.topProducts.filter(
    (p, i, arr) => arr.findIndex((q) => q.sku === p.sku) === i,
  );
  const topGain = uniqueProducts
    .filter((product) => product.trend >= 0)
    .map(toProductMover)
    .sort((a, b) => b.lift - a.lift);
  const topLoss = uniqueProducts
    .filter((product) => product.trend < 0)
    .map(toProductMover)
    .sort((a, b) => a.lift - b.lift);
  const categoryPacing = branch.category
    .filter((c, i, arr) => arr.findIndex((q) => q.en === c.en) === i)
    .map(toCategoryPacing);
  const paymentColor = (index: number) =>
    [
      "var(--primary)",
      "oklch(0.62 0.14 200)",
      "oklch(0.62 0.14 280)",
      "oklch(0.72 0.15 65)",
      "oklch(0.66 0.04 95)",
    ][index] ?? "oklch(0.66 0.04 95)";
  const mainDrag = [...categoryPacing].sort((a, b) => a.gap - b.gap)[0];

  const handleExport = () => {
    setExported(true);
    window.setTimeout(() => setExported(false), 1600);
  };

  return (
    <div className="fade-in space-y-3.5">
      <PageHeader
        title={
          lang === "th"
            ? "ภาพรวมยอดขาย & การเติบโต"
            : "Sales performance - recovery view"
        }
        sub={
          lang === "th"
            ? `วิเคราะห์ข้อมูลรายได้จาก backend · ${branch.store.short[lang] || "-"}`
            : `Backend revenue analysis · ${branch.store.short[lang] || "-"}`
        }
        right={
          <>
            <div className="inline-flex h-9 items-center rounded-lg border border-border bg-muted/70 p-1">
              {[
                { value: "day" as const, label: t.common.today },
                { value: "month" as const, label: "MTD" },
                { value: "year" as const, label: "YTD" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRange(option.value)}
                  className={
                    range === option.value
                      ? "h-7 rounded-md bg-card px-3 text-[12.5px] font-semibold shadow-sm"
                      : "h-7 rounded-md px-3 text-[12.5px] font-medium text-muted-foreground"
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={handleExport}
            >
              {exported ? (
                <CheckCircle2 className="size-3.5 text-primary" />
              ) : (
                <Download className="size-3.5" />
              )}
              {exported
                ? lang === "th"
                  ? "ส่งออกแล้ว"
                  : "Exported"
                : t.common.export}
            </Button>
          </>
        }
      />

      <section id="performance-highlight" className="scroll-mt-20">
        <CrisisContextStrip
          lang={lang}
          metric={comparisonTotal > 0 ? fmtMoney(gap, { compact: true }) : "-"}
          metricLabel={
            lang === "th" ? "ส่วนต่างจากช่วงเทียบ" : "Comparison gap"
          }
          headline={
            lang === "th"
              ? `ยอดขาย ${snapshot.label[lang]} เทียบกับข้อมูลเปรียบเทียบจาก backend${
                  mainDrag ? ` · หมวดที่ฉุดหลักคือ ${mainDrag.th}` : ""
                }`
              : `${snapshot.label[lang]} sales compared with backend comparison data${
                  mainDrag ? ` · primary drag is ${mainDrag.en}` : ""
                }`
          }
        />
      </section>

      {(error || !hasRenderableData) && (
        <Card className="border-warn/45 bg-warn-50/60 shadow-none">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="text-[13px]">
              <span className="font-semibold">
                {lang === "th"
                  ? "ยังไม่มีข้อมูลรายได้จาก backend"
                  : "No backend revenue data"}
              </span>
              <span className="ml-2 text-muted-foreground">
                {error ||
                  (lang === "th"
                    ? "ระบบจะแสดงหน้ารายได้เมื่อ API ส่งข้อมูลกลับมา"
                    : "The revenue view will populate when the API returns data.")}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={refetch}
            >
              <RefreshCcw className="size-3.5" />
              {t.common.refresh}
            </Button>
          </CardContent>
        </Card>
      )}

      {!hasRenderableData && !loading ? (
        <Card className="rounded-[10px] border border-border bg-card shadow-none">
          <CardContent className="px-6 py-10 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted">
              <Banknote className="size-5 text-muted-foreground" />
            </div>
            <div className="mt-3 text-[15px] font-semibold">
              {lang === "th"
                ? "ไม่มีข้อมูลสำหรับหน้ารายได้"
                : "No data for the revenue page"}
            </div>
            <div className="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">
              {lang === "th"
                ? "โปรดตรวจสอบว่า backend ส่ง hourly_sales, daily_sales, monthly_sales, category_sales, payment_mix และ top_products ใน /api/v1/dashboard"
                : "Check that the backend returns hourly_sales, daily_sales, monthly_sales, category_sales, payment_mix, and top_products from /api/v1/dashboard."}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {hasRenderableData && (
        <>
          <XSectionHeader
            idx="01"
            title={lang === "th" ? "ส่วนต่างจากช่วงเทียบ" : "Comparison gap"}
            sub={
              lang === "th"
                ? "คำนวณจากข้อมูล actual และ comparison ที่ backend ส่งมา"
                : "Calculated from actual and comparison values returned by the backend"
            }
            right={
              <Badge variant="secondary" className="gap-1.5">
                <span className="size-1.5 rounded-full bg-muted-foreground" />
                {snapshot.label[lang]}
              </Badge>
            }
          />

          <section className="grid grid-cols-1 gap-3.5 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
            <GapHero
              lang={lang}
              label={snapshot.label[lang]}
              actual={total}
              comparison={comparisonTotal}
              gap={gap}
              gapPct={gapPct}
            />
            <Card className="rounded-[10px] border border-border bg-card shadow-none">
              <CardContent className="space-y-4 p-4.5">
                <TargetMetric
                  label="YTD"
                  value={fmtMoney(ytdTotal, { compact: true })}
                  target={fmtMoney(monthlyAverage, { compact: true })}
                  progress={
                    monthlyAverage > 0 ? latestMonth / monthlyAverage : 0
                  }
                  note={
                    lang === "th"
                      ? `เดือนล่าสุด ${fmtMoney(latestMonth, { compact: true })} · เฉลี่ยต่อเดือน`
                      : `Latest month ${fmtMoney(latestMonth, { compact: true })} · monthly average`
                  }
                />
                <div className="h-px bg-border" />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    {lang === "th" ? "ข้อมูลสาขา" : "Store data"}
                  </div>
                  <div className="mt-1 text-[18px] font-bold text-foreground">
                    {branch.store.code || "-"}
                  </div>
                  <div className="mt-1 text-[11.5px] text-muted-foreground">
                    {branch.store.name[lang] || "-"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="sales-mtd-ytd" className="scroll-mt-20">
            <XSectionHeader
              idx="02"
              title={
                lang === "th" ? "แนวโน้มและการเร่ง" : "Trajectory & pacing"
              }
              sub={
                lang === "th"
                  ? "วันต่อวัน · เทียบกับเส้นเป้า"
                  : "Day-by-day vs target line"
              }
            />

            <Card className="rounded-[10px] border border-border bg-card shadow-none">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-[13.5px]">
                    {lang === "th" ? "ยอดขายรายวัน · MTD" : "Daily sales · MTD"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {snapshot.description[lang]}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3 text-[11.5px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-0.5 w-3 bg-primary" />
                    {lang === "th" ? "ยอดจริง" : "Actual"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-3 border-t-2 border-dashed border-muted-foreground" />
                    {lang === "th" ? "เส้นเป้า" : "Target line"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={snapshot.actual}
                  compare={snapshot.comparison}
                  labels={snapshot.labels}
                  height={240}
                  formatY={(value) => fmtMoney(value, { compact: true })}
                />
                <InsightNote
                  title={lang === "th" ? "ข้อสังเกตจาก AI" : "AI observation"}
                  className="mt-3"
                >
                  {lang === "th"
                    ? `ข้อมูลจาก API แสดงส่วนต่าง ${fmtMoney(gap, { compact: true })} (${fmtPct(gapPct, { sign: true, dp: 1 })}) เทียบกับชุด comparison`
                    : `API data shows a ${fmtMoney(gap, { compact: true })} gap (${fmtPct(gapPct, { sign: true, dp: 1 })}) versus the comparison series.`}
                </InsightNote>
              </CardContent>
            </Card>
          </section>

          <XSectionHeader
            idx="03"
            title={
              lang === "th"
                ? "หมวดสินค้า · ฉุดยอดและขับยอด"
                : "Categories · drag and lift"
            }
            sub={
              lang === "th"
                ? "เปรียบเทียบกับเป้าหมวด · เลือกหมวดที่จะดึงกลับ"
                : "Versus category target - pick the recovery levers"
            }
          />

          <Card className="rounded-[10px] border border-border bg-card shadow-none">
            <CardContent className="space-y-3 p-4.5">
              {categoryPacing.map((category, index) => (
                <CategoryTargetRow
                  key={categoryListKey(category, index)}
                  category={category}
                  lang={lang}
                />
              ))}
            </CardContent>
          </Card>

          <section className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
            <Card className="rounded-[10px] border border-border bg-card shadow-none">
              <CardHeader>
                <CardTitle className="text-[13.5px]">
                  {t.rev.byCategory}
                </CardTitle>
                <CardDescription className="text-xs">
                  {lang === "th"
                    ? "สัดส่วนรายได้วันนี้"
                    : "Today revenue share"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pb-4">
                {branch.category
                  .filter(
                    (c, i, arr) => arr.findIndex((q) => q.en === c.en) === i,
                  )
                  .map((category) => (
                    <CategoryRow
                      key={category.en}
                      category={category}
                      lang={lang}
                    />
                  ))}
              </CardContent>
            </Card>

            <Card className="rounded-[10px] border border-border bg-card shadow-none">
              <CardHeader>
                <CardTitle className="text-[13.5px]">
                  {t.rev.byPayment}
                </CardTitle>
                <CardDescription className="text-xs">
                  {lang === "th"
                    ? "วิธีชำระเงินที่ลูกค้าเลือก"
                    : "Customer payment mix"}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
                <div className="flex justify-center">
                  <Donut
                    data={branch.payments.map((payment, index) => ({
                      value: payment.v,
                      color: paymentColor(index),
                    }))}
                    size={180}
                    thickness={28}
                  />
                </div>
                <div className="space-y-3">
                  {branch.payments.map((payment, index) => (
                    <div
                      key={`${branch.id}-${payment.en}-${index}`}
                      className="grid grid-cols-[12px_1fr_auto] items-center gap-3 text-[13px]"
                    >
                      <span
                        className="size-2.5 rounded-full"
                        style={{ background: paymentColor(index) }}
                      />
                      <span>{payment[lang]}</span>
                      <span className="num font-semibold">
                        {(payment.v * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="top-30-gain-loss" className="scroll-mt-20">
            <XSectionHeader
              idx="04"
              title={
                lang === "th"
                  ? "Top 30 · สินค้าที่ขับและฉุดยอด"
                  : "Top 30 · gain / loss SKUs"
              }
              sub={
                lang === "th"
                  ? "สินค้าหลัก 5 อันดับ ทั้งดีและไม่ดี เทียบกับ MTD เดือนก่อน"
                  : "Top 5 movers on each side, vs last month MTD"
              }
            />

            <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
              <TopMoverTable
                title={lang === "th" ? "สินค้าที่ขับยอด" : "Gain SKUs"}
                tone="primary"
                products={topGain}
                lang={lang}
              />
              <TopMoverTable
                title={lang === "th" ? "สินค้าที่ฉุดยอด" : "Loss SKUs"}
                tone="danger"
                products={topLoss}
                lang={lang}
              />
            </div>
          </section>

          <section id="customer-sales-kpis" className="scroll-mt-20">
            <XSectionHeader
              idx="05"
              title={
                lang === "th"
                  ? "ลูกค้า · ขนาดบิล · การกลับมาซื้อ"
                  : "Customers · basket size · retention"
              }
              sub={
                lang === "th"
                  ? "Facts tile #3 · ตัวชี้วัดเชิงพฤติกรรม"
                  : "Facts tile #3 - behavioural KPIs"
              }
            />

            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
              <CustomerMetricCard
                icon={ReceiptText}
                label={lang === "th" ? "ขนาดบิลเฉลี่ย" : "Avg basket"}
                value={fmtMoney(avgBasket)}
                target={
                  comparisonBasket > 0 ? fmtMoney(comparisonBasket) : undefined
                }
                progress={
                  comparisonBasket > 0
                    ? avgBasket / comparisonBasket
                    : undefined
                }
                note={
                  lang === "th"
                    ? "คำนวณจากยอดขายรวม / จำนวนรายการประมาณการ"
                    : "Calculated from total sales / estimated transactions"
                }
              />
              <CustomerMetricCard
                icon={Users}
                label={lang === "th" ? "จำนวนรายการ" : "Transactions"}
                value={fmtNum(transactions)}
                target={
                  comparisonTransactions > 0
                    ? fmtNum(comparisonTransactions)
                    : undefined
                }
                progress={
                  comparisonTransactions > 0
                    ? transactions / comparisonTransactions
                    : undefined
                }
                note={
                  lang === "th"
                    ? "ประมาณจากยอดขาย / 480 บาทต่อบิล"
                    : "Estimated from sales / ฿480 per basket"
                }
              />
              <CustomerMetricCard
                icon={WalletCards}
                label={
                  lang === "th" ? "การเปลี่ยนแปลงบิลเฉลี่ย" : "Basket change"
                }
                value={fmtPct(basketDelta, { sign: true, dp: 1 })}
                delta={basketDelta}
                note={
                  lang === "th"
                    ? "เทียบกับค่าเฉลี่ยจากชุด comparison"
                    : "Compared with the comparison basket average"
                }
              />
            </div>
          </section>

          <RecoveryFooter
            lang={lang}
            categories={categoryPacing}
            products={topLoss}
          />
        </>
      )}
    </div>
  );
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function getRevenueSnapshot(
  branch: ReturnType<typeof useBranchData>["data"],
  range: Range,
) {
  if (range === "day") {
    return {
      actual: branch.hourly,
      comparison: branch.hourlyYest,
      labels: branch.hours.map((hour) => `${String(hour).padStart(2, "0")}:00`),
      label: { th: "วันนี้", en: "Today" },
      description: {
        th: "รายชั่วโมงจาก backend",
        en: "Hourly series from backend",
      },
    };
  }

  if (range === "year") {
    const previous = branch.monthly.slice(0, -1);
    const latest = branch.monthly.slice(1);
    return {
      actual: latest.length ? latest : branch.monthly,
      comparison: previous.length ? previous : [],
      labels: branch.monthly
        .map((_, index) => String(index + 1))
        .slice(latest.length ? 1 : 0),
      label: { th: "YTD", en: "YTD" },
      description: {
        th: "รายเดือนจาก backend",
        en: "Monthly series from backend",
      },
    };
  }

  return {
    actual: branch.daily,
    comparison: branch.dailyLast,
    labels: branch.daily.map((_, index) => String(index + 1)),
    label: {
      th: range === "week" ? "สัปดาห์นี้" : "MTD",
      en: range === "week" ? "This week" : "MTD",
    },
    description: { th: "รายวันจาก backend", en: "Daily series from backend" },
  };
}

function toCategoryPacing(category: Category): CategoryPacing {
  const trendRatio = category.trend / 100;
  const comparison = trendRatio <= -0.99 ? 0 : category.v / (1 + trendRatio);

  return {
    ...category,
    comparison,
    gap: category.v - comparison,
  };
}

function categoryListKey(category: Category, index: number): string {
  return `${category.id ?? category.categoryId ?? `${category.en}-${category.th}`}-${index}`;
}

function paymentListKey(payment: PaymentShare, index: number): string {
  return `${payment.id ?? payment.paymentMethodId ?? `${payment.en}-${payment.th}`}-${index}`;
}

function productListKey(product: Product, index: number): string {
  return `${product.id ?? product.sku}-${index}`;
}

function toProductMover(product: Product): ProductMover {
  const trendRatio = product.trend / 100;
  const previous = trendRatio <= -0.99 ? 0 : product.value / (1 + trendRatio);

  return {
    ...product,
    lift: product.value - previous,
    rate: product.trend / 100,
  };
}

function CrisisContextStrip({
  lang,
  headline,
  metric,
  metricLabel,
}: {
  lang: Lang;
  headline: React.ReactNode;
  metric: React.ReactNode;
  metricLabel: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 rounded-[10px] border border-destructive/30 bg-red-50/80 p-3.5 md:grid-cols-[auto_1fr_auto] md:items-center">
      <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
        <span className="mono flex size-5.5 items-center justify-center rounded-md bg-foreground text-[11px] font-bold text-background">
          02
        </span>
        <div className="leading-none">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            FACT
          </div>
          <div className="mt-1 text-[12px] font-semibold">Sales MTD / YTD</div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-[11.5px] font-bold uppercase tracking-[0.06em] text-destructive">
          {lang === "th"
            ? "บริบทวิกฤต · TOP FLOP"
            : "Crisis context · TOP FLOP"}
        </div>
        <div className="mt-1 text-[13.5px] leading-5 text-foreground">
          {headline}
        </div>
      </div>
      <div className="text-left md:text-right">
        <div className="num text-[22px] font-bold leading-none text-destructive">
          {metric}
        </div>
        <div className="mt-1 text-[10.5px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
          {metricLabel}
        </div>
      </div>
    </div>
  );
}

function XSectionHeader({
  idx,
  title,
  sub,
  right,
}: {
  idx: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-end justify-between gap-4 px-0.5">
      <div className="flex items-start gap-3">
        <span className="mono flex size-6.5 shrink-0 items-center justify-center rounded-md bg-foreground text-[11px] font-bold text-background">
          {idx}
        </span>
        <div>
          <div className="text-[14.5px] font-semibold tracking-normal">
            {title}
          </div>
          {sub && (
            <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}

function GapHero({
  lang,
  label,
  actual,
  comparison,
  gap,
  gapPct,
}: {
  lang: Lang;
  label: React.ReactNode;
  actual: number;
  comparison: number;
  gap: number;
  gapPct: number;
}) {
  const fill =
    comparison > 0
      ? Math.min(100, Math.max(6, (actual / comparison) * 100))
      : 0;
  const positive = gap >= 0;

  return (
    <Card className="rounded-[10px] border border-border bg-card shadow-none">
      <CardContent className="p-4.5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {label}
              </span>
              <Badge
                variant={positive ? "default" : "destructive"}
                className="gap-1"
              >
                {positive ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {fmtPct(Math.abs(gapPct), { dp: 1 })}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="num text-[34px] font-bold leading-none tracking-tight">
                {fmtMoney(actual, { compact: true })}
              </span>
              <span className="text-[13px] text-muted-foreground">
                /{" "}
                {comparison > 0 ? fmtMoney(comparison, { compact: true }) : "-"}{" "}
                {lang === "th" ? "ช่วงเทียบ" : "comparison"}
              </span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className={
                  positive
                    ? "h-full rounded-full bg-primary"
                    : "h-full rounded-full bg-destructive"
                }
                style={{ width: `${fill}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[12px] text-muted-foreground">
              <span>
                {lang === "th"
                  ? "เปรียบเทียบกับชุดข้อมูล comparison จาก backend"
                  : "Compared with the backend comparison series"}
              </span>
              <span
                className={
                  positive
                    ? "num font-semibold text-primary"
                    : "num font-semibold text-destructive"
                }
              >
                {fmtMoney(gap, { compact: true })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TargetMetric({
  label,
  value,
  target,
  progress,
  note,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  target: React.ReactNode;
  progress: number;
  note: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="num text-[22px] font-bold tracking-tight">
          {value}
        </span>
        <span className="text-xs text-muted-foreground">/ {target}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-orange-500"
          style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%` }}
        />
      </div>
      <div className="mt-1 text-[11.5px] text-orange-700">{note}</div>
    </div>
  );
}

function CategoryTargetRow({
  category,
  lang,
}: {
  category: CategoryPacing;
  lang: Lang;
}) {
  const pct = category.comparison > 0 ? category.gap / category.comparison : 0;
  const isDrag = category.gap < 0;
  const fill =
    category.comparison > 0
      ? Math.min(100, (category.v / category.comparison) * 100)
      : 100;

  return (
    <div className="grid gap-2 md:grid-cols-[200px_1fr_150px_110px] md:items-center md:gap-3.5">
      <div className="flex min-w-0 items-center gap-2">
        {isDrag && (
          <span className="size-1.5 shrink-0 rounded-full bg-destructive" />
        )}
        <span className="truncate text-[13px] font-medium">
          {category[lang]}
        </span>
      </div>
      <div className="relative h-5.5 overflow-hidden rounded bg-muted">
        <div
          className={
            isDrag ? "h-full bg-destructive/85" : "h-full bg-primary/85"
          }
          style={{ width: `${fill}%` }}
        />
        <div className="absolute -inset-y-0.5 right-0 w-0.5 bg-foreground" />
      </div>
      <div className="num text-right text-[13px] font-semibold">
        {fmtMoney(category.v, { compact: true })}
        <span className="ml-1 text-[11px] font-medium text-muted-foreground">
          / {fmtMoney(category.comparison, { compact: true })}
        </span>
      </div>
      <div className="text-right">
        <Badge variant={isDrag ? "destructive" : "default"} className="gap-1">
          {isDrag ? (
            <ArrowDown className="size-3" />
          ) : (
            <ArrowUp className="size-3" />
          )}
          {Math.abs(pct * 100).toFixed(1)}%
        </Badge>
      </div>
    </div>
  );
}

function CategoryRow({ category, lang }: { category: Category; lang: Lang }) {
  const positive = category.trend >= 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-[13px] font-medium">
          <span
            className="size-2.5 shrink-0 rounded-sm"
            style={{ background: category.color }}
          />
          <span className="truncate">{category[lang]}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="num text-[13px] font-semibold">
            {fmtMoney(category.v)}
          </span>
          <Badge variant={positive ? "default" : "destructive"}>
            {positive ? "+" : ""}
            {category.trend.toFixed(1)}%
          </Badge>
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{
            width: `${category.share * 100}%`,
            background: category.color,
          }}
        />
      </div>
    </div>
  );
}

function TopMoverTable({
  title,
  tone,
  products,
  lang,
}: {
  title: React.ReactNode;
  tone: "primary" | "danger";
  products: ProductMover[];
  lang: Lang;
}) {
  const total = products.reduce((sum, product) => sum + product.lift, 0);
  const positive = tone === "primary";

  return (
    <Card className="gap-0 overflow-hidden rounded-[10px] border border-border bg-card py-0 shadow-none">
      <div className="flex items-center gap-2 px-4.5 py-3.5">
        {positive ? (
          <TrendingUp className="size-4 text-primary" />
        ) : (
          <AlertTriangle className="size-4 text-destructive" />
        )}
        <span className="text-[13.5px] font-semibold">{title}</span>
        <Badge
          variant={positive ? "default" : "destructive"}
          className="num ml-auto"
        >
          {positive ? "+" : ""}
          {fmtMoney(total, { compact: true })}
        </Badge>
      </div>
      <div className="h-px bg-border" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{getT(lang).alert.product}</TableHead>
            <TableHead className="text-right">
              {positive ? "+" : ""}
              {getT(lang).rev.total}
            </TableHead>
            <TableHead className="text-right">%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length > 0 ? (
            products.map((product, index) => (
              <TableRow key={productListKey(product, index)}>
                <TableCell>
                  <div className="text-[13px] font-medium">{product[lang]}</div>
                  <div className="mono text-[11.5px] text-muted-foreground">
                    {product.sku}
                  </div>
                </TableCell>
                <TableCell
                  className={
                    positive
                      ? "num text-right font-semibold text-primary"
                      : "num text-right font-semibold text-destructive"
                  }
                >
                  {positive ? "+" : ""}
                  {fmtMoney(product.lift)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={positive ? "default" : "destructive"}>
                    {positive ? "+" : ""}
                    {(product.rate * 100).toFixed(1)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={3}
                className="py-8 text-center text-muted-foreground"
              >
                {getT(lang).common.noData}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

function CustomerMetricCard({
  icon: Icon,
  label,
  value,
  target,
  progress,
  delta,
  note,
}: {
  icon: React.ElementType;
  label: React.ReactNode;
  value: React.ReactNode;
  target?: React.ReactNode;
  progress?: number;
  delta?: number;
  note: React.ReactNode;
}) {
  return (
    <Card className="rounded-[10px] border border-border bg-card shadow-none">
      <CardContent className="p-4.5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {label}
            </div>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className="num text-[28px] font-bold leading-none tracking-tight">
                {value}
              </span>
              {target && (
                <span className="text-xs text-muted-foreground">
                  / {target}
                </span>
              )}
            </div>
          </div>
        </div>
        {typeof progress === "number" && (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-orange-500"
              style={{
                width: `${Math.max(0, Math.min(100, progress * 100))}%`,
              }}
            />
          </div>
        )}
        {typeof delta === "number" && (
          <div className="mt-3">
            <Badge
              variant={delta >= 0 ? "default" : "destructive"}
              className="gap-1"
            >
              {delta >= 0 ? (
                <ArrowUp className="size-3" />
              ) : (
                <ArrowDown className="size-3" />
              )}
              {fmtPct(Math.abs(delta), { dp: 0 })}
            </Badge>
            <span className="ml-2 text-xs text-muted-foreground">
              vs prev period
            </span>
          </div>
        )}
        <div className="mt-3 text-[12px] leading-5 text-muted-foreground">
          {note}
        </div>
      </CardContent>
    </Card>
  );
}

function InsightNote({
  title,
  children,
  className,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-primary/25 bg-primary-50/70 p-3 text-[12.5px] leading-5 ${className ?? ""}`}
    >
      <div className="mb-1 flex items-center gap-1.5 font-semibold text-primary">
        <Sparkles className="size-3.5" />
        {title}
      </div>
      <div className="text-foreground">{children}</div>
    </div>
  );
}

function RecoveryFooter({
  lang,
  categories,
  products,
}: {
  lang: Lang;
  categories: CategoryPacing[];
  products: ProductMover[];
}) {
  const dragCategories = categories
    .filter((category) => category.gap < 0)
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 2);
  const lossProducts = products.slice(0, 1);
  const items = [
    ...dragCategories.map((category, index) => ({
      key: `category-${categoryListKey(category, index)}`,
      icon: Package,
      label: category[lang],
      action:
        lang === "th"
          ? `ตรวจแผนฟื้นยอดหมวด ${category.th} จากส่วนต่าง backend`
          : `Review recovery plan for ${category.en} from backend gap data`,
      upside: Math.abs(category.gap),
      window: lang === "th" ? "จาก category_sales" : "from category_sales",
    })),
    ...lossProducts.map((product) => ({
      key: `product-${product.sku}`,
      icon: Banknote,
      label: product[lang],
      action:
        lang === "th"
          ? `ติดตาม SKU ${product.sku} ที่ trend ติดลบจาก backend`
          : `Track SKU ${product.sku} with negative backend trend`,
      upside: Math.abs(product.lift),
      window: lang === "th" ? "จาก top_products" : "from top_products",
    })),
  ];

  return (
    <Card className="rounded-[10px] border border-primary/25 bg-primary-50/55 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[13.5px]">
          <Flame className="size-4 text-primary" />
          {lang === "th"
            ? "Action เพื่อปิดช่องว่าง"
            : "Actions to close the gap"}
        </CardTitle>
        <CardDescription className="text-xs">
          {lang === "th"
            ? "รายการที่ควรถูกส่งเข้าแผนกู้ยอดของสาขา"
            : "Recommended items for the branch recovery plan"}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.key}
              className="rounded-lg border border-border bg-card p-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary-50 text-primary">
                  <item.icon className="size-4" />
                </div>
                <div className="text-[13px] font-semibold">{item.label}</div>
              </div>
              <div className="mt-3 text-[12.5px] leading-5">{item.action}</div>
              <div className="mt-3 flex items-center justify-between gap-3 text-[11.5px] text-muted-foreground">
                <span>{item.window}</span>
                <span className="num font-semibold text-primary">
                  +{fmtMoney(item.upside, { compact: true })}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground md:col-span-3">
            {lang === "th"
              ? "backend ยังไม่มีหมวดหรือ SKU ที่ trend ติดลบสำหรับสร้าง action"
              : "The backend does not currently return negative-trend categories or SKUs for action generation."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
