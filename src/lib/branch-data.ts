import type {
  Category,
  Delivery,
  DeliveryStatus,
  ExpiringItem,
  LocalizedString,
  LowStockItem,
  Product,
  Suggestion,
} from "@/types";

export interface StoreInfo {
  code: string;
  name: LocalizedString;
  short: LocalizedString;
  address: LocalizedString;
  manager: LocalizedString;
  managerInitials: string;
  staff: LocalizedString;
  staffInitials: string;
}

export interface PaymentShare {
  th: string;
  en: string;
  v: number;
}

export interface BranchData {
  store: StoreInfo;
  hours: number[];
  hourly: number[];
  hourlyYest: number[];
  daily: number[];
  dailyLast: number[];
  monthly: number[];
  category: Category[];
  payments: PaymentShare[];
  topProducts: Product[];
  expiring: ExpiringItem[];
  lowStock: LowStockItem[];
  deliveries: Delivery[];
  promos: Suggestion[];
  events: Suggestion[];
}

export function alertBadgeCount(data: BranchData): number {
  return data.expiring.length + data.lowStock.length;
}

export function openDeliveryBadgeCount(data: BranchData): number {
  return data.deliveries.filter((d) => d.status !== "delivered").length;
}

export function mapDeliveryStatus(status: string): DeliveryStatus {
  if (status === "enRoute" || status === "delivered" || status === "preparing") {
    return status;
  }
  return "preparing";
}
