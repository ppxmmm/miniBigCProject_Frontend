"use client";

import * as React from "react";
import { Lock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getT } from "@/lib/i18n";
import type { Lang } from "@/types";

interface EmptyProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
}

export function Empty({ icon, title, sub }: EmptyProps) {
  return (
    <div className="p-9 text-center text-muted-foreground">
      <div className="inline-flex rounded-full bg-muted p-3.5">
        {icon ?? <AlertCircle className="size-5" />}
      </div>
      <div className="mt-3 font-semibold text-foreground">{title}</div>
      {sub && <div className="mt-1 text-sm">{sub}</div>}
    </div>
  );
}

export function Restricted({ lang }: { lang: Lang }) {
  const t = getT(lang).common;
  return (
    <Card>
      <CardContent className="px-10 py-15 text-center">
        <div className="inline-flex rounded-full bg-muted p-4">
          <Lock className="size-5" />
        </div>
        <div className="mt-3.5 text-base font-semibold">{t.restricted}</div>
        <div className="mt-1.5 text-sm text-muted-foreground">
          {t.restrictedHint}
        </div>
      </CardContent>
    </Card>
  );
}

interface PageHeaderProps {
  title: React.ReactNode;
  sub?: React.ReactNode;
  right?: React.ReactNode;
}

export function PageHeader({ title, sub, right }: PageHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
        {sub && (
          <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
        )}
      </div>
      {right && (
        <div className="flex flex-wrap items-center gap-2">{right}</div>
      )}
    </div>
  );
}
