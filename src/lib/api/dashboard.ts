import { apiGet } from "@/lib/api/client";
import type { ApiDashboardData } from "@/types/api";

export async function fetchDashboard(): Promise<ApiDashboardData> {
  return apiGet<ApiDashboardData>("/api/v1/dashboard");
}
