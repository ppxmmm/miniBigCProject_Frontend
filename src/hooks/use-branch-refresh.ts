"use client";

import * as React from "react";
import { toast } from "sonner";
import { useAppShell } from "@/components/layout/app-shell";
import { useBranchData } from "@/providers/branch-data-provider";

type RefreshMessages = {
  success?: string;
  error?: string;
};

/** Minimum spin time so the refresh icon animation is visible on fast APIs. */
const MIN_REFRESH_SPIN_MS = 650;

export function useBranchRefresh(defaultMessages?: RefreshMessages) {
  const { lang } = useAppShell();
  const { refetch, isRefetching } = useBranchData();
  const [spinHold, setSpinHold] = React.useState(false);
  const isTh = lang === "th";

  const refresh = React.useCallback(
    async (messages?: RefreshMessages): Promise<boolean> => {
      setSpinHold(true);
      const started = performance.now();

      try {
        const ok = await refetch();
        const success =
          messages?.success ??
          defaultMessages?.success ??
          (isTh ? "อัปเดตข้อมูลแล้ว" : "Data refreshed");
        const errorMsg =
          messages?.error ??
          defaultMessages?.error ??
          (isTh ? "โหลดข้อมูลไม่สำเร็จ" : "Failed to refresh data");

        if (ok) toast.success(success);
        else toast.error(errorMsg);
        return ok;
      } finally {
        const remaining = MIN_REFRESH_SPIN_MS - (performance.now() - started);
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }
        setSpinHold(false);
      }
    },
    [defaultMessages, isTh, refetch],
  );

  return { refresh, loading: isRefetching || spinHold };
}
