import type { BranchData } from "@/lib/branch-data";
import { mapDeliveryStatus } from "@/lib/branch-data";
import type { ApiDashboardData } from "@/types/api";

function parseDate(value: string): Date {
  return new Date(value);
}

function formatEta(time: string): string {
  if (!time) return "";
  return time.length >= 5 ? time.slice(0, 5) : time;
}

export function mapDashboardToBranchData(api: ApiDashboardData): BranchData {
  const store = api.store;

  const hourlySorted = [...api.hourly_sales].sort((a, b) => a.hour - b.hour);
  const hours = hourlySorted.map((row) => row.hour);
  const hourly = hourlySorted.map((row) => row.sales_value);
  const hourlyYest = hourlySorted.map((row) => row.comparison_sales_value);

  const dailySorted = [...api.daily_sales].sort(
    (a, b) => new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime(),
  );
  const daily = dailySorted.map((row) => row.sales_value);
  const dailyLast = dailySorted.map((row) => row.comparison_sales_value);

  const monthlySorted = [...api.monthly_sales].sort(
    (a, b) => a.year - b.year || a.month - b.month,
  );
  const monthly = monthlySorted.map((row) => row.sales_value);

  const promos = api.suggestions
    .filter((s) => s.kind === "promo")
    .map((s) => ({
      id: s.id,
      icon: s.icon,
      title: { th: s.title_th, en: s.title_en },
      desc: { th: s.description_th, en: s.description_en },
      upside: s.upside_value,
      confidence: s.confidence,
      duration: { th: s.duration_th, en: s.duration_en },
      target: { th: s.target_th, en: s.target_en },
      type: s.type,
    }));

  const events = api.suggestions
    .filter((s) => s.kind === "event")
    .map((s) => ({
      id: s.id,
      icon: s.icon,
      title: { th: s.title_th, en: s.title_en },
      desc: { th: s.description_th, en: s.description_en },
      upside: s.upside_value,
      confidence: s.confidence,
      duration: { th: s.duration_th, en: s.duration_en },
      target: { th: s.target_th, en: s.target_en },
      type: s.type,
    }));

  return {
    id: store.id,
    store: {
      code: store.code,
      name: { th: store.name_th, en: store.name_en },
      short: { th: store.short_name_th, en: store.short_name_en },
      address: { th: store.address_th, en: store.address_en },
      manager: { th: store.manager_name_th, en: store.manager_name_en },
      managerInitials: store.manager_initials,
      staff: { th: store.staff_name_th, en: store.staff_name_en },
      staffInitials: store.staff_initials,
    },
    hours,
    hourly,
    hourlyYest,
    daily,
    dailyLast,
    monthly,
    category: api.category_sales.map((c) => ({
      id: c.id,
      categoryId: c.category_id,
      th: c.name_th,
      en: c.name_en,
      v: c.sales_value,
      share: c.share,
      trend: c.trend_percent,
      color: c.color,
    })),
    payments: api.payment_mix.map((p) => ({
      id: p.id,
      paymentMethodId: p.payment_method_id,
      th: p.name_th,
      en: p.name_en,
      v: p.share,
    })),
    topProducts: api.top_products.map((p) => ({
      id: p.id,
      sku: p.sku,
      th: p.name_th,
      en: p.name_en,
      sold: p.sold_quantity,
      value: p.sales_value,
      trend: p.trend_percent,
    })),
    expiring: api.expiring_inventory.map((e) => ({
      sku: e.sku,
      th: e.name_th,
      en: e.name_en,
      cat: { th: e.category_th, en: e.category_en },
      exp: parseDate(e.expiry_date),
      stock: e.stock_quantity,
      loc: e.location_code,
      price: e.price,
    })),
    lowStock: api.low_stock_alerts.map((l) => ({
      sku: l.sku,
      th: l.name_th,
      en: l.name_en,
      cat: { th: l.category_th, en: l.category_en },
      stock: l.stock_quantity,
      reorder: l.reorder_quantity,
      loc: l.location_code,
    })),
    deliveries: api.deliveries.map((d) => ({
      id: d.id,
      customer: { th: d.customer_name_th, en: d.customer_name_en },
      addr: { th: d.address_th, en: d.address_en },
      items: d.item_count,
      value: d.order_value,
      driver: { th: d.driver_name_th, en: d.driver_name_en },
      status: mapDeliveryStatus(d.status),
      eta: formatEta(d.eta_time),
      late: d.is_late,
      distance: d.distance_km,
    })),
    promos,
    events,
  };
}
