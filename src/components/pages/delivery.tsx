"use client";

import * as React from "react";
import {
  Filter,
  RotateCcw,
  Truck,
  CheckCircle2,
  Banknote,
  Clock,
  Pin,
  X,
  User,
  Package,
  Check,
  Store,
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
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-helpers";
import { DELIVERIES, STORE } from "@/lib/mock/data";
import { fmtMoney } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/app-shell";
import type { Delivery, DeliveryStatus, Lang, Role } from "@/types";

type Tab = "active" | "completed";

export function DeliveryPage() {
  const { lang, role } = useAppShell();
  const t = getT(lang);
  const [tab, setTab] = React.useState<Tab>("active");
  const [selected, setSelected] = React.useState<string | null>(null);

  const active = DELIVERIES.filter(
    (d) => d.status === "enRoute" || d.status === "preparing",
  );
  const completed = DELIVERIES.filter((d) => d.status === "delivered");
  const list = tab === "active" ? active : completed;

  const stat = (d: Delivery) => {
    if (d.status === "delivered")
      return (
        <Badge variant="default">
          <span className="size-1.5 rounded-full bg-current" />
          {t.deliv.delivered}
        </Badge>
      );
    if (d.status === "enRoute")
      return (
        <Badge variant={d.late ? "destructive" : "default"}>
          <span className="size-1.5 rounded-full bg-current" />
          {t.deliv.enRoute}
        </Badge>
      );
    return (
      <Badge variant="secondary">
        <span className="size-1.5 rounded-full bg-current" />
        {t.deliv.preparing}
      </Badge>
    );
  };

  const selectedDelivery = selected
    ? DELIVERIES.find((x) => x.id === selected)
    : null;

  return (
    <div className="fade-in">
      <PageHeader
        title={t.deliv.title}
        sub={`${t.deliv.from} ${STORE.short[lang]} · ${t.common.today}`}
        right={
          <>
            <Button size="sm" variant="outline">
              <Filter />
              {t.common.filter}
            </Button>
            <Button size="sm" variant="outline">
              <RotateCcw />
              {t.common.refresh}
            </Button>
          </>
        }
      />

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-info-50 text-info">
                <Truck className="size-5" />
              </div>
              <div>
                <div className="text-[12.5px] text-muted-foreground">
                  {t.deliv.active}
                </div>
                <div className="num text-[26px] font-semibold tracking-tight">
                  {active.length}
                </div>
                <div className="text-[11.5px] text-muted-foreground">
                  {active.filter((d) => d.late).length > 0 && (
                    <>
                      <span className="num font-semibold text-warn">
                        {active.filter((d) => d.late).length}
                      </span>{" "}
                      {lang === "th" ? "ล่าช้า" : "running late"} ·{" "}
                    </>
                  )}
                  {active.filter((d) => d.status === "preparing").length}{" "}
                  {lang === "th" ? "กำลังจัด" : "preparing"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary-50 text-primary">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <div className="text-[12.5px] text-muted-foreground">
                  {t.deliv.completed}
                </div>
                <div className="num text-[26px] font-semibold tracking-tight">
                  {completed.length}
                </div>
                <div className="text-[11.5px] text-muted-foreground">
                  {lang === "th" ? "ตรงเวลา" : "On-time"}{" "}
                  <span className="num font-semibold text-primary">
                    {Math.round(
                      (completed.filter((d) => !d.late).length /
                        Math.max(1, completed.length)) *
                        100,
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
                <Banknote className="size-5" />
              </div>
              <div>
                <div className="text-[12.5px] text-muted-foreground">
                  {lang === "th" ? "ยอดส่งวันนี้" : "Delivery value today"}
                </div>
                <div className="num text-[26px] font-semibold tracking-tight">
                  {role === "staff"
                    ? "—"
                    : fmtMoney(DELIVERIES.reduce((s, d) => s + d.value, 0))}
                </div>
                <div className="text-[11.5px] text-muted-foreground">
                  {DELIVERIES.length}{" "}
                  {lang === "th" ? "ออเดอร์" : "orders"} ·{" "}
                  {lang === "th" ? "เฉลี่ย" : "avg"}{" "}
                  <span className="num font-semibold">
                    {role === "staff"
                      ? "—"
                      : fmtMoney(
                          DELIVERIES.reduce((s, d) => s + d.value, 0) /
                            DELIVERIES.length,
                        )}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-[13.5px]">
              {lang === "th" ? "พื้นที่จัดส่ง" : "Delivery area"}
            </CardTitle>
            <CardDescription className="text-xs">
              {`${STORE.short[lang]} · 3 km radius`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeliveryMap
              deliveries={DELIVERIES}
              selected={selected}
              onSelect={setSelected}
              lang={lang}
            />
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden py-0">
          <div className="p-4.5">
            <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
              <TabsList>
                <TabsTrigger value="active">
                  {t.deliv.active} · {active.length}
                </TabsTrigger>
                <TabsTrigger value="completed">
                  {t.deliv.completed} · {completed.length}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Separator />
          <div className="max-h-130 overflow-y-auto">
            {list.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelected(d.id)}
                className={cn(
                  "flex w-full items-start gap-3 border-b px-4.5 py-3 text-left transition-colors hover:bg-accent",
                  selected === d.id && "bg-primary-50 hover:bg-primary-50",
                )}
              >
                <div
                  className={cn(
                    "flex size-9.5 shrink-0 items-center justify-center rounded-md",
                      d.status === "delivered" && "bg-primary-50 text-primary",
                    d.status === "preparing" && "bg-muted text-muted-foreground",
                      d.status === "enRoute" && d.late && "bg-warn-50 text-[oklch(0.45_0.13_70)] dark:text-warn",
                      d.status === "enRoute" && !d.late && "bg-info-50 text-info",
                  )}
                >
                  <Truck className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-[13px] font-semibold">
                      {d.customer[lang]}
                    </div>
                    <div className="mono text-[11.5px] text-muted-foreground">
                      {d.id.slice(-8)}
                    </div>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Pin className="size-3" />
                    {d.addr[lang]} · {d.distance} km
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-xs">
                    {stat(d)}
                    <span className="text-muted-foreground">
                      {t.deliv.driver}:{" "}
                      <b className="text-foreground">{d.driver[lang]}</b>
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                      <Clock className="size-3" />
                      {d.eta}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {selectedDelivery && (
        <DeliveryDetail
          d={selectedDelivery}
          lang={lang}
          role={role}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

interface DeliveryDetailProps {
  d: Delivery;
  lang: Lang;
  role: Role;
  onClose: () => void;
}

function DeliveryDetail({ d, lang, role, onClose }: DeliveryDetailProps) {
  const t = getT(lang);
  const stages: DeliveryStatus[] = ["preparing", "enRoute", "delivered"];
  const stageIdx = stages.indexOf(d.status);

  return (
    <Card className="mt-3.5 fade-in">
      <CardHeader>
        <CardTitle className="mono text-[13.5px]">{d.id}</CardTitle>
        <CardDescription className="text-xs">
          {d.customer[lang]}
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4.5">
          <Field label={t.deliv.customer} value={d.customer[lang]} icon={User} />
          <Field
            label={lang === "th" ? "ที่อยู่จัดส่ง" : "Delivery address"}
            value={d.addr[lang]}
            icon={Pin}
          />
          <Field label={t.deliv.driver} value={d.driver[lang]} icon={Truck} />
          <Field
            label={lang === "th" ? "จำนวนสินค้า" : "Items"}
            value={`${d.items} ${lang === "th" ? "ชิ้น" : "items"}`}
            icon={Package}
          />
          <Field
            label={t.deliv.value}
            value={role === "staff" ? "—" : fmtMoney(d.value)}
            icon={Banknote}
          />
          <Field
            label={t.deliv.eta}
            value={d.eta + (d.late ? ` · ${t.deliv.late}` : "")}
            icon={Clock}
            valueClass={d.late ? "text-[var(--warn)]" : undefined}
          />
        </div>

        <div className="mt-5.5">
          <div className="mb-3 text-[12.5px] font-medium text-muted-foreground">
            {lang === "th" ? "ความคืบหน้า" : "Progress"}
          </div>
          <div className="grid grid-cols-[1fr_24px_1fr_24px_1fr] items-center">
            {stages.map((s, i) => (
              <React.Fragment key={s}>
                <div className="text-center">
                  <div
                    className={cn(
                      "mx-auto flex size-8 items-center justify-center rounded-full",
                      i <= stageIdx
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {s === "preparing" && <Package className="size-3.5" />}
                    {s === "enRoute" && <Truck className="size-3.5" />}
                    {s === "delivered" && <Check className="size-3.5" />}
                  </div>
                  <div
                    className={cn(
                      "mt-2 text-xs",
                      i === stageIdx
                        ? "font-semibold text-foreground"
                        : i < stageIdx
                          ? "text-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    {s === "preparing"
                      ? t.deliv.preparing
                      : s === "enRoute"
                        ? t.deliv.enRoute
                        : t.deliv.delivered}
                  </div>
                </div>
                {i < stages.length - 1 && (
                  <div
                    className={cn(
                      "-mx-2 mt-0 h-0.5 self-start",
                      i < stageIdx ? "bg-primary" : "bg-border",
                    )}
                    style={{ marginTop: 16 }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {role === "manager" && d.status !== "delivered" && (
          <div className="mt-5.5 flex justify-end gap-2">
            <Button size="sm" variant="outline">
              {lang === "th" ? "ติดต่อพนักงานส่ง" : "Contact driver"}
            </Button>
            <Button size="sm">
              {lang === "th" ? "ปรับสถานะ" : "Update status"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface FieldProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  valueClass?: string;
}

function Field({ label, value, icon: Icon, valueClass }: FieldProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="size-3" />}
        {label}
      </div>
      <div className={cn("mt-1 text-sm font-medium", valueClass)}>{value}</div>
    </div>
  );
}

interface DeliveryMapProps {
  deliveries: Delivery[];
  selected: string | null;
  onSelect: (id: string) => void;
  lang: Lang;
}

function DeliveryMap({ deliveries, selected, onSelect, lang }: DeliveryMapProps) {
  const cx = 50,
    cy = 50;
  const pinPos = (d: Delivery): [number, number] => {
    let h = 0;
    for (let k = 0; k < d.id.length; k++)
      h = (h * 31 + d.id.charCodeAt(k)) >>> 0;
    const ang = ((h % 1000) / 1000) * Math.PI * 2;
    const r = 10 + d.distance * 8;
    return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
  };

  return (
    <div className="map-bg relative h-80 overflow-hidden rounded-lg border">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
            <path
              d="M 6 0 L 0 0 0 6"
              fill="none"
              stroke="var(--border)"
              strokeWidth=".2"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        <path d="M0 50 L100 50" stroke="var(--border)" strokeWidth="1.5" opacity=".6" />
        <path d="M50 0 L50 100" stroke="var(--border)" strokeWidth="1.5" opacity=".6" />
        <path d="M0 25 L100 25" stroke="var(--border)" strokeWidth=".7" opacity=".4" />
        <path d="M0 75 L100 75" stroke="var(--border)" strokeWidth=".7" opacity=".4" />
        <path d="M25 0 L25 100" stroke="var(--border)" strokeWidth=".7" opacity=".4" />
        <path d="M75 0 L75 100" stroke="var(--border)" strokeWidth=".7" opacity=".4" />
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
          .filter((d) => d.status === "enRoute")
          .map((d) => {
            const [px, py] = pinPos(d);
            return (
              <line
                key={d.id}
                x1={cx}
                y1={cy}
                x2={px}
                y2={py}
                stroke={d.late ? "var(--warn)" : "var(--info)"}
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
        {deliveries.map((d) => {
          const [px, py] = pinPos(d);
          const isSel = selected === d.id;
          const color =
            d.status === "delivered"
              ? "var(--primary)"
              : d.status === "preparing"
                ? "var(--muted-foreground)"
                : d.late
                  ? "var(--warn)"
                  : "var(--info)";
          return (
            <g
              key={d.id}
              onClick={() => onSelect(d.id)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={px}
                cy={py}
                r={isSel ? 3 : 2}
                fill={color}
                stroke="var(--card)"
                strokeWidth=".5"
              />
              {isSel && (
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

      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-44 items-center gap-1 whitespace-nowrap rounded-md border bg-card px-2 py-1 text-[11px] font-semibold shadow-sm">
        <Store className="size-3 text-primary" />
        {STORE.short[lang]}
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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="size-2 rounded-full"
        style={{ background: color }}
      />
      <span>{label}</span>
    </div>
  );
}
