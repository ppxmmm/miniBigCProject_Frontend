import { apiGet } from "@/lib/api/client";
import type { ApiDashboardData } from "@/types/api";
import type { Role } from "@/types";

export async function fetchDashboard(role: Role): Promise<ApiDashboardData> {
  return apiGet<ApiDashboardData>("/api/v1/dashboard", role);
}
