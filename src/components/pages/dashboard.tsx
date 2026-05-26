"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Banknote,
  Check,
  ChevronRight,
  Clock,
  Download,
  Flame,
  Package,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  Truck,
  User,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/charts/sparkline";
import { PageHeader } from "@/components/page-helpers";
import { fmtMoney, fmtPct } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/app-shell";
import { markHashScrollIntent } from "@/lib/hash-scroll-intent";
import { useBranchData } from "@/providers/branch-data-provider";
import { alertBadgeCount, openDeliveryBadgeCount } from "@/lib/branch-data";
import type { BranchData } from "@/lib/branch-data";
import type { Lang } from "@/types";

type Status = "ready" | "inProgress" | "pending";
type RouteKey = "revenue" | "alerts" | "delivery";
type DashboardTarget = `${RouteKey}:${string}`;

const DASH_I18N = {
  th: {
    crisisTitle: "การเตรียมการบริหารวิกฤตธุรกิจ",
    crisisSub: "กรอบการดำเนินงานสำหรับ SGM · เริ่มจากสาขา Top Flop ที่กระทบยอดขายสูงสุด",
    topFlop: "สาขา TOP FLOP",
    topFlopHint: "สาขานี้อยู่ในกลุ่มกระทบยอดขายสูงสุด — ให้ความสำคัญสูงสุด",
    rank: "อันดับ",
    gap: "ส่วนต่างจากเป้า",
    aiSummary: "สรุปผลโดย AI · Donjai",
    aiUpdated: "อัปเดตจาก backend dashboard API",
    factsTitle: "Facts — แดชบอร์ดข้อมูล",
    factsSub: "ข้อมูลจริงเพื่อใช้ตัดสินใจ คลิกเพื่อดูแดชบอร์ดเต็ม",
    insightTitle: "Insight — ฝ่ายปฏิบัติการสาขาเตรียมข้อมูล",
    insightSub: "ข้อมูลเชิงลึกที่ทีมสาขาต้องเก็บและรายงาน",
    supportTitle: "Support Needs & Expected Outcome",
    supportSub: "ผลลัพธ์ที่ชัดเจนและวัดได้ · Operation & all commit together",
    open: "เปิดแดชบอร์ด",
    ready: "พร้อม",
    inProgress: "ดำเนินการ",
    pending: "รอเก็บข้อมูล",
    actionPlan: "วางแผนปฏิบัติ",
    submit: "ส่งให้ทีม Operation",
    storeOps: "ฝ่ายปฏิบัติการสาขา",
  },
  en: {
    crisisTitle: "Business Crisis Management Preparation",
    crisisSub: "Operating framework for SGM · Starting from Top Flop stores with highest impact",
    topFlop: "TOP FLOP STORE",
    topFlopHint: "This store is in the highest-impact group — top priority",
    rank: "Rank",
    gap: "Gap to target",
    aiSummary: "Executive summary by AI · Donjai",
    aiUpdated: "Updated from backend dashboard API",
    factsTitle: "Facts — data dashboards",
    factsSub: "Ground truth for decisions. Click any tile to open the full dashboard.",
    insightTitle: "Insight — store operation prepares",
    insightSub: "Field intelligence the branch team must capture and report",
    supportTitle: "Support Needs & Expected Outcome",
    supportSub: "Solid and measurable outcomes · Operation & all commit together",
    open: "Open dashboard",
    ready: "Ready",
    inProgress: "In progress",
    pending: "Pending capture",
    actionPlan: "Plan an action",
    submit: "Submit to Operation",
    storeOps: "Store Operation",
  },
} as const;

interface Fact {
  key: string;
  icon: LucideIcon;
  goto: DashboardTarget;
  ai?: boolean;
  title: string;
  sub: string;
  stat: string;
  statLabel: string;
  delta?: number;
  deltaLabel?: string;
  sparkData: number[];
  danger?: boolean;
  warn?: boolean;
  invertDelta?: boolean;
}

interface Insight {
  key: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  tags: string[];
  progress: number;
  status: Status;
  meta: string;
}

function percentChange(current: number, previous: number): number {
  if (!previous) return 0;
  return (current - previous) / previous;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function buildFacts(lang: Lang, branch: BranchData): Fact[] {
  const isTh = lang === "th";
  const d = DASH_I18N[lang];
  const todayRevenue = sum(branch.hourly);
  const comparisonRevenue = sum(branch.hourlyYest);
  const dailyRevenue = sum(branch.daily);
  const dailyComparisonRevenue = sum(branch.dailyLast);
  const mtdRevenue = branch.monthly.at(-1) ?? dailyRevenue;
  const categoryTotal = sum(branch.category.map((item) => item.v));
  const topProduct = branch.topProducts[0];
  const openDeliveries = openDeliveryBadgeCount(branch);
  const lateDeliveries = branch.deliveries.filter((delivery) => delivery.late).length;
  const alertCount = alertBadgeCount(branch);
  const lowStockCount = branch.lowStock.length;
  const expiringValue = sum(
    branch.expiring.map((item) => item.price * item.stock),
  );
  const stockAvailability =
    branch.lowStock.length + branch.topProducts.length > 0
      ? branch.topProducts.length /
        (branch.topProducts.length + branch.lowStock.length)
      : 0;

  return [
    {
      key: "perfHighlight",
      icon: Sparkles,
      goto: "revenue:performance-highlight",
      ai: true,
      title: "Performance Highlight",
      sub: isTh ? "สรุป Executive โดย AI Donjai" : "Executive summary (AI Donjai)",
      stat: fmtMoney(todayRevenue, { compact: true }),
      statLabel: isTh ? "รายได้วันนี้" : "Today",
      delta: percentChange(todayRevenue, comparisonRevenue),
      sparkData: branch.hourly,
    },
    {
      key: "salesMtdYtd",
      icon: TrendingUp,
      goto: "revenue:sales-mtd-ytd",
      title: "Sales MTD / YTD (OMNI view)",
      sub: isTh ? "ยอดขายในร้าน + ออนไลน์" : "In-store + online combined",
      stat: fmtMoney(mtdRevenue, { compact: true }),
      statLabel: "MTD",
      delta: percentChange(dailyRevenue, dailyComparisonRevenue),
      deltaLabel: d.gap,
      sparkData: branch.monthly,
    },
    {
      key: "customerKpi",
      icon: User,
      goto: "revenue:customer-sales-kpis",
      title: isTh ? "Customer Sales & KPIs" : "Customer sales & KPIs",
      sub: isTh ? "ยอดต่อบิล · ลูกค้าใหม่ · กลับมาซื้อ" : "Basket · new · repeat customers",
      stat: fmtMoney(todayRevenue / Math.max(branch.deliveries.length, 1)),
      statLabel: isTh ? "ค่าเฉลี่ยต่อบิล" : "Avg basket",
      delta: percentChange(todayRevenue, comparisonRevenue),
      sparkData: branch.hourly,
    },
    {
      key: "osxOtif",
      icon: Truck,
      goto: "delivery:osx-sales-otif",
      title: "OSX Sales & %OTIF",
      sub: isTh ? "ปฏิบัติการ & การจัดส่งครบถ้วน" : "Operation & Fulfillment",
      stat: String(openDeliveries),
      statLabel: isTh ? "งานที่ยังเปิด" : "Open orders",
      delta: branch.deliveries.length ? lateDeliveries / branch.deliveries.length : 0,
      deltaLabel: isTh ? "ส่งช้า" : "late",
      sparkData: branch.deliveries.map((delivery) => delivery.value),
      danger: lateDeliveries > 0,
    },
    {
      key: "inventory",
      icon: Package,
      goto: "alerts:inventory-aging-shrinkage",
      title: "Inventory, Aging & Shrinkage",
      sub: isTh ? "อายุสินค้า · สูญเสีย · ค้างสต็อก" : "Aging · shrink · slow movers",
      stat: fmtMoney(expiringValue, { compact: true }),
      statLabel: isTh ? "มูลค่าใกล้หมดอายุ" : "Near-expiry value",
      deltaLabel: isTh ? "รายการ" : "items",
      invertDelta: true,
      sparkData: branch.expiring.map((item) => item.stock),
      warn: branch.expiring.length > 0,
    },
    {
      key: "lossOos",
      icon: AlertTriangle,
      goto: "alerts:loss-oos",
      title: "Loss & OOS",
      sub: isTh ? "ของขาด · ของหมด · ของเสีย" : "Out of stock & shrinkage value",
      stat: String(alertCount),
      statLabel: isTh ? "SKU ที่หมด" : "OOS SKUs",
      deltaLabel: isTh ? "รายการแจ้งเตือน" : "alerts",
      invertDelta: true,
      sparkData: branch.lowStock.map((item) => item.stock),
      danger: alertCount > 0,
    },
    {
      key: "stockAvail",
      icon: Check,
      goto: "alerts:stock-availability",
      title: isTh ? "Stock Availability" : "Stock availability",
      sub: isTh ? "% สินค้าที่มีของบนชั้น" : "% on-shelf availability",
      stat: fmtPct(stockAvailability),
      statLabel: "OSA",
      delta: -lowStockCount / Math.max(branch.topProducts.length, 1),
      deltaLabel: isTh ? "สินค้าสต็อกต่ำ" : "low-stock items",
      sparkData: branch.topProducts.map((item) => item.sold),
      warn: lowStockCount > 0,
    },
    {
      key: "top30",
      icon: Flame,
      goto: "revenue:top-30-gain-loss",
      title: isTh ? "Top 30 Items — Gain & Loss" : "Top 30 items — Gain & Loss",
      sub: isTh ? "สินค้าหลักที่ขับยอดและฉุดยอด" : "Hero SKUs driving / dragging sales",
      stat: topProduct ? fmtMoney(topProduct.value, { compact: true }) : fmtMoney(categoryTotal, { compact: true }),
      statLabel: topProduct ? topProduct[lang] : isTh ? "ยอดขายหมวดหมู่" : "Category sales",
      sparkData: branch.topProducts.map((item) => item.value),
    },
  ];
}

function buildInsights(lang: Lang, branch: BranchData): Insight[] {
  const isTh = lang === "th";
  const alertTotal = alertBadgeCount(branch);
  const deliveryTotal = branch.deliveries.length;
  const openDeliveries = openDeliveryBadgeCount(branch);
  const suggestionTotal = branch.promos.length + branch.events.length;
  const topProduct = branch.topProducts[0];

  return [
    {
      key: "competitors",
      icon: User,
      title: isTh ? "บริบทสาขาจาก backend" : "Branch context from backend",
      desc: isTh
        ? branch.store.address.th || "รอข้อมูลสาขาจาก backend"
        : branch.store.address.en || "Waiting for branch data from backend",
      tags: [branch.store.code || (isTh ? "รอข้อมูล" : "Pending")],
      progress: branch.store.code ? 1 : 0,
      status: branch.store.code ? "ready" : "pending",
      meta: branch.store.name[lang] || (isTh ? "ยังไม่มีข้อมูลสาขา" : "No branch data yet"),
    },
    {
      key: "voices",
      icon: AlertTriangle,
      title: isTh ? "รายการแจ้งเตือนที่ต้องติดตาม" : "Alerts requiring follow-up",
      desc: isTh
        ? `สินค้าใกล้หมดอายุ ${branch.expiring.length} รายการ · สต็อกต่ำ ${branch.lowStock.length} รายการ`
        : `${branch.expiring.length} near-expiry items · ${branch.lowStock.length} low-stock items`,
      tags: [isTh ? "สินค้าใกล้หมดอายุ" : "Expiry", isTh ? "สต็อกต่ำ" : "Low stock"],
      progress: alertTotal > 0 ? 0.5 : 1,
      status: alertTotal > 0 ? "inProgress" : "ready",
      meta: isTh ? `${alertTotal} รายการจาก backend` : `${alertTotal} backend alerts`,
    },
    {
      key: "opportunity",
      icon: Sparkles,
      title: isTh ? "โอกาสจาก backend suggestions" : "Opportunities from backend suggestions",
      desc: isTh
        ? topProduct
          ? `สินค้าเด่นตอนนี้: ${topProduct.th}`
          : "รอข้อมูลสินค้าและข้อเสนอแนะ"
        : topProduct
          ? `Current top product: ${topProduct.en}`
          : "Waiting for product and suggestion data",
      tags: [isTh ? "โปรโมชัน" : "Promos", isTh ? "อีเวนต์" : "Events"],
      progress: suggestionTotal > 0 ? 1 : 0,
      status: suggestionTotal > 0 ? "ready" : "pending",
      meta: isTh
        ? `${branch.promos.length} โปรโมชัน · ${branch.events.length} อีเวนต์`
        : `${branch.promos.length} promos · ${branch.events.length} events`,
    },
    {
      key: "issues",
      icon: AlertTriangle,
      title: isTh ? "สถานะงานจัดส่ง" : "Delivery workload",
      desc: isTh
        ? `มีออเดอร์ทั้งหมด ${deliveryTotal} รายการ และยังเปิดอยู่ ${openDeliveries} รายการ`
        : `${deliveryTotal} total orders and ${openDeliveries} still open`,
      tags: [isTh ? "จัดส่ง" : "Delivery", isTh ? "ปฏิบัติการ" : "Ops"],
      progress: deliveryTotal ? (deliveryTotal - openDeliveries) / deliveryTotal : 1,
      status: openDeliveries > 0 ? "inProgress" : "ready",
      meta: isTh ? `${openDeliveries} งานยังไม่ปิด` : `${openDeliveries} open deliveries`,
    },
  ];
}

function TopFlopBanner({ lang, branch }: { lang: Lang; branch: BranchData }) {
  const d = DASH_I18N[lang];
  const dailyTotal = sum(branch.daily);
  const comparisonTotal = sum(branch.dailyLast);
  const gap = percentChange(dailyTotal, comparisonTotal);

  return (
    <div className="mb-3.5 flex items-center gap-3.5 rounded-[10px] border border-destructive/30 bg-destructive/10 p-3.5">
      <div className="flex size-9.5 shrink-0 items-center justify-center rounded-[9px] bg-destructive text-destructive-foreground">
        <Flame className="size-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11.5px] font-bold tracking-[0.08em] text-destructive uppercase">
            {d.topFlop}
          </span>
          <span className="mono text-[11px] text-muted-foreground">
            {branch.store.code || "API"} · {d.gap}: {fmtPct(gap, { sign: true })}
          </span>
        </div>
        <div className="mt-0.5 text-[13px]">{d.topFlopHint}</div>
      </div>
      <Button size="sm" variant="outline" className="hidden sm:inline-flex">
        <TrendingUp />
        {lang === "th" ? "แผนกู้ยอด" : "Recovery plan"}
      </Button>
    </div>
  );
}

function AISummaryCard({ lang, branch }: { lang: Lang; branch: BranchData }) {
  const d = DASH_I18N[lang];
  const todayRevenue = sum(branch.hourly);
  const previousRevenue = sum(branch.hourlyYest);
  const revenueChange = percentChange(todayRevenue, previousRevenue);
  const alertTotal = alertBadgeCount(branch);
  const openDeliveries = openDeliveryBadgeCount(branch);
  const topCategory = branch.category[0];
  const topProduct = branch.topProducts[0];
  const narrative = [
    lang === "th"
      ? `รายได้วันนี้ ${fmtMoney(todayRevenue, { compact: true })} (${fmtPct(revenueChange, { sign: true })} เทียบข้อมูลเปรียบเทียบ)`
      : `Today revenue is ${fmtMoney(todayRevenue, { compact: true })} (${fmtPct(revenueChange, { sign: true })} vs comparison data).`,
    topCategory
      ? lang === "th"
        ? `หมวดที่ทำยอดสูงสุดคือ ${topCategory.th} มูลค่า ${fmtMoney(topCategory.v, { compact: true })}`
        : `Top category is ${topCategory.en} at ${fmtMoney(topCategory.v, { compact: true })}.`
      : lang === "th"
        ? "ยังไม่มีข้อมูลหมวดหมู่จาก backend"
        : "No backend category data is available yet.",
    lang === "th"
      ? `มีรายการแจ้งเตือน ${alertTotal} รายการ และงานจัดส่งที่ยังเปิดอยู่ ${openDeliveries} รายการ`
      : `${alertTotal} alerts and ${openDeliveries} open deliveries require follow-up.`,
    topProduct
      ? lang === "th"
        ? `สินค้าทำรายได้สูงสุดตอนนี้คือ ${topProduct.th}`
        : `Current top revenue product is ${topProduct.en}.`
      : lang === "th"
        ? "ยังไม่มีข้อมูลสินค้าขายดีจาก backend"
        : "No backend top-product data is available yet.",
  ];

  return (
    <Card className="relative mb-3.5 gap-0 py-0">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-linear-to-r from-primary to-[oklch(0.66_0.16_285)]" />
      <CardHeader className="!grid-cols-1 px-4.5 pt-4 sm:!grid-cols-[1fr_auto]">
        <CardTitle className="flex items-center gap-2 text-[13.5px]">
          <span className="inline-flex items-center gap-1 rounded-[5px] bg-linear-to-br from-primary to-[oklch(0.66_0.16_285)] px-1.5 py-0.5 text-[10.5px] font-bold tracking-[0.06em] text-white">
            <Sparkles className="size-3" />
            AI
          </span>
          {d.aiSummary}
        </CardTitle>
        <CardDescription className="text-xs">{d.aiUpdated}</CardDescription>
        <CardAction className="!col-start-1 !row-start-2 !row-span-1 mt-1 flex justify-self-start gap-1.5 sm:!col-start-2 sm:!row-start-1 sm:mt-0 sm:justify-self-end">
          <Button size="icon-sm" variant="ghost" aria-label={lang === "th" ? "รีเฟรช" : "Refresh"}>
            <RefreshCcw />
          </Button>
          <Button size="sm" variant="outline">
            <Download />
            {lang === "th" ? "บันทึกเป็นรายงาน" : "Save as report"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-4.5 pt-2.5 pb-4.5">
        <ol className="m-0 flex list-decimal flex-col gap-2 pl-4.5 text-[13.5px] leading-[1.55]">
          {narrative.map((line, index) => (
            <li key={line}>
              <span
                className={cn(index === narrative.length - 1 && "font-semibold text-primary")}
              >
                {line}
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function SectionHeader({
  idx,
  title,
  sub,
  right,
}: {
  idx: string;
  title: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mx-0.5 mt-5.5 mb-3 flex items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="mono flex size-7 shrink-0 items-center justify-center rounded-[7px] bg-foreground text-xs font-bold text-background">
          {idx}
        </span>
        <div>
          <div className="text-[15.5px] font-semibold tracking-[-0.01em]">{title}</div>
          {sub && <div className="mt-0.5 text-[12.5px] text-muted-foreground">{sub}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}

function FactTile({
  fact,
  lang,
  isStaff,
  onOpen,
}: {
  fact: Fact;
  lang: Lang;
  isStaff: boolean;
  onOpen: (target: DashboardTarget) => void;
}) {
  const d = DASH_I18N[lang];
  const Icon = fact.icon;
  const positive = fact.delta != null && fact.delta >= 0;
  const showRed = fact.invertDelta ? positive : !positive;
  const restricted =
    isStaff &&
    (fact.key === "salesMtdYtd" || fact.key === "top30" || fact.key === "perfHighlight");
  const accentClass = fact.danger
    ? "bg-destructive"
    : fact.warn
      ? "bg-[oklch(0.72_0.16_75)]"
      : "bg-primary";
  const accentText = fact.danger
    ? "text-destructive"
    : fact.warn
      ? "text-[oklch(0.45_0.13_70)]"
      : "text-primary";

  return (
    <button
      type="button"
      onClick={() => onOpen(fact.goto)}
      className="relative flex min-h-40 flex-col gap-2.5 overflow-hidden rounded-[10px] border border-border bg-card p-4 text-left shadow-[0_1px_2px_rgba(20,25,18,0.05)] transition hover:border-foreground/20 hover:shadow-[0_4px_14px_-2px_rgba(20,25,18,0.08),0_1px_3px_rgba(20,25,18,0.04)] focus-visible:ring-3 focus-visible:ring-ring/35 focus-visible:outline-none"
    >
      <div className={cn("absolute top-3 bottom-3 left-0 w-[3px] rounded-r-[3px]", accentClass)} />
      <div className="flex items-start gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <div className="truncate text-[13px] font-semibold tracking-[-0.005em]">
              {fact.title}
            </div>
            {fact.ai && (
              <span className="rounded-[4px] bg-linear-to-br from-primary to-[oklch(0.66_0.16_285)] px-1.5 py-px text-[9.5px] font-bold tracking-[0.05em] text-white">
                AI
              </span>
            )}
          </div>
          <div className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{fact.sub}</div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2.5">
        <div className="min-w-0">
          <div
            className={cn(
              "num text-xl font-semibold tracking-[-0.02em]",
              restricted && "text-muted-foreground",
            )}
          >
            {restricted ? "•••••" : fact.stat}
          </div>
          <div className="mt-px text-[11px] text-muted-foreground">{fact.statLabel}</div>
        </div>
        {!restricted && (
          <Sparkline
            data={fact.sparkData}
            trend={showRed ? -1 : 1}
            width={86}
            height={32}
          />
        )}
      </div>

      {fact.delta != null && !restricted && (
        <div className="flex items-center gap-1.5 text-[11.5px]">
          <Badge
            variant={showRed ? "destructive" : "default"}
            className={cn(!showRed && "bg-primary-50 text-primary hover:bg-primary-50")}
          >
            {fact.delta >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {fmtPct(Math.abs(fact.delta), { dp: 1 })}
          </Badge>
          <span className="truncate text-muted-foreground">
            {fact.deltaLabel || (lang === "th" ? "เทียบกับเมื่อวาน" : "vs yesterday")}
          </span>
        </div>
      )}

      <div className={cn("mt-auto flex items-center justify-between border-t border-border pt-2.5 text-xs font-medium", accentText)}>
        <span>{d.open}</span>
        <ChevronRight className="size-3.5" />
      </div>
    </button>
  );
}

function statusBadgeClass(status: Status) {
  if (status === "ready") return "bg-primary-50 text-primary";
  if (status === "inProgress") return "bg-info-50 text-info";
  return "bg-muted text-muted-foreground";
}

function InsightCard({ insight, lang }: { insight: Insight; lang: Lang }) {
  const d = DASH_I18N[lang];
  const Icon = insight.icon;
  const statusLabel =
    insight.status === "ready"
      ? d.ready
      : insight.status === "inProgress"
        ? d.inProgress
        : d.pending;

  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex flex-col gap-3 p-4.5">
        <div className="flex items-start gap-3">
          <div className="flex size-9.5 shrink-0 items-center justify-center rounded-[9px] bg-primary-50 text-primary">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-semibold tracking-[-0.005em]">{insight.title}</div>
              <Badge className={cn("gap-1", statusBadgeClass(insight.status))}>
                <span className="size-1.5 rounded-full bg-current" />
                {statusLabel}
              </Badge>
            </div>
            <div className="mt-1 text-[12.5px] leading-[1.45] text-muted-foreground">
              {insight.desc}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {insight.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex h-5.5 items-center rounded-[7px] border border-border bg-muted px-2 text-[11px] font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-[11.5px] text-muted-foreground">
            <span>{insight.meta}</span>
            <span className="mono num">{Math.round(insight.progress * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                insight.progress < 0.4 ? "bg-warn" : "bg-primary",
              )}
              style={{ width: `${insight.progress * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-0.5 flex items-center justify-between border-t border-border pt-2.5">
          <span className="flex items-center gap-1 text-[11.5px] text-muted-foreground">
            <User className="size-3.5" />
            {d.storeOps}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              toast(lang === "th" ? `เปิดแบบฟอร์ม "${insight.title}"` : `Opened "${insight.title}" form`)
            }
          >
            {d.actionPlan}
            <ArrowRight />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SupportNeedsCard({ lang, branch }: { lang: Lang; branch: BranchData }) {
  const isTh = lang === "th";
  const d = DASH_I18N[lang];
  const topLowStock = branch.lowStock[0];
  const topExpiring = branch.expiring[0];
  const topPromo = branch.promos[0];
  const openDeliveries = openDeliveryBadgeCount(branch);
  const fields = [
    {
      key: "items",
      icon: Package,
      label: isTh ? "สินค้าใด" : "Which items?",
      value:
        topLowStock?.[lang] ??
        topExpiring?.[lang] ??
        (isTh ? "รอข้อมูลสินค้าจาก backend" : "Waiting for backend product data"),
    },
    {
      key: "price",
      icon: Banknote,
      label: isTh ? "ราคาเท่าไหร่" : "Which price?",
      value: topExpiring
        ? fmtMoney(topExpiring.price)
        : topPromo
          ? fmtMoney(topPromo.upside, { compact: true })
          : isTh
            ? "รอข้อมูลราคา"
            : "Waiting for price data",
    },
    {
      key: "qty",
      icon: TrendingUp,
      label: isTh ? "จำนวนเท่าไหร่" : "How many?",
      value: topLowStock
        ? String(topLowStock.reorder)
        : topExpiring
          ? String(topExpiring.stock)
          : "0",
    },
    {
      key: "target",
      icon: Clock,
      label: isTh ? "เป้าหมาย + ระยะเวลา" : "Target & timeline",
      value: isTh
        ? `ปิดงานจัดส่งค้าง ${openDeliveries} รายการ และลด alert ${alertBadgeCount(branch)} รายการ`
        : `Close ${openDeliveries} open deliveries and reduce ${alertBadgeCount(branch)} alerts`,
    },
  ];

  return (
    <Card className="gap-0 border-primary/35 bg-linear-to-b from-primary-50 to-card py-0">
      <div className="flex flex-col gap-3 px-4.5 pt-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[13.5px] font-medium leading-snug">
            <span className="rounded-[5px] bg-primary px-1.5 py-0.5 text-[10.5px] font-bold tracking-[0.06em] text-primary-foreground">
              {isTh ? "ข้อตกลงร่วม" : "JOINT COMMIT"}
            </span>
            <span>{d.supportTitle}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{d.supportSub}</div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline">
            <Download />
            {isTh ? "ส่งออก PDF" : "Export PDF"}
          </Button>
          <Button
            size="sm"
            onClick={() =>
              toast.success(isTh ? "ส่งข้อตกลงให้ทีม Operation แล้ว" : "Committed to Operation team")
            }
          >
            <Check />
            {d.submit}
          </Button>
        </div>
      </div>
      <CardContent className="px-4.5 pb-4.5">
        <div className="grid gap-3 md:grid-cols-2">
          {fields.map((field) => {
            const Icon = field.icon;
            return (
              <div
                key={field.key}
                className="flex gap-2.5 rounded-[9px] border border-border bg-card p-3.5"
              >
                <div className="flex size-7.5 shrink-0 items-center justify-center rounded-[7px] bg-muted">
                  <Icon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11.5px] font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                    {field.label}
                  </div>
                  <div className="mt-1 text-[13.5px] leading-[1.4] font-medium">{field.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-3 rounded-[9px] border border-dashed border-foreground/20 bg-card px-3.5 py-2.5 text-[12.5px] text-muted-foreground">
          <User className="size-3.5" />
          <span className="min-w-60 flex-1">
            {isTh
              ? `ผู้รับผิดชอบ: ${branch.store.manager.th || "SGM"} + ทีม Operation`
              : `Owners: ${branch.store.manager.en || "SGM"} · Operation`}
          </span>
          <span className="mono font-semibold text-foreground">
            {isTh ? "ข้อมูลจาก backend" : "Backend sourced"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const router = useRouter();
  const { lang, role, currentUser } = useAppShell();
  const { data: branch } = useBranchData();
  const t = getT(lang);
  const d = DASH_I18N[lang];
  const isStaff = role === "staff";
  const userName = currentUser.name;
  const greeting =
    lang === "th" ? "สวัสดียามบ่าย" : "Good afternoon";
  const facts = buildFacts(lang, branch);
  const insights = buildInsights(lang, branch);

  const openRoute = React.useCallback(
    (target: DashboardTarget) => {
      const [route, sectionId] = target.split(":") as [RouteKey, string];
      const pathname = route === "delivery" ? "/deliveries" : `/${route}`;

      markHashScrollIntent();
      router.push(`${pathname}#${sectionId}`, { scroll: false });
    },
    [router],
  );

  return (
    <div className="fade-in">
      <PageHeader
        title={`${greeting}, ${userName.split(" ")[0]} 👋`}
        sub={`${d.crisisTitle} · ${branch.store.name[lang]}`}
        right={
          <>
            <Badge variant="secondary">
              <Clock />
              {t.common.lastUpdated} 14:02
            </Badge>
            <Button size="sm" variant="outline">
              <RefreshCcw />
              {t.common.refresh}
            </Button>
            <Button size="sm" variant="outline">
              <Download />
              {t.common.export}
            </Button>
          </>
        }
      />

      <TopFlopBanner lang={lang} branch={branch} />
      <AISummaryCard lang={lang} branch={branch} />

      <SectionHeader
        idx="01"
        title={d.factsTitle}
        sub={d.factsSub}
        right={
          <Badge variant="secondary" className="hidden gap-1 sm:inline-flex">
            <span className="size-1.5 rounded-full bg-current" />8{" "}
            {lang === "th" ? "แดชบอร์ด" : "dashboards"}
          </Badge>
        }
      />
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {facts.map((fact) => (
          <FactTile
            key={fact.key}
            fact={fact}
            lang={lang}
            isStaff={isStaff}
            onOpen={openRoute}
          />
        ))}
      </div>

      <SectionHeader
        idx="02"
        title={d.insightTitle}
        sub={d.insightSub}
        right={
          <Badge className="hidden gap-1 bg-info-50 text-info sm:inline-flex">
            <span className="size-1.5 rounded-full bg-current" />
            {d.storeOps}
          </Badge>
        }
      />
      <div className="grid gap-3.5 lg:grid-cols-2">
        {insights.map((insight) => (
          <InsightCard key={insight.key} insight={insight} lang={lang} />
        ))}
      </div>

      <SectionHeader idx="03" title={d.supportTitle} sub={d.supportSub} />
      <SupportNeedsCard lang={lang} branch={branch} />

      <div className="h-6" />
    </div>
  );
}
