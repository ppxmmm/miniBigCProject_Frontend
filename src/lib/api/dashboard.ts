import { apiGet } from "@/lib/api/client";
import type { ApiDashboardData, ApiStore } from "@/types/api";
import type { Role } from "@/types";

export async function fetchDashboard(
  role: Role,
  storeId?: number,
): Promise<ApiDashboardData> {
  const path = storeId
    ? `/api/v1/stores/${storeId}/dashboard`
    : "/api/v1/dashboard";

  return apiGet<ApiDashboardData>(path, role);
}

export async function fetchStores(role: Role): Promise<ApiStore[]> {
  return apiGet<ApiStore[]>("/api/v1/stores", role);
}
