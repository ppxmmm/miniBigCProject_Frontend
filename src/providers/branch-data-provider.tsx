"use client";

import * as React from "react";
import { fetchDashboard } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/client";
import { mapDashboardToBranchData } from "@/lib/api/mappers";
import { createEmptyBranchData, type BranchData } from "@/lib/branch-data";

interface BranchDataContextValue {
  data: BranchData;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<boolean>;
}

const BranchDataContext = React.createContext<BranchDataContextValue | null>(
  null,
);

export function BranchDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<BranchData>(createEmptyBranchData);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const api = await fetchDashboard();
      setData(mapDashboardToBranchData(api));
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
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const value = React.useMemo(
    () => ({ data, loading, error, refetch: load }),
    [data, loading, error, load],
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
