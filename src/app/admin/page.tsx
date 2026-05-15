"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  ArrowUpRight, ArrowDownRight, Bell, Search, ChevronDown,
  TrendingUp, Eye, MoreVertical, Wallet, ShoppingCart,
  Users, Clock, AlertTriangle, Zap, X
} from "lucide-react";

// ── SVG Flags ─────────────────────────────────────────────────────
function FlagTH() {
  return (
    <svg viewBox="0 0 30 20" width="30" height="20" style={{ borderRadius: 3, display: "block" }}>
      <rect width="30" height="20" fill="#A51931" />
      <rect y="3.33" width="30" height="13.34" fill="#F4F5F8" />
      <rect y="6.67" width="30" height="6.66" fill="#2D2A4A" />
    </svg>
  );
}

function FlagUK() {
  return (
    <svg viewBox="0 0 60 40" width="30" height="20" style={{ borderRadius: 3, display: "block" }}>
      <rect width="60" height="40" fill="#012169" />
      <line x1="0" y1="0" x2="60" y2="40" stroke="white" strokeWidth="8" />
      <line x1="60" y1="0" x2="0" y2="40" stroke="white" strokeWidth="8" />
      <line x1="0" y1="0" x2="60" y2="40" stroke="#C8102E" strokeWidth="4.8" />
      <line x1="60" y1="0" x2="0" y2="40" stroke="#C8102E" strokeWidth="4.8" />
      <rect x="24" y="0" width="12" height="40" fill="white" />
      <rect x="0" y="14" width="60" height="12" fill="white" />
      <rect x="26" y="0" width="8" height="40" fill="#C8102E" />
      <rect x="0" y="16" width="60" height="8" fill="#C8102E" />
    </svg>
  );
}

// ── Lang Dropdown ──────────────────────────────────────────────────
const LANG_OPTIONS = [
  { code: "th" as const, label: "ภาษาไทย", Flag: FlagTH },
  { code: "en" as const, label: "English", Flag: FlagUK },
];

function LangDropdown({ lang, setLang }: { lang: "th" | "en"; setLang: (l: "th" | "en") => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LANG_OPTIONS.find(o => o.code === lang)!;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl transition hover:bg-white/5"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid #1e293b" }}>
        <current.Flag />
        <ChevronDown size={11} style={{ color: "#64748b", transition: "transform .18s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1.5 rounded-xl overflow-hidden z-50"
          style={{ background: "#1a2235", border: "1px solid #1e293b", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", minWidth: 140 }}>
          {LANG_OPTIONS.map(o => (
            <button key={o.code} onClick={() => { setLang(o.code); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-white/5"
              style={{ borderBottom: o.code === "th" ? "1px solid #1e293b" : "none" }}>
              <o.Flag />
              <span className="text-[13px] font-medium" style={{ color: lang === o.code ? "#38bdf8" : "#e2e8f0" }}>{o.label}</span>
              {lang === o.code && <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#38bdf8" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── i18n ──────────────────────────────────────────────────────────
const T = {
  th: {
    dashboard: "Dashboard", updatedAt: "อัปเดตล่าสุด",
    todaySales: "รายได้วันนี้", totalOrders: "ออเดอร์วันนี้",
    newMembers: "สมาชิกใหม่", successRate: "อัตราสำเร็จ",
    pendingTx: "รอดำเนินการ", failedTopup: "เติมไม่สำเร็จ",
    fromYesterday: "vs เมื่อวาน",
    salesChart: "ยอดขาย", recentOrders: "ธุรกรรมล่าสุด",
    viewAll: "ดูทั้งหมด", quickActions: "Quick Actions",
    systemStatus: "System Status", allOnline: "All Systems Operational",
    topGames: "เกมยอดนิยม", manageGame: "จัดการเกม",
    success: "สำเร็จ", failed: "ล้มเหลว",
    processing: "กำลังเติม", waiting: "รอชำระ", error: "ล้มเหลว",
    lastCheckedLabel: "ตรวจสอบล่าสุด",
    orders: "ออเดอร์", stock: "Stock", today: "ยอดวันนี้", minAgo: "นาทีที่แล้ว",
    qa1: "เติมเกม Manual", qa1s: "เติมเกมด้วยมือสำหรับกรณีพิเศษ",
    qa2: "เพิ่มเกมใหม่", qa2s: "เพิ่มเกมเข้าสู่ระบบ",
    qa3: "สร้างโปรโมชั่น", qa3s: "สร้างโค้ดส่วนลดหรือโปรโมชั่น",
    qa4: "เพิ่มแอดมิน", qa4s: "เพิ่มผู้ดูแลระบบใหม่",
    qa5: "Export รายงาน", qa5s: "ดาวน์โหลดรายงานจาก Excel",
    qa6: "Retry คิวที่ค้าง", qa6s: "รีทรายคิวที่ล้มเหลว",
    open: "เปิดใช้งาน", closed: "ปิดปรับปรุง",
    period3d: "3 วัน", period7d: "7 วัน", period30d: "30 วัน", periodY: "ปีนี้",
    allOrders: "รายการทั้งหมด",
    searchPh: "ค้นหา UID, ธุรกรรม, ผู้ใช้...",
    noOrders: "ยังไม่มีออเดอร์", noGames: "ยังไม่มีข้อมูลเกม",
  },
  en: {
    dashboard: "Dashboard", updatedAt: "Last updated",
    todaySales: "Today Revenue", totalOrders: "Today Orders",
    newMembers: "New Members", successRate: "Success Rate",
    pendingTx: "Pending", failedTopup: "Failed Topup",
    fromYesterday: "vs yesterday",
    salesChart: "Sales", recentOrders: "Recent Transactions",
    viewAll: "View All", quickActions: "Quick Actions",
    systemStatus: "System Status", allOnline: "All Systems Operational",
    topGames: "Popular Games", manageGame: "Manage Games",
    success: "Success", failed: "Failed",
    processing: "Processing", waiting: "Waiting", error: "Error",
    lastCheckedLabel: "Last checked",
    orders: "orders", stock: "Stock", today: "Today", minAgo: "min ago",
    qa1: "Manual Topup", qa1s: "Top up manually for special cases",
    qa2: "Add New Game", qa2s: "Add a new game to the system",
    qa3: "Create Promo", qa3s: "Create discount codes or promotions",
    qa4: "Add Admin", qa4s: "Add a new system administrator",
    qa5: "Export Report", qa5s: "Download reports to Excel",
    qa6: "Retry Queue", qa6s: "Retry failed top-up queue",
    open: "Active", closed: "Maintenance",
    period3d: "3 Days", period7d: "7 Days", period30d: "30 Days", periodY: "This Year",
    allOrders: "All Orders",
    searchPh: "Search UID, transaction, user...",
    noOrders: "No orders yet", noGames: "No game data yet",
  },
};

// ── Game logos ─────────────────────────────────────────────────────
const GAME_LOGOS: Record<string, { bg: string; icon: string }> = {
  "Mobile Legends": { bg: "#1a3a5c", icon: "⚔️" },
  "Free Fire": { bg: "#3a1a1a", icon: "🔥" },
  "PUBG Mobile": { bg: "#2a2a1a", icon: "🎯" },
  "Genshin Impact": { bg: "#1a1a3a", icon: "✨" },
  "ROV": { bg: "#1a3a1a", icon: "🏆" },
};

// ── Status config ─────────────────────────────────────────────────
type TxStatus = "success" | "processing" | "pending" | "failed";

const ST: Record<TxStatus, { color: string; bg: string; border: string }> = {
  success:    { color: "#34d399", bg: "rgba(52,211,153,0.15)",  border: "rgba(52,211,153,0.35)"  },
  processing: { color: "#38bdf8", bg: "rgba(56,189,248,0.15)",  border: "rgba(56,189,248,0.35)"  },
  pending:    { color: "#f59e0b", bg: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.35)"  },
  failed:     { color: "#f87171", bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.35)" },
};

function stockColor(p: number) { return p >= 80 ? "#34d399" : p >= 50 ? "#f59e0b" : "#f87171"; }
const cardBg = { background: "rgba(11,15,32,0.85)", border: "1px solid #1c2540" };
function fmt(n: number) { return n.toLocaleString("th-TH"); }

// ── SVG Line Chart ────────────────────────────────────────────────
function LineChartSVG({ values, labels }: { values: number[]; labels: string[] }) {
  const W = 560, H = 110, pX = 4, pY = 14;
  const max = Math.max(...values), min = Math.min(...values), range = max - min || 1;
  const pts = values.map((v, i) => ({
    x: pX + (i / (values.length - 1)) * (W - pX * 2),
    y: pY + (1 - (v - min) / range) * (H - pY * 2),
  }));
  function bez(p: { x: number; y: number }[]) {
    return p.map((pt, i) => {
      if (i === 0) return `M${pt.x},${pt.y}`;
      const q = p[i - 1];
      const cx = (q.x + pt.x) / 2;
      return `C${cx},${q.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
    }).join(" ");
  }
  const path = bez(pts);
  const area = `${path} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;
  const peak = pts.reduce((a, b) => b.y < a.y ? b : a);
  const step = Math.max(1, Math.floor(labels.length / 6));
  const sl = labels.filter((_, i) => i % step === 0 || i === labels.length - 1);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 110 }}>
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
          </linearGradient>
        </defs>
        {[.25, .5, .75].map(r => (
          <line key={r} x1={pX} y1={pY + r * (H - pY * 2)} x2={W - pX} y2={pY + r * (H - pY * 2)}
            stroke="#1c2540" strokeWidth={1} strokeDasharray="3,4" />
        ))}
        <path d={area} fill="url(#cg)" />
        <path d={path} fill="none" stroke="#38bdf8" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={peak.x} cy={peak.y} r={5} fill="#38bdf8" stroke="rgba(11,15,32,0.9)" strokeWidth={2} />
        <circle cx={peak.x} cy={peak.y} r={10} fill="none" stroke="#38bdf8" strokeWidth={1} opacity={0.35} />
      </svg>
      <div className="flex justify-between px-1 mt-1">
        {sl.map((l, i) => <span key={i} className="text-[9px]" style={{ color: "#3a4a6a" }}>{l}</span>)}
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status, t }: { status: TxStatus; t: typeof T["th"] }) {
  const cfg = ST[status];
  const label = status === "success" ? t.success
    : status === "processing" ? t.processing
      : status === "pending" ? t.waiting
        : t.error;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
      {label}
    </span>
  );
}

// ── Order type ────────────────────────────────────────────────────
type DisplayOrder = {
  id: string; uid: string; game: string; pkg: string;
  method: string; amount: number; status: TxStatus; min: number;
};

// ── Order Row ─────────────────────────────────────────────────────
function OrderRow({ o, t }: { o: DisplayOrder; t: typeof T["th"] }) {
  const logo = GAME_LOGOS[o.game];
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition cursor-pointer"
      style={{ borderBottom: "1px solid #0d1525" }}>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: logo?.bg ?? "#1c1c2a" }}>
        {logo?.icon ?? "🎮"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-white">{o.game}</span>
          <span style={{ color: "#3a4a6a" }}>·</span>
          <span className="text-[13px]" style={{ color: "#94a3b8" }}>{o.pkg}</span>
        </div>
        <p className="text-[11px] mt-0.5" style={{ color: "#64748b" }}>
          UID: {o.uid}&nbsp;·&nbsp;{o.method}&nbsp;·&nbsp;{o.min} {t.minAgo}
        </p>
      </div>
      <p className="text-[15px] font-bold text-white flex-shrink-0">฿{fmt(o.amount)}</p>
      <StatusBadge status={o.status} t={t} />
      <button className="p-1.5 rounded-lg hover:bg-white/5 transition flex-shrink-0" style={{ color: "#3a4a6a" }}>
        <Eye size={15} />
      </button>
    </div>
  );
}

// ── All Orders Modal ──────────────────────────────────────────────
function AllOrdersModal({ onClose, t, orders }: { onClose: () => void; t: typeof T["th"]; orders: DisplayOrder[] }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
      <div className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: "#0d1420", border: "1px solid #1c2540" }}>
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid #1c2540" }}>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-white">{t.allOrders}</p>
            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#34d399" }} />Live
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition" style={{ color: "#64748b" }}>
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {orders.length === 0
            ? <p className="text-center py-12 text-sm" style={{ color: "#64748b" }}>{t.noOrders}</p>
            : orders.map((o, i) => <OrderRow key={i} o={o} t={t} />)}
        </div>
      </div>
    </div>
  );
}

const systemServices = [
  { name: "API Server",      uptime: "99.9%", latency: "42ms",  ok: true  },
  { name: "Payment Gateway", uptime: "99.2%", latency: "210ms", ok: true  },
  { name: "Auto Top-up",     uptime: "100%",  latency: "180ms", ok: true  },
  { name: "Security",        uptime: "100%",  latency: "0ms",   ok: true  },
  { name: "Database",        uptime: "99.9%", latency: "8ms",   ok: true  },
  { name: "CDN",             uptime: "98.1%", latency: "22ms",  ok: false },
];

// ── Main ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [lang, setLang]       = useState<"th" | "en">("th");
  const [period, setPeriod]   = useState<"3d" | "7d" | "30d" | "year">("7d");
  const [showAll, setShowAll] = useState(false);
  const [now, setNow]         = useState("");
  const { token } = useAdminAuth();
  const router = useRouter();

  // อัปเดตเวลาแบบ real-time
  useEffect(() => {
    const update = () => {
      const d = new Date();
      const dateStr = d.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
      const timeStr = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setNow(`${dateStr} ${timeStr}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Real data ─────────────────────────────────────────────────
  const [rawOrders, setRawOrders] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const api = process.env.NEXT_PUBLIC_API_URL;
      const res = await axios.get(`${api}/orders/admin/all`, { headers });
      // backend ส่งมาเป็น array โดยตรง
      setRawOrders(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Compute stats — ใช้ field ตาม backend จริง ────────────────
  // backend ส่ง: { order_id, uid, game, pkg, amount, method, status, created_at, email }
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

  const todayOrders   = rawOrders.filter(o => new Date(o.created_at) >= todayStart);
  const successOrders = rawOrders.filter(o => o.status === "completed");
  const pendingOrders = rawOrders.filter(o => o.status === "pending");
  const failedOrders  = rawOrders.filter(o => o.status === "failed");

  const todayRevenue = todayOrders
    .filter(o => o.status === "completed")
    .reduce((s, o) => s + Number(o.amount ?? 0), 0);

  const successRate = rawOrders.length > 0
    ? ((successOrders.length / rawOrders.length) * 100).toFixed(1)
    : "0.0";

  // ── Chart data ────────────────────────────────────────────────
  function buildChartData(days: number): number[] {
    const map: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      map[d.toDateString()] = 0;
    }
    rawOrders.filter(o => o.status === "completed").forEach(o => {
      const d = new Date(o.created_at); d.setHours(0, 0, 0, 0);
      if (map[d.toDateString()] !== undefined) {
        map[d.toDateString()] += Number(o.amount ?? 0);
      }
    });
    return Object.values(map);
  }

  const CHART_PERIODS = {
    "3d":   { lbTH: ["เมื่อวาน−2", "เมื่อวาน", "วันนี้"], lbEN: ["2d ago", "Yesterday", "Today"], v: buildChartData(3) },
    "7d":   { lbTH: ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"], lbEN: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], v: buildChartData(7) },
    "30d":  { lbTH: Array.from({ length: 30 }, (_, i) => `${i + 1}`), lbEN: Array.from({ length: 30 }, (_, i) => `${i + 1}`), v: buildChartData(30) },
    "year": { lbTH: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
              lbEN: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
              v: buildChartData(365) },
  };

  // ── Top games จาก orders จริง ─────────────────────────────────
  const gameStatsMap: Record<string, { revenue: number; orders: number }> = {};
  rawOrders.filter(o => o.status === "completed").forEach(o => {
    const name = o.game ?? "Unknown";
    if (!gameStatsMap[name]) gameStatsMap[name] = { revenue: 0, orders: 0 };
    gameStatsMap[name].revenue += Number(o.amount ?? 0);
    gameStatsMap[name].orders  += 1;
  });

  const topGames = Object.entries(gameStatsMap)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([name, stats]) => ({
      name,
      status: "open",
      revenue: stats.revenue,
      stockPct: 85,
      orders: stats.orders,
      trend: 0,
      trendUp: true,
    }));

  // ── Display orders — map field ให้ถูกต้อง ─────────────────────
  const displayOrders: DisplayOrder[] = rawOrders.slice(0, 100).map(o => ({
    id:     `ORD-${o.order_id}`,
    uid:    o.uid ?? "-",
    game:   o.game ?? "-",
    pkg:    o.pkg  ?? "-",
    method: o.method ?? "unknown",
    amount: Number(o.amount ?? 0),
    status: (o.status === "completed" ? "success"
      : o.status === "pending"    ? "pending"
      : o.status === "processing" ? "processing"
      : "failed") as TxStatus,
    min: Math.max(0, Math.floor((Date.now() - new Date(o.created_at).getTime()) / 60000)),
  }));

  const t = T[lang];
  const chart = CHART_PERIODS[period];
  const chartLabels = lang === "th" ? chart.lbTH : chart.lbEN;

  const statCards = [
    { label: t.todaySales,  value: `฿${fmt(Math.round(todayRevenue))}`, chg: "+12.5%", up: true,  sub: t.fromYesterday, icon: Wallet,        accent: "#38bdf8" },
    { label: t.totalOrders, value: String(todayOrders.length),           chg: "+8.3%",  up: true,  sub: t.fromYesterday, icon: ShoppingCart,  accent: "#34d399" },
    { label: t.newMembers,  value: "-",                                   chg: "-",      up: true,  sub: t.fromYesterday, icon: Users,         accent: "#a78bfa" },
    { label: t.successRate, value: `${successRate}%`,                    chg: "+0.5%",  up: true,  sub: t.fromYesterday, icon: Zap,           accent: "#34d399" },
    { label: t.pendingTx,   value: String(pendingOrders.length),         chg: "+2.1%",  up: true,  sub: t.fromYesterday, icon: Clock,         accent: "#f59e0b" },
    { label: t.failedTopup, value: String(failedOrders.length),          chg: "-25%",   up: false, sub: t.fromYesterday, icon: AlertTriangle, accent: "#f87171" },
  ];

  const quickActions = [
    { label: t.qa1, sub: t.qa1s, icon: "🔄", color: "#38bdf8", href: null },
    { label: t.qa2, sub: t.qa2s, icon: "➕", color: "#34d399", href: "/admin/games" },
    { label: t.qa3, sub: t.qa3s, icon: "🏷️", color: "#f59e0b", href: null },
    { label: t.qa4, sub: t.qa4s, icon: "👤", color: "#a78bfa", href: null },
    { label: t.qa5, sub: t.qa5s, icon: "📊", color: "#38bdf8", href: null },
    { label: t.qa6, sub: t.qa6s, icon: "🔁", color: "#f87171", href: null },
  ];

  const periods = [
    { key: "3d"   as const, label: t.period3d },
    { key: "7d"   as const, label: t.period7d },
    { key: "30d"  as const, label: t.period30d },
    { key: "year" as const, label: t.periodY },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ fontFamily: "'Noto Sans Thai',sans-serif", background: "#080a16" }}>

      {showAll && <AllOrdersModal onClose={() => setShowAll(false)} t={t} orders={displayOrders} />}

      {/* TOPBAR */}
      <div className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
        style={{ background: "#111827", borderBottom: "1px solid #1e293b", minHeight: 56 }}>
        <div className="flex items-center gap-2 flex-1 max-w-sm rounded-xl px-3 py-2"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1e293b" }}>
          <Search size={13} style={{ color: "#64748b", flexShrink: 0 }} />
          <input placeholder={t.searchPh}
            className="bg-transparent outline-none text-xs text-white placeholder-[#3a4a6a] w-full" />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "#fff", color: "#0f172a" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            System Online
          </div>
          <LangDropdown lang={lang} setLang={setLang} />
          <button className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 transition"
            style={{ border: "1px solid #1e293b" }}>
            <Bell size={15} style={{ color: "#94a3b8" }} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#38bdf8,#818cf8)" }}>
            <span className="text-white text-xs font-bold">A</span>
          </button>
          <span className="text-sm font-semibold text-white hidden sm:block">Admin</span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-5 min-w-0">

          <div>
            <h1 className="text-2xl font-bold text-white">{t.dashboard}</h1>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{t.updatedAt}: {now}</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {statCards.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="rounded-2xl p-4 relative overflow-hidden" style={cardBg}>
                  <div className="absolute inset-0 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(circle at 85% 15%, ${c.accent}18, transparent 65%)` }} />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-[11px] font-semibold leading-tight" style={{ color: "#94a3b8" }}>{c.label}</p>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `linear-gradient(135deg,${c.accent}cc,${c.accent}66)` }}>
                        <Icon size={17} color="#fff" />
                      </div>
                    </div>
                    {loading
                      ? <div className="h-8 w-16 rounded-lg animate-pulse mb-2" style={{ background: "#1c2540" }} />
                      : <p className="text-2xl font-bold text-white leading-none mb-2">{c.value}</p>}
                    <div className="flex items-center gap-1 text-[11px] font-semibold"
                      style={{ color: c.up ? "#34d399" : "#f87171" }}>
                      {c.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      <span>{c.chg}</span>
                      <span className="font-normal ml-0.5" style={{ color: "#64748b" }}>{c.sub}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sales chart */}
          <div className="rounded-2xl p-5" style={cardBg}>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <p className="text-sm font-bold text-white">{t.salesChart}</p>
                <p className="text-[10px]" style={{ color: "#64748b" }}>
                  {lang === "th" ? "รายได้ตามช่วงเวลา" : "Revenue over period"}
                </p>
              </div>
              <div className="flex gap-1.5">
                {periods.map(p => (
                  <button key={p.key} onClick={() => setPeriod(p.key)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                    style={period === p.key
                      ? { background: "rgba(56,189,248,0.18)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.35)" }
                      : { background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid #1c2540" }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col justify-between text-[9px] py-2 flex-shrink-0"
                style={{ color: "#3a4a6a", minWidth: 32 }}>
                {["Max", "75%", "50%", "25%", "0"].map(v => <span key={v}>{v}</span>)}
              </div>
              <div className="flex-1 min-w-0">
                <LineChartSVG values={chart.v} labels={chartLabels} />
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="rounded-2xl overflow-hidden" style={cardBg}>
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid #1c2540" }}>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">{t.recentOrders}</p>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                  style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#34d399" }} />
                  Live
                </span>
              </div>
              <button onClick={() => setShowAll(true)} className="text-sm font-semibold" style={{ color: "#38bdf8" }}>
                {t.viewAll}
              </button>
            </div>
            <div>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: "1px solid #0d1525" }}>
                    <div className="w-11 h-11 rounded-2xl animate-pulse" style={{ background: "#1c2540" }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-40 rounded animate-pulse" style={{ background: "#1c2540" }} />
                      <div className="h-2 w-24 rounded animate-pulse" style={{ background: "#1c2540" }} />
                    </div>
                  </div>
                ))
              ) : displayOrders.length === 0 ? (
                <p className="text-center py-10 text-sm" style={{ color: "#64748b" }}>{t.noOrders}</p>
              ) : (
                displayOrders.slice(0, 6).map((o, i) => <OrderRow key={i} o={o} t={t} />)
              )}
            </div>
          </div>

          {/* Top Games */}
          <div className="rounded-2xl overflow-hidden" style={cardBg}>
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid #1c2540" }}>
              <p className="text-sm font-bold text-white">{t.topGames}</p>
              <button onClick={() => router.push("/admin/games")}
                className="text-xs font-semibold" style={{ color: "#38bdf8" }}>
                {t.manageGame}
              </button>
            </div>
            <div>
              {loading ? (
                <div className="py-8 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : topGames.length === 0 ? (
                <p className="text-center py-10 text-sm" style={{ color: "#64748b" }}>{t.noGames}</p>
              ) : (
                topGames.map((g, i) => {
                  const logo = GAME_LOGOS[g.name];
                  const sColor = "#34d399";
                  const sBg = "rgba(52,211,153,0.12)";
                  const sBorder = "rgba(52,211,153,0.3)";
                  const barColor = stockColor(g.stockPct);
                  return (
                    <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition"
                      style={{ borderBottom: i < topGames.length - 1 ? "1px solid #0d1525" : "none" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: logo?.bg ?? "#1a1a2a" }}>
                        {logo?.icon ?? "🎮"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white">{g.name}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: sBg, color: sColor, border: `1px solid ${sBorder}` }}>
                            {t.open}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px]" style={{ color: "#64748b" }}>{fmt(g.orders)} {t.orders}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 min-w-[80px]">
                        <p className="text-sm font-bold text-white">฿{fmt(g.revenue)}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: "#64748b" }}>{t.today}</p>
                      </div>
                      <div className="flex-shrink-0 w-28">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px]" style={{ color: "#64748b" }}>{t.stock}</span>
                          <span className="text-[11px] font-semibold" style={{ color: barColor }}>{g.stockPct}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                          <div className="h-full rounded-full" style={{ width: `${g.stockPct}%`, background: barColor }} />
                        </div>
                      </div>
                      <button className="flex-shrink-0 p-1 rounded-lg hover:bg-white/5" style={{ color: "#3a4a6a" }}>
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>{/* end left */}

        {/* RIGHT PANEL */}
        <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-shrink-0"
          style={{ width: 272, borderLeft: "1px solid #1c2540" }}>

          {/* Quick Actions */}
          <div className="rounded-2xl p-4" style={cardBg}>
            <p className="text-sm font-bold text-white pb-3 mb-3"
              style={{ borderBottom: "1px solid #1c2540" }}>{t.quickActions}</p>
            <div className="grid grid-cols-2 gap-2.5">
              {quickActions.map((a, i) => (
                <button key={i}
                  onClick={() => a.href && router.push(a.href)}
                  className="rounded-xl p-3 text-left transition-all hover:scale-[1.03] active:scale-[0.97]"
                  style={{ background: `${a.color}12`, border: `1px solid ${a.color}28` }}>
                  <p className="text-xl mb-2">{a.icon}</p>
                  <p className="text-[11px] font-bold leading-tight text-white">{a.label}</p>
                  <p className="text-[9px] mt-0.5 leading-tight" style={{ color: "#64748b" }}>{a.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="rounded-2xl p-4" style={cardBg}>
            <div className="pb-3 mb-3 text-center" style={{ borderBottom: "1px solid #1c2540" }}>
              <p className="text-sm font-bold text-white mb-2">{t.systemStatus}</p>
              <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.35)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                {t.allOnline}
              </span>
            </div>
            <div className="space-y-2">
              {systemServices.map((s, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2.5"
                  style={{ background: "rgba(255,255,255,0.025)", border: "1px solid #141c30" }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.ok ? "#34d399" : "#f87171" }} />
                  <span className="text-[11px] text-white flex-1 truncate font-medium">{s.name}</span>
                  <span className="text-[10px] font-mono font-semibold" style={{ color: s.ok ? "#34d399" : "#f87171" }}>{s.latency}</span>
                  <span className="text-[10px] font-semibold" style={{ color: "#64748b" }}>{s.uptime}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] mt-3 text-center" style={{ color: "#3a4a6a" }}>
              {t.lastCheckedLabel}: {now.split(" ").slice(-1)[0]} · {lang === "th" ? "สำเร็จ" : "Success"} 96.8%
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
