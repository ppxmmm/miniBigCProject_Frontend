"use client";

import * as React from "react";
import { toast } from "sonner";
import { useAppShell } from "@/components/layout/app-shell";
import { useBranchData } from "@/providers/branch-data-provider";

type RefreshMessages = {
  success?: string;
  error?: string;
};

export function useBranchRefresh(defaultMessages?: RefreshMessages) {
  const { lang } = useAppShell();
  const { refetch, isRefetching } = useBranchData();
  const isTh = lang === "th";

  const refresh = React.useCallback(
    async (messages?: RefreshMessages): Promise<boolean> => {
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
    },
    [defaultMessages, isTh, refetch],
  );

  return { refresh, loading: isRefetching };
}
