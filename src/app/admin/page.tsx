"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Wallet, ShoppingCart, Users, Clock, AlertTriangle,
  Zap, X, Sun, Moon, RefreshCw, TrendingUp,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function fmt(n: number) {
  return n.toLocaleString("th-TH");
}

function timeAgo(date: string | Date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (diff < 1) return "เมื่อกี้";
  if (diff < 60) return `${diff} นาทีที่แล้ว`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  return `${Math.floor(h / 24)} วันที่แล้ว`;
}

const GAME_ICONS: Record<string, string> = {
  "Mobile Legends": "⚔️", "Free Fire": "🔥", "PUBG Mobile": "🎯",
  "Genshin Impact": "✨", "ROV": "🏆", "Valorant": "🎯",
};

const STATUS_CFG = {
  completed:  { label: "สำเร็จ",     color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)" },
  processing: { label: "กำลังเติม", color: "#06b6d4", bg: "rgba(6,182,212,0.12)",   border: "rgba(6,182,212,0.25)"  },
  pending:    { label: "รอชำระ",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)" },
  failed:     { label: "ล้มเหลว",   color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)"  },
  cancelled:  { label: "ยกเลิก",   color: "#6b7280", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.25)"},
  refunded:   { label: "คืนเงิน",  color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.25)" },
} as Record<string, { label: string; color: string; bg: string; border: string }>;

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.failed;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function LineChartSVG({ values, labels }: { values: number[]; labels: string[] }) {
  const W = 560, H = 110, pX = 4, pY = 12;
  const safeValues = values.length > 0 ? values : [0, 0];
  const max = Math.max(...safeValues, 1);
  const min = Math.min(...safeValues, 0);
  const range = max - min || 1;
  const pts = safeValues.map((v, i) => ({
    x: pX + (i / Math.max(safeValues.length - 1, 1)) * (W - pX * 2),
    y: pY + (1 - (v - min) / range) * (H - pY * 2),
  }));
  function bez(p: { x: number; y: number }[]) {
    return p.map((pt, i) => {
      if (i === 0) return `M${pt.x},${pt.y}`;
      const q = p[i - 1]; const cx = (q.x + pt.x) / 2;
      return `C${cx},${q.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
    }).join(" ");
  }
  const path = pts.length > 1 ? bez(pts) : `M${pts[0].x},${pts[0].y}`;
  const area = pts.length > 1 ? `${path} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z` : "";
  const peak = pts.reduce((a, b) => b.y < a.y ? b : a);
  const step = Math.max(1, Math.floor(labels.length / 6));
  const sl = labels.filter((_, i) => i % step === 0 || i === labels.length - 1);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 100 }}>
        <defs>
          <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(r => (
          <line key={r} x1={pX} y1={pY + r * (H - pY * 2)} x2={W - pX} y2={pY + r * (H - pY * 2)}
            stroke="currentColor" className="text-border/40" strokeWidth={1} strokeDasharray="3,4" />
        ))}
        {area && <path d={area} fill="url(#cg2)" />}
        <path d={path} fill="none" stroke="#38bdf8" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={peak.x} cy={peak.y} r={4} fill="#38bdf8" stroke="currentColor" className="text-card" strokeWidth={2} />
      </svg>
      <div className="flex justify-between px-1 mt-1">
        {sl.map((l, i) => <span key={i} className="text-[9px] text-muted-foreground/60">{l.slice(5)}</span>)}
      </div>
    </div>
  );
}

function OrderRow({ o, last }: { o: any; last: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition cursor-pointer",
      !last && "border-b border-border/50"
    )}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-muted/60 border border-border/50">
        {GAME_ICONS[o.game] ?? "🎮"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-foreground truncate">{o.game}</span>
          <span className="text-[10px] text-muted-foreground truncate">· {o.pkg}</span>
        </div>
        <p className="text-[10px] mt-0.5 text-muted-foreground truncate">
          {o.uid ?? o.email ?? "—"} · {timeAgo(o.created_at)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <p className="text-xs font-bold text-foreground">฿{fmt(o.amount)}</p>
        <StatusBadge status={o.status} />
      </div>
    </div>
  );
}

function AllOrdersModal({ onClose, orders }: { onClose: () => void; orders: any[] }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg max-h-[88vh] flex flex-col rounded-2xl overflow-hidden bg-card text-card-foreground border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-border/80">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-foreground">ธุรกรรมทั้งหมด</p>
            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500" />Live
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {orders.length === 0
            ? <p className="text-center py-12 text-sm text-muted-foreground">ยังไม่มีออเดอร์</p>
            : orders.map((o, i) => <OrderRow key={i} o={o} last={i === orders.length - 1} />)}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState<7 | 30 | 365>(7);
  const [showAll, setShowAll] = useState(false);
  const { theme: _theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  });

  useEffect(() => { setMounted(true); }, []);
  const currentTheme = mounted ? (resolvedTheme ?? "dark") : "dark";

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const { token } = useAdminAuth();
  const router = useRouter();

  const [dashData, setDashData] = useState<any>(null);
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (!token) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [statsRes, healthRes] = await Promise.all([
        axios.get(`${API_URL}/orders/admin/stats?days=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/system/api-health`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setDashData(statsRes.data);
      setServerHealth(healthRes.data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, period]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  useEffect(() => {
    const id = setInterval(() => fetchDashboard(true), 60000);
    return () => clearInterval(id);
  }, [fetchDashboard]);

  const stats = dashData?.stats ?? {};
  const chart = dashData?.chart ?? { labels: [], values: [] };
  const topGames = dashData?.topGames ?? [];
  const recentOrders: any[] = dashData?.recentOrders ?? [];
  const services = serverHealth?.services ?? [];

  const allOnline = services.length > 0 && services.every((s: any) => s.status === "normal");
  const anyDown = services.some((s: any) => s.status === "down");

  const statCards = [
    { label: "รายได้วันนี้",  value: loading ? null : `฿${fmt(Math.round(stats.todayRevenue ?? 0))}`, icon: Wallet,        accent: "#38bdf8", sub: "completed" },
    { label: "ออเดอร์วันนี้", value: loading ? null : String(stats.todayOrders ?? 0),                  icon: ShoppingCart, accent: "#10b981", sub: "ทุกสถานะ" },
    { label: "สมาชิกใหม่",   value: loading ? null : String(stats.newMembersToday ?? 0),               icon: Users,        accent: "#8b5cf6", sub: "สมัครวันนี้" },
    { label: "อัตราสำเร็จ",  value: loading ? null : `${stats.successRate ?? 0}%`,                    icon: Zap,          accent: "#10b981", sub: `${period} วันล่าสุด` },
    { label: "รอดำเนินการ",  value: loading ? null : String(stats.pendingCount ?? 0),                  icon: Clock,        accent: "#f59e0b", sub: "pending" },
    { label: "ล้มเหลว",      value: loading ? null : String(stats.failedCount ?? 0),                   icon: AlertTriangle,accent: "#ef4444", sub: "failed" },
  ];

  const periods = [
    { key: 7 as const, label: "7 วัน" },
    { key: 30 as const, label: "30 วัน" },
    { key: 365 as const, label: "ปีนี้" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Noto Sans Thai',sans-serif" }}>
      {showAll && <AllOrdersModal onClose={() => setShowAll(false)} orders={recentOrders} />}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/80 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h1 className="text-base font-bold text-foreground flex items-center gap-2">
            Dashboard
            {refreshing && <RefreshCw size={12} className="animate-spin text-primary" />}
          </h1>
          <p className="text-[10px] text-muted-foreground">
            {lastUpdated ? `อัปเดต ${String(lastUpdated.getHours()).padStart(2,"0")}:${String(lastUpdated.getMinutes()).padStart(2,"0")}:${String(lastUpdated.getSeconds()).padStart(2,"0")}` : "กำลังโหลด..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-border/60 transition disabled:opacity-50"
            title="รีเฟรช"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80">
            <Clock size={11} className="text-primary" />
            <span className="font-mono text-xs font-bold tracking-wider">{now}</span>
          </div>
          <div
            className="relative flex items-center w-16 h-8 bg-muted border border-border/80 rounded-full p-1 cursor-pointer select-none transition-colors duration-300"
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
          >
            <div className={cn(
              "absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-card shadow-sm transition-transform duration-300 ease-out border border-border/30",
              currentTheme === "dark" ? "translate-x-8" : "translate-x-0"
            )} />
            <div className="relative z-10 flex-1 flex items-center justify-center h-full">
              <Sun className={cn("w-3.5 h-3.5 transition-colors duration-300", currentTheme === "light" ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div className="relative z-10 flex-1 flex items-center justify-center h-full">
              <Moon className={cn("w-3.5 h-3.5 transition-colors duration-300", currentTheme === "dark" ? "text-primary" : "text-muted-foreground")} />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 sm:p-5 space-y-4">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="bg-card text-card-foreground border border-border/80 rounded-2xl p-3 sm:p-4 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="absolute inset-0 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(circle at 85% 15%, ${c.accent}10, transparent 65%)` }} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[10px] font-semibold leading-tight text-muted-foreground">{c.label}</p>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `linear-gradient(135deg,${c.accent}cc,${c.accent}66)` }}>
                      <Icon size={14} color="#fff" />
                    </div>
                  </div>
                  {c.value === null
                    ? <div className="h-6 w-14 rounded-lg animate-pulse mb-1 bg-muted/80" />
                    : <p className="text-xl font-bold text-foreground leading-none mb-1">{c.value}</p>
                  }
                  <p className="text-[9px] text-muted-foreground/60">{c.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left col */}
          <div className="lg:col-span-2 space-y-4">

            {/* Sales Chart */}
            <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-4 shadow-sm hover:shadow transition-all duration-300">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" />
                  <p className="text-sm font-bold text-foreground">ยอดขาย</p>
                </div>
                <div className="flex gap-1">
                  {periods.map(p => (
                    <button key={p.key} onClick={() => setPeriod(p.key)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border",
                        period === p.key
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-muted/40 text-muted-foreground border-border/80 hover:bg-muted/60"
                      )}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              {loading ? (
                <div className="h-28 rounded-xl animate-pulse bg-muted/60" />
              ) : (
                <LineChartSVG values={chart.values} labels={chart.labels} />
              )}
              {!loading && chart.values.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">รายได้รวม {period} วัน</span>
                  <span className="text-sm font-bold text-foreground">
                    ฿{fmt(chart.values.reduce((a: number, b: number) => a + b, 0))}
                  </span>
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-card text-card-foreground border border-border/80 rounded-2xl overflow-hidden shadow-sm hover:shadow transition-all duration-300">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">ธุรกรรมล่าสุด</p>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500" />Live
                  </span>
                </div>
                <button onClick={() => setShowAll(true)} className="text-xs font-semibold text-primary hover:underline">
                  ดูทั้งหมด
                </button>
              </div>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
                    <div className="w-9 h-9 rounded-xl animate-pulse flex-shrink-0 bg-muted/80" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-32 rounded animate-pulse bg-muted/80" />
                      <div className="h-2 w-20 rounded animate-pulse bg-muted/80" />
                    </div>
                    <div className="h-4 w-16 rounded animate-pulse bg-muted/80" />
                  </div>
                ))
              ) : recentOrders.length === 0 ? (
                <p className="text-center py-8 text-sm text-muted-foreground">ยังไม่มีออเดอร์</p>
              ) : (
                recentOrders.slice(0, 8).map((o, i) => (
                  <OrderRow key={i} o={o} last={i === Math.min(7, recentOrders.length - 1)} />
                ))
              )}
            </div>

            {/* Top Games */}
            <div className="bg-card text-card-foreground border border-border/80 rounded-2xl overflow-hidden shadow-sm hover:shadow transition-all duration-300">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/80">
                <p className="text-sm font-bold text-foreground">เกมยอดนิยม</p>
                <button onClick={() => router.push("/admin/games")} className="text-xs font-semibold text-primary hover:underline">
                  จัดการเกม
                </button>
              </div>
              {loading ? (
                <div className="py-8 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : topGames.length === 0 ? (
                <p className="text-center py-8 text-sm text-muted-foreground">ยังไม่มีข้อมูลเกม</p>
              ) : topGames.map((g: any, i: number) => {
                const maxRevenue = topGames[0]?.revenue || 1;
                const barPct = Math.round((g.revenue / maxRevenue) * 100);
                return (
                  <div key={i} className={cn(
                    "flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition",
                    i < topGames.length - 1 ? "border-b border-border/60" : ""
                  )}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 bg-muted/60 border border-border/50">
                      {GAME_ICONS[g.name] ?? "🎮"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{g.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-700"
                            style={{ width: `${barPct}%` }} />
                        </div>
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap">{fmt(g.orders)} orders</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-foreground">฿{fmt(Math.round(g.revenue))}</p>
                      <span className="text-[9px] font-semibold text-sky-500">#{i + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-4">

            {/* Server Status */}
            <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-4 shadow-sm hover:shadow transition-all duration-300">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/80">
                <p className="text-sm font-bold text-foreground">สถานะเซิร์ฟเวอร์</p>
                {loading ? (
                  <div className="h-5 w-20 rounded-full animate-pulse bg-muted/80" />
                ) : (
                  <span className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                    anyDown
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : allOnline
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      anyDown ? "bg-red-500" : allOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    )} />
                    {anyDown ? "มีปัญหา" : allOnline ? "ปกติทุกระบบ" : "ช้า"}
                  </span>
                )}
              </div>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-10 rounded-lg animate-pulse bg-muted/60" />
                  ))}
                </div>
              ) : services.length === 0 ? (
                <p className="text-center py-4 text-xs text-muted-foreground">ไม่สามารถดึงข้อมูลได้</p>
              ) : (
                <div className="space-y-2">
                  {services.map((s: any, i: number) => {
                    const isOk = s.status === "normal";
                    const isSlow = s.status === "slow";
                    const color = isOk ? "#10b981" : isSlow ? "#f59e0b" : "#ef4444";
                    const bgColor = isOk ? "rgba(16,185,129,0.08)" : isSlow ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)";
                    return (
                      <div key={i} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 border border-border/60 transition-all"
                        style={{ background: bgColor }}>
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                        <span className="text-[11px] text-foreground flex-1 truncate font-medium">{s.label}</span>
                        <span className="text-[10px] font-mono font-bold" style={{ color }}>
                          {s.responseMs != null ? `${s.responseMs}ms` : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                <p className="text-[9px] text-muted-foreground/60">ตรวจล่าสุด: {now}</p>
                <button onClick={() => fetchDashboard(true)} className="text-[9px] font-semibold text-primary hover:underline transition">
                  รีเฟรช
                </button>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-4 shadow-sm hover:shadow transition-all duration-300">
              <p className="text-sm font-bold text-foreground pb-3 mb-3 border-b border-border/80">สรุปภาพรวม</p>
              <div className="space-y-3">
                {[
                  { label: "สมาชิกทั้งหมด",          value: loading ? null : fmt(stats.totalUsers ?? 0),              icon: "👥" },
                  { label: "สำเร็จ (7 วัน)",           value: loading ? null : fmt(recentOrders.filter((o: any) => o.status === "completed").length), icon: "✅" },
                  { label: "รอดำเนินการ",              value: loading ? null : fmt(stats.pendingCount ?? 0),           icon: "⏳" },
                  { label: "ล้มเหลว",                  value: loading ? null : fmt(stats.failedCount ?? 0),            icon: "❌" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                    {item.value === null
                      ? <div className="h-4 w-12 rounded animate-pulse bg-muted/80" />
                      : <span className="text-xs font-bold text-foreground">{item.value}</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
