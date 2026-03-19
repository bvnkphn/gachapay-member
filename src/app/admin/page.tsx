"use client";

import { useState, useMemo } from "react";
import {
  LayoutDashboard, Users, ShoppingCart, HeadphonesIcon,
  BarChart2, CreditCard, Settings, FileText, Activity,
  TrendingUp, TrendingDown, CheckCircle2, XCircle, Clock,
  Globe, RefreshCw, Bell, Search, ChevronDown, Zap,
  ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Server, Shield, Database, Wifi, Trophy, Eye
} from "lucide-react";

// ── i18n ──────────────────────────────────────────────────────────
const T = {
  th: {
    dashboard: "Dashboard", overview: "ภาพรวมระบบแบบ Real-time",
    updatedAt: "อัปเดตล่าสุด",
    todaySales: "รายได้วันนี้", monthlySales: "รายได้เดือนนี้",
    totalOrders: "คำสั่งซื้อ", successRate: "อัตราสำเร็จ",
    activeUsers: "ผู้ใช้งาน", newUsers: "สมาชิกใหม่",
    fromYesterday: "จากเมื่อวาน", fromLastMonth: "จากเดือนที่แล้ว",
    salesChart: "ยอดขาย", recentOrders: "รายการล่าสุด",
    viewAll: "ดูทั้งหมด", status: "สถานะ",
    quickActions: "Quick Actions", systemStatus: "System Status",
    allOnline: "All Systems Operational",
    topGames: "ประเภทเกมยอดนิยม", revenue: "รายได้",
    txMonitor: "Transaction Monitor", success: "สำเร็จ",
    failed: "ล้มเหลว", pending: "รอดำเนินการ",
    manageGame: "จัดการเกม", manageUser: "จัดการผู้ใช้",
    topupNow: "เติมเกมด้วยตัวเอง", exportReport: "Export รายงาน",
    retryFailed: "Retry คำสั่งที่ล้มเหลว", lastChecked: "ตรวจสอบล่าสุด",
    navDashboard: "Dashboard", navGames: "จัดการเกม",
    navOrders: "รายการสั่งซื้อ", navSupport: "ช่วยเหลือ",
    navReport: "รายงาน", navPayment: "Payment", navSystem: "ตั้งค่า",
    navAuditLog: "Audit Log", menu_admin: "การจัดการ", menu_finance: "การเงิน",
    orders: "รายการ",
  },
  en: {
    dashboard: "Dashboard", overview: "Real-time System Overview",
    updatedAt: "Last updated",
    todaySales: "Today Revenue", monthlySales: "Monthly Revenue",
    totalOrders: "Orders", successRate: "Success Rate",
    activeUsers: "Active Users", newUsers: "New Members",
    fromYesterday: "from yesterday", fromLastMonth: "from last month",
    salesChart: "Sales", recentOrders: "Recent Orders",
    viewAll: "View All", status: "Status",
    quickActions: "Quick Actions", systemStatus: "System Status",
    allOnline: "All Systems Operational",
    topGames: "Top Game Categories", revenue: "Revenue",
    txMonitor: "Transaction Monitor", success: "Success",
    failed: "Failed", pending: "Pending",
    manageGame: "Manage Games", manageUser: "Manage Users",
    topupNow: "Manual Top-up", exportReport: "Export Report",
    retryFailed: "Retry Failed Orders", lastChecked: "Last checked",
    navDashboard: "Dashboard", navGames: "Games",
    navOrders: "Orders", navSupport: "Support",
    navReport: "Reports", navPayment: "Payment", navSystem: "Settings",
    navAuditLog: "Audit Log", menu_admin: "Management", menu_finance: "Finance",
    orders: "orders",
  },
};

// ── Mock Data ─────────────────────────────────────────────────────
const hourlyData = [
  0,0,0,10,8,12,22,38,55,72,88,92,78,84,96,100,88,76,68,58,44,32,20,10
].map((v, h) => ({ h: `${String(h).padStart(2,"0")}:00`, v }));

const recentOrders = [
  { id:"ORD-4421", user:"somchai_k",  avatar:"S", game:"Mobile Legends", pkg:"86 Diamonds",   method:"PromptPay", amount: 35,  status:"success" as const, time:"2m ago"   },
  { id:"ORD-4420", user:"pailin_w",   avatar:"P", game:"Free Fire",      pkg:"100 Diamonds",  method:"TrueMoney", amount: 40,  status:"failed"  as const, time:"5m ago"   },
  { id:"ORD-4419", user:"nat_gamer",  avatar:"N", game:"PUBG Mobile",    pkg:"60 UC",         method:"PromptPay", amount: 25,  status:"pending" as const, time:"8m ago"   },
  { id:"ORD-4418", user:"arisa_p",    avatar:"A", game:"Genshin Impact", pkg:"300 Genesis",   method:"Wallet",    amount: 169, status:"success" as const, time:"12m ago"  },
  { id:"ORD-4417", user:"bank_play",  avatar:"B", game:"ROV",            pkg:"90 Vouchers",   method:"PromptPay", amount: 35,  status:"success" as const, time:"15m ago"  },
  { id:"ORD-4416", user:"ming_dev",   avatar:"M", game:"Mobile Legends", pkg:"172 Diamonds",  method:"Card",      amount: 59,  status:"success" as const, time:"18m ago"  },
];

const topGames = [
  { name:"Mobile Legends", genre:"MOBA",   revenue:284200, pct:100, orders:1247, trend:10.3, color:"#38bdf8" },
  { name:"Free Fire",       genre:"Battle", revenue:198400, pct:70,  orders:882,  trend:8.3,  color:"#818cf8" },
  { name:"PUBG Mobile",     genre:"Battle", revenue:152300, pct:54,  orders:432,  trend:5.2,  color:"#f472b6" },
  { name:"Genshin Impact",  genre:"RPG",    revenue:134800, pct:47,  orders:321,  trend:15.1, color:"#fbbf24" },
  { name:"ROV",             genre:"MOBA",   revenue:72400,  pct:25,  orders:289,  trend:2.1,  color:"#34d399" },
];

const systemServices = [
  { name:"API Server",       uptime:"99.9%", latency:"42ms",  ok:true  },
  { name:"Payment Gateway",  uptime:"99.2%", latency:"210ms", ok:true  },
  { name:"Auto Top-up",      uptime:"100%",  latency:"180ms", ok:true  },
  { name:"Security",         uptime:"100%",  latency:"0ms",   ok:true  },
  { name:"Database",         uptime:"99.9%", latency:"8ms",   ok:true  },
  { name:"CDN",              uptime:"98.1%", latency:"22ms",  ok:false },
];

const STATUS = {
  success: { color:"#34d399", bg:"rgba(52,211,153,0.12)",  border:"rgba(52,211,153,0.3)"  },
  failed:  { color:"#f87171", bg:"rgba(248,113,113,0.12)", border:"rgba(248,113,113,0.3)" },
  pending: { color:"#fbbf24", bg:"rgba(251,191,36,0.12)",  border:"rgba(251,191,36,0.3)"  },
};

const cardBg = { background:"rgba(11,15,32,0.85)", border:"1px solid #1c2540" };
function fmt(n: number) { return n.toLocaleString("th-TH"); }

// ── Line Chart SVG ────────────────────────────────────────────────
function LineChartSVG({ data }: { data: {h:string,v:number}[] }) {
  const W=560, H=100, pad=8;
  const pts = data.map((d,i) => ({
    x: pad + (i/(data.length-1))*(W-pad*2),
    y: H - pad - (d.v/100)*(H-pad*2),
  }));
  const path = pts.map((p,i) => `${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;
  const peak = pts.reduce((a,b) => b.y < a.y ? b : a);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{height:100}}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35}/>
          <stop offset="100%" stopColor="#38bdf8" stopOpacity={0}/>
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[25,50,75].map(y => (
        <line key={y} x1={pad} y1={H-pad-(y/100)*(H-pad*2)} x2={W-pad} y2={H-pad-(y/100)*(H-pad*2)}
          stroke="#1c2540" strokeWidth={1} strokeDasharray="3,4" />
      ))}
      <path d={area} fill="url(#chartGrad)"/>
      <path d={path} fill="none" stroke="#38bdf8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {/* Peak indicator */}
      <circle cx={peak.x} cy={peak.y} r={5} fill="#38bdf8" stroke="rgba(11,15,32,0.8)" strokeWidth={2}/>
      <circle cx={peak.x} cy={peak.y} r={9} fill="none" stroke="#38bdf8" strokeWidth={1} opacity={0.4}/>
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [lang, setLang] = useState<"th"|"en">("th");
  const t = T[lang];

  const txCounts = useMemo(() => ({
    success: recentOrders.filter(o => o.status==="success").length,
    failed:  recentOrders.filter(o => o.status==="failed").length,
    pending: recentOrders.filter(o => o.status==="pending").length,
    total:   recentOrders.length,
  }), []);

  const now = new Date().toLocaleDateString("th-TH", { day:"numeric", month:"long", year:"numeric" });

  return (
    <div className="flex flex-col min-h-screen" style={{ fontFamily:"sans-serif" }}>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ background:"rgba(8,10,22,0.95)", borderBottom:"1px solid #1c2540" }}>

          {/* Search */}
          <div className="flex items-center gap-2 flex-1 max-w-xs rounded-xl px-3 py-1.5"
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #1c2540" }}>
            <Search size={13} style={{ color:"#64748b" }} />
            <input placeholder={lang==="th" ? "ค้นหา UID, ออเดอร์, ผู้ใช้..." : "Search UID, order, user..."}
              className="bg-transparent outline-none text-xs text-white placeholder-[#3a4a6a] w-full" />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* System badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.25)", color:"#34d399" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              System Online
            </div>

            {/* Lang */}
            <div className="flex rounded-xl overflow-hidden" style={{ border:"1px solid #1c2540" }}>
              {(["th","en"] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold transition-all"
                  style={lang===l ? { background:"rgba(56,189,248,0.15)", color:"#38bdf8" } : { background:"transparent", color:"#64748b" }}>
                  {l==="th" ? "🇹🇭" : "🇬🇧"} {l.toUpperCase()}
                </button>
              ))}
            </div>

            <button className="relative p-2 rounded-xl" style={{ color:"#64748b" }}>
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-400" />
            </button>
            <div className="flex items-center gap-2 px-2 py-1 rounded-xl cursor-pointer"
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #1c2540" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background:"linear-gradient(135deg,#38bdf8,#818cf8)", color:"white" }}>A</div>
              <span className="text-xs text-white hidden sm:block">Admin</span>
              <ChevronDown size={12} style={{ color:"#64748b" }} />
            </div>
          </div>
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex min-h-full">

            {/* ── Center Content ── */}
            <div className="flex-1 p-4 md:p-5 space-y-4 min-w-0">

              {/* Page title */}
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">{t.dashboard}</h1>
                <p className="text-xs mt-0.5" style={{ color:"#64748b" }}>
                  {t.updatedAt}: {now} 17:02:55
                </p>
              </div>

              {/* ── Stat Cards ── */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {[
                  { label:t.todaySales,   value:"฿146,280", sub:"+12.5%", subLabel:t.fromYesterday, icon:TrendingUp,   accent:"#38bdf8", up:true  },
                  { label:t.monthlySales, value:"฿892,400", sub:"+8.9%",  subLabel:t.fromLastMonth, icon:BarChart2,    accent:"#818cf8", up:true  },
                  { label:t.totalOrders,  value:"2,841",    sub:"-0.8%",  subLabel:t.fromLastMonth, icon:ShoppingCart, accent:"#f472b6", up:false },
                  { label:t.successRate,  value:"98.7%",    sub:"+0.4%",  subLabel:t.fromYesterday, icon:CheckCircle2, accent:"#34d399", up:true  },
                  { label:t.activeUsers,  value:"23",       sub:"-4.6%",  subLabel:"now",           icon:Users,        accent:"#fbbf24", up:false },
                  { label:t.newUsers,     value:"14",       sub:"-29%",   subLabel:t.fromYesterday, icon:TrendingDown, accent:"#f87171", up:false },
                ].map((c,i) => {
                  const Icon = c.icon;
                  return (
                    <div key={i} className="rounded-2xl p-3 md:p-4 relative overflow-hidden" style={cardBg}>
                      <div className="absolute inset-0 pointer-events-none rounded-2xl"
                        style={{ background:`radial-gradient(circle at 80% 20%, ${c.accent}12, transparent 60%)` }} />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold leading-tight" style={{ color:"#94a3b8" }}>{c.label}</p>
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:`${c.accent}1a` }}>
                            <Icon size={12} style={{ color:c.accent }} />
                          </div>
                        </div>
                        <p className="text-base md:text-lg font-bold text-white leading-none mb-1">{c.value}</p>
                        <div className="flex items-center gap-0.5 text-[9px] md:text-[10px] font-semibold" style={{ color:c.up?"#34d399":"#f87171" }}>
                          {c.up ? <ArrowUpRight size={9}/> : <ArrowDownRight size={9}/>}
                          <span>{c.sub}</span>
                          <span className="ml-0.5 font-normal" style={{ color:"#64748b" }}>{c.subLabel}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Line Chart ── */}
              <div className="rounded-2xl p-4 md:p-5" style={cardBg}>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <div>
                    <p className="text-sm font-bold text-white">{t.salesChart}</p>
                    <p className="text-[10px]" style={{ color:"#64748b" }}>วันนี้ · รายชั่วโมง</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs" style={{ color:"#94a3b8" }}>
                      <span className="w-3 h-0.5 rounded" style={{ background:"#38bdf8", display:"inline-block" }}/>รายได้
                    </span>
                  </div>
                </div>
                {/* Y labels */}
                <div className="flex gap-3">
                  <div className="flex flex-col justify-between text-[9px] py-1" style={{ color:"#3a4a6a", minWidth:28 }}>
                    {["100k","75k","50k","25k","0"].map(v => <span key={v}>{v}</span>)}
                  </div>
                  <div className="flex-1">
                    <LineChartSVG data={hourlyData} />
                    {/* X labels */}
                    <div className="flex justify-between mt-1 px-1">
                      {["00:00","04:00","08:00","12:00","16:00","20:00","24:00"].map(h => (
                        <span key={h} className="text-[9px]" style={{ color:"#3a4a6a" }}>{h}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Recent Orders ── */}
              <div className="rounded-2xl overflow-hidden" style={cardBg}>
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom:"1px solid #1c2540" }}>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{t.recentOrders}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:"rgba(56,189,248,0.12)", color:"#38bdf8", border:"1px solid rgba(56,189,248,0.25)" }}>
                      Live
                    </span>
                  </div>
                  <button className="text-xs" style={{ color:"#38bdf8" }}>{t.viewAll} →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background:"rgba(5,7,18,0.7)", borderBottom:"1px solid #1c2540" }}>
                        {["Order","User","Game / Package","Method","Amount","Status",""].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap" style={{ color:"#3a4a6a" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((o, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition" style={{ borderBottom:"1px solid #0f1525" }}>
                          <td className="px-3 py-2.5 font-mono" style={{ color:"#67e8f9" }}>{o.id}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                style={{ background:"linear-gradient(135deg,#38bdf8,#818cf8)", color:"white" }}>{o.avatar}</div>
                              <span className="text-white">{o.user}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="text-white font-semibold">{o.game}</p>
                            <p style={{ color:"#64748b" }}>{o.pkg}</p>
                          </td>
                          <td className="px-3 py-2.5" style={{ color:"#94a3b8" }}>{o.method}</td>
                          <td className="px-3 py-2.5 font-bold text-white">฿{o.amount}</td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                              style={{ background:STATUS[o.status].bg, color:STATUS[o.status].color, border:`1px solid ${STATUS[o.status].border}` }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background:STATUS[o.status].color }} />
                              {o.status==="success"?t.success:o.status==="failed"?t.failed:t.pending}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <button style={{ color:"#3a4a6a" }}><Eye size={13}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Top Games ── */}
              <div className="rounded-2xl p-4 md:p-5" style={cardBg}>
                <div className="flex items-center gap-2 pb-3 mb-4" style={{ borderBottom:"1px solid #1c2540" }}>
                  <Trophy size={13} style={{ color:"#fbbf24" }} />
                  <p className="text-sm font-bold text-white">{t.topGames}</p>
                </div>
                <div className="space-y-3">
                  {topGames.map((g, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-bold w-4 flex-shrink-0 text-center" style={{ color:i<3?g.color:"#3a4a6a" }}>#{i+1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{g.name}</p>
                            <span className="text-[9px] px-1.5 py-0.5 rounded flex-shrink-0" style={{ background:`${g.color}18`, color:g.color }}>
                              {g.genre}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <span className="text-[10px] font-semibold" style={{ color:"#34d399" }}>+{g.trend}%</span>
                            <span className="text-xs font-bold" style={{ color:g.color }}>฿{fmt(g.revenue)}</span>
                          </div>
                        </div>
                        <div className="w-full h-1 rounded-full" style={{ background:"rgba(255,255,255,0.05)" }}>
                          <div className="h-full rounded-full" style={{ width:`${g.pct}%`, background:`linear-gradient(90deg,${g.color},${g.color}66)` }} />
                        </div>
                      </div>
                      <span className="text-[10px] flex-shrink-0 w-16 text-right" style={{ color:"#64748b" }}>{fmt(g.orders)} {t.orders}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            </div>
            </div>

            {/* ── Right Panel ── */}
            <div className="hidden xl:flex flex-col w-64 flex-shrink-0 p-4 space-y-4 overflow-y-auto"
              style={{ borderLeft:"1px solid #1c2540" }}>

              {/* Transaction Monitor */}
              <div className="rounded-2xl p-4" style={cardBg}>
                <div className="flex items-center gap-1.5 pb-2.5 mb-3" style={{ borderBottom:"1px solid #1c2540" }}>
                  <Activity size={12} style={{ color:"#38bdf8" }} />
                  <p className="text-xs font-bold text-white">{t.txMonitor}</p>
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {[
                    { label:t.success, count:txCounts.success, ...STATUS.success, icon:CheckCircle2 },
                    { label:t.failed,  count:txCounts.failed,  ...STATUS.failed,  icon:XCircle     },
                    { label:t.pending, count:txCounts.pending, ...STATUS.pending, icon:Clock       },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className="rounded-xl p-2 text-center" style={{ background:s.bg, border:`1px solid ${s.border}` }}>
                        <Icon size={12} className="mx-auto mb-1" style={{ color:s.color }} />
                        <p className="text-sm font-bold" style={{ color:s.color }}>{s.count}</p>
                        <p className="text-[9px]" style={{ color:s.color, opacity:0.8 }}>{s.label}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background:"rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full" style={{ width:`${(txCounts.success/txCounts.total)*100}%`, background:"linear-gradient(90deg,#34d399,#38bdf8)" }} />
                </div>
                <p className="text-[10px] text-right mt-1 font-semibold" style={{ color:"#34d399" }}>
                  {Math.round((txCounts.success/txCounts.total)*100)}% {t.successRate}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl p-4" style={cardBg}>
                <p className="text-xs font-bold text-white pb-2.5 mb-3" style={{ borderBottom:"1px solid #1c2540" }}>{t.quickActions}</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label:t.manageGame,   color:"#38bdf8", icon:"🎮" },
                    { label:t.manageUser,   color:"#818cf8", icon:"👤" },
                    { label:t.topupNow,     color:"#34d399", icon:"⚡" },
                    { label:t.exportReport, color:"#fbbf24", icon:"📊" },
                    { label:t.retryFailed,  color:"#f87171", icon:"🔄" },
                  ].map((a, i) => (
                    <button key={i}
                      className={`rounded-xl p-2.5 text-center transition-all hover:scale-105 ${i===4?"col-span-2":""}`}
                      style={{ background:`${a.color}12`, border:`1px solid ${a.color}25` }}>
                      <p className="text-base mb-1">{a.icon}</p>
                      <p className="text-[9px] font-semibold leading-tight" style={{ color:a.color }}>{a.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* System Status */}
              <div className="rounded-2xl p-4" style={cardBg}>
                <div className="flex items-center justify-between pb-2.5 mb-3" style={{ borderBottom:"1px solid #1c2540" }}>
                  <p className="text-xs font-bold text-white">{t.systemStatus}</p>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold" style={{ background:"rgba(52,211,153,0.12)", color:"#34d399", border:"1px solid rgba(52,211,153,0.3)" }}>
                    {t.allOnline}
                  </span>
                </div>
                <div className="space-y-2">
                  {systemServices.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg px-2.5 py-2"
                      style={{ background:"rgba(255,255,255,0.025)", border:"1px solid #141c30" }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:s.ok?"#34d399":"#f87171" }} />
                      <span className="text-[10px] text-white flex-1 truncate">{s.name}</span>
                      <span className="text-[9px] font-mono" style={{ color:s.ok?"#34d399":"#f87171" }}>{s.latency}</span>
                      <span className="text-[9px]" style={{ color:"#64748b" }}>{s.uptime}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] mt-2 text-center" style={{ color:"#3a4a6a" }}>
                  {t.lastChecked}: 17:02:55 · {lang==="th"?"สำเร็จ":"Success"} 96.8%
                </p>
              </div>

            </div>
          </div>
        </div>
      
  );
}
