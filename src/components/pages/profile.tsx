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
import { toast } from "sonner";
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
import {
  initialsFromName,
  writeProfileOverrides,
} from "@/lib/profile-session";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/app-shell";

type Tab = "personal" | "security";

type PersonalForm = {
  name: string;
  email: string;
  phone: string;
};

function snapshotPersonal(user: {
  name: string;
  email: string;
  phone: string;
}): PersonalForm {
  return { name: user.name, email: user.email, phone: user.phone };
}

export function ProfilePage() {
  const { lang, role, currentUser } = useAppShell();
  const { data: branch } = useBranchData();
  const STORE = branch.store;
  const t = getT(lang);
  const [tab, setTab] = React.useState<Tab>("personal");
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<PersonalForm>(() =>
    snapshotPersonal(currentUser),
  );
  const [pwOpen, setPwOpen] = React.useState(false);
  const [twoFa, setTwoFa] = React.useState(true);

  React.useEffect(() => {
    if (!editing) {
      setDraft(snapshotPersonal(currentUser));
    }
  }, [currentUser, editing]);

  const startEditing = React.useCallback(() => {
    setTab("personal");
    setDraft(snapshotPersonal(currentUser));
    setEditing(true);
  }, [currentUser]);

  const cancelEditing = React.useCallback(() => {
    setDraft(snapshotPersonal(currentUser));
    setEditing(false);
  }, [currentUser]);

  const savePersonal = React.useCallback(() => {
    const name = draft.name.trim();
    const email = draft.email.trim();
    const phone = draft.phone.trim();

    if (!name || !email || !phone) {
      toast.error(
        lang === "th"
          ? "กรุณากรอกชื่อ อีเมล และเบอร์โทรให้ครบ"
          : "Please fill in name, email, and phone",
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(
        lang === "th" ? "รูปแบบอีเมลไม่ถูกต้อง" : "Invalid email format",
      );
      return;
    }

    writeProfileOverrides(role, {
      name,
      email,
      phone,
      initials: initialsFromName(name),
    });
    setEditing(false);
    toast.success(
      lang === "th" ? "บันทึกโปรไฟล์แล้ว" : "Profile saved",
    );
  }, [draft, lang, role]);

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
          <Button
            type="button"
            variant="outline"
            onClick={editing ? cancelEditing : startEditing}
          >
            <Edit />
            {editing ? t.common.cancel : t.common.edit}
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
              <FormField
                label={t.profile.name}
                value={draft.name}
                onChange={(value) => setDraft((d) => ({ ...d, name: value }))}
                disabled={!editing}
              />
              <FormField
                label={t.profile.email}
                value={draft.email}
                onChange={(value) => setDraft((d) => ({ ...d, email: value }))}
                icon={Mail}
                disabled={!editing}
              />
              <FormField
                label={t.profile.phone}
                value={draft.phone}
                onChange={(value) => setDraft((d) => ({ ...d, phone: value }))}
                icon={Phone}
                disabled={!editing}
              />
              <FormField
                label={t.profile.employeeId}
                value={currentUser.employeeId}
                mono
                disabled
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
              <Button
                type="button"
                variant="ghost"
                disabled={!editing}
                onClick={cancelEditing}
              >
                {t.common.cancel}
              </Button>
              <Button
                type="button"
                disabled={!editing}
                onClick={savePersonal}
              >
                {t.common.save}
              </Button>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPwOpen(true)}
                >
                  {t.profile.changePw}
                </Button>
              ) : (
                <div className="flex max-w-105 flex-col gap-3.5">
                  <PwInput label={t.profile.current} />
                  <PwInput label={t.profile.newPw} showStrength />
                  <PwInput label={t.profile.confirmPw} />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={() => {
                        setPwOpen(false);
                        toast.success(
                          lang === "th"
                            ? "อัปเดตรหัสผ่านแล้ว (จำลอง)"
                            : "Password updated (demo)",
                        );
                      }}
                    >
                      {t.common.save}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPwOpen(false)}
                    >
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
                  <Button type="button" size="sm" variant="ghost">
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
  onChange?: (value: string) => void;
  icon?: LucideIcon;
  mono?: boolean;
  disabled?: boolean;
}

function FormField({
  label,
  value,
  onChange,
  icon: Icon,
  mono,
  disabled,
}: FormFieldProps) {
  return (
    <div>
      <Label className="mb-1.5">{label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        )}
        <Input
          className={cn(mono && "mono", Icon && "pl-8")}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={!onChange}
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
