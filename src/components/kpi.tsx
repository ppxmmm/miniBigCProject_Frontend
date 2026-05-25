"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/charts/sparkline";
import { fmtPct } from "@/lib/format";

interface KPIProps {
  label: React.ReactNode;
  value: React.ReactNode;
  sub?: React.ReactNode;
  delta?: number;
  deltaLabel?: React.ReactNode;
  sparkData?: number[];
  icon?: LucideIcon;
  restricted?: boolean;
}

export function KPI({
  label,
  value,
  sub,
  delta,
  deltaLabel,
  sparkData,
  icon: Icon,
  restricted,
}: KPIProps) {
  const positive = delta != null && delta >= 0;
  return (
    <Card className="gap-0 py-0">
      <CardContent className="relative p-4.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[12.5px] font-medium text-muted-foreground">
              {Icon && <Icon className="size-3.5" />}
              {label}
            </div>
            <div className="num mt-2 text-[26px] font-semibold tracking-tight">
              {restricted ? "•••••" : value}
            </div>
            {sub && !restricted && (
              <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
            )}
          </div>
          {sparkData && !restricted && (
            <Sparkline data={sparkData} trend={delta} />
          )}
        </div>
        {delta != null && !restricted && (
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <Badge variant={positive ? "default" : "destructive"}>
              {positive ? (
                <ArrowUp className="size-3" />
              ) : (
                <ArrowDown className="size-3" />
              )}
              {fmtPct(Math.abs(delta), { dp: 1 })}
            </Badge>
            <span className="text-muted-foreground">{deltaLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
