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
import { fmtPct } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { STORE } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/app-shell";
import { useBranchData } from "@/providers/branch-data-provider";
import type { Lang } from "@/types";

type Status = "ready" | "inProgress" | "pending";
type RouteKey = "revenue" | "alerts" | "delivery";

const DASH_I18N = {
  th: {
    crisisTitle: "การเตรียมการบริหารวิกฤตธุรกิจ",
    crisisSub: "กรอบการดำเนินงานสำหรับ SGM · เริ่มจากสาขา Top Flop ที่กระทบยอดขายสูงสุด",
    topFlop: "สาขา TOP FLOP",
    topFlopHint: "สาขานี้อยู่ในกลุ่มกระทบยอดขายสูงสุด — ให้ความสำคัญสูงสุด",
    rank: "อันดับ",
    gap: "ส่วนต่างจากเป้า",
    aiSummary: "สรุปผลโดย AI · Donjai",
    aiNarrative: [
      "ยอดขาย MTD ฿4.82M ต่ำกว่าเป้า 11.4% โดยหมวด ของใช้บ้าน และ อาหารแช่แข็ง เป็นกลุ่มฉุดหลัก",
      "OTIF สัปดาห์นี้ 87.3% ลดลงจาก 92.1% สาเหตุหลักจาก OOS สินค้าหลัก 14 รายการ",
      "ลูกค้าใหม่ลด 6% ใน 30 วัน — แนวโน้มหลุดไปคู่แข่งร้านสะดวกซื้อรอบกว่า 500 ม.",
      "แนะนำดำเนินการ: เร่งเติม Top-30 ที่ขาด, ตั้งโปร Markdown 7 รายการใกล้หมดอายุ, ทำ Customer Win-back",
    ],
    aiUpdated: "อัปเดต 14:02 จากข้อมูล MTD, OTIF, Customer KPI",
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
    aiNarrative: [
      "MTD revenue ฿4.82M is 11.4% below target. Household and Frozen are the main drag categories.",
      "OTIF this week 87.3%, down from 92.1% — driven by 14 OOS core SKUs.",
      "New customer acquisition down 6% over 30 days — drifting to convenience competitors within a 500m radius.",
      "Recommended actions: replenish out-of-stock Top-30, set 7-item markdown on near-expiry, launch customer win-back.",
    ],
    aiUpdated: "Updated 14:02 from MTD, OTIF and Customer KPI feeds",
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
  goto: RouteKey;
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

function buildFacts(lang: Lang, hourly: number[], monthly: number[]): Fact[] {
  const isTh = lang === "th";
  const d = DASH_I18N[lang];

  return [
    {
      key: "perfHighlight",
      icon: Sparkles,
      goto: "revenue",
      ai: true,
      title: "Performance Highlight",
      sub: isTh ? "สรุป Executive โดย AI Donjai" : "Executive summary (AI Donjai)",
      stat: "฿284k",
      statLabel: isTh ? "รายได้วันนี้" : "Today",
      delta: 0.062,
      sparkData: hourly,
    },
    {
      key: "salesMtdYtd",
      icon: TrendingUp,
      goto: "revenue",
      title: "Sales MTD / YTD (OMNI view)",
      sub: isTh ? "ยอดขายในร้าน + ออนไลน์" : "In-store + online combined",
      stat: "฿4.82M",
      statLabel: "MTD",
      delta: -0.114,
      deltaLabel: d.gap,
      sparkData: monthly.slice(0, 8),
    },
    {
      key: "customerKpi",
      icon: User,
      goto: "revenue",
      title: isTh ? "Customer Sales & KPIs" : "Customer sales & KPIs",
      sub: isTh ? "ยอดต่อบิล · ลูกค้าใหม่ · กลับมาซื้อ" : "Basket · new · repeat customers",
      stat: "฿686",
      statLabel: isTh ? "ค่าเฉลี่ยต่อบิล" : "Avg basket",
      delta: 0.038,
      sparkData: [110, 118, 132, 119, 124, 128, 142, 138, 145, 134, 128, 138],
    },
    {
      key: "osxOtif",
      icon: Truck,
      goto: "delivery",
      title: "OSX Sales & %OTIF",
      sub: isTh ? "ปฏิบัติการ & การจัดส่งครบถ้วน" : "Operation & Fulfillment",
      stat: "87.3%",
      statLabel: "OTIF",
      delta: -0.048,
      deltaLabel: isTh ? "เทียบสัปดาห์ก่อน" : "vs last week",
      sparkData: [94, 93, 92, 91, 90, 89, 87],
      danger: true,
    },
    {
      key: "inventory",
      icon: Package,
      goto: "alerts",
      title: "Inventory, Aging & Shrinkage",
      sub: isTh ? "อายุสินค้า · สูญเสีย · ค้างสต็อก" : "Aging · shrink · slow movers",
      stat: "฿38.4k",
      statLabel: isTh ? "สูญเสีย MTD" : "Shrink MTD",
      delta: 0.124,
      deltaLabel: isTh ? "เพิ่มจากเดือนก่อน" : "vs last month",
      invertDelta: true,
      sparkData: [22, 26, 28, 31, 30, 34, 38],
      warn: true,
    },
    {
      key: "lossOos",
      icon: AlertTriangle,
      goto: "alerts",
      title: "Loss & OOS",
      sub: isTh ? "ของขาด · ของหมด · ของเสีย" : "Out of stock & shrinkage value",
      stat: "14",
      statLabel: isTh ? "SKU ที่หมด" : "OOS SKUs",
      delta: 0.55,
      deltaLabel: isTh ? "เทียบ 7 วันก่อน" : "vs prev 7d",
      invertDelta: true,
      sparkData: [4, 5, 6, 9, 11, 12, 14],
      danger: true,
    },
    {
      key: "stockAvail",
      icon: Check,
      goto: "alerts",
      title: isTh ? "Stock Availability" : "Stock availability",
      sub: isTh ? "% สินค้าที่มีของบนชั้น" : "% on-shelf availability",
      stat: "91.6%",
      statLabel: "OSA",
      delta: -0.024,
      deltaLabel: isTh ? "ต่ำกว่าเป้า 95%" : "below 95% target",
      sparkData: [96, 95, 94, 93, 92, 92, 91],
      warn: true,
    },
    {
      key: "top30",
      icon: Flame,
      goto: "revenue",
      title: isTh ? "Top 30 Items — Gain & Loss" : "Top 30 items — Gain & Loss",
      sub: isTh ? "สินค้าหลักที่ขับยอดและฉุดยอด" : "Hero SKUs driving / dragging sales",
      stat: "+฿62k / -฿41k",
      statLabel: isTh ? "กำไร / ขาดทุน" : "Gain / Loss",
      sparkData: [8, 14, 12, 19, 22, 28, 31],
    },
  ];
}

function buildInsights(lang: Lang): Insight[] {
  const isTh = lang === "th";

  return [
    {
      key: "competitors",
      icon: User,
      title: isTh ? "คู่แข่งในรัศมีบริการ" : "Competitors in catchment area",
      desc: isTh
        ? "ระบุทั้ง B2B (ร้านชำ คาเฟ่ ร้านอาหาร) และ B2C ในรัศมี 1 กม."
        : "Identify both B2B (groceries, cafés, restaurants) and B2C within 1 km",
      tags: ["B2B", "B2C"],
      progress: 0.7,
      status: "inProgress",
      meta: isTh ? "พบ 11 ร้าน · สำรวจราคา 6/11" : "11 stores found · 6/11 price-scanned",
    },
    {
      key: "voices",
      icon: AlertTriangle,
      title: isTh ? "เสียงลูกค้า (เหตุผลที่เลิกซื้อ)" : "Customer voices (reasons to churn)",
      desc: isTh
        ? "สัมภาษณ์และรวบรวมเหตุผลที่ลูกค้าเปลี่ยนไปร้านอื่น"
        : "Interview and aggregate why customers switched to other stores",
      tags: [isTh ? "สัมภาษณ์" : "Interviews", isTh ? "แบบสอบถาม" : "Survey"],
      progress: 0.35,
      status: "inProgress",
      meta: isTh ? "เก็บแล้ว 18/50 ตัวอย่าง" : "Collected 18 of 50 samples",
    },
    {
      key: "opportunity",
      icon: Sparkles,
      title: isTh ? "โอกาส (สินค้า บริการ อื่น ๆ)" : "Opportunities (products, services, other)",
      desc: isTh
        ? "เสนอ SKU ใหม่ บริการเสริม และโอกาสจากเทรนด์ในย่าน"
        : "Propose new SKUs, value-added services, neighbourhood trends",
      tags: ["SKU", isTh ? "บริการ" : "Service"],
      progress: 0.5,
      status: "inProgress",
      meta: isTh ? "เสนอ 6 ไอเดีย · ผ่านกลั่นกรอง 3" : "6 ideas drafted · 3 screened",
    },
    {
      key: "issues",
      icon: AlertTriangle,
      title: isTh ? "ปัญหา & ความต้องการสนับสนุน" : "Issues & requirements",
      desc: isTh
        ? "ปัญหาเชิงปฏิบัติการ และทรัพยากรที่ต้องการจากสำนักงานใหญ่"
        : "Operational pain points and resource asks from HQ",
      tags: [isTh ? "ปฏิบัติการ" : "Ops", "HR", "IT"],
      progress: 0.2,
      status: "pending",
      meta: isTh ? "เก็บ 2 หัวข้อ · รอ 4 หัวข้อ" : "2 captured · 4 pending",
    },
  ];
}

function TopFlopBanner({ lang }: { lang: Lang }) {
  const d = DASH_I18N[lang];

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
            {d.rank}: #4 / 387 · {d.gap}: -11.4% MTD
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

function AISummaryCard({ lang }: { lang: Lang }) {
  const d = DASH_I18N[lang];

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
          {d.aiNarrative.map((line, index) => (
            <li key={line}>
              <span
                className={cn(
                  index === d.aiNarrative.length - 1 && "font-semibold text-primary",
                )}
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
  onOpen: (route: RouteKey) => void;
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

function SupportNeedsCard({ lang }: { lang: Lang }) {
  const isTh = lang === "th";
  const d = DASH_I18N[lang];
  const fields = [
    {
      key: "items",
      icon: Package,
      label: isTh ? "สินค้าใด" : "Which items?",
      value: isTh
        ? "Top-30 OOS · 7 รายการ Markdown · กระเช้าวันแม่"
        : "Top-30 OOS · 7 markdown SKUs · Mother's Day baskets",
    },
    {
      key: "price",
      icon: Banknote,
      label: isTh ? "ราคาเท่าไหร่" : "Which price?",
      value: isTh
        ? "ลด 25–30% สำหรับ Markdown · ราคาปกติสำหรับ OOS"
        : "25–30% off markdown SKUs · regular price for OOS",
    },
    {
      key: "qty",
      icon: TrendingUp,
      label: isTh ? "จำนวนเท่าไหร่" : "How many?",
      value: isTh ? "เติม 1,840 ชิ้น · ตั้งกระเช้า 60 ชุด" : "Replenish 1,840 units · 60 gift baskets",
    },
    {
      key: "target",
      icon: Clock,
      label: isTh ? "เป้าหมาย + ระยะเวลา" : "Target & timeline",
      value: isTh
        ? "ปิดช่องว่าง MTD ให้เหลือ -5% ภายใน 31 พ.ค."
        : "Close MTD gap to -5% by May 31",
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
              ? "ผู้รับผิดชอบ: SGM ทองหล่อ ซ.13 + ทีม Merchandising + ทีม Supply Chain"
              : "Owners: SGM Thonglor 13 · Merchandising · Supply Chain"}
          </span>
          <span className="mono font-semibold text-foreground">
            {isTh ? "ตรวจสอบ: 31 พ.ค." : "Review: May 31"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const router = useRouter();
  const { lang, role } = useAppShell();
  const { data: branch } = useBranchData();
  const t = getT(lang);
  const d = DASH_I18N[lang];
  const isStaff = role === "staff";
  const userName = isStaff ? STORE.staff[lang] : STORE.manager[lang];
  const greeting =
    lang === "th" ? "สวัสดียามบ่าย" : "Good afternoon";
  const facts = buildFacts(lang, branch.hourly, branch.monthly);
  const insights = buildInsights(lang);

  const openRoute = React.useCallback(
    (route: RouteKey) => {
      router.push(route === "delivery" ? "/deliveries" : `/${route}`);
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

      <TopFlopBanner lang={lang} />
      <AISummaryCard lang={lang} />

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
      <SupportNeedsCard lang={lang} />

      <div className="h-6" />
    </div>
  );
}
