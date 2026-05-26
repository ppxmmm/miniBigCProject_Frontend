"use client";

import * as React from "react";
import {
  Calendar,
  Check,
  Download,
  Flame,
  Gift,
  Package,
  Plus,
  Sparkles,
  TrendingUp,
  User,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Restricted } from "@/components/page-helpers";
import { useAppShell } from "@/components/layout/app-shell";
import { useBranchData } from "@/providers/branch-data-provider";
import { fmtMoney } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Lang, LocalizedString } from "@/types";

type PlanTab = "all" | "quick" | "week" | "month";
type Source = "alerts" | "revenue" | "events";
type Priority = "p1" | "p2" | "p3";
type Effort = "low" | "medium" | "high";
type Horizon = "quick" | "week1" | "week2" | "month";

interface RecoveryAction {
  id: string;
  icon: keyof typeof ICON_MAP;
  source: Source;
  priority: Priority;
  title: LocalizedString;
  desc: LocalizedString;
  upside: number;
  effort: Effort;
  confidence: number;
  window: LocalizedString;
  horizon: Horizon;
  owner: LocalizedString;
}

const ICON_MAP = {
  calendar: Calendar,
  flame: Flame,
  gift: Gift,
  package: Package,
  sparkle: Sparkles,
  trending: TrendingUp,
  user: User,
} satisfies Record<string, LucideIcon>;

const GAP = 620000;

const ACTIONS: RecoveryAction[] = [
  {
    id: "r1",
    icon: "package",
    source: "alerts",
    priority: "p1",
    title: { th: "เติม Top-30 OOS เร่งด่วน", en: "Express replenish Top-30 OOS" },
    desc: {
      th: "สั่งซัพพลายเออร์ส่งภายใน 1-3 วันสำหรับ 5 SKU หลักที่หมด",
      en: "Express order from supplier in 1-3 days for 5 core OOS SKUs",
    },
    upside: 62000,
    effort: "low",
    confidence: 0.91,
    window: { th: "7 วัน", en: "7 days" },
    horizon: "quick",
    owner: { th: "Supply Chain + SGM", en: "Supply Chain + SGM" },
  },
  {
    id: "p1",
    icon: "flame",
    source: "alerts",
    priority: "p1",
    title: {
      th: "Markdown 25-30% ขนมปังใกล้หมดอายุ",
      en: "25-30% markdown - bread expiring soon",
    },
    desc: {
      th: "11 ชิ้นหมดอายุภายใน 2 วัน - ลดดีกว่าทิ้ง ลดมูลค่าเสียให้น้อยที่สุด",
      en: "11 units expire in 2 days - markdown beats write-off, minimise loss",
    },
    upside: 18400,
    effort: "low",
    confidence: 0.92,
    window: { th: "3 วัน", en: "3 days" },
    horizon: "quick",
    owner: { th: "ฝ่ายปฏิบัติการสาขา", en: "Store ops" },
  },
  {
    id: "p2",
    icon: "gift",
    source: "revenue",
    priority: "p2",
    title: {
      th: "Bundle ซื้อ 2 แถม 1 บะหมี่ MAMA",
      en: "Buy 2 get 1 - MAMA noodles bundle",
    },
    desc: {
      th: "ยอด MAMA โต 23% สัปดาห์นี้ ใช้ bundle ขยายขนาดบิลเฉลี่ย",
      en: "MAMA up 23% this week - bundle to lift average basket",
    },
    upside: 1840 * 8,
    effort: "medium",
    confidence: 0.78,
    window: { th: "1 สัปดาห์", en: "1 week" },
    horizon: "week1",
    owner: { th: "Merchandising", en: "Merchandising" },
  },
  {
    id: "p3",
    icon: "trending",
    source: "revenue",
    priority: "p2",
    title: {
      th: "Happy hour เครื่องดื่มเย็น 17:00-19:00",
      en: "Cold-drink happy hour 17:00-19:00",
    },
    desc: {
      th: "ยอดเครื่องดื่ม 17-19 น. ต่ำกว่าค่าเฉลี่ย 18% ลด 10% เพื่อดึงทราฟฟิก",
      en: "Cold drinks 18% below avg in 17-19h window - 10% off lifts footfall",
    },
    upside: 980 * 14,
    effort: "low",
    confidence: 0.65,
    window: { th: "2 สัปดาห์", en: "2 weeks" },
    horizon: "week1",
    owner: { th: "Merchandising + SGM", en: "Merchandising + SGM" },
  },
  {
    id: "r2",
    icon: "user",
    source: "revenue",
    priority: "p2",
    title: {
      th: "Win-back ลูกค้าหายไป 30 วัน",
      en: "30-day lapsed customer win-back",
    },
    desc: {
      th: "ส่ง SMS คูปอง ฿80 สำหรับลูกค้า 1,240 คนที่ไม่ได้ซื้อมา 30+ วัน",
      en: "SMS ฿80 coupon to 1,240 customers lapsed 30+ days",
    },
    upside: 68000,
    effort: "medium",
    confidence: 0.71,
    window: { th: "14 วัน", en: "14 days" },
    horizon: "week2",
    owner: { th: "CRM + SGM", en: "CRM + SGM" },
  },
  {
    id: "e1",
    icon: "calendar",
    source: "events",
    priority: "p2",
    title: { th: "วิสาขบูชา 31 พ.ค.", en: "Visakha Bucha - May 31" },
    desc: {
      th: "วันหยุดนักขัตฤกษ์ ลูกค้าซื้อของไหว้พระ ของแห้ง เทียน ดอกไม้ น้ำดื่ม",
      en: "Holiday - offerings, dry goods, candles, flowers, water spike",
    },
    upside: 8600,
    effort: "medium",
    confidence: 0.88,
    window: { th: "5 วัน", en: "5 days" },
    horizon: "week1",
    owner: { th: "Merchandising", en: "Merchandising" },
  },
  {
    id: "e2",
    icon: "gift",
    source: "events",
    priority: "p3",
    title: {
      th: "วันแม่ 12 ส.ค. กระเช้าของขวัญ",
      en: "Mother's Day - gift baskets",
    },
    desc: {
      th: "เริ่มแสดงสินค้ากระเช้า 14 วันก่อน ดึงลูกค้าที่เริ่มมองหา",
      en: "Stage gift baskets 14 days early to capture browsers",
    },
    upside: 14200,
    effort: "high",
    confidence: 0.81,
    window: { th: "3 สัปดาห์", en: "3 weeks" },
    horizon: "month",
    owner: { th: "Merchandising", en: "Merchandising" },
  },
  {
    id: "e3",
    icon: "sparkle",
    source: "events",
    priority: "p3",
    title: {
      th: "เปิดเทอม 16 พ.ค. มุมเครื่องเขียน-นม",
      en: "Back to school - stationery + breakfast",
    },
    desc: {
      th: "ครัวเรือนใกล้สาขามีเด็กวัยเรียน ~38% เสนอจัดมุมเครื่องเขียน-นม-ขนมเช้า",
      en: "~38% local households have school kids - stationery + breakfast corner",
    },
    upside: 6400,
    effort: "medium",
    confidence: 0.74,
    window: { th: "4 สัปดาห์", en: "4 weeks" },
    horizon: "month",
    owner: { th: "Merchandising", en: "Merchandising" },
  },
];

const SOURCE_LABEL: Record<Source, LocalizedString> = {
  alerts: { th: "จาก Alerts", en: "from Alerts" },
  revenue: { th: "จาก Revenue", en: "from Revenue" },
  events: { th: "จาก Calendar", en: "from Calendar" },
};

const EFFORT_LABEL: Record<Effort, LocalizedString> = {
  low: { th: "งานเบา", en: "Low effort" },
  medium: { th: "งานกลาง", en: "Medium effort" },
  high: { th: "งานหนัก", en: "Heavy lift" },
};

const TABS: Array<{ value: PlanTab; getLabel: (lang: Lang) => string }> = [
  {
    value: "all",
    getLabel: (lang) => `${lang === "th" ? "ทั้งหมด" : "All"} · ${ACTIONS.length}`,
  },
  {
    value: "quick",
    getLabel: (lang) =>
      `${lang === "th" ? "ทำได้ทันที" : "Quick wins"} · ${ACTIONS.filter((a) => a.horizon === "quick").length}`,
  },
  {
    value: "week",
    getLabel: (lang) =>
      `${lang === "th" ? "1-2 สัปดาห์" : "1-2 weeks"} · ${ACTIONS.filter((a) => a.horizon === "week1" || a.horizon === "week2").length}`,
  },
  {
    value: "month",
    getLabel: (lang) =>
      `${lang === "th" ? "เดือน+" : "Monthly+"} · ${ACTIONS.filter((a) => a.horizon === "month").length}`,
  },
];

function getFilteredActions(tab: PlanTab) {
  if (tab === "quick") return ACTIONS.filter((a) => a.horizon === "quick");
  if (tab === "week") {
    return ACTIONS.filter((a) => a.horizon === "week1" || a.horizon === "week2");
  }
  if (tab === "month") return ACTIONS.filter((a) => a.horizon === "month");
  return ACTIONS;
}

function PriorityPill({ level, lang }: { level: Priority; lang: Lang }) {
  const labels: Record<Priority, LocalizedString> = {
    p1: { th: "P1 เร่งด่วน", en: "P1 urgent" },
    p2: { th: "P2 สำคัญ", en: "P2 important" },
    p3: { th: "P3 วางแผน", en: "P3 planned" },
  };

  return (
    <Badge
      variant={level === "p1" ? "destructive" : level === "p2" ? "secondary" : "outline"}
      className={cn(
        "h-5 rounded-md px-1.5 text-[10.5px] font-semibold",
        level === "p2" && "bg-warn-50 text-[oklch(0.45_0.13_70)]",
      )}
    >
      {labels[level][lang]}
    </Badge>
  );
}

function CrisisContextStrip({
  lang,
  storeName,
}: {
  lang: Lang;
  storeName: string;
}) {
  const isTh = lang === "th";

  return (
    <Card className="mb-3.5 overflow-hidden border-primary/25 bg-primary-50/65 shadow-(--sh-2)">
      <CardContent className="flex flex-wrap items-center gap-4 border-l-4 border-primary p-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-5" />
        </div>
        <div className="min-w-64 flex-1">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
            {isTh ? "Recovery Levers · AI" : "Recovery levers · AI"}
          </div>
          <h2 className="text-[18px] font-semibold leading-tight tracking-tight text-foreground">
            {isTh
              ? "ชุด action เพื่อปิดช่องว่าง MTD -฿620k → ตั้งเป้าให้เหลือ -5%"
              : "Action set to close the MTD -฿620k gap → target -5% by month-end"}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {isTh
              ? `ปรับจาก Alerts, Revenue และ Calendar ของ ${storeName}`
              : `Prioritised from Alerts, Revenue and Calendar for ${storeName}`}
          </p>
        </div>
        <div className="rounded-lg border border-primary/20 bg-card px-4 py-3 text-right">
          <div className="num text-2xl font-bold tracking-tight text-primary">-฿620k</div>
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            {isTh ? "ช่องว่าง MTD" : "MTD gap"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SuggestionsPage() {
  const { lang, role } = useAppShell();
  const { data: branch } = useBranchData();
  const t = getT(lang);
  const isTh = lang === "th";
  const [tab, setTab] = React.useState<PlanTab>("all");
  const [launched, setLaunched] = React.useState<Set<string>>(new Set());

  if (role === "staff") {
    return (
      <>
        <PageHeader title={t.sug.title} sub={t.sug.sub} />
        <Restricted lang={lang} />
      </>
    );
  }

  const filtered = getFilteredActions(tab);
  const inPlan = ACTIONS.filter((action) => launched.has(action.id));
  const totalUpside = filtered.reduce((sum, action) => sum + action.upside, 0);
  const planTotal = inPlan.reduce((sum, action) => sum + action.upside, 0);
  const gapClose = Math.min(1, planTotal / GAP);
  const gapPercent = Math.round(gapClose * 100);

  return (
    <div className="fade-in">
      <PageHeader
        title={isTh ? "แผนกู้ยอด · Recovery Plan" : "Recovery plan"}
        sub={
          isTh
            ? `Action ที่ AI แนะนำเพื่อปิดช่องว่าง MTD · ${branch.store.short[lang]}`
            : `AI-curated actions to close the MTD gap · ${branch.store.short[lang]}`
        }
        right={
          <>
            <Badge variant="secondary" className="bg-info-50 text-info">
              <Sparkles />
              {isTh ? "ขับเคลื่อนด้วย AI · Donjai" : "AI · Donjai"}
            </Badge>
            <Button size="sm" variant="outline">
              <Download />
              {t.common.export}
            </Button>
          </>
        }
      />

      <CrisisContextStrip lang={lang} storeName={branch.store.short[lang]} />

      <Card className="mb-3.5">
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="min-w-60 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {isTh ? "ปิดช่องว่างแล้ว" : "Gap closed by selected plan"}
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span
                className={cn(
                  "num text-[32px] font-bold tracking-[-0.02em]",
                  gapClose >= 0.5
                    ? "text-primary"
                    : gapClose > 0
                      ? "text-warn"
                      : "text-muted-foreground",
                )}
              >
                {fmtMoney(planTotal, { compact: true })}
              </span>
              <span className="text-[13px] text-muted-foreground">
                / {fmtMoney(GAP, { compact: true })} {isTh ? "ช่องว่าง MTD" : "MTD gap"}
              </span>
            </div>
            <Progress
              value={gapClose * 100}
              className={cn(
                "mt-2.5 **:data-[slot=progress-track]:h-2.5",
                gapClose >= 0.5
                  ? "**:data-[slot=progress-indicator]:bg-primary"
                  : gapClose > 0
                    ? "**:data-[slot=progress-indicator]:bg-warn"
                    : "**:data-[slot=progress-indicator]:bg-muted-foreground",
              )}
            />
            <div className="mt-1.5 text-xs text-muted-foreground">
              {inPlan.length} {isTh ? "action ที่เลือกไว้" : "actions selected"} · {gapPercent}%{" "}
              {isTh ? "ของช่องว่าง" : "of the gap"}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setLaunched(new Set())}>
              {isTh ? "เริ่มใหม่" : "Reset"}
            </Button>
            <Button
              onClick={() =>
                toast.success(
                  isTh
                    ? "ส่งแผนเข้า Support Needs แล้ว"
                    : "Plan submitted to Support Needs",
                )
              }
            >
              <Check />
              {isTh ? "ยืนยันส่งเข้า Support Needs" : "Commit to Support Needs"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-3.5 flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={(value) => setTab(value as PlanTab)}>
          <TabsList>
            {TABS.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.getLabel(lang)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <span className="ml-auto text-[12.5px] text-muted-foreground">
          {isTh ? "ผลตอบแทนคาดการณ์" : "Total estimated upside"} ·{" "}
          <span className="num font-bold text-primary">
            +{fmtMoney(totalUpside, { compact: true })}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((action) => (
          <RecoveryActionCard
            key={action.id}
            action={action}
            inPlan={launched.has(action.id)}
            lang={lang}
            onToggle={() => {
              setLaunched((prev) => {
                const next = new Set(prev);
                if (next.has(action.id)) next.delete(action.id);
                else next.add(action.id);
                return next;
              });

              const nowInPlan = !launched.has(action.id);
              toast.success(
                nowInPlan
                  ? isTh
                    ? `เพิ่ม "${action.title.th}" เข้าแผน`
                    : `Added "${action.title.en}" to plan`
                  : isTh
                    ? `นำ "${action.title.th}" ออกจากแผน`
                    : `Removed "${action.title.en}" from plan`,
              );
            }}
          />
        ))}
      </div>
    </div>
  );
}

function RecoveryActionCard({
  action,
  inPlan,
  lang,
  onToggle,
}: {
  action: RecoveryAction;
  inPlan: boolean;
  lang: Lang;
  onToggle: () => void;
}) {
  const Icon = ICON_MAP[action.icon];
  const isTh = lang === "th";

  return (
    <Card
      className={cn(
        "relative transition-shadow",
        inPlan && "border-primary shadow-[0_0_0_3px_var(--primary-50)]",
      )}
    >
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9.5 shrink-0 items-center justify-center rounded-[9px] bg-primary-50 text-primary">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <PriorityPill level={action.priority} lang={lang} />
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                {SOURCE_LABEL[action.source][lang]}
              </span>
            </div>
            <h3 className="text-sm font-semibold leading-snug">{action.title[lang]}</h3>
          </div>
        </div>

        <p className="m-0 flex-1 text-[12.5px] leading-relaxed text-muted-foreground">
          {action.desc[lang]}
        </p>

        <div className="grid grid-cols-2 gap-2.5 border-y py-3">
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
              {isTh ? "ผลตอบแทน" : "Upside"}
            </div>
            <div className="num mt-0.5 text-lg font-bold tracking-tight text-primary">
              +{fmtMoney(action.upside, { compact: true })}
            </div>
            <div className="mt-0.5 text-[10.5px] text-muted-foreground">
              {isTh ? "ใน" : "in"} {action.window[lang]}
            </div>
          </div>
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
              {EFFORT_LABEL[action.effort][lang]} · {isTh ? "ความเชื่อมั่น" : "Confidence"}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Progress
                value={action.confidence * 100}
                className={cn(
                  "flex-1",
                  action.confidence <= 0.65 &&
                    "**:data-[slot=progress-indicator]:bg-destructive",
                  action.confidence > 0.65 &&
                    action.confidence <= 0.8 &&
                    "**:data-[slot=progress-indicator]:bg-warn",
                )}
              />
              <span className="num min-w-8 text-xs font-semibold">
                {Math.round(action.confidence * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
          <User className="size-3.5" />
          <span className="flex-1">{action.owner[lang]}</span>
        </div>

        <div className="mt-auto flex gap-1.5">
          <Button size="sm" variant="outline" className="flex-1">
            {isTh ? "รายละเอียด" : "Details"}
          </Button>
          <Button
            size="sm"
            variant={inPlan ? "outline" : "default"}
            className={cn("flex-1", inPlan && "border-primary text-primary")}
            onClick={onToggle}
          >
            {inPlan ? <Check /> : <Plus />}
            {inPlan ? (isTh ? "อยู่ในแผน" : "In plan") : isTh ? "ใส่แผน" : "Add to plan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
