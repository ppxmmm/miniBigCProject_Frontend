"use client";

import dynamic from "next/dynamic";

const MiniBigCManagerConsole = dynamic(
  () => import("@/components/mini-bigc-manager-console"),
  { ssr: false },
);

export function ManagerConsoleLoader() {
  return <MiniBigCManagerConsole />;
}
