"use client";

import * as React from "react";
import {
  Sparkles,
  Filter,
  Check,
  Clock,
  Flame,
  Gift,
  TrendingUp,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PageHeader, Restricted } from "@/components/page-helpers";
import { EVENTS, PROMOS } from "@/lib/data";
import { fmtMoney } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/app-shell";

type Tab = "promotions" | "events";

const ICON_MAP: Record<string, LucideIcon> = {
  flame: Flame,
  gift: Gift,
  trending: TrendingUp,
  calendar: Calendar,
  sparkle: Sparkles,
};

export function SuggestionsPage() {
  const { lang, role } = useAppShell();
  const t = getT(lang);
  const [tab, setTab] = React.useState<Tab>("promotions");
  const [launched, setLaunched] = React.useState<Set<string>>(new Set());

  if (role === "staff")
    return (
      <>
        <PageHeader title={t.sug.title} sub={t.sug.sub} />
        <Restricted lang={lang} />
      </>
    );

  const items = tab === "promotions" ? PROMOS : EVENTS;

  return (
    <div className="fade-in">
      <PageHeader
        title={t.sug.title}
        sub={t.sug.sub}
        right={
          <Badge variant="secondary">
            <Sparkles />
            {lang === "th" ? "ขับเคลื่อนด้วย AI" : "AI-powered"}
          </Badge>
        }
      />

      <Card
        className="mb-3.5 border-primary-50"
        style={{
          background:
            "linear-gradient(135deg, var(--primary-50) 0%, oklch(0.96 0.02 200) 100%)",
        }}
      >
        <CardContent className="flex flex-wrap items-center gap-4">
          <div className="min-w-60 flex-1">
            <div className="mb-1.5 text-[13px] font-semibold uppercase tracking-wider text-primary">
              {lang === "th" ? "โอกาสประจำสัปดาห์" : "This week's opportunity"}
            </div>
            <h2 className="m-0 text-[22px] font-semibold tracking-tight text-foreground">
              {lang === "th"
                ? "เปิดใช้งานข้อเสนอแนะทั้งหมดอาจเพิ่มยอด"
                : "Launching all suggestions could lift sales by"}{" "}
              <span className="num text-primary">
                {fmtMoney(
                  [...PROMOS, ...EVENTS].reduce((s, x) => s + x.upside, 0),
                )}
              </span>{" "}
              {lang === "th" ? "ต่อสัปดาห์" : "per week"}
            </h2>
            <div className="mt-1.5 text-[13px] text-muted-foreground">
              {lang === "th"
                ? "ระบบวิเคราะห์จากข้อมูลย้อนหลัง 90 วันของสาขา ปฏิทินกิจกรรม และสภาพอากาศ"
                : "Based on 90-day branch history, event calendar and local weather"}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter />
              {t.common.filter}
            </Button>
            <Button>
              <Check />
              {lang === "th" ? "ดำเนินการทั้งหมด" : "Apply all"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-3.5">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList>
            <TabsTrigger value="promotions">
              {t.sug.promotions} · {PROMOS.length}
            </TabsTrigger>
            <TabsTrigger value="events">
              {t.sug.events} · {EVENTS.length}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((s) => {
          const Icon = ICON_MAP[s.icon] || Sparkles;
          const isLaunched = launched.has(s.id);
          return (
            <Card key={s.id} className="relative">
              <CardContent className="flex h-full flex-col">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 text-sm font-semibold leading-tight">
                      {s.title[lang]}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline">
                        <Clock />
                        {s.duration[lang]}
                      </Badge>
                      <Badge variant="secondary">{s.target[lang]}</Badge>
                    </div>
                  </div>
                </div>

                <p className="mb-3.5 flex-1 text-[13px] leading-relaxed text-muted-foreground">
                  {s.desc[lang]}
                </p>

                <div className="grid grid-cols-2 gap-2.5 border-t py-3">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {t.sug.potential}
                    </div>
                    <div className="num mt-0.5 text-lg font-semibold tracking-tight text-primary">
                      +{fmtMoney(s.upside, { compact: true })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {t.sug.confidence}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Progress
                        value={s.confidence * 100}
                        className={cn(
                          s.confidence <= 0.65 && "[&>div]:bg-destructive",
                          s.confidence > 0.65 &&
                            s.confidence <= 0.8 &&
                            "[&>div]:bg-warn",
                        )}
                      />
                      <span className="num min-w-7.5 text-xs font-semibold">
                        {Math.round(s.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex gap-1.5">
                  <Button size="sm" variant="outline" className="flex-1">
                    {t.common.details}
                  </Button>
                  {!isLaunched ? (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setLaunched((prev) => new Set([...prev, s.id]));
                        toast.success(
                          lang === "th"
                            ? `เปิดใช้งาน "${s.title.th}" แล้ว`
                            : `Launched "${s.title.en}"`,
                        );
                      }}
                    >
                      <Check />
                      {t.sug.launch}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-primary text-primary"
                    >
                      <Check />
                      {lang === "th" ? "เปิดใช้งานแล้ว" : "Launched"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
