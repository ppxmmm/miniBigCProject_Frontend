"use client";

import * as React from "react";
import Link from "next/link";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Restricted } from "@/components/page-helpers";
import { useAppShell } from "@/components/layout/app-shell";
import { useBranchData } from "@/providers/branch-data-provider";
import { downloadCsv, exportFilename } from "@/lib/download-csv";
import { daysBetween, fmtD, fmtMoney, fmtNum } from "@/lib/format";
import { buildSuggestionsExportRows } from "@/lib/page-exports";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { BranchData } from "@/lib/branch-data";
import type { Lang, LocalizedString, Suggestion } from "@/types";

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

function normalizeIcon(icon: string): keyof typeof ICON_MAP {
  return icon in ICON_MAP ? (icon as keyof typeof ICON_MAP) : "sparkle";
}

function priorityFromConfidence(confidence: number): Priority {
  if (confidence >= 0.85) return "p1";
  if (confidence >= 0.7) return "p2";
  return "p3";
}

function horizonFromSuggestion(suggestion: Suggestion): Horizon {
  const text = `${suggestion.duration.th} ${suggestion.duration.en}`.toLowerCase();
  if (text.includes("day") || text.includes("วัน")) return "quick";
  if (text.includes("week") || text.includes("สัปดาห์")) return "week1";
  return "month";
}

function effortFromSuggestion(suggestion: Suggestion): Effort {
  if (suggestion.confidence >= 0.85) return "low";
  if (suggestion.confidence >= 0.7) return "medium";
  return "high";
}

function suggestionToAction(
  suggestion: Suggestion,
  source: Source,
  prefix: string,
): RecoveryAction {
  return {
    id: `${prefix}-${suggestion.id}`,
    icon: normalizeIcon(suggestion.icon),
    source,
    priority: priorityFromConfidence(suggestion.confidence),
    title: suggestion.title,
    desc: suggestion.desc,
    upside: suggestion.upside,
    effort: effortFromSuggestion(suggestion),
    confidence: suggestion.confidence,
    window: suggestion.duration,
    horizon: horizonFromSuggestion(suggestion),
    owner: suggestion.target,
  };
}

function buildRecoveryActions(branch: BranchData): RecoveryAction[] {
  const actions = [
    ...branch.promos.map((suggestion) => suggestionToAction(suggestion, "revenue", "promo")),
    ...branch.events.map((suggestion) => suggestionToAction(suggestion, "events", "event")),
  ];

  if (branch.lowStock.length > 0) {
    const lostSales = branch.lowStock.reduce(
      (sum, item) => sum + Math.max(3600, Math.round((item.reorder - item.stock) * 620)),
      0,
    );
    actions.unshift({
      id: "alerts-low-stock",
      icon: "package",
      source: "alerts",
      priority: "p1",
      title: {
        th: `เติมสต็อกต่ำ ${branch.lowStock.length} SKU`,
        en: `Replenish ${branch.lowStock.length} low-stock SKUs`,
      },
      desc: {
        th: "สร้างจากข้อมูล lowStock backend เพื่อให้แผนตรงกับหน้า Alerts",
        en: "Generated from backend lowStock data so the plan matches Alerts.",
      },
      upside: lostSales,
      effort: "low",
      confidence: 0.9,
      window: { th: "7 วัน", en: "7 days" },
      horizon: "quick",
      owner: { th: "Supply Chain + SGM", en: "Supply Chain + SGM" },
    });
  }

  const expiringValue = branch.expiring.reduce((sum, item) => sum + item.stock * item.price, 0);
  if (expiringValue > 0) {
    actions.unshift({
      id: "alerts-expiring",
      icon: "flame",
      source: "alerts",
      priority: "p1",
      title: {
        th: `ลดสูญเสียสินค้าใกล้หมดอายุ ${branch.expiring.length} SKU`,
        en: `Reduce near-expiry loss across ${branch.expiring.length} SKUs`,
      },
      desc: {
        th: "สร้างจากข้อมูล expiring backend เพื่อให้ตรงกับหน้า Alerts",
        en: "Generated from backend expiring data so it reconciles with Alerts.",
      },
      upside: expiringValue,
      effort: "low",
      confidence: 0.88,
      window: { th: "3 วัน", en: "3 days" },
      horizon: "quick",
      owner: { th: "ฝ่ายปฏิบัติการสาขา", en: "Store ops" },
    });
  }

  return actions;
}

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

function buildTabs(actions: RecoveryAction[], lang: Lang) {
  return [
    {
      value: "all" as const,
      label: `${lang === "th" ? "ทั้งหมด" : "All"} · ${actions.length}`,
    },
    {
      value: "quick" as const,
      label: `${lang === "th" ? "ทำได้ทันที" : "Quick wins"} · ${
        actions.filter((action) => action.horizon === "quick").length
      }`,
    },
    {
      value: "week" as const,
      label: `${lang === "th" ? "1-2 สัปดาห์" : "1-2 weeks"} · ${
        actions.filter((action) => action.horizon === "week1" || action.horizon === "week2")
          .length
      }`,
    },
    {
      value: "month" as const,
      label: `${lang === "th" ? "เดือน+" : "Monthly+"} · ${
        actions.filter((action) => action.horizon === "month").length
      }`,
    },
  ];
}

function getFilteredActions(actions: RecoveryAction[], tab: PlanTab) {
  if (tab === "quick") return actions.filter((a) => a.horizon === "quick");
  if (tab === "week") {
    return actions.filter((a) => a.horizon === "week1" || a.horizon === "week2");
  }
  if (tab === "month") return actions.filter((a) => a.horizon === "month");
  return actions;
}

function findSuggestionForAction(
  branch: BranchData,
  action: RecoveryAction,
): Suggestion | null {
  if (action.id.startsWith("promo-")) {
    const id = action.id.slice("promo-".length);
    return branch.promos.find((item) => String(item.id) === id) ?? null;
  }
  if (action.id.startsWith("event-")) {
    const id = action.id.slice("event-".length);
    return branch.events.find((item) => String(item.id) === id) ?? null;
  }
  return null;
}

function ActionDetailDialog({
  action,
  branch,
  lang,
  open,
  onOpenChange,
}: {
  action: RecoveryAction | null;
  branch: BranchData;
  lang: Lang;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isTh = lang === "th";
  if (!action) return null;

  const suggestion = findSuggestionForAction(branch, action);
  const showAlertsLink = action.source === "alerts";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{action.title[lang]}</DialogTitle>
          <DialogDescription>{action.desc[lang]}</DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-3 text-[12.5px]">
          <div>
            <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
              {isTh ? "ผลตอบแทน" : "Upside"}
            </dt>
            <dd className="num mt-0.5 font-semibold text-primary">
              +{fmtMoney(action.upside, { compact: true })}
            </dd>
          </div>
          <div>
            <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
              {isTh ? "ระยะเวลา" : "Window"}
            </dt>
            <dd className="mt-0.5 font-medium">{action.window[lang]}</dd>
          </div>
          <div>
            <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
              {EFFORT_LABEL[action.effort][lang]}
            </dt>
            <dd className="mt-0.5 font-medium">
              {Math.round(action.confidence * 100)}% {isTh ? "ความเชื่อมั่น" : "confidence"}
            </dd>
          </div>
          <div>
            <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
              {isTh ? "ผู้รับผิดชอบ" : "Owner"}
            </dt>
            <dd className="mt-0.5 font-medium">{action.owner[lang]}</dd>
          </div>
        </dl>

        {action.id === "alerts-expiring" && branch.expiring.length > 0 && (
          <div className="max-h-52 overflow-y-auto rounded-lg border">
            <table className="w-full text-left text-[12px]">
              <thead className="sticky top-0 bg-muted/80 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">{isTh ? "สินค้า" : "Product"}</th>
                  <th className="px-3 py-2">{isTh ? "หมดอายุ" : "Expires"}</th>
                  <th className="px-3 py-2 text-right">{isTh ? "มูลค่า" : "Value"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {branch.expiring.map((item, index) => (
                  <tr
                    key={`${item.sku}-${item.exp.getTime()}-${item.loc}-${index}`}
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium">{item[lang]}</div>
                      <div className="mono text-[10.5px] text-muted-foreground">
                        {item.sku} · {item.loc}
                      </div>
                    </td>
                    <td className="num px-3 py-2 whitespace-nowrap">
                      {fmtD(item.exp, lang)} ({daysBetween(item.exp)}d)
                    </td>
                    <td className="num px-3 py-2 text-right font-medium">
                      {fmtMoney(item.stock * item.price, { compact: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {action.id === "alerts-low-stock" && branch.lowStock.length > 0 && (
          <div className="max-h-52 overflow-y-auto rounded-lg border">
            <table className="w-full text-left text-[12px]">
              <thead className="sticky top-0 bg-muted/80 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">{isTh ? "สินค้า" : "Product"}</th>
                  <th className="px-3 py-2 text-right">{isTh ? "คงเหลือ" : "Stock"}</th>
                  <th className="px-3 py-2 text-right">{isTh ? "จุดสั่ง" : "Reorder"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {branch.lowStock.map((item, index) => (
                  <tr key={`${item.sku}-${item.loc}-${index}`}>
                    <td className="px-3 py-2">
                      <div className="font-medium">{item[lang]}</div>
                      <div className="mono text-[10.5px] text-muted-foreground">
                        {item.sku} · {item.loc}
                      </div>
                    </td>
                    <td className="num px-3 py-2 text-right">{fmtNum(item.stock)}</td>
                    <td className="num px-3 py-2 text-right">{fmtNum(item.reorder)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {suggestion && (
          <div className="space-y-2 rounded-lg border bg-muted/40 p-3 text-[12.5px]">
            <div>
              <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                {isTh ? "ประเภท" : "Type"}
              </span>
              <p className="mt-0.5 font-medium">{suggestion.type}</p>
            </div>
            <div>
              <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                {isTh ? "เป้าหมาย" : "Target"}
              </span>
              <p className="mt-0.5">{suggestion.target[lang]}</p>
            </div>
            <p className="leading-relaxed text-muted-foreground">{suggestion.desc[lang]}</p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          {showAlertsLink ? (
            <Link
              href="/alerts"
              className={buttonVariants({ variant: "outline", size: "sm" })}
              onClick={() => onOpenChange(false)}
            >
              {isTh ? "เปิดหน้า Alerts" : "Open Alerts"}
            </Link>
          ) : (
            <span />
          )}
          <Button size="sm" onClick={() => onOpenChange(false)}>
            {isTh ? "ปิด" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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
  targetValue,
}: {
  lang: Lang;
  storeName: string;
  targetValue: number;
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
              ? `ชุด action จาก backend เพื่อกู้โอกาส ${fmtMoney(targetValue, { compact: true })}`
              : `Backend action set for ${fmtMoney(targetValue, { compact: true })} in recoverable opportunity`}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {isTh
              ? `ปรับจาก Alerts, Revenue และ Calendar ของ ${storeName}`
              : `Prioritised from Alerts, Revenue and Calendar for ${storeName}`}
          </p>
        </div>
        <div className="rounded-lg border border-primary/20 bg-card px-4 py-3 text-right">
          <div className="num text-2xl font-bold tracking-tight text-primary">
            {fmtMoney(targetValue, { compact: true })}
          </div>
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            {isTh ? "โอกาสกู้ยอด" : "Opportunity"}
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
  const [detailAction, setDetailAction] = React.useState<RecoveryAction | null>(null);

  if (role === "staff") {
    return (
      <>
        <PageHeader title={t.sug.title} sub={t.sug.sub} />
        <Restricted lang={lang} />
      </>
    );
  }

  const actions = buildRecoveryActions(branch);
  const tabs = buildTabs(actions, lang);
  const filtered = getFilteredActions(actions, tab);
  const inPlan = actions.filter((action) => launched.has(action.id));
  const totalUpside = filtered.reduce((sum, action) => sum + action.upside, 0);
  const planTotal = inPlan.reduce((sum, action) => sum + action.upside, 0);
  const dailyGap = Math.max(
    0,
    branch.dailyLast.reduce((sum, value) => sum + value, 0) -
      branch.daily.reduce((sum, value) => sum + value, 0),
  );
  const targetValue = Math.max(
    dailyGap,
    actions.reduce((sum, action) => sum + action.upside, 0),
  );
  const gapClose = targetValue > 0 ? Math.min(1, planTotal / targetValue) : 0;
  const gapPercent = Math.round(gapClose * 100);

  const handleExport = () => {
    downloadCsv(
      exportFilename("recovery-plan"),
      buildSuggestionsExportRows(lang, branch, actions),
    );
  };

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
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download />
              {t.common.export}
            </Button>
          </>
        }
      />

      <CrisisContextStrip
        lang={lang}
        storeName={branch.store.short[lang]}
        targetValue={targetValue}
      />

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
                / {fmtMoney(targetValue, { compact: true })}{" "}
                {isTh ? "โอกาสกู้ยอด" : "recoverable opportunity"}
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
            {tabs.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
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

      <ActionDetailDialog
        action={detailAction}
        branch={branch}
        lang={lang}
        open={detailAction !== null}
        onOpenChange={(open) => {
          if (!open) setDetailAction(null);
        }}
      />

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((action) => (
          <RecoveryActionCard
            key={action.id}
            action={action}
            inPlan={launched.has(action.id)}
            lang={lang}
            onShowDetails={() => setDetailAction(action)}
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
        {filtered.length === 0 && (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              {isTh
                ? "ยังไม่มีคำแนะนำจาก backend สำหรับตัวกรองนี้"
                : "No backend suggestions for this filter yet."}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function RecoveryActionCard({
  action,
  inPlan,
  lang,
  onShowDetails,
  onToggle,
}: {
  action: RecoveryAction;
  inPlan: boolean;
  lang: Lang;
  onShowDetails: () => void;
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
          <Button size="sm" variant="outline" className="flex-1" onClick={onShowDetails}>
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
