"use client";

import * as React from "react";
import { fetchDashboard } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/client";
import { readAuthRole, subscribeAuthRole } from "@/lib/auth-session";
import { mapDashboardToBranchData } from "@/lib/api/mappers";
import { createEmptyBranchData, type BranchData } from "@/lib/branch-data";
import type { Role } from "@/types";

interface BranchDataContextValue {
  data: BranchData;
  loading: boolean;
  isRefetching: boolean;
  error: string | null;
  lastFetchedAt: Date | null;
  refetch: () => Promise<boolean>;
}

const BranchDataContext = React.createContext<BranchDataContextValue | null>(
  null,
);

export function BranchDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = React.useState<BranchData>(createEmptyBranchData);
  const [loading, setLoading] = React.useState(true);
  const [isRefetching, setIsRefetching] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = React.useState<Date | null>(null);
  const authRole = React.useSyncExternalStore(
    subscribeAuthRole,
    readAuthRole,
    () => null,
  );

  const load = React.useCallback(
    async (role: Role, options?: { refetch?: boolean }): Promise<boolean> => {
      const isRefetch = options?.refetch ?? false;
      if (isRefetch) {
        setIsRefetching(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const api = await fetchDashboard(role);
        setData(mapDashboardToBranchData(api));
        setLastFetchedAt(new Date());
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load branch data";
        setError(message);
        return false;
      } finally {
        if (isRefetch) {
          setIsRefetching(false);
        } else {
          setLoading(false);
        }
      }
    },
    [],
  );

  React.useEffect(() => {
    if (!authRole) {
      setLoading(false);
      return;
    }
    void load(authRole);
  }, [authRole, load]);

  const refetch = React.useCallback(async (): Promise<boolean> => {
    const role = readAuthRole();
    if (!role) {
      setError("Not signed in");
      return false;
    }
    return load(role, { refetch: true });
  }, [load]);

  const value = React.useMemo(
    () => ({ data, loading, isRefetching, error, lastFetchedAt, refetch }),
    [data, loading, isRefetching, error, lastFetchedAt, refetch],
  );

  return (
    <BranchDataContext.Provider value={value}>
      {children}
    </BranchDataContext.Provider>
  );
}

export function useBranchData() {
  const context = React.useContext(BranchDataContext);
  if (!context) {
    throw new Error("useBranchData must be used within BranchDataProvider");
  }
  return context;
}
