"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search, ChevronDown, Check, Bell, Download,
  RefreshCw, Eye, X, ChevronLeft, ChevronRight,
  FileText, CreditCard, Gamepad2, SlidersHorizontal,
} from "lucide-react";

// ══════════════════════════════════════════════════════
// FLAGS & LANG DROPDOWN
// ══════════════════════════════════════════════════════
function FlagTH() {
  return <svg viewBox="0 0 30 20" width="28" height="18" style={{ borderRadius: 3, display: "block" }}>
    <rect width="30" height="20" fill="#A51931" />
    <rect y="3.33" width="30" height="13.34" fill="#F4F5F8" />
    <rect y="6.67" width="30" height="6.66" fill="#2D2A4A" />
  </svg>;
}
function FlagUK() {
  return <svg viewBox="0 0 60 40" width="28" height="18" style={{ borderRadius: 3, display: "block" }}>
    <rect width="60" height="40" fill="#012169" />
    <line x1="0" y1="0" x2="60" y2="40" stroke="white" strokeWidth="8" />
    <line x1="60" y1="0" x2="0" y2="40" stroke="white" strokeWidth="8" />
    <line x1="0" y1="0" x2="60" y2="40" stroke="#C8102E" strokeWidth="4.8" />
    <line x1="60" y1="0" x2="0" y2="40" stroke="#C8102E" strokeWidth="4.8" />
    <rect x="24" y="0" width="12" height="40" fill="white" />
    <rect x="0" y="14" width="60" height="12" fill="white" />
    <rect x="26" y="0" width="8" height="40" fill="#C8102E" />
    <rect x="0" y="16" width="60" height="8" fill="#C8102E" />
  </svg>;
}
const LANG_OPTIONS = [
  { code: "th" as const, label: "ภาษาไทย", Flag: FlagTH },
  { code: "en" as const, label: "English",  Flag: FlagUK },
];
function LangDropdown({ lang, setLang }: { lang: "th"|"en"; setLang: (l: "th"|"en") => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const cur = LANG_OPTIONS.find(o => o.code === lang)!;
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 px-2 py-1.5 rounded-xl transition hover:bg-white/5"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid #1e293b" }}>
        <cur.Flag />
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
              {lang === o.code && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#38bdf8" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// i18n
// ══════════════════════════════════════════════════════
const T = {
  th: {
    pageTitle: "ธุรกรรม", pageSubtitle: "ดูและจัดการธุรกรรมผู้เล่นทั้งหมด",
    searchPh: "ค้นหา Order ID, UID, หรือเบอร์โทร...",
    systemOnline: "ระบบออนไลน์", adminLabel: "แอดมิน",
    exportCSV: "ส่งออก CSV", exportExcel: "ส่งออก Excel",
    allGames: "ทุกเกม", statusAll: "สถานะ: ทั้งหมด",
    statusSuccess: "สำเร็จ", statusPending: "กำลังดำเนินการ",
    statusFailed: "ล้มเหลว", statusRefunded: "คืนเงินแล้ว",
    recentTx: "ธุรกรรมล่าสุด", viewAll: "ดูทั้งหมด",
    live: "สด",
    colGame: "เกม", colUID: "UID", colMethod: "วิธีชำระ", colTime: "เวลา",
    colAmount: "ยอด", colStatus: "สถานะ", colActions: "ดู",
    minAgo: "นาทีที่แล้ว", next: "ถัดไป",
    // Modal
    modalCreatedOn: "สร้างเมื่อ",
    txStatus: "สถานะธุรกรรม", paymentMethod: "วิธีชำระเงิน",
    gameDetails: "รายละเอียดเกม", financials: "การเงิน",
    gameName: "ชื่อเกม:", package: "แพ็กเกจ:", uid: "Player ID (UID):", server: "เซิร์ฟเวอร์:",
    totalAmount: "ยอดรวม:", costPrice: "ต้นทุน:", adminProfit: "กำไรแอดมิน:",
    internalNotes: "บันทึกภายใน", notesPlaceholder: "เพิ่มบันทึกสำหรับออเดอร์นี้...",
    cancelRefund: "ยกเลิก / คืนเงิน", close: "ปิด", saveNote: "บันทึกโน้ต",
    txSuccess: "สำเร็จ", txPending: "รอดำเนินการ", txFailed: "ล้มเหลว", txRefunded: "คืนเงินแล้ว",
  },
  en: {
    pageTitle: "Transactions", pageSubtitle: "Review and manage all player transactions",
    searchPh: "Order ID, UID, or Phone...",
    systemOnline: "System Online", adminLabel: "Admin",
    exportCSV: "Export CSV", exportExcel: "Export Excel",
    allGames: "All Games", statusAll: "Status: All",
    statusSuccess: "Success", statusPending: "Pending",
    statusFailed: "Failed", statusRefunded: "Refunded",
    recentTx: "Recent Transactions", viewAll: "View All",
    live: "Live",
    colGame: "Game", colUID: "UID", colMethod: "Method", colTime: "Time",
    colAmount: "Amount", colStatus: "Status", colActions: "View",
    minAgo: "min ago", next: "Next",
    // Modal
    modalCreatedOn: "Created on",
    txStatus: "Transaction Status", paymentMethod: "Payment Method",
    gameDetails: "Game Details", financials: "Financials",
    gameName: "Game Name:", package: "Package:", uid: "Player ID (UID):", server: "Server:",
    totalAmount: "Total Amount:", costPrice: "Cost Price:", adminProfit: "Admin Profit:",
    internalNotes: "Internal Notes", notesPlaceholder: "Add a note to this order...",
    cancelRefund: "Cancel/Refund", close: "Close", saveNote: "Save Note",
    txSuccess: "Success", txPending: "Pending", txFailed: "Failed", txRefunded: "Refunded",
  },
};

// ══════════════════════════════════════════════════════
// Types & Data
// ══════════════════════════════════════════════════════
type TxStatus = "success"|"pending"|"failed"|"refunded";

const ST: Record<TxStatus, { color: string; bg: string; border: string }> = {
  success:  { color:"#34d399", bg:"rgba(52,211,153,0.12)",  border:"rgba(52,211,153,0.3)"  },
  pending:  { color:"#38bdf8", bg:"rgba(56,189,248,0.12)",  border:"rgba(56,189,248,0.3)"  },
  failed:   { color:"#f59e0b", bg:"rgba(245,158,11,0.12)",  border:"rgba(245,158,11,0.3)"  },
  refunded: { color:"#f87171", bg:"rgba(248,113,113,0.12)", border:"rgba(248,113,113,0.3)" },
};

interface Tx {
  id: string; orderId: string; game: string; logo: string; logoColor: string;
  pkg: string; uid: string; method: string; min: number;
  amount: number; status: TxStatus;
  totalAmount: number; costPrice: number; profit: number;
  server: string; createdAt: string; paymentMethod: string;
}

const GAMES_LIST = [
  { name:"Mobile Legends", logo:"⚔️", color:"#38bdf8" },
  { name:"Free Fire",      logo:"🔥", color:"#f87171" },
  { name:"PUBG Mobile",    logo:"🎯", color:"#fbbf24" },
  { name:"Genshin Impact", logo:"✨", color:"#a78bfa" },
  { name:"ROV",            logo:"🏆", color:"#34d399" },
  { name:"Valorant",       logo:"🎮", color:"#818cf8" },
  { name:"Honkai: SR",     logo:"⭐", color:"#f472b6" },
];

const METHODS = ["PromptPay","TrueMoney","บัตรเครดิต","Mobile Banking","TrueMoney Wallet"];
const PKGS: Record<string,string[]> = {
  "Mobile Legends":["86 Diamonds","172 Diamonds","344 Diamonds","570 Diamonds"],
  "Free Fire":["100 Diamonds","310 Diamonds","520 Diamonds","1060 Diamonds"],
  "PUBG Mobile":["60 UC","325 UC","660 UC","1800 UC"],
  "Genshin Impact":["300 Genesis","980 Genesis","1980 Genesis","3280 Genesis"],
  "ROV":["90 Vouchers","180 Vouchers","375 Vouchers","775 Vouchers"],
  "Valorant":["475 VP","1000 VP","2050 VP","3650 VP"],
  "Honkai: SR":["60 Oneiric","300 Oneiric","980 Oneiric","1980 Oneiric"],
};

const STATUSES: TxStatus[] = ["success","pending","failed","refunded","success","success","success","pending","failed","success"];

// Generate 100 mock transactions
const ALL_TX: Tx[] = Array.from({ length: 100 }, (_, i) => {
  const g = GAMES_LIST[i % GAMES_LIST.length];
  const pkgs = PKGS[g.name];
  const pkg = pkgs[i % pkgs.length];
  const method = METHODS[i % METHODS.length];
  const status = STATUSES[i % STATUSES.length];
  const baseAmount = [35,40,25,169,35,59,120,250,89,19][i % 10];
  const cost = Math.round(baseAmount * 0.85);
  return {
    id: `LOG-${8000 + i}`,
    orderId: `ORD-${4400 + i}`,
    game: g.name, logo: g.logo, logoColor: g.color,
    pkg, uid: `${10000000 + i * 137}`,
    method, min: (i % 30) + 1,
    amount: baseAmount, status,
    totalAmount: baseAmount, costPrice: cost, profit: baseAmount - cost,
    server: ["TH","Global","Asia","NA","EU"][i % 5],
    createdAt: `2026-03-${String(8 + (i % 12)).padStart(2,"0")} ${String(10 + (i % 12)).padStart(2,"0")}:${String(i % 60).padStart(2,"0")}:00`,
    paymentMethod: method === "PromptPay" ? "QR PromptPay (KBANK)" : method,
  };
});

const PAGE_SIZE = 10;

// ══════════════════════════════════════════════════════
// ORDER DETAIL MODAL
// ══════════════════════════════════════════════════════
function OrderModal({ tx, onClose, t }: { tx: Tx; onClose: () => void; t: typeof T["th"] }) {
  const [note, setNote] = useState("");
  const txCfg = ST[tx.status];
  const txLabel = (s: TxStatus) => {
    if (s === "success")  return t.txSuccess;
    if (s === "pending")  return t.txPending;
    if (s === "failed")   return t.txFailed;
    return t.txRefunded;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.75)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{ background: "#0f1729", border: "1px solid #1e293b", boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
          style={{ background: "#0f1729", borderBottom: "1px solid #1e293b" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)" }}>
              <FileText size={15} style={{ color: "#38bdf8" }} />
            </div>
            <div>
              <p className="text-base font-bold text-white">Order #{tx.orderId}</p>
              <p className="text-[11px]" style={{ color: "#64748b" }}>{t.modalCreatedOn} {tx.createdAt}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "#64748b" }}>
            <X size={16} />
          </button>
        </div>

        {/* TX Status + Payment */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid #1e293b", background: "rgba(255,255,255,0.02)" }}>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#64748b" }}>{t.txStatus}</p>
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: txCfg.bg, color: txCfg.color, border: `1px solid ${txCfg.border}` }}>
              {txLabel(tx.status).toUpperCase()}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#64748b" }}>{t.paymentMethod}</p>
            <p className="text-sm font-semibold text-white">{tx.paymentMethod}</p>
          </div>
        </div>

        {/* Game Details + Financials */}
        <div className="grid grid-cols-2 gap-4 px-5 py-5" style={{ borderBottom: "1px solid #1e293b" }}>
          {/* Game */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Gamepad2 size={13} style={{ color: "#38bdf8" }} />
              <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#38bdf8" }}>{t.gameDetails}</p>
            </div>
            <div className="space-y-2">
              {[
                [t.gameName, tx.game],
                [t.package,  tx.pkg ],
                [t.uid,      tx.uid ],
                [t.server,   tx.server],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-xs gap-3">
                  <span style={{ color: "#64748b" }}>{label}</span>
                  <span className="font-semibold text-white text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financials */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <CreditCard size={13} style={{ color: "#34d399" }} />
              <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#34d399" }}>{t.financials}</p>
            </div>
            <div className="rounded-xl p-3 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1e293b" }}>
              {[
                [t.totalAmount, `฿${tx.totalAmount.toLocaleString()}`, "#e2e8f0"],
                [t.costPrice,   `฿${tx.costPrice.toLocaleString()}`,   "#94a3b8"],
              ].map(([label, val, color]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span style={{ color: "#64748b" }}>{label}</span>
                  <span className="font-semibold" style={{ color }}>{val}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2" style={{ borderTop: "1px solid #1e293b" }}>
                <span className="font-bold tracking-wide uppercase text-[10px]" style={{ color: "#34d399" }}>{t.adminProfit}</span>
                <span className="text-lg font-bold" style={{ color: "#34d399" }}>฿{tx.profit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Internal Notes */}
        <div className="px-5 py-4" style={{ borderBottom: "1px solid #1e293b" }}>
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#64748b" }}>{t.internalNotes}</p>
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder={t.notesPlaceholder} rows={3}
            className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #2a3550" }} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4">
          <button className="flex items-center gap-1.5 text-xs font-semibold transition hover:opacity-80"
            style={{ color: "#f87171" }}>
            ✕ {t.cancelRefund}
          </button>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition hover:bg-white/5"
              style={{ border: "1px solid #2a3550", color: "#94a3b8" }}>{t.close}</button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#38bdf8,#818cf8)", color: "#fff" }}>
              <FileText size={13} />{t.saveNote}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// SELECT DROPDOWN (generic)
// ══════════════════════════════════════════════════════
function SelectDrop({ value, options, onChange }: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const cur = options.find(o => o.value === value)!;
  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition hover:bg-white/5"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid #2a3550", color: "#e2e8f0", width: "100%" }}>
        <span className="flex-1 text-left truncate">{cur.label}</span>
        <ChevronDown size={12} style={{ color: "#64748b", transform: open ? "rotate(180deg)" : "none", transition: ".18s", flexShrink: 0 }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-full rounded-xl overflow-hidden z-30"
          style={{ background: "#131929", border: "1px solid #2a3550", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", minWidth: 140 }}>
          {options.map(o => (
            <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-left transition hover:bg-white/5"
              style={{ color: value === o.value ? "#38bdf8" : "#e2e8f0", borderBottom: "1px solid #1e293b" }}>
              {o.label}
              {value === o.value && <Check size={11} style={{ color: "#38bdf8", flexShrink: 0 }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════
export default function TransactionsPage() {
  const [lang, setLang]     = useState<"th"|"en">("th");
  const [search, setSearch] = useState("");
  const [gameFilter, setGameFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage]     = useState(1);
  const [modalTx, setModalTx] = useState<Tx|null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const t = T[lang];

  // Filter
  const filtered = ALL_TX.filter(tx => {
    if (gameFilter !== "all" && tx.game !== gameFilter) return false;
    if (statusFilter !== "all" && tx.status !== statusFilter) return false;
    const q = search.toLowerCase();
    if (q && !tx.orderId.toLowerCase().includes(q) && !tx.uid.includes(q) && !tx.game.toLowerCase().includes(q)) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const statusLabel = (s: TxStatus) => {
    if (s === "success")  return t.statusSuccess;
    if (s === "pending")  return t.statusPending;
    if (s === "failed")   return t.statusFailed;
    return t.statusRefunded;
  };

  const gameOptions = [
    { label: t.allGames, value: "all" },
    ...GAMES_LIST.map(g => ({ label: g.name, value: g.name })),
  ];

  const statusOptions = [
    { label: t.statusAll,      value: "all"      },
    { label: t.statusSuccess,  value: "success"  },
    { label: t.statusPending,  value: "pending"  },
    { label: t.statusFailed,   value: "failed"   },
    { label: t.statusRefunded, value: "refunded" },
  ];

  // Sliding window of 3 around current, always show last
  const getPages = () => {
    const pages: (number|"...")[] = [];
    const start = Math.max(1, page - 1);
    const end   = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    if (totalPages > end) pages.push(totalPages);
    return pages;
  };

  const card = { background: "rgba(11,15,32,0.9)", border: "1px solid #1c2540" };

  return (
    <div className="flex flex-col min-h-full"
      style={{ background: "linear-gradient(160deg,#080c18 0%,#0a0e1e 60%,#060911 100%)", fontFamily: "'Noto Sans Thai','Inter',sans-serif" }}>

      {modalTx && <OrderModal tx={modalTx} onClose={() => setModalTx(null)} t={t} />}

      {/* ══ TOPBAR ══ */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 flex-shrink-0"
        style={{ background: "#111827", borderBottom: "1px solid #1e293b", minHeight: 52 }}>
        <div className="flex items-center gap-2 flex-1 min-w-0 max-w-sm rounded-xl px-3 py-2"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1e293b" }}>
          <Search size={13} style={{ color: "#64748b", flexShrink: 0 }} />
          <input placeholder={t.searchPh} value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent outline-none text-xs text-white placeholder-[#3a4a6a] w-full min-w-0" />
        </div>
        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "#fff", color: "#0f172a" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{t.systemOnline}
          </div>
          <LangDropdown lang={lang} setLang={setLang} />
          <button className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5"
            style={{ border: "1px solid #1e293b" }}>
            <Bell size={15} style={{ color: "#94a3b8" }} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#38bdf8,#818cf8)" }}>
            <span className="text-white text-xs font-bold">A</span>
          </button>
          <span className="text-sm font-semibold text-white hidden md:block">{t.adminLabel}</span>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="flex-1 p-4 sm:p-5 space-y-4">

        {/* Page header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">{t.pageTitle}</h1>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{t.pageSubtitle}</p>
          </div>
          {/* Export buttons */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: t.exportCSV,   color: "#34d399" },
              { label: t.exportExcel, color: "#38bdf8" },
            ].map(btn => (
              <button key={btn.label}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition hover:opacity-80"
                style={{ background: `${btn.color}15`, border: `1px solid ${btn.color}35`, color: btn.color }}>
                <Download size={12} />{btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table card ── */}
        <div className="rounded-2xl overflow-hidden" style={card}>

          {/* ── Filter bar ── */}
          <div style={{ borderBottom: "1px solid #1c2540" }}>

            {/* Main row: search + filter toggle (mobile) / full filters (desktop) */}
            <div className="flex items-center gap-2.5 px-4 sm:px-5 py-3">

              {/* Search — full width always */}
              <div className="flex items-center gap-2 flex-1 min-w-0 rounded-xl px-3 py-2"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e293b" }}>
                <Search size={13} style={{ color: "#64748b", flexShrink: 0 }} />
                <input placeholder={t.searchPh} value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="bg-transparent outline-none text-xs text-white placeholder-[#3a4a6a] w-full min-w-0" />
              </div>

              {/* Desktop: dropdowns inline */}
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                <div style={{ width: 140 }}>
                  <SelectDrop value={gameFilter} options={gameOptions}
                    onChange={v => { setGameFilter(v); setPage(1); }} />
                </div>
                <div style={{ width: 160 }}>
                  <SelectDrop value={statusFilter} options={statusOptions}
                    onChange={v => { setStatusFilter(v); setPage(1); }} />
                </div>
                <button onClick={refresh}
                  className="w-8 h-8 flex items-center justify-center rounded-xl transition hover:bg-white/5"
                  style={{ border: "1px solid #2a3550", color: "#64748b" }}>
                  <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                </button>
              </div>

              {/* Mobile: filter icon + refresh */}
              <div className="flex sm:hidden items-center gap-2 flex-shrink-0">
                <button onClick={refresh}
                  className="w-9 h-9 flex items-center justify-center rounded-xl transition hover:bg-white/5"
                  style={{ border: "1px solid #2a3550", color: "#64748b" }}>
                  <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                </button>
                <button
                  onClick={() => setFilterOpen(o => !o)}
                  className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-semibold transition"
                  style={{
                    background: (gameFilter !== "all" || statusFilter !== "all")
                      ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.05)",
                    border: (gameFilter !== "all" || statusFilter !== "all")
                      ? "1px solid rgba(56,189,248,0.4)" : "1px solid #2a3550",
                    color: (gameFilter !== "all" || statusFilter !== "all") ? "#38bdf8" : "#94a3b8",
                  }}>
                  <SlidersHorizontal size={14} />
                  {(gameFilter !== "all" || statusFilter !== "all") && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile filter panel — slide down when open */}
            {filterOpen && (
              <div className="sm:hidden flex flex-col gap-2.5 px-4 pb-3">
                <div className="w-full">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#3a4a6a" }}>{t.allGames}</p>
                  <SelectDrop value={gameFilter} options={gameOptions}
                    onChange={v => { setGameFilter(v); setPage(1); }} />
                </div>
                <div className="w-full">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#3a4a6a" }}>{t.statusAll.replace(": ", " ")}</p>
                  <SelectDrop value={statusFilter} options={statusOptions}
                    onChange={v => { setStatusFilter(v); setPage(1); }} />
                </div>
                {/* Clear filters */}
                {(gameFilter !== "all" || statusFilter !== "all") && (
                  <button
                    onClick={() => { setGameFilter("all"); setStatusFilter("all"); setPage(1); setFilterOpen(false); }}
                    className="text-xs font-semibold py-2 rounded-xl transition hover:bg-white/5"
                    style={{ color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
                    ✕ {lang === "th" ? "ล้างตัวกรอง" : "Clear filters"}
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Section title */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3"
            style={{ borderBottom: "1px solid #0f1525" }}>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white">{t.recentTx}</p>
              <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />{t.live}
              </span>
            </div>
            <button className="text-xs font-semibold" style={{ color: "#38bdf8" }}>{t.viewAll}</button>
          </div>

          {/* Table — scrollable on mobile */}
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 580 }}>
              <tbody>
                {pageItems.map((tx, i) => (
                  <tr key={tx.id} className="group hover:bg-white/[0.02] transition cursor-pointer"
                    style={{ borderBottom: "1px solid #0a0f1e" }}
                    onClick={() => setModalTx(tx)}>

                    {/* Game logo + name + pkg */}
                    <td className="px-4 sm:px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: `${tx.logoColor}18`, border: `1px solid ${tx.logoColor}30` }}>
                          {tx.logo}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-white">{tx.game}</span>
                            <span className="text-xs" style={{ color: "#3a4a6a" }}>·</span>
                            <span className="text-xs" style={{ color: "#94a3b8" }}>{tx.pkg}</span>
                          </div>
                          <p className="text-[11px] mt-0.5" style={{ color: "#64748b" }}>
                            UID: {tx.uid} · {tx.method} · {tx.min} {t.minAgo}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ราคา */}
                    <td className="py-3 text-sm font-bold text-white text-right whitespace-nowrap"
                      style={{ width: 80, paddingRight: 52 }}>
                      ฿{tx.amount}
                    </td>

                    {/* Status badge */}
                    <td className="py-3 whitespace-nowrap"
                      style={{ width: 160, paddingRight: 40 }}>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: ST[tx.status].bg, color: ST[tx.status].color, border: `1px solid ${ST[tx.status].border}` }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ST[tx.status].color }} />
                        {statusLabel(tx.status)}
                      </span>
                    </td>

                    {/* Eye */}
                    <td className="py-3 whitespace-nowrap"
                      style={{ width: 56, paddingRight: 24 }}>
                      <button
                        onClick={e => { e.stopPropagation(); setModalTx(tx); }}
                        className="p-1.5 rounded-lg transition hover:bg-white/10"
                        style={{ color: "#64748b" }}>
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 flex-wrap gap-2"
            style={{ borderTop: "1px solid #1c2540" }}>
            <p className="text-xs" style={{ color: "#64748b" }}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition hover:bg-white/5"
                style={{ color: page === 1 ? "#3a4a6a" : "#94a3b8", border: "1px solid #1c2540" }}>
                <ChevronLeft size={13} />
              </button>
              {getPages().map((n, i) => (
                <button key={i}
                  onClick={() => typeof n === "number" && setPage(n)}
                  disabled={n === "..."}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition"
                  style={n === page
                    ? { background: "rgba(56,189,248,0.2)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.4)" }
                    : { color: n === "..." ? "#3a4a6a" : "#64748b", border: "1px solid #1c2540" }}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="flex items-center gap-1 px-2 h-8 rounded-lg text-xs font-semibold transition hover:bg-white/5"
                style={{ color: page === totalPages ? "#3a4a6a" : "#94a3b8", border: "1px solid #1c2540" }}>
                {t.next} <ChevronRight size={12} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}