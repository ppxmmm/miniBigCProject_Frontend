"use client";

import * as React from "react";
import {
  Edit,
  Store,
  Check,
  Shield,
  AlertTriangle,
  Mail,
  Phone,
  User,
  Eye,
  EyeOff,
  type LucideIcon,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/page-helpers";
import { useBranchData } from "@/providers/branch-data-provider";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/app-shell";

type Tab = "personal" | "security";

export function ProfilePage() {
  const { lang, currentUser } = useAppShell();
  const { data: branch } = useBranchData();
  const STORE = branch.store;
  const t = getT(lang);
  const [tab, setTab] = React.useState<Tab>("personal");
  const [pwOpen, setPwOpen] = React.useState(false);
  const [twoFa, setTwoFa] = React.useState(true);

  return (
    <div className="fade-in">
      <PageHeader title={t.profile.title} sub={t.profile.sub} />

      <Card className="mb-3.5">
        <CardContent className="flex flex-wrap items-center gap-4.5">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary-50 text-base font-semibold text-primary">
              {currentUser.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-50 flex-1">
            <div className="text-lg font-semibold tracking-tight">
              {currentUser.name}
            </div>
            <div className="mt-0.5 text-[13px] text-muted-foreground">
              {currentUser.role} ·{" "}
              <span className="mono">{currentUser.employeeId}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="default">
                <Store />
                {STORE.short[lang]}
              </Badge>
              <Badge variant="outline">
                <Check />
                {lang === "th" ? "ยืนยันแล้ว" : "Verified"}
              </Badge>
            </div>
          </div>
          <Button variant="outline">
            <Edit />
            {t.common.edit}
          </Button>
        </CardContent>
      </Card>

      <div className="mb-3.5">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList>
            <TabsTrigger value="personal">{t.profile.personal}</TabsTrigger>
            <TabsTrigger value="security">{t.profile.security}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {tab === "personal" && (
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 gap-4.5 md:grid-cols-2">
              <FormField label={t.profile.name} value={currentUser.name} />
              <FormField
                label={t.profile.email}
                value={currentUser.email}
                icon={Mail}
              />
              <FormField
                label={t.profile.phone}
                value="+66 81 234 5678"
                icon={Phone}
              />
              <FormField
                label={t.profile.employeeId}
                value={currentUser.employeeId}
                mono
              />
              <FormField
                label={t.profile.roleField}
                value={currentUser.role}
                disabled
              />
              <FormField
                label={t.profile.branch}
                value={STORE.name[lang]}
                disabled
              />
            </div>
            <div className="mt-5.5 flex justify-end gap-2">
              <Button variant="ghost">{t.common.cancel}</Button>
              <Button>{t.common.save}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "security" && (
        <div className="flex flex-col gap-3.5">
          <Card>
            <CardHeader>
              <CardTitle className="text-[13.5px]">{t.profile.changePw}</CardTitle>
              <CardDescription className="text-xs">
                {t.profile.lastChanged} · 28 {t.months[3]} 2026
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!pwOpen ? (
                <Button variant="outline" onClick={() => setPwOpen(true)}>
                  {t.profile.changePw}
                </Button>
              ) : (
                <div className="flex max-w-105 flex-col gap-3.5">
                  <PwInput label={t.profile.current} />
                  <PwInput label={t.profile.newPw} showStrength />
                  <PwInput label={t.profile.confirmPw} />
                  <div className="flex gap-2">
                    <Button className="flex-1">{t.common.save}</Button>
                    <Button variant="outline" onClick={() => setPwOpen(false)}>
                      {t.common.cancel}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[13.5px]">{t.profile.twoFa}</CardTitle>
              <CardDescription className="text-xs">
                {t.profile.twoFaSub}
              </CardDescription>
              <CardAction>
                <Switch checked={twoFa} onCheckedChange={setTwoFa} />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 rounded-md bg-muted p-3.5">
                {twoFa ? (
                  <Shield className="size-5 text-primary" />
                ) : (
                  <AlertTriangle className="size-5 text-warn" />
                )}
                <div className="flex-1 text-[13px]">
                  {twoFa
                    ? lang === "th"
                      ? "เปิดใช้งานอยู่ · เชื่อมต่อกับ Google Authenticator"
                      : "Enabled · linked to Google Authenticator"
                    : lang === "th"
                      ? "ยังไม่ได้เปิดใช้งาน — แนะนำให้เปิดเพื่อความปลอดภัย"
                      : "Not enabled — recommended for security"}
                </div>
                {twoFa && (
                  <Button size="sm" variant="ghost">
                    {lang === "th" ? "ตั้งค่าใหม่" : "Reconfigure"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[13.5px]">
                {lang === "th" ? "เซสชันที่ใช้งานอยู่" : "Active sessions"}
              </CardTitle>
              <CardDescription className="text-xs">
                {lang === "th"
                  ? "อุปกรณ์ที่เข้าสู่ระบบบัญชีนี้"
                  : "Devices signed into this account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionRow
                device={lang === "th" ? "MacBook Pro · ทองหล่อ" : "MacBook Pro · Thonglor"}
                ip="118.172.49.x"
                current
              />
              <SessionRow
                device={lang === "th" ? "iPhone 15 · กรุงเทพฯ" : "iPhone 15 · Bangkok"}
                ip="171.97.32.x"
                time="2h"
              />
              <SessionRow
                device={lang === "th" ? "เครื่อง POS-04" : "POS-04 terminal"}
                ip="10.0.4.7"
                time="6h"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  mono?: boolean;
  disabled?: boolean;
}

function FormField({ label, value, icon: Icon, mono, disabled }: FormFieldProps) {
  const [v, setV] = React.useState(value);
  return (
    <div>
      <Label className="mb-1.5">{label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        )}
        <Input
          className={cn(mono && "mono", Icon && "pl-8")}
          value={v}
          onChange={(e) => setV(e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function PwInput({
  label,
  showStrength,
}: {
  label: string;
  showStrength?: boolean;
}) {
  const [v, setV] = React.useState("");
  const [shown, setShown] = React.useState(false);
  const strength = Math.min(
    4,
    Math.floor(v.length / 3) +
      (/[A-Z]/.test(v) ? 1 : 0) +
      (/[0-9]/.test(v) ? 1 : 0),
  );
  return (
    <div>
      <Label className="mb-1.5">{label}</Label>
      <div className="relative">
        <Input
          type={shown ? "text" : "password"}
          value={v}
          onChange={(e) => setV(e.target.value)}
          className="pr-9"
        />
        <button
          type="button"
          onClick={() => setShown(!shown)}
          className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
        >
          {shown ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </button>
      </div>
      {showStrength && v && (
        <div className="mt-1.5 flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-0.75 flex-1 rounded-full",
                i >= strength && "bg-muted",
                i < strength && strength <= 1 && "bg-destructive",
                i < strength && strength === 2 && "bg-warn",
                i < strength && strength >= 3 && "bg-primary",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SessionRowProps {
  device: string;
  ip: string;
  time?: string;
  current?: boolean;
}

function SessionRow({ device, ip, time, current }: SessionRowProps) {
  return (
    <div className="flex items-center gap-3 border-t py-3 first:border-t-0">
      <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <User className="size-4" />
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-medium">{device}</div>
        <div className="mono text-[11.5px] text-muted-foreground">{ip}</div>
      </div>
      {current ? (
        <Badge variant="default">
          <span className="size-1.5 rounded-full bg-current" />
          Current
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">{time} ago</span>
      )}
    </div>
  );
}
