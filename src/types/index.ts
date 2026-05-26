export type Lang = "th" | "en";
export type Role = "manager" | "staff";
export type Density = "compact" | "regular" | "spacious";

export type LocalizedString = { th: string; en: string };

export interface Product {
  id?: number;
  sku: string;
  th: string;
  en: string;
  sold: number;
  value: number;
  trend: number;
}

export interface ExpiringItem {
  sku: string;
  th: string;
  en: string;
  cat: LocalizedString;
  exp: Date;
  stock: number;
  loc: string;
  price: number;
}

export interface LowStockItem {
  sku: string;
  th: string;
  en: string;
  cat: LocalizedString;
  stock: number;
  reorder: number;
  loc: string;
}

export type DeliveryStatus = "preparing" | "enRoute" | "delivered";

export interface Delivery {
  id: string;
  customer: LocalizedString;
  addr: LocalizedString;
  items: number;
  value: number;
  driver: LocalizedString;
  status: DeliveryStatus;
  eta: string;
  late: boolean;
  distance: number;
}

export interface Suggestion {
  id: string;
  icon: string;
  title: LocalizedString;
  desc: LocalizedString;
  upside: number;
  confidence: number;
  duration: LocalizedString;
  target: LocalizedString;
  type: string;
}

export interface Category {
  id?: number;
  categoryId?: number;
  th: string;
  en: string;
  v: number;
  share: number;
  trend: number;
  color: string;
}

export interface CurrentUser {
  name: string;
  initials: string;
  email: string;
  phone: string;
  employeeId: string;
  role: string;
}

export type PageId =
  | "dashboard"
  | "revenue"
  | "alerts"
  | "delivery"
  | "suggestions"
  | "profile";
