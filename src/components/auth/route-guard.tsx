"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppShell } from "@/components/layout/app-shell";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { authReady, isAuthenticated } = useAppShell();

  React.useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authReady, isAuthenticated, router]);

  if (!authReady || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export function RedirectIfAuthenticated({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { authReady, isAuthenticated } = useAppShell();

  React.useEffect(() => {
    if (authReady && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authReady, isAuthenticated, router]);

  if (!authReady || isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
