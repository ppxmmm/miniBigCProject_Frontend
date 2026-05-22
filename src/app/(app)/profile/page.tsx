"use client";

import { useState } from "react";
import { Check, Edit, Mail, Phone, Shield, Store, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const user = {
  name: "ปริญญา ทวีศักดิ์",
  role: "ผู้จัดการสาขา",
  email: "parinya.t@minibigc.example",
  phone: "+66 81 234 5678",
  employeeId: "EMP-0421-M",
  branch: "มินิ บิ๊กซี สาขาทองหล่อ ซอย 13",
  initials: "PT",
};

export default function ProfilePage() {
  const [twoFa, setTwoFa] = useState(true);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">โปรไฟล์ของฉัน</h1>
        <p className="text-muted-foreground mt-1 text-sm">ข้อมูลส่วนตัวและความปลอดภัย</p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-5 pt-6">
          <Avatar className="size-16 rounded-full">
            <AvatarFallback className="bg-accent text-accent-foreground text-xl font-semibold">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-semibold tracking-tight">{user.name}</div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {user.role} · <span className="font-mono">{user.employeeId}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="secondary" className="gap-1">
                <Store className="size-3" /> ทองหล่อ ซ.13
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Check className="size-3" /> ยืนยันแล้ว
              </Badge>
            </div>
          </div>
          <Button variant="outline">
            <Edit /> แก้ไข
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">ข้อมูลส่วนตัว</TabsTrigger>
          <TabsTrigger value="security">ความปลอดภัย</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="ชื่อ-นามสกุล" defaultValue={user.name} />
                <Field
                  label="อีเมล"
                  defaultValue={user.email}
                  icon={<Mail className="size-4" />}
                  type="email"
                />
                <Field
                  label="เบอร์โทร"
                  defaultValue={user.phone}
                  icon={<Phone className="size-4" />}
                />
                <Field label="รหัสพนักงาน" defaultValue={user.employeeId} mono />
                <Field label="ตำแหน่ง" defaultValue={user.role} disabled />
                <Field label="สาขา" defaultValue={user.branch} disabled />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost">ยกเลิก</Button>
                <Button>บันทึก</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">เปลี่ยนรหัสผ่าน</CardTitle>
              <CardDescription>เปลี่ยนล่าสุด · 28 เม.ย. 2026</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">เปลี่ยนรหัสผ่าน</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">การยืนยันสองชั้น</CardTitle>
                <CardDescription>ปกป้องบัญชีของคุณด้วยรหัสจากแอป</CardDescription>
              </div>
              <Switch checked={twoFa} onCheckedChange={setTwoFa} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3.5 text-sm">
                <Shield
                  className={twoFa ? "text-primary size-5" : "text-muted-foreground size-5"}
                />
                <div className="flex-1">
                  {twoFa
                    ? "เปิดใช้งานอยู่ · เชื่อมต่อกับ Google Authenticator"
                    : "ยังไม่ได้เปิดใช้งาน — แนะนำให้เปิดเพื่อความปลอดภัย"}
                </div>
                {twoFa && (
                  <Button variant="ghost" size="sm">
                    ตั้งค่าใหม่
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">เซสชันที่ใช้งานอยู่</CardTitle>
              <CardDescription>อุปกรณ์ที่เข้าสู่ระบบบัญชีนี้</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <SessionRow
                device="MacBook Pro · ทองหล่อ"
                ip="118.172.49.x"
                current
              />
              <SessionRow
                device="iPhone 15 · กรุงเทพฯ"
                ip="171.97.32.x"
                time="2 ชม. ที่แล้ว"
              />
              <SessionRow
                device="เครื่อง POS-04"
                ip="10.0.4.7"
                time="6 ชม. ที่แล้ว"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  icon,
  type = "text",
  mono,
  disabled,
}: {
  label: string;
  defaultValue: string;
  icon?: React.ReactNode;
  type?: string;
  mono?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <Input
          type={type}
          defaultValue={defaultValue}
          disabled={disabled}
          className={`${icon ? "pl-9" : ""} ${mono ? "font-mono" : ""}`}
        />
      </div>
    </div>
  );
}

function SessionRow({
  device,
  ip,
  current,
  time,
}: {
  device: string;
  ip: string;
  current?: boolean;
  time?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <UserIcon className="size-4" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{device}</div>
        <div className="text-xs text-muted-foreground font-mono">{ip}</div>
      </div>
      {current ? (
        <Badge className="bg-primary/10 text-primary border-transparent">ปัจจุบัน</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">{time}</span>
      )}
    </div>
  );
}
