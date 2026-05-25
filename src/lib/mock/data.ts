import { dPlus } from "@/lib/format";
import type {
  Category,
  Delivery,
  ExpiringItem,
  LowStockItem,
  Product,
  Suggestion,
} from "@/types";

export const STORE = {
  code: "MBC-0421",
  name: {
    th: "มินิ บิ๊กซี สาขาทองหล่อ ซอย 13",
    en: "Mini BigC · Thonglor Soi 13",
  },
  short: { th: "ทองหล่อ ซ.13", en: "Thonglor 13" },
  address: {
    th: "121/4 ซ.สุขุมวิท 55, แขวงคลองตันเหนือ, วัฒนา, กรุงเทพฯ 10110",
    en: "121/4 Sukhumvit 55, Khlong Tan Nuea, Watthana, Bangkok 10110",
  },
  manager: { th: "ปริญญา ทวีศักดิ์", en: "Parinya Taweesak" },
  managerInitials: "PT",
  staff: { th: "ณัฐวุฒิ สมบูรณ์", en: "Nattawut Somboon" },
  staffInitials: "NS",
} as const;

// Hourly today (06:00 → 23:00)
export const HOURS = Array.from({ length: 18 }, (_, i) => i + 6);
export const HOURLY = [
  3200, 4100, 5800, 8400, 11200, 9800, 12400, 15600, 14200, 11800, 9400, 13200,
  18900, 21400, 19200, 14800, 11600, 8200,
];
export const HOURLY_YEST = [
  2900, 3800, 5200, 7900, 10400, 9100, 11600, 14200, 13100, 10800, 8900, 12100,
  17400, 19800, 17600, 13900, 10900, 7800,
];
export const DAILY = [184000, 168000, 192000, 211000, 248000, 296000, 264000];
export const DAILY_LAST = [172000, 161000, 178000, 199000, 226000, 274000, 248000];
export const MONTHLY = [5.42, 5.18, 5.96, 6.18, 6.74, 6.92, 7.18, 7.04, 6.88, 7.32, 7.86, 8.14].map(
  (v) => v * 1e6,
);

export const CATEGORY: Category[] = [
  { th: "อาหารและเครื่องดื่ม", en: "Food & Beverage", v: 142800, share: 0.38, trend: 6.2, color: "oklch(0.58 0.16 150)" },
  { th: "ของใช้ในบ้าน", en: "Household", v: 78400, share: 0.21, trend: -2.1, color: "oklch(0.62 0.14 200)" },
  { th: "ของใช้ส่วนตัว", en: "Personal Care", v: 56200, share: 0.15, trend: 4.8, color: "oklch(0.62 0.14 280)" },
  { th: "ขนมและของว่าง", en: "Snacks", v: 49100, share: 0.13, trend: 11.3, color: "oklch(0.72 0.15 65)" },
  { th: "อาหารแช่แข็ง", en: "Frozen", v: 28400, share: 0.075, trend: -1.4, color: "oklch(0.66 0.14 320)" },
  { th: "อื่น ๆ", en: "Other", v: 21100, share: 0.055, trend: 2.0, color: "oklch(0.70 0.04 95)" },
];

export const PAYMENTS = [
  { th: "เงินสด", en: "Cash", v: 0.38 },
  { th: "พร้อมเพย์ / QR", en: "PromptPay / QR", v: 0.34 },
  { th: "บัตรเครดิต", en: "Credit card", v: 0.18 },
  { th: "เดบิต", en: "Debit", v: 0.07 },
  { th: "True Money / Wallet", en: "True Money / Wallet", v: 0.03 },
];

export const TOP_PRODUCTS: Product[] = [
  { sku: "FB-0102", th: "ลีโอ เบียร์ กระป๋อง 320 มล.", en: "Leo beer can 320ml", sold: 184, value: 9568, trend: 12 },
  { sku: "FB-2284", th: "เลย์ คลาสสิค 75 ก.", en: "Lays Classic 75g", sold: 162, value: 4374, trend: 8 },
  { sku: "FB-0411", th: "นมไทย-เดนมาร์ค จืด 200 มล.", en: "Foremost milk plain 200ml", sold: 148, value: 2516, trend: 5 },
  { sku: "FB-0099", th: "น้ำดื่ม คริสตัล 600 มล. (6 ขวด)", en: "Crystal water 600ml × 6", sold: 121, value: 8470, trend: -2 },
  { sku: "PC-0331", th: "หน้ากากอนามัย 4 ชั้น (50 ชิ้น)", en: "Surgical mask 4-ply × 50", sold: 96, value: 11520, trend: 18 },
  { sku: "HH-1820", th: "ผงซักฟอก เปา 800 ก.", en: "Pao detergent 800g", sold: 88, value: 7392, trend: 3 },
];

export const EXPIRING: ExpiringItem[] = [
  { sku: "FB-0411", th: "นมไทย-เดนมาร์ค จืด 200 มล.", en: "Foremost milk 200ml", cat: { th: "อาหาร", en: "Food" }, exp: dPlus(1), stock: 24, loc: "F-12-B", price: 17 },
  { sku: "FB-1140", th: "ขนมปังฟาร์มเฮ้าส์ โฮลวีท", en: "Farmhouse wholewheat bread", cat: { th: "อาหาร", en: "Food" }, exp: dPlus(2), stock: 11, loc: "A-04-C", price: 45 },
  { sku: "FB-0822", th: "ไส้กรอกบีทาโกร 250 ก.", en: "Betagro sausage 250g", cat: { th: "แช่เย็น", en: "Chilled" }, exp: dPlus(3), stock: 18, loc: "C-01-A", price: 89 },
  { sku: "FB-1990", th: "โยเกิร์ตดัชชี่ รสกล้วยหอม", en: "Dutchie banana yoghurt", cat: { th: "แช่เย็น", en: "Chilled" }, exp: dPlus(0), stock: 6, loc: "C-02-A", price: 19 },
  { sku: "FB-2210", th: "ส้มสายน้ำผึ้ง 1 กก.", en: "Honey oranges 1kg", cat: { th: "ผัก-ผลไม้", en: "Produce" }, exp: dPlus(2), stock: 14, loc: "P-01-A", price: 79 },
  { sku: "FB-3084", th: "เต้าหู้ขาวอ่อน คาวบอย", en: "Cowboy soft tofu", cat: { th: "แช่เย็น", en: "Chilled" }, exp: dPlus(4), stock: 22, loc: "C-03-B", price: 18 },
  { sku: "FB-0188", th: "น้ำพริกแม่ประนอม", en: "Mae Pranom chilli paste", cat: { th: "อาหาร", en: "Food" }, exp: dPlus(6), stock: 9, loc: "A-09-D", price: 32 },
];

export const LOW_STOCK: LowStockItem[] = [
  { sku: "PC-0331", th: "หน้ากากอนามัย 4 ชั้น (50 ชิ้น)", en: "Surgical mask 4-ply × 50", cat: { th: "ของใช้ส่วนตัว", en: "Personal" }, stock: 4, reorder: 30, loc: "G-02-A" },
  { sku: "HH-1820", th: "ผงซักฟอก เปา 800 ก.", en: "Pao detergent 800g", cat: { th: "ของใช้บ้าน", en: "Household" }, stock: 7, reorder: 24, loc: "H-04-B" },
  { sku: "FB-0099", th: "น้ำดื่มคริสตัล 600 มล. (6 ขวด)", en: "Crystal water 600ml × 6", cat: { th: "เครื่องดื่ม", en: "Beverage" }, stock: 12, reorder: 36, loc: "B-01-A" },
  { sku: "PC-0470", th: "ผ้าอนามัยลอริเอะ ขนาดกลาง", en: "Laurier sanitary pads M", cat: { th: "ของใช้ส่วนตัว", en: "Personal" }, stock: 5, reorder: 18, loc: "G-05-B" },
  { sku: "FB-2284", th: "เลย์ คลาสสิค 75 ก.", en: "Lays Classic 75g", cat: { th: "ขนม", en: "Snacks" }, stock: 18, reorder: 40, loc: "S-02-A" },
  { sku: "HH-2201", th: "กระดาษทิชชู่ Cellox 12 ม้วน", en: "Cellox tissue × 12", cat: { th: "ของใช้บ้าน", en: "Household" }, stock: 3, reorder: 15, loc: "H-06-C" },
];

export const DELIVERIES: Delivery[] = [
  { id: "BC-26052201", customer: { th: "คุณณัฐกานต์ ม.", en: "K. Natthakarn M." }, addr: { th: "ทองหล่อ ซ.10", en: "Thonglor Soi 10" }, items: 8, value: 487, driver: { th: "วินัย", en: "Winai" }, status: "enRoute", eta: "14:25", late: false, distance: 1.2 },
  { id: "BC-26052202", customer: { th: "คุณปานทิพย์ ส.", en: "K. Panthip S." }, addr: { th: "เอกมัย ซ.12", en: "Ekkamai Soi 12" }, items: 22, value: 1284, driver: { th: "สมชาย", en: "Somchai" }, status: "enRoute", eta: "14:35", late: true, distance: 2.4 },
  { id: "BC-26052203", customer: { th: "คุณภาสกร ว.", en: "K. Phasakorn W." }, addr: { th: "ทองหล่อ ซ.5", en: "Thonglor Soi 5" }, items: 14, value: 892, driver: { th: "บุญส่ง", en: "Boonsong" }, status: "preparing", eta: "15:00", late: false, distance: 0.8 },
  { id: "BC-26052204", customer: { th: "คุณกัลยา ก.", en: "K. Kanlaya K." }, addr: { th: "พร้อมพงษ์", en: "Phrom Phong" }, items: 31, value: 1872, driver: { th: "วินัย", en: "Winai" }, status: "preparing", eta: "15:15", late: false, distance: 1.8 },
  { id: "BC-26052205", customer: { th: "คุณธีรพล ต.", en: "K. Teeraphol T." }, addr: { th: "ทองหล่อ ซ.8", en: "Thonglor Soi 8" }, items: 6, value: 320, driver: { th: "สมชาย", en: "Somchai" }, status: "delivered", eta: "13:50", late: false, distance: 1.0 },
  { id: "BC-26052206", customer: { th: "คุณวรินทร ก.", en: "K. Warintorn K." }, addr: { th: "เอกมัย ซ.4", en: "Ekkamai Soi 4" }, items: 12, value: 654, driver: { th: "บุญส่ง", en: "Boonsong" }, status: "delivered", eta: "13:20", late: false, distance: 2.0 },
  { id: "BC-26052207", customer: { th: "คุณพิชชา ม.", en: "K. Phichcha M." }, addr: { th: "ทองหล่อ ซ.23", en: "Thonglor Soi 23" }, items: 4, value: 198, driver: { th: "วินัย", en: "Winai" }, status: "delivered", eta: "12:45", late: false, distance: 1.5 },
];

export const PROMOS: Suggestion[] = [
  {
    id: "p1",
    icon: "flame",
    title: { th: "ลด 30% ขนมปังฟาร์มเฮ้าส์ใกล้หมดอายุ", en: "30% off Farmhouse bread near expiry" },
    desc: {
      th: "มีสินค้า 11 ชิ้นที่หมดอายุภายใน 2 วัน ลดราคา 30% ภายในวันนี้คาดว่าจะลดมูลค่าสูญเสียได้ ฿245",
      en: "11 units expire in 2 days. A 30% same-day markdown would recover an estimated ฿245",
    },
    upside: 245,
    confidence: 0.92,
    duration: { th: "1 วัน", en: "1 day" },
    target: { th: "ลูกค้าทุกคน", en: "All customers" },
    type: "markdown",
  },
  {
    id: "p2",
    icon: "gift",
    title: { th: "ซื้อ 2 แถม 1 — บะหมี่กึ่งสำเร็จรูป", en: "Buy 2 get 1 free — instant noodles" },
    desc: {
      th: "ยอดขายบะหมี่ MAMA เพิ่ม 23% ในสัปดาห์นี้ จับคู่กับสินค้าเสริมเพื่อเพิ่มขนาดบิล",
      en: "MAMA noodle sales up 23% this week. Bundle to lift basket size",
    },
    upside: 1840,
    confidence: 0.78,
    duration: { th: "1 สัปดาห์", en: "1 week" },
    target: { th: "ลูกค้าประจำ", en: "Repeat customers" },
    type: "bundle",
  },
  {
    id: "p3",
    icon: "trending",
    title: { th: "Happy Hour 17:00 - 19:00 เครื่องดื่มเย็น", en: "Happy hour 17:00 - 19:00, cold drinks" },
    desc: {
      th: "ช่วง 17:00-19:00 มียอดขายเครื่องดื่มต่ำกว่าค่าเฉลี่ย 18% ลด 10% เพื่อกระตุ้นทราฟฟิก",
      en: "Cold drink sales 18% below average in 17:00-19:00 window. A 10% promo could lift footfall",
    },
    upside: 980,
    confidence: 0.65,
    duration: { th: "2 สัปดาห์", en: "2 weeks" },
    target: { th: "ลูกค้าหลังเลิกงาน", en: "After-work crowd" },
    type: "discount",
  },
];

export const EVENTS: Suggestion[] = [
  {
    id: "e1",
    icon: "calendar",
    title: { th: "เทศกาลวิสาขบูชา 31 พ.ค.", en: "Visakha Bucha · May 31" },
    desc: {
      th: "วันหยุดนักขัตฤกษ์ ลูกค้าซื้อของไหว้พระและของแห้งเพิ่มขึ้น แนะนำให้สต็อกเทียน-ดอกไม้-น้ำดื่ม",
      en: "Public holiday. Customers stock up on offerings and dry goods — boost candles, flowers, water",
    },
    upside: 8600,
    confidence: 0.88,
    duration: { th: "5 วัน", en: "5 days" },
    target: { th: "ครอบครัว", en: "Families" },
    type: "event",
  },
  {
    id: "e2",
    icon: "gift",
    title: { th: "วันแม่ 12 ส.ค. — กระเช้าของขวัญ", en: "Mother's Day · Aug 12 — gift baskets" },
    desc: {
      th: "เริ่มเตรียมการแสดงสินค้ากระเช้าและของขวัญ 14 วันก่อนวันแม่ ดึงดูดลูกค้าที่กำลังมองหา",
      en: "Start gift-basket merchandising 14 days ahead to capture early shoppers",
    },
    upside: 14200,
    confidence: 0.81,
    duration: { th: "3 สัปดาห์", en: "3 weeks" },
    target: { th: "ลูกค้าที่ต้องการของขวัญ", en: "Gift shoppers" },
    type: "event",
  },
  {
    id: "e3",
    icon: "sparkle",
    title: { th: "เปิดเทอม 16 พ.ค. — ของใช้นักเรียน", en: "Back to school · May 16" },
    desc: {
      th: "ครัวเรือนใกล้สาขามีเด็กวัยเรียน ~38% เสนอจัดมุมเครื่องเขียน-นม-ขนมตอนเช้า",
      en: "~38% of households nearby have school-age kids. Set up a stationery + breakfast bundle corner",
    },
    upside: 6400,
    confidence: 0.74,
    duration: { th: "4 สัปดาห์", en: "4 weeks" },
    target: { th: "ผู้ปกครอง", en: "Parents" },
    type: "event",
  },
];
