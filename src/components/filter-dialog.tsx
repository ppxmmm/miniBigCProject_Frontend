"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Lang } from "@/types";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang: Lang;
  title: string;
  children: React.ReactNode;
  onApply: () => void;
  onReset: () => void;
}

export function FilterDialog({
  open,
  onOpenChange,
  lang,
  title,
  children,
  onApply,
  onReset,
}: FilterDialogProps) {
  const t = getT(lang);
  const isTh = lang === "th";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">{children}</div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            {isTh ? "ล้างตัวกรอง" : "Clear filters"}
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onApply();
                onOpenChange(false);
              }}
            >
              {t.common.apply}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FilterToggle({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-[13px] font-medium">
          {label}
        </Label>
        {description && (
          <p className="text-[11.5px] text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function FilterChipGroup({
  label,
  options,
  selected,
  onChange,
  mode = "multiple",
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  mode?: "single" | "multiple";
}) {
  const toggle = (value: string) => {
    if (mode === "single") {
      onChange(selected.includes(value) ? [] : [value]);
      return;
    }
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  };

  return (
    <div className="space-y-2">
      <div className="text-[12.5px] font-medium">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors",
                active
                  ? "border-primary bg-primary-50 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
