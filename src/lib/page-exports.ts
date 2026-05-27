import type { BranchData } from "@/lib/branch-data";
import type { Lang } from "@/types";

type RevenueSnapshot = {
  actual: number[];
  comparison: number[];
  labels: string[];
  label: { th: string; en: string };
};

export function buildRevenueExportRows(
  lang: Lang,
  branch: BranchData,
  range: string,
  snapshot: RevenueSnapshot,
  summary: {
    total: number;
    comparisonTotal: number;
    gap: number;
    gapPct: number;
    transactions: number;
    avgBasket: number;
  },
): (string | number)[][] {
  const rows: (string | number)[][] = [
    ["Store", branch.store.name[lang]],
    ["Range", range],
    ["Period", snapshot.label[lang]],
    ["Total sales", summary.total],
    ["Comparison sales", summary.comparisonTotal],
    ["Gap", summary.gap],
    ["Gap %", summary.gapPct],
    ["Transactions (est.)", summary.transactions],
    ["Avg basket (est.)", summary.avgBasket],
    [],
    ["Label", "Actual", "Comparison"],
    ...snapshot.labels.map((label, index) => [
      label,
      snapshot.actual[index] ?? "",
      snapshot.comparison[index] ?? "",
    ]),
    [],
    ["SKU", "Product", "Sales", "Trend %"],
    ...branch.topProducts.map((product) => [
      product.sku,
      product[lang],
      product.value,
      product.trend,
    ]),
    [],
    ["Category (TH)", "Category (EN)", "Sales", "Trend %"],
    ...branch.category.map((category) => [
      category.th,
      category.en,
      category.v,
      category.trend,
    ]),
    [],
    ["Payment (TH)", "Payment (EN)", "Share %"],
    ...branch.payments.map((payment) => [
      payment.th,
      payment.en,
      payment.share,
    ]),
  ];
  return rows;
}

export function buildDashboardExportRows(
  facts: { title: string; stat: string; statLabel: string; delta?: number }[],
  insights: { title: string; desc: string }[],
): (string | number)[][] {
  return [
    ["Metric", "Value", "Label", "Delta"],
    ...facts.map((fact) => [
      fact.title,
      fact.stat,
      fact.statLabel,
      fact.delta ?? "",
    ]),
    [],
    ["Insight", "Description"],
    ...insights.map((insight) => [insight.title, insight.desc]),
  ];
}

export function buildAlertsExportRows(
  lang: Lang,
  branch: BranchData,
  oosItems: {
    sku: string;
    th: string;
    en: string;
    stock: number;
    reorder: number;
    loc: string;
    lostSales: number;
    eta: string;
  }[],
  expiring: {
    sku: string;
    th: string;
    en: string;
    daysLeft: number;
    stock: number;
    valueAtRisk: number;
  }[],
): (string | number)[][] {
  return [
    ["Store", branch.store.name[lang]],
    ["OSA %", branch.topProducts.length + branch.lowStock.length > 0
      ? (branch.topProducts.length /
          (branch.topProducts.length + branch.lowStock.length)) *
        100
      : 0],
    [],
    ["OOS — SKU", "Product", "Stock", "Reorder", "Location", "Lost sales est.", "ETA"],
    ...oosItems.map((item) => [
      item.sku,
      item[lang],
      item.stock,
      item.reorder,
      item.loc,
      item.lostSales,
      item.eta,
    ]),
    [],
    ["Expiring — SKU", "Product", "Days left", "Stock", "Value at risk"],
    ...expiring.map((item) => [
      item.sku,
      item[lang],
      item.daysLeft,
      item.stock,
      item.valueAtRisk,
    ]),
  ];
}

export function buildSuggestionsExportRows(
  lang: Lang,
  branch: BranchData,
  actions: {
    id: string;
    title: { th: string; en: string };
    upside: number;
    confidence: number;
    owner: { th: string; en: string };
    window: { th: string; en: string };
  }[],
): (string | number)[][] {
  return [
    ["Store", branch.store.short[lang]],
    [],
    ["ID", "Action", "Upside", "Confidence", "Owner", "Window"],
    ...actions.map((action) => [
      action.id,
      action.title[lang],
      action.upside,
      action.confidence,
      action.owner[lang],
      action.window[lang],
    ]),
  ];
}

export function buildJointCommitExportRows(
  fields: { label: string; value: string }[],
  lang: Lang,
  branch: BranchData,
): (string | number)[][] {
  return [
    ["Store", branch.store.name[lang]],
    [],
    ["Field", "Value"],
    ...fields.map((field) => [field.label, field.value]),
  ];
}
