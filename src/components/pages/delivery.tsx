"use client";

import * as React from "react";
import {
  ArrowDown,
  Banknote,
  Check,
  Clock,
  Filter,
  Flame,
  Package,
  Pin,
  RotateCcw,
  Sparkles,
  Store,
  Truck,
  User,
  X,
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
import { Separator } from "@/components/ui/separator";
import {
  FilterChipGroup,
  FilterDialog,
  FilterToggle,
} from "@/components/filter-dialog";
import { PageHeader } from "@/components/page-helpers";
import { Sparkline } from "@/components/charts/sparkline";
import { useAppShell } from "@/components/layout/app-shell";
import { useBranchData } from "@/providers/branch-data-provider";
import { fmtMoney } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useHashScroll } from "@/hooks/use-hash-scroll";
import type { Delivery, DeliveryStatus, Lang, Role } from "@/types";

type Tab = "active" | "completed";
type Tone = "warn" | "danger" | "info" | "primary";

type DeliveryFilters = {
  lateOnly: boolean;
  status: DeliveryStatus | "all";
};

const DEFAULT_DELIVERY_FILTERS: DeliveryFilters = {
  lateOnly: false,
  status: "all",
};

const OTIF = 87.3;
const OTIF_TARGET = 95;
const OTIF_LAST = 92.1;
const OTIF_TREND = [94, 93, 92, 91, 90, 89, 87.3];
const OSX_TODAY = 18400;
const OSX_TARGET = 24000;

const ROOT_CAUSE = [
  {
    th: "OOS — สินค้าสั่งหมด ต้องตัดออก",
    en: "OOS — items removed from order",
    value: 0.52,
    color: "var(--destructive)",
  },
  {
    th: "ส่งล่าช้า (จราจร, ระยะทาง)",
    en: "Late (traffic, distance)",
    value: 0.28,
    color: "oklch(0.55 0.15 70)",
  },
  {
    th: "ส่งบางส่วน (Substitution)",
    en: "Partial (substitution)",
    value: 0.12,
    color: "var(--info)",
  },
  {
    th: "จัดผิด/คุณภาพ",
    en: "Pick error / quality",
    value: 0.08,
    color: "var(--muted-foreground)",
  },
] satisfies Array<{ th: string; en: string; value: number; color: string }>;

const DRIVERS = [
  { th: "วินัย", en: "Winai", today: 7, onTime: 0.86, distance: 12.4 },
  { th: "สมชาย", en: "Somchai", today: 6, onTime: 0.74, distance: 11.8 },
  { th: "บุญส่ง", en: "Boonsong", today: 5, onTime: 0.92, distance: 9.6 },
] satisfies Array<{
  th: string;
  en: string;
  today: number;
  onTime: number;
  distance: number;
}>;

const FALLBACK_STORE = {
  short: { th: "ทองหล่อ ซ.13", en: "Thonglor 13" },
};

const FALLBACK_DELIVERIES = [
  {
    id: "BC-26052201",
    customer: { th: "คุณณัฐกานต์ ม.", en: "K. Natthakarn M." },
    addr: { th: "ทองหล่อ ซ.10", en: "Thonglor Soi 10" },
    items: 8,
    value: 487,
    driver: { th: "วินัย", en: "Winai" },
    status: "enRoute",
    eta: "14:25",
    late: false,
    distance: 1.2,
  },
  {
    id: "BC-26052202",
    customer: { th: "คุณปานทิพย์ ส.", en: "K. Panthip S." },
    addr: { th: "เอกมัย ซ.12", en: "Ekkamai Soi 12" },
    items: 22,
    value: 1284,
    driver: { th: "สมชาย", en: "Somchai" },
    status: "enRoute",
    eta: "14:35",
    late: true,
    distance: 2.4,
  },
  {
    id: "BC-26052203",
    customer: { th: "คุณภาสกร ว.", en: "K. Phasakorn W." },
    addr: { th: "ทองหล่อ ซ.5", en: "Thonglor Soi 5" },
    items: 14,
    value: 892,
    driver: { th: "บุญส่ง", en: "Boonsong" },
    status: "preparing",
    eta: "15:00",
    late: false,
    distance: 0.8,
  },
  {
    id: "BC-26052204",
    customer: { th: "คุณกัลยา ก.", en: "K. Kanlaya K." },
    addr: { th: "พร้อมพงษ์", en: "Phrom Phong" },
    items: 31,
    value: 1872,
    driver: { th: "วินัย", en: "Winai" },
    status: "preparing",
    eta: "15:15",
    late: false,
    distance: 1.8,
  },
  {
    id: "BC-26052205",
    customer: { th: "คุณธีรพล ต.", en: "K. Teeraphol T." },
    addr: { th: "ทองหล่อ ซ.8", en: "Thonglor Soi 8" },
    items: 6,
    value: 320,
    driver: { th: "สมชาย", en: "Somchai" },
    status: "delivered",
    eta: "13:50",
    late: false,
    distance: 1,
  },
  {
    id: "BC-26052206",
    customer: { th: "คุณวรินทร ก.", en: "K. Warintorn K." },
    addr: { th: "เอกมัย ซ.4", en: "Ekkamai Soi 4" },
    items: 12,
    value: 654,
    driver: { th: "บุญส่ง", en: "Boonsong" },
    status: "delivered",
    eta: "13:20",
    late: false,
    distance: 2,
  },
  {
    id: "BC-26052207",
    customer: { th: "คุณพิชชา ม.", en: "K. Phichcha M." },
    addr: { th: "ทองหล่อ ซ.23", en: "Thonglor Soi 23" },
    items: 4,
    value: 198,
    driver: { th: "วินัย", en: "Winai" },
    status: "delivered",
    eta: "12:45",
    late: false,
    distance: 1.5,
  },
] satisfies Delivery[];

export function DeliveryPage() {
  const { lang, role } = useAppShell();
  const { data: branch, refetch } = useBranchData();
  const t = getT(lang);
  const isTh = lang === "th";
  const [tab, setTab] = React.useState<Tab>("active");
  const [selected, setSelected] = React.useState<string | null>(null);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<DeliveryFilters>(
    DEFAULT_DELIVERY_FILTERS,
  );
  const [draftFilters, setDraftFilters] = React.useState<DeliveryFilters>(
    DEFAULT_DELIVERY_FILTERS,
  );

  const deliveries =
    branch.deliveries.length > 0 ? branch.deliveries : FALLBACK_DELIVERIES;
  const storeInfo = branch.store.short[lang] ? branch.store : FALLBACK_STORE;
  const active = deliveries.filter(
    (delivery) =>
      delivery.status === "enRoute" || delivery.status === "preparing",
  );
  const completed = deliveries.filter(
    (delivery) => delivery.status === "delivered",
  );
  const list = React.useMemo(() => {
    const base = tab === "active" ? active : completed;
    return base.filter((delivery) => {
      if (filters.lateOnly && !delivery.late) return false;
      if (filters.status !== "all" && delivery.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [active, completed, filters, tab]);

  const hasActiveFilters =
    filters.lateOnly || filters.status !== "all";

  const statusOptions = React.useMemo(
    () => [
      { value: "preparing", label: t.deliv.preparing },
      { value: "enRoute", label: t.deliv.enRoute },
      { value: "delivered", label: t.deliv.delivered },
    ],
    [t],
  );
  const selectedDelivery = selected
    ? deliveries.find((delivery) => delivery.id === selected)
    : null;

  useHashScroll();

  return (
    <div className="fade-in" data-screen-label="Delivery">
      <PageHeader
        title={isTh ? "OSX Sales & %OTIF" : "OSX sales & %OTIF"}
        sub={
          isTh
            ? `การจัดส่ง & การปฏิบัติงาน · ${storeInfo.short[lang]}`
            : `Operation & fulfillment · ${storeInfo.short[lang]}`
        }
        right={
          <>
            <Button size="sm" variant="outline" onClick={refetch}>
              <RotateCcw />
              {t.common.refresh}
            </Button>
          </>
        }
      />

      <section id="osx-sales-otif" className="scroll-mt-20">
        <CrisisContextStrip
          lang={lang}
          factsTileNo="04"
          factsTileName="OSX Sales & %OTIF"
          headline={
            isTh
              ? `OTIF ลดจาก ${OTIF_LAST}% เหลือ ${OTIF}% — เหตุหลักคือ OOS ตัดออร์เดอร์`
              : `OTIF dropped from ${OTIF_LAST}% to ${OTIF}% — primarily from OOS cuts`
          }
          metric={`${OTIF.toFixed(1)}%`}
          metricLabel="OTIF"
          tone="warn"
        />
      </section>

      <SectionHeader
        idx="01"
        title={isTh ? "สถานะ OTIF & สาเหตุหลัก" : "OTIF & root cause"}
        sub={isTh ? "ทำไมเรากำลังพลาดเป้า" : "Why we're missing target"}
      />

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-[1fr_1.4fr]">
        <Card className="rounded-[10px] shadow-none">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <GaugeRing
              value={OTIF}
              target={OTIF_TARGET}
              label="OTIF · 7d"
              size={150}
              tone="warn"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {isTh ? "แนวโน้ม 7 วัน" : "7-day trend"}
              </div>
              <div className="mt-2">
                <Sparkline data={OTIF_TREND} width={150} height={36} trend={-1} />
              </div>
              <div className="mt-1.5 text-xs text-muted-foreground">
                <Badge variant="destructive" className="gap-1">
                  <ArrowDown className="size-3" />
                  {(OTIF - OTIF_LAST).toFixed(1)} pts
                </Badge>{" "}
                {isTh ? "จากสัปดาห์ก่อน" : "vs last week"}
              </div>
              <div className="mt-2.5 text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {isTh ? "OSX วันนี้" : "OSX today"}
                  </span>
                  <span className="num font-semibold">
                    {role === "staff" ? "—" : fmtMoney(OSX_TODAY)}
                    <span className="font-medium text-muted-foreground">
                      {" "}
                      / {role === "staff" ? "—" : fmtMoney(OSX_TARGET)}
                    </span>
                  </span>
                </div>
                <Meter value={(OSX_TODAY / OSX_TARGET) * 100} tone="warn" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[10px] shadow-none">
          <CardHeader>
            <CardTitle className="text-[13.5px]">
              {isTh ? "เหตุที่ OTIF พลาดเป้า" : "Why OTIF is missing"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isTh
                ? "แยกตามสาเหตุของออร์เดอร์ที่พลาด"
                : "Breakdown of failed orders by cause"}
            </CardDescription>
            <CardAction>
              <Badge variant="secondary" className="gap-1 text-info">
                <Sparkles className="size-3" />
                AI
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="px-4">
            <div className="flex flex-col gap-2.5">
              {ROOT_CAUSE.map((cause) => (
                <div key={cause.en}>
                  <div className="mb-1 flex justify-between gap-3 text-[12.5px]">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="size-2.5 rounded-[2px]"
                        style={{ background: cause.color }}
                      />
                      <span className="font-medium">{cause[lang]}</span>
                    </span>
                    <span className="num font-semibold">
                      {(cause.value * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Meter value={cause.value * 100} color={cause.color} />
                </div>
              ))}
            </div>
            <InsightNote
              tone="warn"
              title={isTh ? "ส่วนที่กระทบหลัก" : "Primary driver"}
              className="mt-3.5"
            >
              {isTh ? (
                <>
                  <b>52% ของ OTIF ที่พลาด</b> เกิดจาก OOS — ต้องกลับไปแก้ที่
                  Stock Availability (หน้า Alerts) เป็นอันดับแรก
                </>
              ) : (
                <>
                  <b>52% of misses</b> are OOS-driven — fix Stock Availability
                  first (Alerts page).
                </>
              )}
            </InsightNote>
          </CardContent>
        </Card>
      </div>

      <SectionHeader
        idx="02"
        title={isTh ? "ทีมจัดส่ง วันนี้" : "Today's drivers"}
        sub={isTh ? "ใครจัดส่งตรงเวลาแค่ไหน" : "Who's hitting on-time"}
      />

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {DRIVERS.map((driver) => (
          <Card key={driver.en} className="rounded-[10px] shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar initials={driver[lang].slice(0, 2).toUpperCase()} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{driver[lang]}</div>
                  <div className="text-[11.5px] text-muted-foreground">
                    {driver.today} {isTh ? "ออเดอร์" : "orders"} ·{" "}
                    {driver.distance.toFixed(1)} km
                  </div>
                </div>
                <div
                  className="num text-xl font-bold tracking-tight"
                  style={{ color: driverOnTimeColor(driver.onTime) }}
                >
                  {(driver.onTime * 100).toFixed(0)}%
                </div>
              </div>
              <div className="mt-2.5">
                <Meter
                  value={driver.onTime * 100}
                  tone={
                    driver.onTime >= 0.9
                      ? "primary"
                      : driver.onTime >= 0.8
                        ? "warn"
                        : "danger"
                  }
                />
                <div className="mt-1 text-[11.5px] text-muted-foreground">
                  {isTh ? "อัตราตรงเวลา" : "On-time rate"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SectionHeader
        idx="03"
        title={isTh ? "การจัดส่งกำลังดำเนินอยู่" : "Active deliveries"}
        sub={
          isTh
            ? `จากสาขา ${storeInfo.short[lang]} รัศมี 3 กม.`
            : `From ${storeInfo.short[lang]} · 3 km radius`
        }
      />

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 xl:grid-cols-[2fr_1fr]">
        <Card className="rounded-[10px] shadow-none">
          <CardContent className="p-4">
            <DeliveryMap
              storeLabel={storeInfo.short[lang]}
              deliveries={deliveries}
              selected={selected}
              onSelect={setSelected}
              lang={lang}
            />
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden rounded-[10px] py-0 shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-2 p-4">
            <div className="inline-flex h-8 w-fit items-center justify-center gap-0.5 rounded-lg bg-muted p-0.75 text-muted-foreground">
              <button
                type="button"
                onClick={() => setTab("active")}
                className={cn(
                  "inline-flex h-6.25 items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors",
                  tab === "active"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/60 hover:text-foreground",
                )}
              >
                {t.deliv.active} ·{" "}
                {tab === "active" ? list.length : active.length}
              </button>
              <button
                type="button"
                onClick={() => setTab("completed")}
                className={cn(
                  "inline-flex h-6.25 items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors",
                  tab === "completed"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/60 hover:text-foreground",
                )}
              >
                {t.deliv.completed} ·{" "}
                {tab === "completed" ? list.length : completed.length}
              </button>
            </div>
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
          </div>
          <FilterDialog
            open={filterOpen}
            onOpenChange={setFilterOpen}
            lang={lang}
            title={t.common.filter}
            onApply={() => setFilters(draftFilters)}
            onReset={() => {
              setDraftFilters(DEFAULT_DELIVERY_FILTERS);
              setFilters(DEFAULT_DELIVERY_FILTERS);
            }}
          >
            <FilterChipGroup
              mode="single"
              label={t.deliv.status}
              options={statusOptions}
              selected={
                draftFilters.status === "all" ? [] : [draftFilters.status]
              }
              onChange={(selected) =>
                setDraftFilters((current) => ({
                  ...current,
                  status:
                    selected.length === 0
                      ? "all"
                      : (selected[0] as DeliveryStatus),
                }))
              }
            />
            <FilterToggle
              id="delivery-late"
              label={t.deliv.late}
              description={
                isTh
                  ? "แสดงเฉพาะออเดอร์ที่ล่าช้า"
                  : "Show only late deliveries"
              }
              checked={draftFilters.lateOnly}
              onCheckedChange={(lateOnly) =>
                setDraftFilters((current) => ({ ...current, lateOnly }))
              }
            />
          </FilterDialog>
          <Separator />
          <div className="max-h-105 overflow-y-auto text-[13px]">
            {list.map((delivery) => (
              <DeliveryRow
                key={delivery.id}
                delivery={delivery}
                lang={lang}
                selected={selected === delivery.id}
                onSelect={() => setSelected(delivery.id)}
              />
            ))}
          </div>
        </Card>
      </div>

      {selectedDelivery && (
        <DeliveryDetail
          delivery={selectedDelivery}
          lang={lang}
          role={role}
          onClose={() => setSelected(null)}
        />
      )}

      <RecoveryFooter lang={lang} role={role} />

      <div className="h-6" />
    </div>
  );
}

function DeliveryRow({
  delivery,
  lang,
  selected,
  onSelect,
}: {
  delivery: Delivery;
  lang: Lang;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "block w-full border-b px-4.5 py-3 text-left transition-colors hover:bg-muted",
        selected && "bg-primary-50 hover:bg-primary-50",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            delivery.status === "delivered" && "bg-primary-50 text-primary",
            delivery.status === "preparing" && "bg-muted text-muted-foreground",
            delivery.status === "enRoute" &&
              delivery.late &&
              "bg-warn-50 text-[oklch(0.45_0.13_70)]",
            delivery.status === "enRoute" &&
              !delivery.late &&
              "bg-info-50 text-info",
          )}
        >
          <Truck className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-[13px] font-semibold">
              {delivery.customer[lang]}
            </div>
            <div className="mono text-[11px] text-muted-foreground">
              {delivery.id.slice(-8)}
            </div>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[11.5px] text-muted-foreground">
            <Pin className="size-3" />
            {delivery.addr[lang]} · {delivery.distance} km
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[11.5px]">
            <StatusBadge delivery={delivery} lang={lang} />
            <span className="ml-auto flex items-center gap-1 text-muted-foreground">
              <Clock className="size-3" />
              {delivery.eta}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function DeliveryDetail({
  delivery,
  lang,
  role,
  onClose,
}: {
  delivery: Delivery;
  lang: Lang;
  role: Role;
  onClose: () => void;
}) {
  const t = getT(lang);
  const isTh = lang === "th";
  const stages: DeliveryStatus[] = ["preparing", "enRoute", "delivered"];
  const stageIdx = stages.indexOf(delivery.status);

  return (
    <Card className="mb-3.5 rounded-[10px] shadow-none fade-in">
      <CardHeader>
        <CardTitle className="mono text-[13.5px]">{delivery.id}</CardTitle>
        <CardDescription className="text-xs">
          {delivery.customer[lang]}
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4.5">
          <DetailField label={t.deliv.customer} value={delivery.customer[lang]} icon={User} />
          <DetailField
            label={isTh ? "ที่อยู่" : "Address"}
            value={delivery.addr[lang]}
            icon={Pin}
          />
          <DetailField label={t.deliv.driver} value={delivery.driver[lang]} icon={Truck} />
          <DetailField
            label={isTh ? "จำนวนสินค้า" : "Items"}
            value={`${delivery.items} ${isTh ? "ชิ้น" : "items"}`}
            icon={Package}
          />
          <DetailField
            label={t.deliv.value}
            value={role === "staff" ? "—" : fmtMoney(delivery.value)}
            icon={Banknote}
          />
          <DetailField
            label={t.deliv.eta}
            value={delivery.eta + (delivery.late ? ` · ${t.deliv.late}` : "")}
            icon={Clock}
            valueClass={delivery.late ? "text-[color:oklch(0.45_0.13_70)]" : undefined}
          />
        </div>

        <div className="mt-5.5">
          <div className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
            {isTh ? "ความคืบหน้า" : "Progress"}
          </div>
          <div className="grid grid-cols-[1fr_24px_1fr_24px_1fr] items-center">
            {stages.map((stage, index) => (
              <React.Fragment key={stage}>
                <div className="text-center">
                  <div
                    className={cn(
                      "mx-auto flex size-8 items-center justify-center rounded-full",
                      index <= stageIdx
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {stage === "preparing" && <Package className="size-3.5" />}
                    {stage === "enRoute" && <Truck className="size-3.5" />}
                    {stage === "delivered" && <Check className="size-3.5" />}
                  </div>
                  <div
                    className={cn(
                      "mt-2 text-xs",
                      index === stageIdx
                        ? "font-semibold text-foreground"
                        : index < stageIdx
                          ? "text-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    {stage === "preparing"
                      ? t.deliv.preparing
                      : stage === "enRoute"
                        ? t.deliv.enRoute
                        : t.deliv.delivered}
                  </div>
                </div>
                {index < stages.length - 1 && (
                  <div
                    className={cn(
                      "-mx-2 h-0.5 self-start",
                      index < stageIdx ? "bg-primary" : "bg-border",
                    )}
                    style={{ marginTop: 16 }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {role === "manager" && delivery.status !== "delivered" && (
          <div className="mt-5.5 flex justify-end gap-2">
            <Button size="sm" variant="outline">
              {isTh ? "ติดต่อพนักงานส่ง" : "Contact driver"}
            </Button>
            <Button size="sm">{isTh ? "ปรับสถานะ" : "Update status"}</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DeliveryMap({
  storeLabel,
  deliveries,
  selected,
  onSelect,
  lang,
}: {
  storeLabel: string;
  deliveries: Delivery[];
  selected: string | null;
  onSelect: (id: string) => void;
  lang: Lang;
}) {
  const cx = 50;
  const cy = 50;
  const pinPos = (delivery: Delivery): [number, number] => {
    let hash = 0;
    for (let index = 0; index < delivery.id.length; index++) {
      hash = (hash * 31 + delivery.id.charCodeAt(index)) >>> 0;
    }
    const angle = ((hash % 1000) / 1000) * Math.PI * 2;
    const radius = 10 + delivery.distance * 8;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
  };

  return (
    <div className="relative h-80 overflow-hidden rounded-[10px] border bg-[linear-gradient(180deg,oklch(0.97_0.01_95)_0%,oklch(0.95_0.012_95)_100%)]">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern id="delivery-grid" width="6" height="6" patternUnits="userSpaceOnUse">
            <path
              d="M 6 0 L 0 0 0 6"
              fill="none"
              stroke="var(--border)"
              strokeWidth=".2"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#delivery-grid)" />
        <path d="M0 50 L100 50" stroke="var(--border-strong)" strokeWidth="1.5" opacity=".6" />
        <path d="M50 0 L50 100" stroke="var(--border-strong)" strokeWidth="1.5" opacity=".6" />
        <path d="M0 25 L100 25" stroke="var(--border-strong)" strokeWidth=".7" opacity=".4" />
        <path d="M0 75 L100 75" stroke="var(--border-strong)" strokeWidth=".7" opacity=".4" />
        <path d="M25 0 L25 100" stroke="var(--border-strong)" strokeWidth=".7" opacity=".4" />
        <path d="M75 0 L75 100" stroke="var(--border-strong)" strokeWidth=".7" opacity=".4" />
        <circle
          cx={cx}
          cy={cy}
          r="30"
          fill="var(--primary)"
          opacity=".05"
          stroke="var(--primary)"
          strokeWidth=".3"
          strokeDasharray="1 1.5"
        />
        <circle
          cx={cx}
          cy={cy}
          r="20"
          fill="none"
          stroke="var(--primary)"
          strokeWidth=".25"
          strokeDasharray="1 1.5"
          opacity=".4"
        />
        {deliveries
          .filter((delivery) => delivery.status === "enRoute")
          .map((delivery) => {
            const [px, py] = pinPos(delivery);
            return (
              <line
                key={delivery.id}
                x1={cx}
                y1={cy}
                x2={px}
                y2={py}
                stroke={delivery.late ? "var(--warn)" : "var(--info)"}
                strokeWidth=".4"
                strokeDasharray="1 1"
                opacity=".7"
              />
            );
          })}
        <circle cx={cx} cy={cy} r="2.6" fill="var(--primary)" />
        <circle
          cx={cx}
          cy={cy}
          r="4"
          fill="none"
          stroke="var(--primary)"
          strokeWidth=".4"
          opacity=".4"
        />
        {deliveries.map((delivery) => {
          const [px, py] = pinPos(delivery);
          const isSelected = selected === delivery.id;
          const color =
            delivery.status === "delivered"
              ? "var(--primary)"
              : delivery.status === "preparing"
                ? "var(--muted-foreground)"
                : delivery.late
                  ? "var(--warn)"
                  : "var(--info)";
          return (
            <g
              key={delivery.id}
              onClick={() => onSelect(delivery.id)}
              className="cursor-pointer"
            >
              <circle
                cx={px}
                cy={py}
                r={isSelected ? 3 : 2}
                fill={color}
                stroke="var(--card)"
                strokeWidth=".5"
              />
              {isSelected && (
                <circle
                  cx={px}
                  cy={py}
                  r="5"
                  fill="none"
                  stroke={color}
                  strokeWidth=".5"
                  opacity=".5"
                />
              )}
            </g>
          );
        })}
      </svg>
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 translate-y-[-180%] items-center gap-1 whitespace-nowrap rounded-md border border-border-strong bg-card px-2 py-1 text-[11px] font-semibold shadow-sm">
        <Store className="size-3 text-primary" />
        {storeLabel}
      </div>
      <div className="absolute bottom-2.5 left-2.5 flex flex-col gap-1 rounded-lg border bg-card/90 p-2.5 text-[11px] backdrop-blur-sm">
        <LegendDot color="var(--info)" label={lang === "th" ? "อยู่ระหว่างทาง" : "En route"} />
        <LegendDot color="var(--warn)" label={lang === "th" ? "ล่าช้า" : "Late"} />
        <LegendDot color="var(--muted-foreground)" label={lang === "th" ? "กำลังจัด" : "Preparing"} />
        <LegendDot color="var(--primary)" label={lang === "th" ? "ส่งแล้ว" : "Delivered"} />
      </div>
    </div>
  );
}

function CrisisContextStrip({
  lang,
  factsTileNo,
  factsTileName,
  headline,
  metric,
  metricLabel,
  tone,
}: {
  lang: Lang;
  factsTileNo: string;
  factsTileName: string;
  headline: React.ReactNode;
  metric: React.ReactNode;
  metricLabel: React.ReactNode;
  tone: Tone;
}) {
  const toneClass =
    tone === "warn"
      ? "border-[color:oklch(0.72_0.16_75_/_0.35)] bg-warn-50/80 text-[color:oklch(0.45_0.13_70)]"
      : "border-destructive/30 bg-red-50/80 text-destructive";

  return (
    <div
      className={cn(
        "grid gap-4 rounded-[10px] border p-3.5 md:grid-cols-[auto_1fr_auto] md:items-center",
        toneClass,
      )}
    >
      <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-foreground">
        <span className="mono flex size-5.5 items-center justify-center rounded-md bg-foreground text-[11px] font-bold text-background">
          {factsTileNo}
        </span>
        <div className="leading-none">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            FACT
          </div>
          <div className="mt-1 text-[12px] font-semibold">{factsTileName}</div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-[11.5px] font-bold uppercase tracking-[0.06em]">
          {lang === "th" ? "บริบทวิกฤต · TOP FLOP" : "Crisis context · TOP FLOP"}
        </div>
        <div className="mt-1 text-[13.5px] leading-5 text-foreground">
          {headline}
        </div>
      </div>
      <div className="text-left md:text-right">
        <div className="num text-[22px] font-bold leading-none">{metric}</div>
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
}: {
  idx: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="mb-3 mt-5 flex flex-wrap items-end justify-between gap-4 px-0.5">
      <div className="flex items-start gap-3">
        <span className="mono flex size-6.5 shrink-0 items-center justify-center rounded-md bg-foreground text-[11px] font-bold text-background">
          {idx}
        </span>
        <div>
          <div className="text-[14.5px] font-semibold tracking-normal">{title}</div>
          {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function GaugeRing({
  value,
  target,
  label,
  size,
  tone,
}: {
  value: number;
  target: number;
  label: string;
  size: number;
  tone: Tone;
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
  const strokeColor =
    tone === "warn"
      ? "oklch(0.55 0.15 70)"
      : tone === "danger"
        ? "var(--destructive)"
        : "var(--primary)";

  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
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
          stroke={strokeColor}
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

function InsightNote({
  title,
  children,
  tone,
  className,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  tone: Tone;
  className?: string;
}) {
  const classNames =
    tone === "warn"
      ? "border-[color:oklch(0.72_0.16_75_/_0.28)] bg-warn-50/70 text-[color:oklch(0.45_0.13_70)]"
      : "border-primary/25 bg-primary-50/70 text-primary";

  return (
    <div className={cn("rounded-lg border p-3 text-[12.5px] leading-5", classNames, className)}>
      <div className="mb-1 flex items-center gap-1.5 font-semibold">
        <Sparkles className="size-3.5" />
        {title}
      </div>
      <div className="text-foreground">{children}</div>
    </div>
  );
}

function RecoveryFooter({ lang, role }: { lang: Lang; role: Role }) {
  const isTh = lang === "th";
  const items = [
    {
      icon: Package,
      label: isTh ? "ลด OOS cuts" : "Cut OOS rejections",
      action: isTh
        ? "เติม Top-30 OOS → ลดการตัดออร์เดอร์"
        : "Replenish Top-30 OOS → fewer order cuts",
      upside: 28000,
      window: isTh ? "ภายใน 7 วัน" : "within 7 days",
    },
    {
      icon: Truck,
      label: isTh ? "ปรับเส้นทาง" : "Re-route batches",
      action: isTh
        ? "จัด batch ส่ง 2 ครั้ง/ชม. ในช่วงพีค"
        : "Two batched runs/hour in peak window",
      upside: 14000,
      window: isTh ? "ภายใน 3 วัน" : "within 3 days",
    },
    {
      icon: User,
      label: isTh ? "ฝึกพนักงานจัดส่ง" : "Driver coaching",
      action: isTh
        ? "Brief สมชาย เรื่องเส้นทางและเวลาเริ่มส่ง"
        : "Coach Somchai on routing and dispatch timing",
      upside: 6000,
      window: isTh ? "ภายใน 14 วัน" : "within 14 days",
    },
  ];

  return (
    <Card className="rounded-[10px] border-primary/25 bg-primary-50/55 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[13.5px]">
          <Flame className="size-4 text-primary" />
          {isTh ? "Action เพื่อกู้ OTIF" : "Actions to recover OTIF"}
        </CardTitle>
        <CardDescription className="text-xs">
          {isTh
            ? "รายการที่ควรถูกส่งเข้าแผนกู้ยอดและลดการส่งไม่ครบ"
            : "Recommended items for recovery planning and fewer failed orders"}
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
              <span className="num font-semibold text-primary">
                +{role === "staff" ? "—" : fmtMoney(item.upside, { compact: true })}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DetailField({
  label,
  value,
  icon: Icon,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
        {Icon && <Icon className="size-3" />}
        {label}
      </div>
      <div className={cn("mt-1 text-[13.5px] font-medium", valueClass)}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ delivery, lang }: { delivery: Delivery; lang: Lang }) {
  const t = getT(lang);
  if (delivery.status === "delivered") {
    return (
      <Badge className="gap-1">
        <span className="size-1.5 rounded-full bg-current" />
        {t.deliv.delivered}
      </Badge>
    );
  }
  if (delivery.status === "enRoute") {
    return (
      <Badge
        variant={delivery.late ? "secondary" : "outline"}
        className={cn(
          "gap-1",
          delivery.late
            ? "bg-warn-50 text-[oklch(0.45_0.13_70)]"
            : "bg-info-50 text-info",
        )}
      >
        <span className="size-1.5 rounded-full bg-current" />
        {t.deliv.enRoute}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <span className="size-1.5 rounded-full bg-current" />
      {t.deliv.preparing}
    </Badge>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary">
      {initials}
    </div>
  );
}

function Meter({
  value,
  tone = "primary",
  color,
}: {
  value: number;
  tone?: Tone;
  color?: string;
}) {
  const fill =
    color ??
    (tone === "warn"
      ? "var(--warn)"
      : tone === "danger"
        ? "var(--destructive)"
        : tone === "info"
          ? "var(--info)"
          : "var(--primary)");

  return (
    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-[width]"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: fill }}
      />
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="size-2 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}

function driverOnTimeColor(value: number) {
  if (value >= 0.9) return "var(--primary)";
  if (value >= 0.8) return "oklch(0.45 0.13 70)";
  return "var(--destructive)";
}
