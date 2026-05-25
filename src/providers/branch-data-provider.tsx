"use client";

import * as React from "react";
import { fetchDashboard } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/client";
import {
  getStaticBranchData,
  mapDashboardToBranchData,
} from "@/lib/api/mappers";
import type { BranchData } from "@/lib/branch-data";

type DataSource = "api" | "static";

interface BranchDataContextValue {
  data: BranchData;
  loading: boolean;
  error: string | null;
  source: DataSource;
  refetch: () => void;
}

const BranchDataContext = React.createContext<BranchDataContextValue | null>(
  null,
);

export function BranchDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<BranchData>(getStaticBranchData);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [source, setSource] = React.useState<DataSource>("static");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const api = await fetchDashboard();
      setData(mapDashboardToBranchData(api));
      setSource("api");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load branch data";
      setError(message);
      setData(getStaticBranchData());
      setSource("static");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const value = React.useMemo(
    () => ({ data, loading, error, source, refetch: load }),
    [data, loading, error, source, load],
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
