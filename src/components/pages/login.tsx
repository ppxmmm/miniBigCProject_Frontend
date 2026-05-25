"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  TrendingUp,
  AlertTriangle,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BrandMark } from "@/components/brand-mark";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/app-shell";

export function LoginPage() {
  const router = useRouter();
  const { lang } = useAppShell();
  const tx = getT(lang);
  const t = tx.login;
  const [u, setU] = React.useState("");
  const [p, setP] = React.useState("");
  const [shown, setShown] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault?.();
    if (!u || !p) {
      setError(
        lang === "th" ? "กรุณากรอกข้อมูลให้ครบ" : "Please fill in all fields",
      );
      return;
    }
    setError(null);
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-stretch">
      <div className="hidden flex-1 flex-col justify-between bg-linear-to-br from-primary to-[oklch(0.45_0.14_145)] p-12 text-white md:flex">
        <div className="flex items-center gap-2.5 text-lg font-semibold">
          <BrandMark size={36} inverse />
          <div>
            <div className="tracking-tight">{tx.appName}</div>
            <div className="text-[11.5px] font-normal opacity-70">{tx.appSub}</div>
          </div>
        </div>

        <div>
          <div className="mb-3.5 text-[13px] font-medium uppercase tracking-wider opacity-85">
            {lang === "th" ? "บริหารสาขาง่ายขึ้น" : "Run your branch with ease"}
          </div>
          <h1 className="m-0 max-w-115 text-[42px] font-semibold leading-[1.05] tracking-tight">
            {t.tagline}
          </h1>
          <div className="mt-9 flex max-w-120 gap-4.5">
            <Highlight
              icon={TrendingUp}
              label={lang === "th" ? "ยอดขายเรียลไทม์" : "Real-time sales"}
            />
            <Highlight
              icon={AlertTriangle}
              label={lang === "th" ? "เตือนสต็อกอัตโนมัติ" : "Smart stock alerts"}
            />
            <Highlight
              icon={Truck}
              label={lang === "th" ? "ติดตามการส่ง" : "Delivery tracking"}
            />
          </div>
        </div>

        <div className="text-xs opacity-60">{t.footer}</div>
      </div>

      <div className="flex w-full shrink-0 flex-col justify-center bg-background p-6 md:w-110 md:p-12">
        <div className="mx-auto w-full max-w-90">
          <div className="mb-7">
            <h2 className="m-0 text-2xl font-semibold tracking-tight">
              {t.welcomeBack}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{t.subtitle}</p>
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
                <a
                  href="#"
                  className="text-xs font-medium text-primary no-underline"
                  onClick={(e) => e.preventDefault()}
                >
                  {t.forgot}
                </a>
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
                <AlertCircle className="size-3.5" />
                {error}
              </div>
            )}

            <Button type="submit" onClick={submit} className="h-10.5 text-sm">
              {busy ? (
                <>
                  <RotateCcw />
                  {lang === "th" ? "กำลังเข้าสู่ระบบ…" : "Signing in…"}
                </>
              ) : (
                <>
                  {t.signIn}
                  <ArrowRight />
                </>
              )}
            </Button>

            <div className="my-1 flex items-center gap-2.5 text-xs text-muted-foreground">
              <Separator className="flex-1" />
              <span>{t.or}</span>
              <Separator className="flex-1" />
            </div>

            <Button variant="outline" type="button" className="h-10.5">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
                <path fill="#F25022" d="M11 11H2V2h9z" />
                <path fill="#7FBA00" d="M22 11h-9V2h9z" />
                <path fill="#00A4EF" d="M11 22H2v-9h9z" />
                <path fill="#FFB900" d="M22 22h-9v-9h9z" />
              </svg>
              {t.ssoMs}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Highlight({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-white/15">
        <Icon className="size-3.5" />
      </div>
      <span className="opacity-90">{label}</span>
    </div>
  );
}
