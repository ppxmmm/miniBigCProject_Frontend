"use client";

import * as React from "react";
import {
  AlertTriangle,
  Check,
  Clock,
  Download,
  Filter,
  Flame,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FilterChipGroup,
  FilterDialog,
  FilterToggle,
} from "@/components/filter-dialog";
import { Empty, PageHeader } from "@/components/page-helpers";
import { downloadCsv, exportFilename } from "@/lib/download-csv";
import { fmtD, fmtMoney, daysBetween } from "@/lib/format";
import { buildAlertsExportRows } from "@/lib/page-exports";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/app-shell";
import { useBranchRefresh } from "@/hooks/use-branch-refresh";
import { useBranchData } from "@/providers/branch-data-provider";
import { useHashScroll } from "@/hooks/use-hash-scroll";
import type { ExpiringItem, Lang, LocalizedString } from "@/types";

type Tab = "oos" | "expiring" | "slow";
type Priority = "p1" | "p2" | "p3";

type AlertFilters = {
  categories: string[];
  top30Only: boolean;
  hideAcked: boolean;
};

const DEFAULT_ALERT_FILTERS: AlertFilters = {
  categories: [],
  top30Only: false,
  hideAcked: false,
};

type FilterableAlertItem = {
  sku: string;
  th: string;
  en: string;
  cat: LocalizedString;
  supplier?: string;
};

function categoryKey(cat: LocalizedString) {
  return `${cat.th}-${cat.en}`;
}

function matchesAlertFilters(
  item: FilterableAlertItem,
  filters: AlertFilters,
  tab: Tab,
  acked: Set<string>,
) {
  if (filters.hideAcked && acked.has(item.sku)) {
    return false;
  }
  if (
    filters.categories.length > 0 &&
    !filters.categories.includes(categoryKey(item.cat))
  ) {
    return false;
  }
  if (filters.top30Only && tab === "oos" && item.supplier !== "Top-30") {
    return false;
  }
  return true;
}

interface OosItem {
  sku: string;
  th: string;
  en: string;
  cat: LocalizedString;
  stock: number;
  reorder: number;
  loc: string;
  lostSales: number;
  eta: string;
  supplier?: string;
}

interface SlowItem {
  sku: string;
  th: string;
  en: string;
  cat: LocalizedString;
  days: number;
  stock: number;
  value: number;
}

interface ExpiringActionItem extends ExpiringItem {
  daysLeft: number;
  valueAtRisk: number;
}

const OSA_TARGET = 95;
const SHRINK_COLORS = [
  "var(--destructive)",
  "oklch(0.62 0.16 35)",
  "var(--warn)",
  "var(--info)",
  "var(--muted-foreground)",
];

/** SKUs can repeat per location/expiry row from the backend. */
function inventoryRowKey(
  sku: string,
  loc: string,
  index: number,
  extra = "",
): string {
  return [sku, loc, extra, String(index)].filter(Boolean).join("-");
}

function buildShrinkByCategory(items: ExpiringActionItem[]) {
  const grouped = new Map<string, { th: string; en: string; v: number }>();

  for (const item of items) {
    const key = `${item.cat.th}-${item.cat.en}`;
    const current = grouped.get(key) ?? {
      th: item.cat.th,
      en: item.cat.en,
      v: 0,
    };
    current.v += item.valueAtRisk;
    grouped.set(key, current);
  }

  return Array.from(grouped.values())
    .sort((a, b) => b.v - a.v)
    .map((category, index) => ({
      ...category,
      color: SHRINK_COLORS[index % SHRINK_COLORS.length],
    }));
}

export function AlertsPage() {
  const { lang, role } = useAppShell();
  const { data: branch } = useBranchData();
  const { refresh: refreshBranch, loading: syncing } = useBranchRefresh();
  const t = getT(lang);
  const isTh = lang === "th";
  const [tab, setTab] = React.useState<Tab>("oos");
  const [q, setQ] = React.useState("");
  const [acked, setAcked] = React.useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<AlertFilters>(
    DEFAULT_ALERT_FILTERS,
  );
  const [draftFilters, setDraftFilters] = React.useState<AlertFilters>(
    DEFAULT_ALERT_FILTERS,
  );

  const expiring = React.useMemo<ExpiringActionItem[]>(
    () =>
      branch.expiring.map((item) => ({
        ...item,
        daysLeft: daysBetween(item.exp),
        valueAtRisk: item.stock * item.price,
      })),
    [branch.expiring],
  );

  const oosItems = React.useMemo(() => {
    return branch.lowStock.map(
      (item, idx): OosItem => ({
        ...item,
        lostSales: Math.max(
          3600,
          Math.round((item.reorder - item.stock) * 620),
        ),
        eta: idx % 3 === 0 ? "1d" : idx % 3 === 1 ? "2d" : "3d",
        supplier: idx < 3 ? "Top-30" : undefined,
      }),
    );
  }, [branch.lowStock]);

  const slowItems = React.useMemo<SlowItem[]>(() => [], []);

  const hasActiveFilters =
    filters.categories.length > 0 || filters.top30Only || filters.hideAcked;

  const categoryOptions = React.useMemo(() => {
    const grouped = new Map<string, LocalizedString>();
    for (const item of [...oosItems, ...expiring, ...slowItems]) {
      const key = categoryKey(item.cat);
      if (!grouped.has(key)) {
        grouped.set(key, item.cat);
      }
    }
    return Array.from(grouped.entries()).map(([value, cat]) => ({
      value,
      label: cat[lang],
    }));
  }, [expiring, lang, oosItems, slowItems]);

  const filterFn = React.useCallback(
    (item: FilterableAlertItem) => {
      if (!matchesAlertFilters(item, filters, tab, acked)) {
        return false;
      }
      if (!q) return true;
      const needle = q.toLowerCase();
      return (
        item[lang].toLowerCase().includes(needle) ||
        item.sku.toLowerCase().includes(needle)
      );
    },
    [acked, filters, lang, q, tab],
  );

  const filtered = {
    oos: oosItems.filter(filterFn),
    expiring: expiring.filter(filterFn),
    slow: slowItems.filter(filterFn),
  };

  const osaInventoryTotal = branch.topProducts.length + branch.lowStock.length;
  const osa =
    osaInventoryTotal > 0
      ? (branch.topProducts.length / osaInventoryTotal) * 100
      : 0;
  const osaGap = Math.max(0, OSA_TARGET - osa);
  const shrinkByCategory = buildShrinkByCategory(expiring);
  const shrinkMtd = expiring.reduce((sum, item) => sum + item.valueAtRisk, 0);
  const lostSales = oosItems.reduce((sum, item) => sum + item.lostSales, 0);
  const storeName =
    branch.store.short[lang] || (isTh ? "สาขาพระราม 9" : "Rama 9 branch");

  useHashScroll();

  const ack = (sku: string) => {
    setAcked((current) => new Set([...current, sku]));
    toast.success(
      isTh ? `เพิ่ม ${sku} เข้าแผนกู้ยอด` : `Added ${sku} to recovery plan`,
    );
  };

  const syncStock = React.useCallback(() => {
    void refreshBranch({
      success: isTh ? "ซิงค์สต็อกจากระบบแล้ว" : "Stock synced from backend",
      error: isTh ? "ซิงค์สต็อกไม่สำเร็จ" : "Stock sync failed",
    });
  }, [isTh, refreshBranch]);

  const handleExport = React.useCallback(() => {
    downloadCsv(
      exportFilename("alerts"),
      buildAlertsExportRows(lang, branch, oosItems, expiring),
    );
  }, [branch, expiring, lang, oosItems]);

  return (
    <div className="fade-in" data-screen-label="Stock Alerts">
      <PageHeader
        title={isTh ? "สุขภาพสต็อก & การสูญเสีย" : "Inventory health & loss"}
        sub={
          isTh
            ? `OOS · ใกล้หมดอายุ · ค้างสต็อก · ${storeName}`
            : `OOS · near-expiry · slow movers · ${storeName}`
        }
        right={
          <>
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download />
              {t.common.export}
            </Button>
            {role === "manager" && (
              <Button
                type="button"
                size="sm"
                disabled={syncing}
                onClick={syncStock}
              >
                <RefreshCw className={cn(syncing && "animate-spin")} />
                {isTh ? "ซิงค์สต็อก" : "Sync stock"}
              </Button>
            )}
          </>
        }
      />

      <CrisisContextStrip
        lang={lang}
        headline={
          isTh
            ? `OOS ${oosItems.length} SKU + OSA ต่ำกว่าเป้า ${OSA_TARGET}% -> กระทบยอดตรง`
            : `${oosItems.length} OOS SKUs + OSA below ${OSA_TARGET}% target -> directly drags revenue`
        }
        metric={`${osa.toFixed(1)}%`}
        metricLabel="OSA"
      />

      <section id="stock-availability" className="scroll-mt-20">
        <SectionHeader
          idx="01"
          title={isTh ? "สถานะหลัก" : "Health snapshot"}
          sub={
            isTh
              ? "ดู scale ของปัญหาก่อนเริ่ม action"
              : "Frame the scale before acting"
          }
        />
      </section>

      <div className="mb-3.5 grid gap-3.5 xl:grid-cols-[1.1fr_1fr_1fr]">
        <Card className="rounded-[10px] shadow-none">
          <CardContent className="flex flex-col gap-4 p-4.5 sm:flex-row sm:items-center">
            <GaugeRing value={osa} target={OSA_TARGET} label="OSA" size={140} />
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {isTh ? "ความพร้อมสินค้าบนชั้น" : "On-shelf availability"}
              </div>
              <div className="mt-2 text-[13px] leading-6">
                {isTh ? (
                  <>
                    ต่ำกว่าเป้า <b>{osaGap.toFixed(1)}%</b> จากข้อมูลสินค้า
                    backend: สินค้าขายดี {branch.topProducts.length} SKU
                    และสต็อกต่ำ {branch.lowStock.length} SKU
                  </>
                ) : (
                  <>
                    Below target by <b>{osaGap.toFixed(1)}%</b> from backend
                    inventory:
                    {branch.topProducts.length} top SKUs and{" "}
                    {branch.lowStock.length} low-stock SKUs.
                  </>
                )}
              </div>
              <div className="mt-2 text-[11.5px] text-muted-foreground">
                {isTh ? "ซิงค์จาก backend ล่าสุด" : "Synced from backend"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card id="loss-oos" className="scroll-mt-20 rounded-[10px] shadow-none">
          <CardContent className="p-4.5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-[10px] bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  {isTh ? "SKU ที่หมด" : "OOS SKUs"}
                </div>
                <div className="num mt-0.5 text-[30px] font-bold leading-none tracking-tight">
                  {oosItems.length}
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2.5 text-[12px] leading-5 text-destructive">
              <AlertTriangle className="mr-1 inline size-3.5 align-[-2px]" />
              {isTh ? (
                <>
                  มูลค่ายอดที่หายไป <b className="num">{fmtMoney(lostSales)}</b>{" "}
                  ใน 7 วัน
                </>
              ) : (
                <>
                  Estimated lost sales{" "}
                  <b className="num">{fmtMoney(lostSales)}</b> over 7 days
                </>
              )}
            </div>
            <div className="mt-2 text-[11.5px] text-muted-foreground">
              {isTh
                ? "อ้างอิงจาก lowStock backend"
                : "Based on backend lowStock records"}
            </div>
          </CardContent>
        </Card>

        <Card
          id="inventory-aging-shrinkage"
          className="scroll-mt-20 rounded-[10px] shadow-none"
        >
          <CardContent className="p-4.5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-[10px] bg-warn-50 text-[oklch(0.45_0.13_70)]">
                <Package className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  {isTh ? "สูญเสีย MTD" : "Shrink MTD"}
                </div>
                <div className="num mt-0.5 text-[30px] font-bold leading-none tracking-tight">
                  {fmtMoney(shrinkMtd)}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {shrinkByCategory.map((category) => (
                <div key={category.en} className="flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-[2px]"
                    style={{ background: category.color }}
                  />
                  <span className="flex-1 text-[11.5px] text-muted-foreground">
                    {category[lang]}
                  </span>
                  <span className="num text-[11.5px] font-semibold">
                    {fmtMoney(category.v)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-[11.5px] text-muted-foreground">
              {isTh
                ? "คำนวณจากสินค้าที่ใกล้หมดอายุ"
                : "Calculated from near-expiry inventory"}
            </div>
          </CardContent>
        </Card>
      </div>

      <SectionHeader
        idx="02"
        title={isTh ? "รายการที่ต้องดำเนินการ" : "Items needing action"}
        sub={
          isTh
            ? "เลือก SKU เพื่อกำหนดแผนกู้ยอด"
            : "Select SKUs to add to recovery actions"
        }
        right={
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            <Button
              size="sm"
              variant={hasActiveFilters ? "secondary" : "outline"}
              onClick={() => {
                setDraftFilters(filters);
                setFilterOpen(true);
              }}
            >
              <Filter />
              {t.common.filter}
              {hasActiveFilters && (
                <span className="ml-1 size-1.5 rounded-full bg-primary" />
              )}
            </Button>
            <div className="relative w-full sm:w-60">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-[12.5px]"
                placeholder={t.common.search}
                value={q}
                onChange={(event) => setQ(event.target.value)}
              />
            </div>
          </div>
        }
      />

      <FilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        lang={lang}
        title={t.common.filter}
        onApply={() => setFilters(draftFilters)}
        onReset={() => {
          setDraftFilters(DEFAULT_ALERT_FILTERS);
          setFilters(DEFAULT_ALERT_FILTERS);
        }}
      >
        <FilterChipGroup
          label={t.alert.category}
          options={categoryOptions}
          selected={draftFilters.categories}
          onChange={(categories) =>
            setDraftFilters((current) => ({ ...current, categories }))
          }
        />
        <FilterToggle
          id="alert-top30"
          label={isTh ? "เฉพาะ Top-30" : "Top-30 SKUs only"}
          description={
            isTh
              ? "ใช้กับแท็บหมด/ต่ำเร่งด่วน"
              : "Applies on the OOS critical tab"
          }
          checked={draftFilters.top30Only}
          onCheckedChange={(top30Only) =>
            setDraftFilters((current) => ({ ...current, top30Only }))
          }
        />
        <FilterToggle
          id="alert-hide-acked"
          label={isTh ? "ซ่อนรายการในแผนแล้ว" : "Hide items in recovery plan"}
          checked={draftFilters.hideAcked}
          onCheckedChange={(hideAcked) =>
            setDraftFilters((current) => ({ ...current, hideAcked }))
          }
        />
      </FilterDialog>

      <Card className="gap-0 overflow-hidden rounded-[10px] py-0 shadow-none">
        <div className="px-4.5 py-3">
          <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
            <TabsList className="h-auto flex-wrap">
              <TabsTrigger value="oos">
                {isTh ? "หมด/ต่ำเร่งด่วน" : "OOS critical"} ·{" "}
                {filtered.oos.length}
              </TabsTrigger>
              <TabsTrigger value="expiring">
                {isTh ? "ใกล้หมดอายุ" : "Near expiry"} ·{" "}
                {filtered.expiring.length}
              </TabsTrigger>
              <TabsTrigger value="slow">
                {isTh ? "ค้างสต็อก" : "Slow movers"} · {slowItems.length}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="border-t border-border" />

        {tab === "oos" && (
          <OosTable
            lang={lang}
            items={filtered.oos}
            acked={acked}
            role={role}
            onAck={ack}
          />
        )}
        {tab === "expiring" && (
          <ExpiringTable
            lang={lang}
            items={filtered.expiring}
            acked={acked}
            role={role}
            onAck={ack}
          />
        )}
        {tab === "slow" && (
          <SlowTable
            lang={lang}
            items={filtered.slow}
            acked={acked}
            role={role}
            onAck={ack}
          />
        )}
      </Card>

      <RecoveryFooter lang={lang} />
    </div>
  );
}

function OosTable({
  lang,
  items,
  acked,
  role,
  onAck,
}: {
  lang: Lang;
  items: OosItem[];
  acked: Set<string>;
  role: string;
  onAck: (sku: string) => void;
}) {
  const t = getT(lang);
  const isTh = lang === "th";

  return (
    <ResponsiveTable>
      <thead>
        <tr>
          <th>{t.alert.product}</th>
          <th>{isTh ? "ระดับ" : "Priority"}</th>
          <th>{isTh ? "คงเหลือ / จุดสั่ง" : "On hand / reorder"}</th>
          <th className="text-right">
            {isTh ? "ยอดที่เสียไป (7d)" : "Lost sales (7d)"}
          </th>
          <th>{isTh ? "เติมเข้าใน" : "Replenish ETA"}</th>
          <th className="text-right">{t.common.actions}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const isCritical = item.supplier === "Top-30";
          const isAcked = acked.has(item.sku);
          return (
            <tr
              key={inventoryRowKey(item.sku, item.loc, index)}
              className={cn(isAcked && "opacity-50")}
            >
              <td>
                <div className="flex items-center gap-2.5">
                  {isCritical && (
                    <span className="h-10 w-1 rounded-full bg-destructive" />
                  )}
                  <div>
                    <div className="text-[13px] font-medium">{item[lang]}</div>
                    <div className="mono mt-0.5 text-[11.5px] text-muted-foreground">
                      {item.sku} · {item.loc}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <PriorityPill
                  lang={lang}
                  level={isCritical ? "p1" : item.stock === 0 ? "p2" : "p3"}
                />
                {isCritical && (
                  <div className="mt-1 text-[10.5px] text-muted-foreground">
                    {isTh ? "อยู่ใน Top-30" : "Top-30 SKU"}
                  </div>
                )}
              </td>
              <td>
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "num min-w-8 font-semibold",
                      item.stock === 0 && "text-destructive",
                    )}
                  >
                    {item.stock}
                  </span>
                  <span className="text-xs text-muted-foreground">/</span>
                  <span className="num text-xs">{item.reorder}</span>
                </div>
              </td>
              <td className="num text-right font-semibold text-destructive">
                -{fmtMoney(item.lostSales)}
              </td>
              <td>
                <EtaBadge eta={item.eta} />
              </td>
              <td className="text-right">
                {!isAcked ? (
                  <div className="inline-flex gap-1.5">
                    <Button size="sm" variant="outline">
                      {isTh ? "สั่งทันที" : "Reorder"}
                    </Button>
                    {role === "manager" && (
                      <Button size="sm" onClick={() => onAck(item.sku)}>
                        <Plus />
                        {isTh ? "ใส่แผน" : "To plan"}
                      </Button>
                    )}
                  </div>
                ) : (
                  <Badge>
                    <Check className="size-3" />
                    {isTh ? "อยู่ในแผน" : "Added"}
                  </Badge>
                )}
              </td>
            </tr>
          );
        })}
        {items.length === 0 && <EmptyRow colSpan={6} lang={lang} />}
      </tbody>
    </ResponsiveTable>
  );
}

function ExpiringTable({
  lang,
  items,
  acked,
  role,
  onAck,
}: {
  lang: Lang;
  items: ExpiringActionItem[];
  acked: Set<string>;
  role: string;
  onAck: (sku: string) => void;
}) {
  const t = getT(lang);
  const isTh = lang === "th";

  return (
    <ResponsiveTable>
      <thead>
        <tr>
          <th>{t.alert.product}</th>
          <th>{isTh ? "ระดับ" : "Priority"}</th>
          <th>{t.alert.expiry}</th>
          <th>{t.alert.daysLeft}</th>
          <th className="text-right">
            {isTh ? "มูลค่าเสี่ยง" : "Value at risk"}
          </th>
          <th className="text-right">{t.common.actions}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const isAcked = acked.has(item.sku);
          const isUrgent = item.daysLeft <= 1;
          return (
            <tr
              key={inventoryRowKey(
                item.sku,
                item.loc,
                index,
                String(item.exp.getTime()),
              )}
              className={cn(isAcked && "opacity-50")}
            >
              <td>
                <div className="text-[13px] font-medium">{item[lang]}</div>
                <div className="mono mt-0.5 text-[11.5px] text-muted-foreground">
                  {item.sku} · {item.loc}
                </div>
              </td>
              <td>
                <PriorityPill
                  lang={lang}
                  level={isUrgent ? "p1" : item.daysLeft <= 3 ? "p2" : "p3"}
                />
              </td>
              <td className="num">{fmtD(item.exp, lang)}</td>
              <td>
                <span
                  className={cn(
                    "num font-semibold",
                    isUrgent && "text-destructive",
                    !isUrgent &&
                      item.daysLeft <= 3 &&
                      "text-[oklch(0.45_0.13_70)]",
                  )}
                >
                  {item.daysLeft === 0
                    ? isTh
                      ? "วันนี้"
                      : "today"
                    : `${item.daysLeft} ${t.alert.days}`}
                </span>
              </td>
              <td className="num text-right font-semibold">
                {fmtMoney(item.valueAtRisk)}
              </td>
              <td className="text-right">
                {!isAcked ? (
                  <div className="inline-flex gap-1.5">
                    {role === "manager" && (
                      <Button size="sm" variant="outline">
                        {t.alert.markdown}
                      </Button>
                    )}
                    <Button size="sm" onClick={() => onAck(item.sku)}>
                      {isTh ? "ใส่แผน" : "To plan"}
                    </Button>
                  </div>
                ) : (
                  <Badge>
                    <Check className="size-3" />
                    {isTh ? "อยู่ในแผน" : "Added"}
                  </Badge>
                )}
              </td>
            </tr>
          );
        })}
        {items.length === 0 && <EmptyRow colSpan={6} lang={lang} />}
      </tbody>
    </ResponsiveTable>
  );
}

function SlowTable({
  lang,
  items,
  acked,
  role,
  onAck,
}: {
  lang: Lang;
  items: SlowItem[];
  acked: Set<string>;
  role: string;
  onAck: (sku: string) => void;
}) {
  const t = getT(lang);
  const isTh = lang === "th";

  return (
    <ResponsiveTable>
      <thead>
        <tr>
          <th>{t.alert.product}</th>
          <th>{isTh ? "ค้างมา" : "Days on shelf"}</th>
          <th>{t.alert.stock}</th>
          <th className="text-right">{isTh ? "มูลค่าค้าง" : "Stuck value"}</th>
          <th className="text-right">{t.common.actions}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const isAcked = acked.has(item.sku);
          return (
            <tr
              key={inventoryRowKey(item.sku, "", index, String(item.days))}
              className={cn(isAcked && "opacity-50")}
            >
              <td>
                <div className="text-[13px] font-medium">{item[lang]}</div>
                <div className="mono mt-0.5 text-[11.5px] text-muted-foreground">
                  {item.sku}
                </div>
              </td>
              <td>
                <Badge
                  variant="outline"
                  className="gap-1 text-[oklch(0.45_0.13_70)]"
                >
                  <Clock className="size-3" />
                  {item.days} {t.alert.days}
                </Badge>
              </td>
              <td className="num">{item.stock}</td>
              <td className="num text-right font-semibold">
                {fmtMoney(item.value)}
              </td>
              <td className="text-right">
                {!isAcked ? (
                  <div className="inline-flex gap-1.5">
                    {role === "manager" && (
                      <Button size="sm" variant="outline">
                        {t.alert.returnSupplier}
                      </Button>
                    )}
                    <Button size="sm" onClick={() => onAck(item.sku)}>
                      {isTh ? "ใส่แผน" : "To plan"}
                    </Button>
                  </div>
                ) : (
                  <Badge>
                    <Check className="size-3" />
                    {isTh ? "อยู่ในแผน" : "Added"}
                  </Badge>
                )}
              </td>
            </tr>
          );
        })}
        {items.length === 0 && <EmptyRow colSpan={5} lang={lang} />}
      </tbody>
    </ResponsiveTable>
  );
}

function ResponsiveTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-195 text-left text-[12.5px]">
        {children}
      </table>
    </div>
  );
}

function EmptyRow({ colSpan, lang }: { colSpan: number; lang: Lang }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <Empty
          title={getT(lang).common.noData}
          sub={
            lang === "th"
              ? "ไม่พบสินค้าตามคำค้นหา"
              : "No items match your search"
          }
        />
      </td>
    </tr>
  );
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
          06
        </span>
        <div className="leading-none">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            FACT
          </div>
          <div className="mt-1 text-[12px] font-semibold">
            Loss & OOS · Stock Availability
          </div>
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

function SectionHeader({
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
    <div className="mt-5 mb-3 flex flex-wrap items-end justify-between gap-4 px-0.5">
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

function GaugeRing({
  value,
  target,
  label,
  size = 140,
}: {
  value: number;
  target: number;
  label: string;
  size?: number;
}) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const targetPct = Math.max(0, Math.min(100, target));
  const dash = circumference * (pct / 100);
  const targetAngle = (targetPct / 100) * 360 - 90;
  const targetX = size / 2 + Math.cos((targetAngle * Math.PI) / 180) * radius;
  const targetY = size / 2 + Math.sin((targetAngle * Math.PI) / 180) * radius;

  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--destructive)"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          strokeWidth={stroke}
        />
        <circle cx={targetX} cy={targetY} r="3.5" fill="var(--foreground)" />
      </svg>
      <div className="absolute text-center">
        <div className="num text-[30px] font-bold leading-none tracking-tight">
          {value.toFixed(1)}%
        </div>
        <div className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </div>
        <div className="num mt-1 text-[10px] text-muted-foreground">
          target {target}%
        </div>
      </div>
    </div>
  );
}

function PriorityPill({ lang, level }: { lang: Lang; level: Priority }) {
  const label = {
    p1: lang === "th" ? "P1 เร่งด่วน" : "P1 urgent",
    p2: lang === "th" ? "P2 วันนี้" : "P2 today",
    p3: lang === "th" ? "P3 ติดตาม" : "P3 watch",
  }[level];
  const className = {
    p1: "border-destructive/25 bg-destructive/10 text-destructive",
    p2: "border-[oklch(0.72_0.16_75/0.28)] bg-warn-50 text-[oklch(0.45_0.13_70)]",
    p3: "border-primary/25 bg-primary-50 text-primary",
  }[level];

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold",
        className,
      )}
    >
      {label}
    </span>
  );
}

function EtaBadge({ eta }: { eta: string }) {
  const variant = eta === "1d" ? "default" : "outline";
  return (
    <Badge variant={variant} className="gap-1">
      <Clock className="size-3" />
      {eta}
    </Badge>
  );
}

function RecoveryFooter({ lang }: { lang: Lang }) {
  const isTh = lang === "th";
  const items = [
    {
      icon: Package,
      label: isTh ? "เติม Top-30 OOS" : "Replenish Top-30",
      action: isTh
        ? "สั่งเร่งด่วน 5 SKU หลัก · ส่งใน 1-3 วัน"
        : "Express order 5 core SKUs · 1-3 day delivery",
      upside: 62000,
      window: isTh ? "ภายใน 7 วัน" : "within 7 days",
    },
    {
      icon: TrendingUp,
      label: isTh ? "Markdown ใกล้หมดอายุ" : "Markdown near-expiry",
      action: isTh
        ? "ลด 25-30% สำหรับ 7 SKU ที่หมดอายุภายใน 3 วัน"
        : "25-30% off on 7 SKUs expiring within 3 days",
      upside: 18400,
      window: isTh ? "ภายใน 3 วัน" : "within 3 days",
    },
    {
      icon: RotateCcw,
      label: isTh ? "คืนสินค้าค้างสต็อก" : "Return slow movers",
      action: isTh
        ? "เจรจากับซัพพลายเออร์สำหรับ SKU ค้างเกิน 60 วัน"
        : "Negotiate supplier returns for SKUs stuck over 60 days",
      upside: 8560,
      window: isTh ? "ภายใน 14 วัน" : "within 14 days",
    },
  ];

  return (
    <Card className="mt-3.5 rounded-[10px] border-primary/25 bg-primary-50/55 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[13.5px]">
          <Flame className="size-4 text-primary" />
          {isTh ? "Action เพื่อปิดช่องว่าง" : "Actions to close the gap"}
        </CardTitle>
        <CardDescription className="text-xs">
          {isTh
            ? "รายการที่ควรถูกส่งเข้าแผนกู้ยอดของสาขา"
            : "Recommended items for the branch recovery plan"}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
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
        ))}
      </CardContent>
    </Card>
  );
}
