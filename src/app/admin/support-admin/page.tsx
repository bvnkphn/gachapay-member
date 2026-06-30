"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  Ticket, MessageSquare, BookOpen, Search, Send,
  Plus, Trash2, Edit3, X, Check, AlertCircle,
  CheckCircle2, XCircle, RefreshCw, FileImage,
  Link2, ShoppingCart, History, User,
  Eye, Youtube, Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type TicketStatus = "new" | "inprogress" | "resolved" | "closed";
type TicketItem = {
  id: string; ticketNo: string; subject: string;
  status: TicketStatus; priority: string; category: string | null;
  email: string; name: string;
  user: { id: string; name: string; email: string; tier: string } | null;
  assignee: { id: string; name: string } | null;
  messageCount: number; lastMessage: any;
  orderId: string | null; createdAt: string;
};
type TicketMsg = {
  id: string; senderType: "user" | "admin"; message: string;
  imageUrl: string | null; createdAt: string;
  user: { id: string; name: string; role: string } | null;
};
type TicketHistoryItem = {
  id: string; action: string; fromValue: string | null;
  toValue: string | null; note: string | null; createdAt: string;
  admin: { id: string; name: string } | null;
};
type OrderRef = {
  id: string; gameName: string; packageName: string;
  packagePrice: string; finalPrice: string | null; cost?: string | null;
  status: string; paymentMethod: string | null;
  uid: string; createdAt: string;
};
type TicketDetail = TicketItem & {
  messages: TicketMsg[];
  histories: TicketHistoryItem[];
  orderRef: OrderRef | null;
  orderCount: number;
};
type FaqItem = {
  id: number; question: string; answer: string;
  videoUrl: string | null; category: string;
  order: number; viewCount: number; isActive: boolean;
  createdAt: string; updatedAt: string;
};
type FaqDraft = { question: string; answer: string; videoUrl: string; category: string };

const STATUS_CFG: Record<TicketStatus, { label: string; color: string; bg: string; border: string; icon: any }> = {
  new:        { label: "ใหม่",           color: "#38bdf8", bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.3)",  icon: AlertCircle  },
  inprogress: { label: "กำลังดำเนินการ", color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)",  icon: RefreshCw    },
  resolved:   { label: "แก้ไขแล้ว",     color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)",  icon: CheckCircle2 },
  closed:     { label: "ปิดเคส",        color: "#94a3b8", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.25)", icon: XCircle      },
};
const PRIORITY_CFG: Record<string, { label: string; color: string }> = {
  low:    { label: "ต่ำ",       color: "#64748b" },
  normal: { label: "ปกติ",     color: "#94a3b8" },
  high:   { label: "สูง",      color: "#f59e0b" },
  urgent: { label: "เร่งด่วน", color: "#f87171" },
};
const FAQ_CATEGORIES = [
  { value: "all",     label: "ทั้งหมด" },
  { value: "topup",   label: "การเติมเงิน" },
  { value: "payment", label: "การชำระเงิน" },
  { value: "refund",  label: "การคืนเงิน" },
  { value: "account", label: "บัญชี" },
  { value: "general", label: "ทั่วไป" },
];
const ALLOWED: Record<TicketStatus, TicketStatus[]> = {
  new:        ["inprogress", "closed"],
  inprogress: ["resolved", "closed"],
  resolved:   ["closed", "inprogress"],
  closed:     [],
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60)    return "เมื่อกี้";
  if (diff < 3600)  return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function fmtMoney(n: number) { return `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const patterns = [/youtube\.com\/watch\?v=([^&]+)/, /youtu\.be\/([^?]+)/, /youtube\.com\/embed\/([^?]+)/];
  for (const p of patterns) { const m = url.match(p); if (m) return `https://www.youtube.com/embed/${m[1]}`; }
  return null;
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.closed; const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap"
      style={{ backgroundColor: c.bg, color: c.color, borderColor: c.border }}>
      <Icon size={11} className="shrink-0" />
      {c.label}
    </span>
  );
}

// ── Order Reference Card ──────────────────────────────────────────
function OrderRefCard({ order }: { order: OrderRef }) {
  const finalPrice = Number(order.finalPrice ?? order.packagePrice);
  const cost       = Number(order.cost ?? 0);
  const profit     = finalPrice - cost;

  const txStatusCfg: Record<string, { label: string; color: string; bg: string }> = {
    completed: { label: "SUCCESS",    color: "#34d399", bg: "rgba(52,211,153,0.15)"  },
    pending:   { label: "PENDING",    color: "#fbbf24", bg: "rgba(251,191,36,0.15)"  },
    failed:    { label: "FAILED",     color: "#f87171", bg: "rgba(248,113,113,0.15)" },
    refunded:  { label: "REFUNDED",   color: "#a78bfa", bg: "rgba(167,139,250,0.15)" },
  };
  const txCfg = txStatusCfg[order.status] ?? { label: order.status.toUpperCase(), color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm text-card-foreground">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 text-primary flex-shrink-0">
            <ShoppingCart size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Order #{order.id}</p>
            <p className="text-[10px] text-muted-foreground">
              Created on {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}
              {" "}{new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Status */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
        <div>
          <p className="text-[10px] tracking-widest font-bold mb-1.5 text-muted-foreground">TRANSACTION STATUS</p>
          <span className="px-3 py-1 rounded-lg text-xs font-bold"
            style={{ backgroundColor: txCfg.bg, color: txCfg.color }}>
            {txCfg.label}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="px-5 py-4 space-y-3.5 text-xs">
        {[
          { label: "GAME NAME", value: order.gameName },
          { label: "PACKAGE", value: order.packageName },
          { label: "GAME UID", value: order.uid, mono: true },
          { label: "PAYMENT METHOD", value: order.paymentMethod ?? "Unknown" },
          { label: "FINAL PRICE", value: fmtMoney(finalPrice), bold: true },
          { label: "ESTIMATED PROFIT", value: profit > 0 ? fmtMoney(profit) : "-", bold: true, color: profit > 0 ? "text-green-500" : "" },
        ].map(({ label, value, mono, bold, color }) => (
          <div key={label} className="flex justify-between items-center py-0.5">
            <span className="text-muted-foreground font-bold tracking-wider text-[10px]">{label}</span>
            <span className={cn(
              "text-foreground text-right max-w-[65%] truncate",
              mono && "font-mono font-semibold",
              bold && "font-extrabold text-sm",
              color
            )}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqForm({ initial, onSave, onCancel, saving }: {
  initial: FaqDraft; onSave: (data: FaqDraft) => void; onCancel: () => void; saving: boolean;
}) {
  const [form, setForm] = useState<FaqDraft>(initial);
  const embedUrl = getYoutubeEmbedUrl(form.videoUrl);
  return (
    <div className="rounded-2xl p-5 space-y-4 bg-muted/30 border border-border/80">
      <div>
        <label className="text-xs font-bold mb-1.5 block text-muted-foreground">หมวดหมู่</label>
        <div className="flex gap-2 flex-wrap">
          {FAQ_CATEGORIES.filter(c => c.value !== "all").map(c => (
            <button key={c.value} type="button" onClick={() => setForm(p => ({ ...p, category: c.value }))}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold border transition",
                form.category === c.value
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-card text-muted-foreground border-border/80 hover:text-foreground"
              )}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-bold mb-1.5 block text-muted-foreground">คำถาม *</label>
        <input value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
          placeholder="เช่น: วิธีเติมเกมทำอย่างไร?"
          className="w-full rounded-xl px-4 py-2.5 text-sm text-foreground bg-card border border-border outline-none placeholder:text-muted-foreground/50" />
      </div>
      <div>
        <label className="text-xs font-bold mb-1.5 block text-muted-foreground">คำตอบ *</label>
        <textarea value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))}
          placeholder="อธิบายคำตอบให้ชัดเจน..." rows={4}
          className="w-full rounded-xl px-4 py-2.5 text-sm text-foreground bg-card border border-border outline-none resize-none placeholder:text-muted-foreground/50" />
      </div>
      <div>
        <label className="text-xs font-bold mb-1.5 flex items-center gap-1.5 text-muted-foreground">
          <Youtube size={12} className="text-red-500 shrink-0" /> Video URL (YouTube) — ไม่บังคับ
        </label>
        <input value={form.videoUrl} onChange={e => setForm(p => ({ ...p, videoUrl: e.target.value }))}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full rounded-xl px-4 py-2.5 text-sm text-foreground bg-card border border-border outline-none placeholder:text-muted-foreground/50" />
        {embedUrl && (
          <div className="mt-3 rounded-xl overflow-hidden border border-border shadow-sm">
            <iframe src={embedUrl} width="100%" height="180"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen className="block" />
          </div>
        )}
        {form.videoUrl && !embedUrl && <p className="text-xs mt-1 text-red-500">URL ไม่ถูกต้อง</p>}
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)} disabled={saving || !form.question.trim() || !form.answer.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 hover:bg-green-500/20 transition disabled:opacity-50">
          {saving ? <RefreshCw size={12} className="animate-spin" /> : <Check size={13} />} บันทึก
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-bold bg-muted text-muted-foreground border border-border hover:bg-muted/80 transition">
          ยกเลิก
        </button>
      </div>
    </div>
  );
}

type Tab = "tickets" | "faq";
type DetailTab = "chat" | "history" | "order";

export default function SupportDashboard() {
  const { token } = useAdminAuth();
  const [tab, setTab]           = useState<Tab>("tickets");
  const [detailTab, setDetailTab] = useState<DetailTab>("chat");
  const [tickets, setTickets]   = useState<TicketItem[]>([]);
  const [selected, setSelected] = useState<TicketDetail | null>(null);
  const [stats, setStats]       = useState({ total:0, new:0, inprogress:0, resolved:0, closed:0, urgent:0 });
  const [loading, setLoading]   = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [statusFilter, setStatusFilter]   = useState<TicketStatus | "all">("all");
  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [msgInput, setMsgInput]     = useState("");
  const [sending, setSending]       = useState(false);
  const searchTimer = useRef<any>(null);
  const chatEndRef  = useRef<HTMLDivElement>(null);

  const [faqs, setFaqs]               = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading]   = useState(false);
  const [faqSaving, setFaqSaving]     = useState(false);
  const [faqCatFilter, setFaqCatFilter] = useState("all");
  const [showNewFaq, setShowNewFaq]   = useState(false);
  const [editFaqId, setEditFaqId]     = useState<number | null>(null);
  const EMPTY_DRAFT: FaqDraft = { question:"", answer:"", videoUrl:"", category:"general" };

  const fetchTickets = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ page:"1", limit:"50",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(search   && { search }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo   && { dateTo }),
      });
      const [tRes, sRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/support/admin/tickets?${p}`, { headers:{ Authorization:`Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/support/admin/stats`,         { headers:{ Authorization:`Bearer ${token}` } }),
      ]);
      setTickets(tRes.data?.data ?? []);
      setStats(sRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, statusFilter, search, dateFrom, dateTo]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const fetchFaqs = useCallback(async () => {
    if (!token) return;
    setFaqLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/faq/admin`, { headers:{ Authorization:`Bearer ${token}` } });
      setFaqs(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); }
    finally { setFaqLoading(false); }
  }, [token]);

  useEffect(() => { if (tab === "faq") fetchFaqs(); }, [tab, fetchFaqs]);

  // Handle global navbar refresh action
  useEffect(() => {
    const handleRefresh = () => {
      if (tab === "tickets") {
        fetchTickets();
      } else {
        fetchFaqs();
      }
    };
    window.addEventListener("admin-refresh", handleRefresh);
    return () => window.removeEventListener("admin-refresh", handleRefresh);
  }, [tab, fetchTickets, fetchFaqs]);

  const fetchDetail = useCallback(async (id: string) => {
    if (!token) return;
    setLoadingDetail(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/support/admin/tickets/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
      setSelected(res.data);
      setDetailTab("chat");
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior:"smooth" }), 150);
    } catch (e) { console.error(e); }
    finally { setLoadingDetail(false); }
  }, [token]);

  const handleSearch = (v: string) => {
    setSearchInput(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(v), 400);
  };

  const updateStatus = async (id: string, status: TicketStatus) => {
    if (!token) return;
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/support/admin/tickets/${id}/status`, { status }, { headers:{ Authorization:`Bearer ${token}` } });
      toast.success("เปลี่ยนสถานะตั๋วสำเร็จ");
      await Promise.all([fetchTickets(), fetchDetail(id)]);
    } catch (e: any) { 
      toast.error(e?.response?.data?.message ?? "เปลี่ยนสถานะไม่สำเร็จ"); 
    }
  };

  const sendReply = async () => {
    if (!msgInput.trim() || !selected || !token) return;
    setSending(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/support/admin/tickets/${selected.id}/reply`, { message: msgInput }, { headers:{ Authorization:`Bearer ${token}` } });
      setMsgInput("");
      await fetchDetail(selected.id);
    } catch (e: any) { 
      toast.error(e?.response?.data?.message ?? "ส่งไม่สำเร็จ"); 
    } finally { setSending(false); }
  };

  const createFaq = async (data: FaqDraft) => {
    if (!token) return; setFaqSaving(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/faq/admin`, { question:data.question, answer:data.answer, videoUrl:data.videoUrl||null, category:data.category }, { headers:{ Authorization:`Bearer ${token}` } });
      toast.success("สร้าง FAQ สำเร็จ");
      setShowNewFaq(false); await fetchFaqs();
    } catch (e: any) { 
      toast.error(e?.response?.data?.message ?? "สร้างไม่สำเร็จ"); 
    } finally { setFaqSaving(false); }
  };

  const updateFaq = async (id: number, data: FaqDraft) => {
    if (!token) return; setFaqSaving(true);
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/faq/admin/${id}`, { question:data.question, answer:data.answer, videoUrl:data.videoUrl||null, category:data.category }, { headers:{ Authorization:`Bearer ${token}` } });
      toast.success("อัปเดต FAQ สำเร็จ");
      setEditFaqId(null); await fetchFaqs();
    } catch (e: any) { 
      toast.error(e?.response?.data?.message ?? "แก้ไขไม่สำเร็จ"); 
    } finally { setFaqSaving(false); }
  };

  const deleteFaq = async (id: number) => {
    if (!token || !confirm("ลบ FAQ นี้?")) return;
    try { 
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/faq/admin/${id}`, { headers:{ Authorization:`Bearer ${token}` } }); 
      toast.success("ลบ FAQ สำเร็จ");
      await fetchFaqs(); 
    } catch (e: any) { 
      toast.error(e?.response?.data?.message ?? "ลบไม่สำเร็จ"); 
    }
  };

  const toggleFaqActive = async (faq: FaqItem) => {
    if (!token) return;
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/faq/admin/${faq.id}`, { isActive: !faq.isActive }, { headers:{ Authorization:`Bearer ${token}` } });
      setFaqs(p => p.map(f => f.id === faq.id ? {...f, isActive:!f.isActive} : f));
      toast.success(faq.isActive ? "ปิดการแสดงผล FAQ" : "เปิดการแสดงผล FAQ");
    } catch (e) { console.error(e); }
  };

  const filteredFaqs = faqs.filter(f => faqCatFilter === "all" || f.category === faqCatFilter);

  return (
    <div className="p-3 sm:p-5 space-y-4">

      <div>
        <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-mono mb-1">Super Admin · Support</p>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          จัดการ <span className="text-primary">Support & FAQ</span>
        </h1>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {([
          { key:"total",      label:"ทั้งหมด",        color:"text-foreground" },
          { key:"new",        label:"ใหม่",            color:"text-sky-500" },
          { key:"inprogress", label:"กำลังดำเนินการ", color:"text-amber-500" },
          { key:"resolved",   label:"แก้ไขแล้ว",      color:"text-emerald-500" },
          { key:"closed",     label:"ปิดเคส",          color:"text-muted-foreground" },
          { key:"urgent",     label:"เร่งด่วน",        color:"text-red-500" },
        ] as const).map(s => (
          <div key={s.key}
            onClick={() => s.key !== "total" && s.key !== "urgent" && setStatusFilter(s.key === statusFilter ? "all" : s.key as TicketStatus)}
            className={cn(
              "rounded-2xl p-3.5 cursor-pointer transition border bg-card text-card-foreground shadow-sm",
              statusFilter === s.key ? "border-primary" : "border-border/80 hover:border-border"
            )}>
            <p className="text-[10px] mb-1 font-bold text-muted-foreground">{s.label}</p>
            <p className={cn("text-xl font-extrabold", s.color)}>{stats[s.key]}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {([["tickets",Ticket,"Ticket Management"],["faq",BookOpen,"FAQ & คู่มือ"]] as const).map(([key,Icon,label]) => (
          <button key={key} onClick={() => setTab(key as Tab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition",
              tab === key
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-card text-muted-foreground border-border/80 hover:text-foreground"
            )}>
            <Icon size={14}/>{label}
          </button>
        ))}
      </div>

      {tab === "tickets" && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-2 space-y-3">
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border/80 shadow-sm">
              <Search size={14} className="text-muted-foreground" />
              <input value={searchInput} onChange={e => handleSearch(e.target.value)}
                placeholder="ค้นหา ticket, email, order id..."
                className="flex-1 bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground/50" />
              {searchInput && <button onClick={() => { setSearchInput(""); setSearch(""); }} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] mb-1 block text-muted-foreground font-bold">ตั้งแต่วันที่</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="w-full rounded-xl px-3.5 py-1.5 text-xs bg-card text-foreground border border-border/80 outline-none" />
              </div>
              <div>
                <label className="text-[10px] mb-1 block text-muted-foreground font-bold">ถึงวันที่</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="w-full rounded-xl px-3.5 py-1.5 text-xs bg-card text-foreground border border-border/80 outline-none" />
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {(["all","new","inprogress","resolved","closed"] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition border",
                    statusFilter === s
                      ? s === "all"
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "border-primary bg-primary/5 text-primary"
                      : "bg-card text-muted-foreground border-border/80 hover:text-foreground hover:border-border"
                  )}>
                  {s==="all" ? "ทั้งหมด" : STATUS_CFG[s].label}
                </button>
              ))}
            </div>
            {loading ? Array.from({length:5}).map((_,i) => (
              <div key={i} className="rounded-2xl p-4 animate-pulse bg-card border border-border/60">
                <div className="h-3.5 w-20 rounded bg-muted/60 mb-2.5" />
                <div className="h-4.5 w-48 rounded bg-muted/60 mb-1.5" />
              </div>
            )) : tickets.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground bg-card border border-border/85 rounded-2xl shadow-sm">
                ไม่มีการแจ้งปัญหา
              </div>
            ) : tickets.map(t => (
              <button key={t.id} onClick={() => fetchDetail(t.id)}
                className={cn(
                  "w-full text-left rounded-2xl p-4 transition border shadow-sm block bg-card text-card-foreground",
                  selected?.id === t.id
                    ? "border-primary bg-primary/5"
                    : "border-border/80 hover:border-border"
                )}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">{t.ticketNo}</span>
                    {t.priority === "urgent" && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-red-500/10 text-red-500">เร่งด่วน</span>}
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <p className="text-sm font-extrabold text-foreground leading-snug mb-1">{t.subject}</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">{t.name}</span>
                    {t.orderId && <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-primary/10 text-primary shrink-0">#{t.orderId.slice(-6)}</span>}
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">{fmtDate(t.createdAt)}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="xl:col-span-3 space-y-4">
            {!selected ? (
              <div className="rounded-2xl flex flex-col items-center justify-center py-20 bg-card border border-border/80 shadow-sm text-card-foreground">
                <MessageSquare size={36} className="text-muted-foreground/60 mb-2" />
                <p className="text-sm text-muted-foreground font-medium">เลือกรายการปัญหาเพื่อดูรายละเอียด</p>
              </div>
            ) : loadingDetail ? (
              <div className="rounded-2xl flex items-center justify-center py-20 bg-card border border-border/80 shadow-sm">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="rounded-2xl p-5 bg-card border border-border/85 shadow-sm text-card-foreground space-y-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-sm font-mono text-cyan-600 dark:text-cyan-400 font-bold">{selected.ticketNo}</span>
                        <StatusBadge status={selected.status} />
                        {selected.priority !== "normal" && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/10"
                            style={{ color: PRIORITY_CFG[selected.priority]?.color ?? "#f59e0b" }}>
                            {PRIORITY_CFG[selected.priority]?.label}
                          </span>
                        )}
                      </div>
                      <p className="text-base font-extrabold text-foreground">{selected.subject}</p>
                      <div className="flex items-center gap-3.5 mt-1.5 flex-wrap text-muted-foreground">
                        <span className="text-xs flex items-center gap-1 font-medium">
                          <User size={12} className="shrink-0" /> {selected.name} · {selected.email}
                        </span>
                        {selected.orderCount > 0 && <span className="text-xs flex items-center gap-1 font-medium">
                          <ShoppingCart size={12} className="shrink-0" /> {selected.orderCount} คำสั่งซื้อ
                        </span>}
                        {selected.assignee && <span className="text-xs text-primary font-bold">ผู้รับผิดชอบ: {selected.assignee.name}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap border-t border-border/40 pt-3">
                    {(ALLOWED[selected.status]??[]).map(s => (
                      <button key={s} onClick={() => updateStatus(selected.id, s)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition hover:opacity-90 border"
                        style={{ backgroundColor: STATUS_CFG[s].bg, color: STATUS_CFG[s].color, borderColor: STATUS_CFG[s].border }}>
                        → {STATUS_CFG[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-1.5">
                  {([["chat",MessageSquare,"รายละเอียดข้อความทั้งหมด"],["order",ShoppingCart,"ข้อมูลออเดอร์"],["history",History,"ประวัติ"]] as const).map(([key,Icon,label]) => (
                    <button key={key} onClick={() => setDetailTab(key as DetailTab)}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border",
                        detailTab === key
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-card text-muted-foreground border-border/80 hover:text-foreground"
                      )}>
                      <Icon size={12}/>{label}
                    </button>
                  ))}
                </div>

                {detailTab === "chat" && (
                  <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm text-card-foreground">
                    <div className="px-4 py-3 flex items-center gap-2 border-b border-border/60 bg-muted/20">
                      <MessageSquare size={13} className="text-primary" />
                      <span className="text-xs font-bold text-foreground">รายละเอียดข้อความทั้งหมด</span>
                      <span className="text-[10px] ml-auto text-muted-foreground font-bold">{selected.messages.length} ข้อความ</span>
                    </div>
                    <div className="p-4 space-y-3.5 overflow-y-auto max-h-[350px] bg-background/10">
                      {selected.messages.length === 0 ? (
                        <p className="text-center text-xs py-10 text-muted-foreground">ยังไม่มีข้อความ</p>
                      ) : selected.messages.map((m, i) => (
                        <div key={i} className={cn("flex", m.senderType === "admin" ? "justify-end" : "justify-start")}>
                          <div className="max-w-[80%]">
                            <p className="text-[10px] mb-1 px-1 text-muted-foreground/80 font-bold">
                              {m.user?.name??selected.name} · {fmtDate(m.createdAt)}
                            </p>
                            <div className={cn(
                              "rounded-2xl px-4 py-2.5 text-xs shadow-sm border",
                              m.senderType === "admin"
                                ? "bg-primary/15 text-primary border-primary/10 rounded-br-none"
                                : "bg-card text-foreground border-border/60 rounded-bl-none"
                            )}>
                              {m.imageUrl ? (
                                <div className="flex items-center gap-2 text-xs font-bold">
                                  <FileImage size={13}/> ไฟล์แนบ: <a href={m.imageUrl} target="_blank" rel="noreferrer" className="underline hover:text-primary">เปิดไฟล์</a>
                                </div>
                              ) : m.message}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="p-3 border-t border-border/60 bg-muted/10 flex justify-center">
                      <a href={`mailto:${selected.email}?subject=Re: [${selected.ticketNo}] ${selected.subject}&body=สวัสดีครับ คุณ ${selected.name},%0D%0A%0D%0A`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 shadow transition text-center text-xs"
                      >
                        <Send size={13} /> ตอบกลับลูกค้าผ่านอีเมล ({selected.email})
                      </a>
                    </div>
                  </div>
                )}

                {detailTab === "order" && (
                  <div>
                    {!selected.orderRef ? (
                      <div className="rounded-2xl flex flex-col items-center justify-center py-16 bg-card border border-border/80 shadow-sm">
                        <ShoppingCart size={32} className="text-muted-foreground/60 mb-2" />
                        <p className="text-sm text-muted-foreground font-semibold">ไม่มีออเดอร์ที่เกี่ยวข้องกับ ticket นี้</p>
                      </div>
                    ) : (
                      <OrderRefCard order={selected.orderRef} />
                    )}
                  </div>
                )}

                {detailTab === "history" && (
                  <div className="rounded-2xl p-5 bg-card border border-border/80 text-card-foreground shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-border/60 bg-muted/20 -mx-5 -mt-5 px-5 py-3">
                      <History size={14} className="text-purple-500" />
                      <p className="text-xs font-bold text-foreground">ประวัติการดำเนินการ</p>
                    </div>
                    {selected.histories.length === 0 ? (
                      <p className="text-center py-8 text-xs text-muted-foreground">ยังไม่มีประวัติ</p>
                    ) : (
                      <div className="space-y-4">
                        {selected.histories.map(h => (
                          <div key={h.id} className="flex items-start gap-3 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-primary" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap font-bold">
                                <span className="text-foreground">
                                  {h.action==="status_changed" ? `เปลี่ยนสถานะ ${h.fromValue} → ${h.toValue}`
                                    : h.action==="assigned" ? "มอบหมายให้ Admin"
                                    : h.action==="replied" ? "ตอบกลับ" : h.action}
                                </span>
                                {h.admin && <span className="text-[10px] text-muted-foreground">โดย {h.admin.name}</span>}
                              </div>
                              {h.note && <p className="text-xs mt-0.5 text-muted-foreground truncate">{h.note}</p>}
                              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{fmtDate(h.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {tab === "faq" && (
        <div className="space-y-4 max-w-4xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {FAQ_CATEGORIES.map(c => (
                  <button key={c.value} onClick={() => setFaqCatFilter(c.value)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-bold border transition whitespace-nowrap",
                      faqCatFilter === c.value
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-card text-muted-foreground border-border/80 hover:text-foreground"
                    )}>
                    {c.label}
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-muted-foreground ml-2 shrink-0">{filteredFaqs.length} รายการ</span>
            </div>
            <button onClick={() => { setShowNewFaq(true); setEditFaqId(null); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 shadow transition">
              <Plus size={14}/> เพิ่มคำถาม
            </button>
          </div>

          {showNewFaq && <FaqForm initial={EMPTY_DRAFT} onSave={createFaq} onCancel={() => setShowNewFaq(false)} saving={faqSaving} />}

          {faqLoading ? (
            <div className="space-y-3">
              {Array.from({length:3}).map((_,i) => (
                <div key={i} className="rounded-2xl p-5 animate-pulse bg-card border border-border/60">
                  <div className="h-4 w-64 rounded bg-muted/60 mb-3" />
                  <div className="h-3 w-full rounded bg-muted/60" />
                </div>
              ))}
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border/80 rounded-2xl shadow-sm">
              <BookOpen size={32} className="mx-auto mb-2 text-muted-foreground/55" />
              <p className="text-sm text-muted-foreground">ยังไม่มี FAQ ในหมวดนี้</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => {
                const embedUrl = getYoutubeEmbedUrl(faq.videoUrl ?? "");
                const isEditing = editFaqId === faq.id;
                const catLabel = FAQ_CATEGORIES.find(c => c.value===faq.category)?.label ?? faq.category;
                return (
                  <div key={faq.id} className={cn(
                    "rounded-2xl overflow-hidden transition border bg-card text-card-foreground shadow-sm",
                    faq.isActive ? "opacity-100" : "opacity-60"
                  )}>
                    {isEditing ? (
                      <div className="p-4">
                        <FaqForm
                          initial={{ question:faq.question, answer:faq.answer, videoUrl:faq.videoUrl??"", category:faq.category }}
                          onSave={(data) => updateFaq(faq.id, data)}
                          onCancel={() => setEditFaqId(null)}
                          saving={faqSaving}
                        />
                      </div>
                    ) : (
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="text-xs font-bold font-mono mt-0.5 shrink-0 w-8 text-center py-0.5 rounded-lg bg-primary/10 text-primary">Q{idx+1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                <p className="text-sm font-extrabold text-foreground">{faq.question}</p>
                                <span className="flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                                  <Tag size={9}/>{catLabel}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground/80 font-semibold">
                                  <Eye size={9}/>{faq.viewCount} views
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed text-foreground/80 font-medium">{faq.answer}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button onClick={() => toggleFaqActive(faq)}
                              className={cn(
                                "relative w-11 h-6 rounded-full transition-colors shrink-0",
                                faq.isActive ? "bg-green-500" : "bg-muted-foreground/30"
                              )}>
                              <span className={cn(
                                "absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform",
                                faq.isActive ? "translate-x-5" : "translate-x-0"
                              )} />
                            </button>
                            <button onClick={() => { setEditFaqId(faq.id); setShowNewFaq(false); }}
                              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition">
                              <Edit3 size={13}/>
                            </button>
                            <button onClick={() => deleteFaq(faq.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition">
                              <Trash2 size={13}/>
                            </button>
                          </div>
                        </div>
                        {faq.videoUrl && embedUrl && (
                          <div className="mt-3 rounded-xl overflow-hidden border border-border">
                            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border-b border-border">
                              <Youtube size={12} className="text-red-500 shrink-0" />
                              <span className="text-[10px] font-extrabold text-red-500">VIDEO GUIDE</span>
                              <a href={faq.videoUrl} target="_blank" rel="noreferrer" className="ml-auto text-[10px] flex items-center gap-1 text-muted-foreground hover:text-foreground font-bold">
                                <Link2 size={9}/> เปิดใน YouTube
                              </a>
                            </div>
                            <iframe src={embedUrl} width="100%" height="200"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen className="block" />
                          </div>
                        )}
                        {faq.videoUrl && !embedUrl && (
                          <a href={faq.videoUrl} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-primary hover:underline">
                            <Link2 size={11}/> ดูวิดีโอ
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
