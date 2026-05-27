"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  RotateCcw,
  AlertCircle,
  TrendingUp,
  AlertTriangle,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
