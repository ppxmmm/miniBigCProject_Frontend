"use client";

import * as React from "react";
import { fetchDashboard, fetchStores } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/client";
import { readAuthRole, subscribeAuthRole } from "@/lib/auth-session";
import {
  mapDashboardToBranchData,
  mapStoreToBranchOption,
} from "@/lib/api/mappers";
import {
  createEmptyBranchData,
  type BranchData,
  type BranchOption,
} from "@/lib/branch-data";
import type { Role } from "@/types";

const SELECTED_BRANCH_KEY = "minibigc.selectedBranchId";

interface BranchDataContextValue {
  data: BranchData;
  branches: BranchOption[];
  selectedBranchId: number | null;
  loading: boolean;
  isRefetching: boolean;
  error: string | null;
  lastFetchedAt: Date | null;
  selectBranch: (branchId: number) => Promise<boolean>;
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
  const [branches, setBranches] = React.useState<BranchOption[]>([]);
  const [selectedBranchId, setSelectedBranchId] = React.useState<number | null>(
    null,
  );
  const [loading, setLoading] = React.useState(false);
  const [isRefetching, setIsRefetching] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = React.useState<Date | null>(null);
  const latestRequestRef = React.useRef(0);
  const authRole = React.useSyncExternalStore(
    subscribeAuthRole,
    readAuthRole,
    () => null,
  );

  const load = React.useCallback(
    async (
      role: Role,
      options?: { refetch?: boolean; storeId?: number | null },
    ): Promise<boolean> => {
      const isRefetch = options?.refetch ?? false;
      const requestId = latestRequestRef.current + 1;
      latestRequestRef.current = requestId;

      if (isRefetch) {
        setIsRefetching(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        let nextStoreId = options?.storeId ?? null;
        let nextBranches: BranchOption[] = [];

        if (role === "manager") {
          const stores = await fetchStores(role);
          nextBranches = stores.map(mapStoreToBranchOption);
          const storedStoreId = readSelectedBranchId();
          nextStoreId =
            nextStoreId ??
            (storedStoreId != null &&
            nextBranches.some((branch) => branch.id === storedStoreId)
              ? storedStoreId
              : nextBranches[0]?.id ?? null);
        }

        const api = await fetchDashboard(role, nextStoreId ?? undefined);
        const nextData = mapDashboardToBranchData(api);
        const resolvedBranches =
          role === "manager"
            ? nextBranches
            : [mapStoreToBranchOption(api.store)];
        const resolvedStoreId = nextData.id ?? nextStoreId;

        if (requestId !== latestRequestRef.current) {
          return false;
        }

        setBranches(resolvedBranches);
        setSelectedBranchId(resolvedStoreId ?? null);
        if (role === "manager" && resolvedStoreId != null) {
          writeSelectedBranchId(resolvedStoreId);
        }
        setData(nextData);
        setLastFetchedAt(new Date());
        return true;
      } catch (err) {
        if (requestId !== latestRequestRef.current) {
          return false;
        }
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
      return;
    }
    void Promise.resolve().then(() => load(authRole));
  }, [authRole, load]);

  const refetch = React.useCallback(async (): Promise<boolean> => {
    const role = readAuthRole();
    if (!role) {
      setError("Not signed in");
      return false;
    }
    return load(role, { refetch: true, storeId: selectedBranchId });
  }, [load, selectedBranchId]);

  const selectBranch = React.useCallback(
    async (branchId: number): Promise<boolean> => {
      const role = readAuthRole();
      if (!role) {
        setError("Not signed in");
        return false;
      }
      if (role !== "manager") {
        setError("Only managers can switch branches");
        return false;
      }

      setSelectedBranchId(branchId);
      writeSelectedBranchId(branchId);
      return load(role, { storeId: branchId });
    },
    [load],
  );

  const value = React.useMemo(
    () => ({
      data,
      branches,
      selectedBranchId,
      loading,
      isRefetching,
      error,
      lastFetchedAt,
      selectBranch,
      refetch,
    }),
    [
      data,
      branches,
      selectedBranchId,
      loading,
      isRefetching,
      error,
      lastFetchedAt,
      selectBranch,
      refetch,
    ],
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

function readSelectedBranchId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(SELECTED_BRANCH_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function writeSelectedBranchId(branchId: number): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SELECTED_BRANCH_KEY, String(branchId));
}
