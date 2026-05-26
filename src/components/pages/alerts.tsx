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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FilterChipGroup,
  FilterDialog,
  FilterToggle,
} from "@/components/filter-dialog";
import { Empty, PageHeader } from "@/components/page-helpers";
import { fmtD, fmtMoney, daysBetween } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/app-shell";
import { useBranchData } from "@/providers/branch-data-provider";
import { useHashScroll } from "@/hooks/use-hash-scroll";
import type { ExpiringItem, Lang, LocalizedString } from "@/types";

type Tab = "oos" | "expiring" | "slow";
type Priority = "p1" | "p2" | "p3";

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

const OOS_ITEMS: OosItem[] = [
  {
    sku: "PC-0331",
    th: "หน้ากากอนามัย 4 ชั้น (50 ชิ้น)",
    en: "Surgical mask 4-ply x 50",
    cat: { th: "ของใช้ส่วนตัว", en: "Personal" },
    stock: 0,
    reorder: 30,
    loc: "G-02-A",
    lostSales: 18400,
    eta: "2d",
    supplier: "Top-30",
  },
  {
    sku: "HH-2201",
    th: "กระดาษทิชชู่ Cellox 12 ม้วน",
    en: "Cellox tissue x 12",
    cat: { th: "ของใช้บ้าน", en: "Household" },
    stock: 0,
    reorder: 15,
    loc: "H-06-C",
    lostSales: 14200,
    eta: "1d",
    supplier: "Top-30",
  },
  {
    sku: "HH-1820",
    th: "ผงซักฟอก เปา 800 ก.",
    en: "Pao detergent 800g",
    cat: { th: "ของใช้บ้าน", en: "Household" },
    stock: 0,
    reorder: 24,
    loc: "H-04-B",
    lostSales: 12800,
    eta: "3d",
    supplier: "Top-30",
  },
  {
    sku: "FB-0099",
    th: "น้ำดื่ม คริสตัล 600 มล. (6 ขวด)",
    en: "Crystal water 600ml x 6",
    cat: { th: "เครื่องดื่ม", en: "Beverage" },
    stock: 2,
    reorder: 36,
    loc: "B-01-A",
    lostSales: 9800,
    eta: "1d",
    supplier: "Top-30",
  },
  {
    sku: "PC-0470",
    th: "ผ้าอนามัยลอริเอะ ขนาดกลาง",
    en: "Laurier sanitary pads M",
    cat: { th: "ของใช้ส่วนตัว", en: "Personal" },
    stock: 0,
    reorder: 18,
    loc: "G-05-B",
    lostSales: 7400,
    eta: "2d",
    supplier: "Top-30",
  },
  {
    sku: "FB-2284",
    th: "เลย์ คลาสสิค 75 ก.",
    en: "Lays Classic 75g",
    cat: { th: "ขนม", en: "Snacks" },
    stock: 4,
    reorder: 40,
    loc: "S-02-A",
    lostSales: 6800,
    eta: "1d",
  },
  {
    sku: "FB-1880",
    th: "ผลิตภัณฑ์ทำความสะอาดพื้น",
    en: "Floor cleaner concentrate",
    cat: { th: "ของใช้บ้าน", en: "Household" },
    stock: 0,
    reorder: 20,
    loc: "H-08-A",
    lostSales: 5600,
    eta: "3d",
  },
];

const SLOW_ITEMS: SlowItem[] = [
  {
    sku: "FB-9920",
    th: "ซอสมะเขือเทศ พิเศษ 2 กก.",
    en: "Tomato sauce 2kg pack",
    cat: { th: "อาหาร", en: "Food" },
    days: 84,
    stock: 14,
    value: 1680,
  },
  {
    sku: "HH-5512",
    th: "ไม้ถูพื้นไมโครไฟเบอร์",
    en: "Microfibre floor mop",
    cat: { th: "ของใช้บ้าน", en: "Household" },
    days: 76,
    stock: 8,
    value: 1840,
  },
  {
    sku: "PC-7220",
    th: "ครีมอาบน้ำกลิ่นพิเศษ 500 มล.",
    en: "Premium body wash 500ml",
    cat: { th: "ของใช้ส่วนตัว", en: "Personal" },
    days: 68,
    stock: 22,
    value: 3960,
  },
  {
    sku: "FB-4108",
    th: "นัตเล่ ครันชี่บาร์",
    en: "Nestle Crunchy Bar",
    cat: { th: "ขนม", en: "Snacks" },
    days: 62,
    stock: 36,
    value: 1080,
  },
];

type AlertFilters = {
  top30Only: boolean;
  hideAcked: boolean;
  categories: string[];
};

const DEFAULT_ALERT_FILTERS: AlertFilters = {
  top30Only: false,
  hideAcked: false,
  categories: [],
};

const SHRINK_BY_CATEGORY = [
  { th: "อาหารแช่แข็ง", en: "Frozen", v: 12400, color: "var(--destructive)" },
  { th: "ผัก-ผลไม้", en: "Produce", v: 9800, color: "oklch(0.62 0.16 35)" },
  { th: "ของใช้บ้าน", en: "Household", v: 7200, color: "var(--warn)" },
  { th: "เครื่องดื่ม", en: "Beverages", v: 5600, color: "var(--info)" },
  { th: "อื่น ๆ", en: "Other", v: 3400, color: "var(--muted-foreground)" },
];

export function AlertsPage() {
  const { lang, role } = useAppShell();
  const { data: branch } = useBranchData();
  const t = getT(lang);
  const isTh = lang === "th";
  const [tab, setTab] = React.useState<Tab>("oos");
  const [q, setQ] = React.useState("");
  const [acked, setAcked] = React.useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<AlertFilters>(DEFAULT_ALERT_FILTERS);
  const [draftFilters, setDraftFilters] =
    React.useState<AlertFilters>(DEFAULT_ALERT_FILTERS);

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
    const backendLow = branch.lowStock.map((item, idx): OosItem => ({
      ...item,
      lostSales: Math.max(3600, Math.round((item.reorder - item.stock) * 620)),
      eta: idx % 3 === 0 ? "1d" : idx % 3 === 1 ? "2d" : "3d",
      supplier: idx < 3 ? "Top-30" : undefined,
    }));
    return backendLow.length > 0 ? backendLow : OOS_ITEMS;
  }, [branch.lowStock]);

  const categoryOptions = React.useMemo(() => {
    const map = new Map<string, LocalizedString>();
    for (const item of [...oosItems, ...expiring, ...SLOW_ITEMS]) {
      map.set(item.cat.en, item.cat);
    }
    return [...map.entries()]
      .map(([value, cat]) => ({ value, label: cat[lang] }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [expiring, lang, oosItems]);

  const matchesFilters = React.useCallback(
    (item: { sku: string; th: string; en: string; cat: LocalizedString; supplier?: string }) => {
      if (filters.hideAcked && acked.has(item.sku)) return false;
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(item.cat.en)
      ) {
        return false;
      }
      if (filters.top30Only && tab === "oos" && item.supplier !== "Top-30") {
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
    oos: oosItems.filter(matchesFilters),
    expiring: expiring.filter(matchesFilters),
    slow: SLOW_ITEMS.filter(matchesFilters),
  };

  const hasActiveFilters =
    filters.top30Only ||
    filters.hideAcked ||
    filters.categories.length > 0;

  const osa = 91.6;
  const osaTarget = 95;
  const shrinkMtd = 38400;
  const shrinkLast = 34200;
  const lostSales = oosItems.reduce((sum, item) => sum + item.lostSales, 0);
  const storeName = branch.store.short[lang] || (isTh ? "สาขาพระราม 9" : "Rama 9 branch");

  useHashScroll();

  const ack = (sku: string) => {
    setAcked((current) => new Set([...current, sku]));
    toast.success(isTh ? `เพิ่ม ${sku} เข้าแผนกู้ยอด` : `Added ${sku} to recovery plan`);
  };

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
            <Button size="sm" variant="outline">
              <Download />
              {t.common.export}
            </Button>
            {role === "manager" && (
              <Button size="sm">
                <RefreshCw />
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
            ? "OOS 14 SKU หลัก + OSA ต่ำกว่าเป้า 95% -> กระทบยอดตรง"
            : "14 core OOS SKUs + OSA below 95% target -> directly drags revenue"
        }
        metric={`${osa.toFixed(1)}%`}
        metricLabel="OSA"
      />

      <section id="stock-availability" className="scroll-mt-20">
        <SectionHeader
          idx="01"
          title={isTh ? "สถานะหลัก" : "Health snapshot"}
          sub={isTh ? "ดู scale ของปัญหาก่อนเริ่ม action" : "Frame the scale before acting"}
        />
      </section>

      <div className="mb-3.5 grid gap-3.5 xl:grid-cols-[1.1fr_1fr_1fr]">
        <Card className="rounded-[10px] shadow-none">
          <CardContent className="flex flex-col gap-4 p-4.5 sm:flex-row sm:items-center">
            <GaugeRing value={osa} target={osaTarget} label="OSA" size={140} />
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {isTh ? "ความพร้อมสินค้าบนชั้น" : "On-shelf availability"}
              </div>
              <div className="mt-2 text-[13px] leading-6">
                {isTh ? (
                  <>
                    ต่ำกว่าเป้า <b>3.4%</b> หลัก ๆ คือ Top-30 ใน 3 หมวด ของใช้บ้าน
                    เครื่องดื่ม และของใช้ส่วนตัว
                  </>
                ) : (
                  <>
                    Below target by <b>3.4%</b>, concentrated in Top-30 across Household,
                    Beverages and Personal Care.
                  </>
                )}
              </div>
              <div className="mt-2 text-[11.5px] text-muted-foreground">
                {isTh ? "อัปเดตล่าสุด" : "Last sync"} · 13:48
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
                  14
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2.5 text-[12px] leading-5 text-destructive">
              <AlertTriangle className="mr-1 inline size-3.5 align-[-2px]" />
              {isTh ? (
                <>
                  มูลค่ายอดที่หายไป <b className="num">{fmtMoney(lostSales)}</b> ใน 7 วัน
                </>
              ) : (
                <>
                  Estimated lost sales <b className="num">{fmtMoney(lostSales)}</b> over 7 days
                </>
              )}
            </div>
            <div className="mt-2 text-[11.5px] text-muted-foreground">
              {isTh ? "เพิ่มขึ้น" : "Up"}{" "}
              <span className="num font-semibold text-destructive">+55%</span>{" "}
              {isTh ? "เทียบกับ 7 วันก่อน" : "vs prev 7d"}
            </div>
          </CardContent>
        </Card>

        <Card id="inventory-aging-shrinkage" className="scroll-mt-20 rounded-[10px] shadow-none">
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
              {SHRINK_BY_CATEGORY.map((category) => (
                <div key={category.en} className="flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-[2px]"
                    style={{ background: category.color }}
                  />
                  <span className="flex-1 text-[11.5px] text-muted-foreground">
                    {category[lang]}
                  </span>
                  <span className="num text-[11.5px] font-semibold">{fmtMoney(category.v)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-[11.5px] text-muted-foreground">
              {isTh ? "เพิ่มขึ้น" : "Up"}{" "}
              <span className="num font-semibold text-[oklch(0.45_0.13_70)]">
                +{(((shrinkMtd - shrinkLast) / shrinkLast) * 100).toFixed(1)}%
              </span>{" "}
              {isTh ? "เทียบเดือนก่อน" : "vs last month"}
            </div>
          </CardContent>
        </Card>
      </div>

      <SectionHeader
        idx="02"
        title={isTh ? "รายการที่ต้องดำเนินการ" : "Items needing action"}
        sub={isTh ? "เลือก SKU เพื่อกำหนดแผนกู้ยอด" : "Select SKUs to add to recovery actions"}
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
                {isTh ? "หมด/ต่ำเร่งด่วน" : "OOS critical"} · {filtered.oos.length}
              </TabsTrigger>
              <TabsTrigger value="expiring">
                {isTh ? "ใกล้หมดอายุ" : "Near expiry"} · {filtered.expiring.length}
              </TabsTrigger>
              <TabsTrigger value="slow">
                {isTh ? "ค้างสต็อก" : "Slow movers"} · {filtered.slow.length}
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
          <th className="text-right">{isTh ? "ยอดที่เสียไป (7d)" : "Lost sales (7d)"}</th>
          <th>{isTh ? "เติมเข้าใน" : "Replenish ETA"}</th>
          <th className="text-right">{t.common.actions}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const isCritical = item.supplier === "Top-30";
          const isAcked = acked.has(item.sku);
          return (
            <tr key={item.sku} className={cn(isAcked && "opacity-50")}>
              <td>
                <div className="flex items-center gap-2.5">
                  {isCritical && <span className="h-10 w-1 rounded-full bg-destructive" />}
                  <div>
                    <div className="text-[13px] font-medium">{item[lang]}</div>
                    <div className="mono mt-0.5 text-[11.5px] text-muted-foreground">
                      {item.sku} · {item.loc}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <PriorityPill lang={lang} level={isCritical ? "p1" : item.stock === 0 ? "p2" : "p3"} />
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
          <th className="text-right">{isTh ? "มูลค่าเสี่ยง" : "Value at risk"}</th>
          <th className="text-right">{t.common.actions}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const isAcked = acked.has(item.sku);
          const isUrgent = item.daysLeft <= 1;
          return (
            <tr key={item.sku} className={cn(isAcked && "opacity-50")}>
              <td>
                <div className="text-[13px] font-medium">{item[lang]}</div>
                <div className="mono mt-0.5 text-[11.5px] text-muted-foreground">
                  {item.sku} · {item.loc}
                </div>
              </td>
              <td>
                <PriorityPill lang={lang} level={isUrgent ? "p1" : item.daysLeft <= 3 ? "p2" : "p3"} />
              </td>
              <td className="num">{fmtD(item.exp, lang)}</td>
              <td>
                <span
                  className={cn(
                    "num font-semibold",
                    isUrgent && "text-destructive",
                    !isUrgent && item.daysLeft <= 3 && "text-[oklch(0.45_0.13_70)]",
                  )}
                >
                  {item.daysLeft === 0 ? (isTh ? "วันนี้" : "today") : `${item.daysLeft} ${t.alert.days}`}
                </span>
              </td>
              <td className="num text-right font-semibold">{fmtMoney(item.valueAtRisk)}</td>
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
        {items.map((item) => {
          const isAcked = acked.has(item.sku);
          return (
            <tr key={item.sku} className={cn(isAcked && "opacity-50")}>
              <td>
                <div className="text-[13px] font-medium">{item[lang]}</div>
                <div className="mono mt-0.5 text-[11.5px] text-muted-foreground">{item.sku}</div>
              </td>
              <td>
                <Badge variant="outline" className="gap-1 text-[oklch(0.45_0.13_70)]">
                  <Clock className="size-3" />
                  {item.days} {t.alert.days}
                </Badge>
              </td>
              <td className="num">{item.stock}</td>
              <td className="num text-right font-semibold">{fmtMoney(item.value)}</td>
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
          sub={lang === "th" ? "ไม่พบสินค้าตามคำค้นหา" : "No items match your search"}
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
          <div className="mt-1 text-[12px] font-semibold">Loss & OOS · Stock Availability</div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-[11.5px] font-bold uppercase tracking-[0.06em] text-destructive">
          {lang === "th" ? "บริบทวิกฤต · TOP FLOP" : "Crisis context · TOP FLOP"}
        </div>
        <div className="mt-1 text-[13.5px] leading-5 text-foreground">{headline}</div>
      </div>
      <div className="text-left md:text-right">
        <div className="num text-[22px] font-bold leading-none text-destructive">{metric}</div>
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
          <div className="text-[14.5px] font-semibold tracking-normal">{title}</div>
          {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
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
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
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
        <div className="num text-[30px] font-bold leading-none tracking-tight">{value.toFixed(1)}%</div>
        <div className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </div>
        <div className="num mt-1 text-[10px] text-muted-foreground">target {target}%</div>
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
    <span className={cn("inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold", className)}>
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
          <div key={item.label} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary-50 text-primary">
                <item.icon className="size-4" />
              </div>
              <div className="text-[13px] font-semibold">{item.label}</div>
            </div>
            <div className="mt-3 text-[12.5px] leading-5">{item.action}</div>
            <div className="mt-3 flex items-center justify-between gap-3 text-[11.5px] text-muted-foreground">
              <span>{item.window}</span>
              <span className="num font-semibold text-primary">+{fmtMoney(item.upside, { compact: true })}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
