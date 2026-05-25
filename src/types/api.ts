/** JSON shapes returned by the Go API (`/api/v1/dashboard`). */

export interface ApiStore {
  id: number;
  code: string;
  name_th: string;
  name_en: string;
  short_name_th: string;
  short_name_en: string;
  address_th: string;
  address_en: string;
  manager_name_th: string;
  manager_name_en: string;
  manager_initials: string;
  staff_name_th: string;
  staff_name_en: string;
  staff_initials: string;
}

export interface ApiHourlySale {
  id: number;
  store_id: number;
  sale_date: string;
  hour: number;
  sales_value: number;
  comparison_sales_value: number;
}

export interface ApiDailySale {
  id: number;
  store_id: number;
  sale_date: string;
  sales_value: number;
  comparison_sales_value: number;
}

export interface ApiMonthlySale {
  id: number;
  store_id: number;
  year: number;
  month: number;
  sales_value: number;
}

export interface ApiCategorySale {
  id: number;
  store_id: number;
  category_id: number;
  name_th: string;
  name_en: string;
  color: string;
  sales_date: string;
  sales_value: number;
  share: number;
  trend_percent: number;
}

export interface ApiPaymentMix {
  id: number;
  store_id: number;
  sales_date: string;
  payment_method_id: number;
  name_th: string;
  name_en: string;
  share: number;
}

export interface ApiTopProduct {
  id: number;
  store_id: number;
  sku: string;
  name_th: string;
  name_en: string;
  sales_date: string;
  sold_quantity: number;
  sales_value: number;
  trend_percent: number;
}

export interface ApiExpiringInventoryItem {
  id: number;
  store_id: number;
  sku: string;
  name_th: string;
  name_en: string;
  category_id: number;
  category_th: string;
  category_en: string;
  expiry_date: string;
  stock_quantity: number;
  location_code: string;
  price: number;
}

export interface ApiLowStockAlert {
  id: number;
  store_id: number;
  sku: string;
  name_th: string;
  name_en: string;
  category_id: number;
  category_th: string;
  category_en: string;
  stock_quantity: number;
  reorder_quantity: number;
  location_code: string;
}

export interface ApiDelivery {
  id: string;
  store_id: number;
  customer_name_th: string;
  customer_name_en: string;
  address_th: string;
  address_en: string;
  item_count: number;
  order_value: number;
  driver_name_th: string;
  driver_name_en: string;
  status: string;
  eta_time: string;
  is_late: boolean;
  distance_km: number;
}

export interface ApiSuggestion {
  id: string;
  store_id: number;
  kind: string;
  icon: string;
  title_th: string;
  title_en: string;
  description_th: string;
  description_en: string;
  upside_value: number;
  confidence: number;
  duration_th: string;
  duration_en: string;
  target_th: string;
  target_en: string;
  type: string;
}

export interface ApiDashboardData {
  store: ApiStore;
  hourly_sales: ApiHourlySale[];
  daily_sales: ApiDailySale[];
  monthly_sales: ApiMonthlySale[];
  category_sales: ApiCategorySale[];
  payment_mix: ApiPaymentMix[];
  top_products: ApiTopProduct[];
  inventory_items: unknown[];
  expiring_inventory: ApiExpiringInventoryItem[];
  low_stock_alerts: ApiLowStockAlert[];
  deliveries: ApiDelivery[];
  suggestions: ApiSuggestion[];
}
