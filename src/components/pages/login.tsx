"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Headphones,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BrandMark } from "@/components/brand-mark";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/app-shell";

const SSO_ERROR_MESSAGES: Record<string, { th: string; en: string }> = {
  state_mismatch: {
    th: "เซสชันล็อกอินหมดอายุ กรุณาลองใหม่อีกครั้ง",
    en: "Login session expired. Please try again.",
  },
  token_exchange_failed: {
    th: "ไม่สามารถเชื่อมต่อกับ SSO Server ได้",
    en: "Could not connect to SSO server.",
  },
  missing_params: {
    th: "การตอบสนองจาก SSO ไม่ถูกต้อง",
    en: "Invalid response from SSO.",
  },
};

export function LoginPage() {
  const { lang } = useAppShell();
  const tx = getT(lang);
  const t = tx.login;
  const searchParams = useSearchParams();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resetOpen, setResetOpen] = React.useState(false);
  const [resetIdentifier, setResetIdentifier] = React.useState("");
  const [resetError, setResetError] = React.useState<string | null>(null);
  const [resetSent, setResetSent] = React.useState(false);

  const openPasswordReset = () => {
    setResetIdentifier(u);
    setResetError(null);
    setResetSent(false);
    setResetOpen(true);
  };

  const submitPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim()) {
      setResetError(t.reset.required);
      return;
    }

    setResetError(null);
    setResetSent(true);
  };

  const errorCode = searchParams.get("error");
  const errorMsg = errorCode
    ? (SSO_ERROR_MESSAGES[errorCode]?.[lang] ??
      (lang === "th"
        ? "เกิดข้อผิดพลาดในการเข้าสู่ระบบ"
        : "Authentication error. Please try again."))
    : null;

  const startSsoLogin = () => {
    setBusy(true);
    window.location.href = "/api/auth/login";
  };

  return (
    <div className="flex min-h-screen items-stretch">
      <div className="login-hero-panel relative hidden flex-1 flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,oklch(0.5_0.14_150),oklch(0.35_0.1_145))] p-12 text-white md:flex">
        <div className="login-hero-in login-hero-in-1 relative z-10 flex items-center gap-2.5 text-lg font-semibold">
          <BrandMark size={36} inverse />
          <div>
            <div className="tracking-tight">{tx.appName}</div>
            <div className="text-[11.5px] font-normal opacity-70">
              {tx.appSub}
            </div>
          </div>
        </div>

        <div className="relative z-10 grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,38%)]">
          <div>
            <div className="login-hero-in login-hero-in-2 mb-3.5 text-[13px] font-medium uppercase tracking-wider opacity-85">
              {lang === "th" ? "บริหารสาขาง่ายขึ้น" : "Run your branch with ease"}
            </div>
            <h1 className="login-hero-in login-hero-in-3 m-0 max-w-115 text-[42px] font-semibold leading-[1.05] tracking-tight">
              {t.tagline}
            </h1>
            <div className="mt-9 flex max-w-120 flex-wrap gap-4.5">
              <Highlight
                className="login-hero-in login-hero-in-4"
                icon={TrendingUp}
                label={lang === "th" ? "ยอดขายเรียลไทม์" : "Real-time sales"}
              />
              <Highlight
                className="login-hero-in login-hero-in-5"
                icon={AlertTriangle}
                label={
                  lang === "th" ? "เตือนสต็อกอัตโนมัติ" : "Smart stock alerts"
                }
              />
              <Highlight
                className="login-hero-in login-hero-in-6"
                icon={Truck}
                label={lang === "th" ? "ติดตามการส่ง" : "Delivery tracking"}
              />
            </div>
          </div>

          <div className="login-hero-in login-hero-in-5 relative hidden aspect-[4/5] min-h-88 overflow-hidden rounded-lg border border-white/18 bg-white/10 shadow-[0_24px_70px_rgba(5,32,18,0.32)] ring-1 ring-white/10 lg:block">
            <Image
              src="/images/login-store-hero.png"
              alt={
                lang === "th"
                  ? "พนักงานตรวจสต็อกในสาขา Mini BigC"
                  : "Store staff checking inventory in a Mini BigC branch"
              }
              fill
              priority
              sizes="(min-width: 1024px) 34vw, 0px"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/22 to-transparent"
            />
          </div>
        </div>

        <div className="login-hero-in login-hero-in-7 relative z-10 text-xs opacity-60">
          {t.footer}
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col justify-center bg-background p-6 md:w-110 md:p-12">
        <div className="mx-auto w-full max-w-90">
          <div className="mb-8">
            <h2 className="m-0 text-2xl font-semibold tracking-tight">
              {t.welcomeBack}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{t.subtitle}</p>
          </div>

          <div className="flex flex-col gap-4">
            {errorMsg && (
          <div className="mb-4 rounded-md border bg-muted/60 px-3 py-2.5 text-[12px] text-muted-foreground">
            <div className="mb-1 font-semibold text-foreground">
              {lang === "th" ? "บัญชีทดสอบ" : "Mock accounts"}
            </div>
            <div className="space-y-1">
              {MOCK_EMPLOYEE_ACCOUNTS.map((account) => (
                <div key={account.employeeId} className="flex justify-between gap-3">
                  <span className="font-medium uppercase text-foreground">
                    {account.role}
                  </span>
                  <span className="mono text-right">
                    {account.employeeId} / {account.password}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3.5">
            <div>
              <Label className="mb-1.5">{t.email}</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={u}
                  onChange={(e) => setU(e.target.value)}
                  placeholder={lang === "th" ? "เช่น EMP-0421" : "e.g. EMP-0421"}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex justify-between">
                <Label className="m-0">{t.password}</Label>
                <button
                  type="button"
                  className="rounded-sm text-xs font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                  onClick={openPasswordReset}
                >
                  {t.forgot}
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={shown ? "text" : "password"}
                  value={p}
                  onChange={(e) => setP(e.target.value)}
                  placeholder="••••••••"
                  className="pl-8 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShown(!shown)}
                  className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                >
                  {shown ? (
                    <EyeOff className="size-3.5" />
                  ) : (
                    <Eye className="size-3.5" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-[13px] select-none">
              <input
                type="checkbox"
                defaultChecked
                className="accent-primary"
              />
              {t.remember}
            </label>

            {error && (
              <div
                className={cn(
                  "rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive",
                  "flex items-center gap-1.5",
                )}
              >
                <AlertCircle className="size-3.5 shrink-0" />
                {errorMsg}
              </div>
            )}

            <Button
              type="button"
              className="h-11 text-sm"
              onClick={startSsoLogin}
              disabled={busy}
            >
              {busy ? (
                <>
                  <RotateCcw className="animate-spin" />
                  {lang === "th" ? "กำลังเชื่อมต่อ SSO…" : "Connecting to SSO…"}
                </>
              ) : (
                <>
                  {t.signIn}
                  <ArrowRight />
                </>
              )}
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
              {lang === "th"
                ? "คุณจะถูกนำไปยังหน้าล็อกอินของ SSO เพื่อยืนยันตัวตน"
                : "You'll be redirected to the SSO login page to authenticate."}
            </p>
          </div>
        </div>
      </div>

      <Dialog
        open={resetOpen}
        onOpenChange={(open) => {
          setResetOpen(open);
          if (!open) {
            setResetError(null);
            setResetSent(false);
          }
        }}
      >
        <DialogContent className="gap-0 overflow-hidden rounded-lg p-0 sm:max-w-[26rem]">
          <div className="border-b bg-muted/35 px-4 py-3.5">
            <DialogHeader>
              <div className="mb-1 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="size-4" />
              </div>
              <DialogTitle className="text-base leading-6">
                {t.reset.title}
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-5">
                {t.reset.description}
              </DialogDescription>
            </DialogHeader>
          </div>

          {resetSent ? (
            <div className="px-4 py-4">
              <div
                role="status"
                className="rounded-lg border border-primary/20 bg-primary/5 p-3.5"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-primary" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {t.reset.sentTitle}
                    </div>
                    <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                      {t.reset.sentDescription}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-lg border bg-background p-3">
                <div className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                  <Headphones className="size-4 text-primary" />
                  {t.reset.supportTitle}
                </div>
                <p className="text-[13px] leading-5 text-muted-foreground">
                  {t.reset.supportDescription}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={submitPasswordReset}>
              <div className="space-y-3.5 px-4 py-4">
                <div>
                  <Label htmlFor="password-reset-identifier" className="mb-1.5">
                    {t.reset.identifierLabel}
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password-reset-identifier"
                      type="text"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder={t.reset.identifierPlaceholder}
                      className="h-9 pl-8"
                      autoFocus
                    />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {t.reset.helpText}
                  </p>
                </div>

                {resetError && (
                  <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                    <AlertCircle className="size-3.5" />
                    {resetError}
                  </div>
                )}
              </div>

              <DialogFooter className="mx-0 mb-0 flex-row justify-end rounded-none px-4 py-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 px-4"
                  onClick={() => setResetOpen(false)}
                >
                  {t.reset.cancel}
                </Button>
                <Button type="submit" className="h-9 px-4">
                  {t.reset.send}
                  <ArrowRight />
                </Button>
              </DialogFooter>
            </form>
          )}

          {resetSent && (
            <DialogFooter className="mx-0 mb-0 flex-row justify-end rounded-none px-4 py-3">
              <Button className="h-9 px-4" onClick={() => setResetOpen(false)}>
                {t.reset.done}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Highlight({
  icon: Icon,
  label,
  className,
}: {
  icon: LucideIcon;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-[13px]", className)}>
      <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm transition-transform duration-500 hover:scale-105">
        <Icon className="size-3.5" />
      </div>
      <span className="opacity-90">{label}</span>
    </div>
  );
}
