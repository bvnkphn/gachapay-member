"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Zap, Plus, RefreshCw, TrendingUp, TrendingDown,
  AlertTriangle, ArrowUpCircle, ArrowDownCircle,
  Settings2, Trash2, History, X, Wallet,
  CheckCircle2, XCircle, Edit3, Eye, Loader2,
  ChevronDown, Gamepad2, CreditCard, Globe
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function timeAgo(date: string | Date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (diff < 1) return "เมื่อกี้";
  if (diff < 60) return `${diff} นาทีที่แล้ว`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h} ชม.ที่แล้ว`;
  return `${Math.floor(h / 24)} วันที่แล้ว`;
}

const TYPE_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  topup: { label: "เติมเครดิต", color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", icon: ArrowUpCircle },
  deduct: { label: "หักเครดิต", color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", icon: ArrowDownCircle },
  adjust: { label: "ปรับยอด", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", icon: Edit3 },
};

function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_CFG[type] ?? TYPE_CFG.adjust;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function StatusDot({ balance, threshold }: { balance: number; threshold: number }) {
  const ratio = threshold > 0 ? balance / threshold : 1;
  const color = ratio >= 2 ? "#10b981" : ratio >= 1 ? "#f59e0b" : "#ef4444";
  const label = ratio >= 2 ? "ปกติ" : ratio >= 1 ? "เตือน" : "วิกฤต";
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color }}>
      <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
      {label}
    </span>
  );
}

// ── Modal wrapper ──────────────────────────────────────────────────
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted/60 text-muted-foreground">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Input component ────────────────────────────────────────────────
function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
      <input
        {...props}
        className="w-full px-3 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
      />
    </div>
  );
}

// Helper to get provider icon
const getProviderIcon = (code: string) => {
  const className = "w-5 h-5 text-primary";
  switch (code) {
    case "24payseller":
      return <Gamepad2 className={className} />;
    case "omise":
      return <CreditCard className={className} />;
    default:
      return <Globe className={className} />;
  }
};

// ── Page ───────────────────────────────────────────────────────────
export default function ApiCreditPage() {
  const { token } = useAdminAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [providers, setProviders] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [topupModal, setTopupModal] = useState<{ open: boolean; provider: any | null }>({ open: false, provider: null });
  const [adjustModal, setAdjustModal] = useState<{ open: boolean; provider: any | null }>({ open: false, provider: null });
  const [historyModal, setHistoryModal] = useState<{ open: boolean; provider: any | null; transactions: any[] }>({ open: false, provider: null, transactions: [] });
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<{ open: boolean; provider: any | null }>({ open: false, provider: null });

  // Form states
  const [topupAmount, setTopupAmount] = useState("");
  const [topupNote, setTopupNote] = useState("");
  const [adjustBalance, setAdjustBalance] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [newProvider, setNewProvider] = useState({ name: "", code: "", description: "", apiBaseUrl: "", balance: "", alertThreshold: "1000" });
  const [editData, setEditData] = useState({ name: "", description: "", apiBaseUrl: "", alertThreshold: "" });
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch data ──────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [pRes, sRes] = await Promise.all([
        axios.get(`${API}/api-credit/providers`, { headers }),
        axios.get(`${API}/api-credit/summary`, { headers }),
      ]);
      setProviders(pRes.data);
      setSummary(sRes.data);
    } catch (err: any) {
      toast.error("โหลดข้อมูลเครดิตล้มเหลว");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refresh = () => { setRefreshing(true); fetchData(); };

  // ── Handlers ────────────────────────────────────────────────────
  const handleTopup = async () => {
    const amt = parseFloat(topupAmount);
    if (!amt || amt <= 0) { toast.error("กรุณากรอกจำนวนเงิน"); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/api-credit/providers/${topupModal.provider.id}/topup`, { amount: amt, note: topupNote || undefined }, { headers });
      toast.success(`เติมเครดิต ฿${fmt(amt)} สำเร็จ`);
      setTopupModal({ open: false, provider: null });
      setTopupAmount(""); setTopupNote("");
      fetchData();
    } catch { toast.error("เติมเครดิตล้มเหลว"); }
    finally { setSubmitting(false); }
  };

  const handleAdjust = async () => {
    const bal = parseFloat(adjustBalance);
    if (isNaN(bal) || bal < 0) { toast.error("กรุณากรอกยอดเครดิตใหม่"); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/api-credit/providers/${adjustModal.provider.id}/adjust`, { newBalance: bal, note: adjustNote || undefined }, { headers });
      toast.success(`ปรับยอดเป็น ฿${fmt(bal)} สำเร็จ`);
      setAdjustModal({ open: false, provider: null });
      setAdjustBalance(""); setAdjustNote("");
      fetchData();
    } catch { toast.error("ปรับยอดล้มเหลว"); }
    finally { setSubmitting(false); }
  };

  const handleAddProvider = async () => {
    if (!newProvider.name || !newProvider.code) { toast.error("กรุณากรอกชื่อและรหัส"); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/api-credit/providers`, {
        ...newProvider,
        balance: parseFloat(newProvider.balance) || 0,
        alertThreshold: parseFloat(newProvider.alertThreshold) || 1000,
      }, { headers });
      toast.success("เพิ่มผู้ให้บริการสำเร็จ");
      setAddModal(false);
      setNewProvider({ name: "", code: "", description: "", apiBaseUrl: "", balance: "", alertThreshold: "1000" });
      fetchData();
    } catch { toast.error("เพิ่มผู้ให้บริการล้มเหลว"); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!editData.name) { toast.error("กรุณากรอกชื่อ"); return; }
    setSubmitting(true);
    try {
      await axios.patch(`${API}/api-credit/providers/${editModal.provider.id}`, {
        name: editData.name,
        description: editData.description || undefined,
        apiBaseUrl: editData.apiBaseUrl || undefined,
        alertThreshold: parseFloat(editData.alertThreshold) || 1000,
      }, { headers });
      toast.success("อัปเดตสำเร็จ");
      setEditModal({ open: false, provider: null });
      fetchData();
    } catch { toast.error("อัปเดตล้มเหลว"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (provider: any) => {
    if (!confirm(`ลบ ${provider.name} หรือไม่?`)) return;
    try {
      await axios.delete(`${API}/api-credit/providers/${provider.id}`, { headers });
      toast.success("ลบสำเร็จ");
      fetchData();
    } catch { toast.error("ลบล้มเหลว"); }
  };

  const handleToggle = async (provider: any) => {
    try {
      await axios.patch(`${API}/api-credit/providers/${provider.id}`, { enabled: !provider.enabled }, { headers });
      fetchData();
    } catch { toast.error("เปลี่ยนสถานะล้มเหลว"); }
  };

  const openHistory = async (provider: any) => {
    try {
      const res = await axios.get(`${API}/api-credit/providers/${provider.id}/transactions`, { headers });
      setHistoryModal({ open: true, provider, transactions: res.data });
    } catch { toast.error("โหลดประวัติล้มเหลว"); }
  };

  // ── Loading ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="p-3 sm:p-5 space-y-6">
      {/* Subtitle & Title */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/80">SUPER ADMIN • CREDIT SETTINGS</p>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-1">
            จัดการ <span className="text-primary">API Credit</span>
          </h1>
        </div>
        <div>
          <button onClick={() => setAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:bg-foreground/90 transition-all shadow-sm cursor-pointer">
            <Plus size={13} /> เพิ่มผู้ให้บริการ
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: "ยอดเครดิตรวม",
              value: `฿${fmt(summary.totalBalance)}`,
              sub: `จาก ${summary.totalProviders} ผู้ให้บริการ`,
              icon: Wallet,
              accent: "#10b981", // Emerald
            },
            {
              label: "ผู้ให้บริการ Active",
              value: summary.activeProviders,
              sub: `ทั้งหมด ${summary.totalProviders} ราย`,
              icon: CheckCircle2,
              accent: "#3b82f6", // Blue
            },
            {
              label: "แจ้งเตือนเครดิตต่ำ",
              value: summary.alertCount,
              sub: summary.alertCount > 0 ? "ต้องเติมเครดิต!" : "ไม่มีรายการเตือน",
              icon: AlertTriangle,
              accent: summary.alertCount > 0 ? "#ef4444" : "#64748b", // Red or Slate
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-card text-card-foreground border border-border/80 rounded-2xl p-4 relative overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300 group">
                <div className="absolute inset-0 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(circle at 85% 15%, ${card.accent}10, transparent 65%)` }} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{card.label}</p>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `linear-gradient(135deg,${card.accent}cc,${card.accent}66)` }}>
                      <Icon size={14} color="#fff" />
                    </div>
                  </div>
                  <p className="text-xl font-extrabold text-foreground leading-none mb-1">{card.value}</p>
                  <p className="text-[10px] text-muted-foreground/60">{card.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Provider Cards */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">ผู้ให้บริการ API</h2>
        {providers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            ยังไม่มีผู้ให้บริการ — กดปุ่ม &quot;เพิ่มผู้ให้บริการ&quot; เพื่อเริ่มต้น
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map(p => {
              const ratio = p.alertThreshold > 0 ? p.balance / p.alertThreshold : 999;
              const barPct = Math.min(100, Math.max(0, p.alertThreshold > 0 ? (p.balance / (p.alertThreshold * 3)) * 100 : 50));
              const barColor = ratio >= 2 ? "#10b981" : ratio >= 1 ? "#f59e0b" : "#ef4444";
              return (
                <div key={p.id}
                  className={cn(
                    "rounded-2xl border bg-card p-5 space-y-4 transition-all hover:shadow-md",
                    !p.enabled ? "opacity-50 border-border/40" : "border-border/60"
                  )}>
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        {getProviderIcon(p.code)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">{p.name}</h3>
                          <StatusDot balance={p.balance} threshold={p.alertThreshold} />
                        </div>
                        <p className="text-[10px] text-muted-foreground">{p.code} • {p.description || "ไม่มีคำอธิบาย"}</p>
                      </div>
                    </div>
                    {/* Toggle */}
                    <button onClick={() => handleToggle(p)}
                      className={cn(
                        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                        p.enabled ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                      )}>
                      <span className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200",
                        p.enabled ? "translate-x-5" : "translate-x-0"
                      )} />
                    </button>
                  </div>

                  {/* Balance */}
                  <div>
                    <div className="flex items-end justify-between mb-2">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium">ยอดเครดิตคงเหลือ</p>
                        <p className="text-2xl font-extrabold text-foreground">฿{fmt(p.balance)}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        แจ้งเตือนเมื่อต่ำกว่า ฿{fmt(p.alertThreshold)}
                      </p>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-muted/50 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${barPct}%`, background: barColor }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <button onClick={() => { setTopupModal({ open: true, provider: p }); setTopupAmount(""); setTopupNote(""); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:bg-foreground/90 transition-all cursor-pointer">
                      <ArrowUpCircle size={12} /> เติมเครดิต
                    </button>
                    <button onClick={() => { setAdjustModal({ open: true, provider: p }); setAdjustBalance(String(p.balance)); setAdjustNote(""); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card hover:bg-muted text-foreground border border-border text-xs font-bold transition-all cursor-pointer">
                      <Edit3 size={12} /> ปรับยอด
                    </button>
                    <button onClick={() => openHistory(p)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold transition-all cursor-pointer">
                      <History size={12} /> ดูประวัติ
                    </button>
                    <button onClick={() => { setEditModal({ open: true, provider: p }); setEditData({ name: p.name, description: p.description || "", apiBaseUrl: p.apiBaseUrl || "", alertThreshold: String(p.alertThreshold) }); }}
                      className="flex items-center justify-center w-8 h-8 rounded-xl bg-muted/65 text-muted-foreground hover:text-foreground hover:bg-muted/90 transition-all border border-border/50 cursor-pointer">
                      <Settings2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(p)}
                      className="flex items-center justify-center w-8 h-8 rounded-xl bg-red-500/5 hover:bg-red-500/15 text-muted-foreground hover:text-red-500 transition-all border border-red-500/10 cursor-pointer">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Last checked */}
                  {p.lastCheckedAt && (
                    <p className="text-[10px] text-muted-foreground/60">อัปเดตล่าสุด: {timeAgo(p.lastCheckedAt)}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Transactions Table */}
      {summary?.recentTransactions?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">รายการเคลื่อนไหวล่าสุด</h2>
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/30 text-muted-foreground">
                    <th className="text-left px-4 py-3 font-bold">วันที่</th>
                    <th className="text-left px-4 py-3 font-bold">ผู้ให้บริการ</th>
                    <th className="text-left px-4 py-3 font-bold">ประเภท</th>
                    <th className="text-right px-4 py-3 font-bold">จำนวน</th>
                    <th className="text-right px-4 py-3 font-bold">คงเหลือ</th>
                    <th className="text-left px-4 py-3 font-bold">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {summary.recentTransactions.map((t: any) => (
                    <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleString("th-TH", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">{t.providerName}</td>
                      <td className="px-4 py-3"><TypeBadge type={t.type} /></td>
                      <td className={cn("px-4 py-3 text-right font-bold tabular-nums",
                        t.amount >= 0 ? "text-emerald-500" : "text-red-500")}>
                        {t.amount >= 0 ? "+" : ""}฿{fmt(Math.abs(t.amount))}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">฿{fmt(t.balanceAfter)}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{t.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────── */}

      {/* Top-up Modal */}
      <Modal open={topupModal.open} onClose={() => setTopupModal({ open: false, provider: null })}
        title={`เติมเครดิต — ${topupModal.provider?.name || ""}`}>
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">ยอดเครดิตปัจจุบัน</p>
            <p className="text-lg font-extrabold text-foreground">฿{fmt(topupModal.provider?.balance || 0)}</p>
          </div>
          <Input label="จำนวนเงินที่ต้องการเติม (฿)" type="number" min="0" step="0.01"
            placeholder="เช่น 5000" value={topupAmount} onChange={e => setTopupAmount(e.target.value)} />
          <Input label="หมายเหตุ (ไม่บังคับ)" type="text"
            placeholder="เช่น เติมเครดิตรอบเดือน ก.ค." value={topupNote} onChange={e => setTopupNote(e.target.value)} />
          {topupAmount && parseFloat(topupAmount) > 0 && (
            <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
              <p className="text-[10px] text-muted-foreground font-bold">ยอดหลังเติม</p>
              <p className="text-lg font-extrabold text-emerald-500">
                ฿{fmt((topupModal.provider?.balance || 0) + parseFloat(topupAmount || "0"))}
              </p>
            </div>
          )}
          <button onClick={handleTopup} disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <ArrowUpCircle size={14} />}
            เติมเครดิต
          </button>
        </div>
      </Modal>

      {/* Adjust Modal */}
      <Modal open={adjustModal.open} onClose={() => setAdjustModal({ open: false, provider: null })}
        title={`ปรับยอดเครดิต — ${adjustModal.provider?.name || ""}`}>
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">ยอดเครดิตปัจจุบัน</p>
            <p className="text-lg font-extrabold text-foreground">฿{fmt(adjustModal.provider?.balance || 0)}</p>
          </div>
          <Input label="ยอดเครดิตใหม่ (฿)" type="number" min="0" step="0.01"
            placeholder="เช่น 10000" value={adjustBalance} onChange={e => setAdjustBalance(e.target.value)} />
          <Input label="เหตุผลการปรับ (ไม่บังคับ)" type="text"
            placeholder="เช่น ปรับตามยอดจริง" value={adjustNote} onChange={e => setAdjustNote(e.target.value)} />
          {adjustBalance && (
            <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
              <p className="text-[10px] text-muted-foreground font-bold">ผลต่าง</p>
              <p className={cn("text-lg font-extrabold",
                parseFloat(adjustBalance) >= (adjustModal.provider?.balance || 0) ? "text-emerald-500" : "text-red-500")}>
                {parseFloat(adjustBalance) >= (adjustModal.provider?.balance || 0) ? "+" : ""}
                ฿{fmt(Math.abs(parseFloat(adjustBalance || "0") - (adjustModal.provider?.balance || 0)))}
              </p>
            </div>
          )}
          <button onClick={handleAdjust} disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Edit3 size={14} />}
            ปรับยอด
          </button>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal open={historyModal.open} onClose={() => setHistoryModal({ open: false, provider: null, transactions: [] })}
        title={`ประวัติเครดิต — ${historyModal.provider?.name || ""}`}>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {historyModal.transactions.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">ยังไม่มีรายการ</p>
          ) : (
            historyModal.transactions.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/30">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <TypeBadge type={t.type} />
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString("th-TH", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {t.note && <p className="text-[11px] text-muted-foreground">{t.note}</p>}
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-bold tabular-nums",
                    t.amount >= 0 ? "text-emerald-500" : "text-red-500")}>
                    {t.amount >= 0 ? "+" : ""}฿{fmt(Math.abs(t.amount))}
                  </p>
                  <p className="text-[10px] text-muted-foreground">คงเหลือ ฿{fmt(t.balanceAfter)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Add Provider Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="เพิ่มผู้ให้บริการ API ใหม่">
        <div className="space-y-4">
          <Input label="ชื่อผู้ให้บริการ *" type="text" placeholder="เช่น ItemKu"
            value={newProvider.name} onChange={e => setNewProvider({ ...newProvider, name: e.target.value })} />
          <Input label="รหัสอ้างอิง (code) *" type="text" placeholder="เช่น itemku"
            value={newProvider.code} onChange={e => setNewProvider({ ...newProvider, code: e.target.value.toLowerCase().replace(/\s/g, "-") })} />
          <Input label="คำอธิบาย" type="text" placeholder="เช่น API เติมเกมเสริม"
            value={newProvider.description} onChange={e => setNewProvider({ ...newProvider, description: e.target.value })} />
          <Input label="API Base URL" type="text" placeholder="เช่น https://api.itemku.com"
            value={newProvider.apiBaseUrl} onChange={e => setNewProvider({ ...newProvider, apiBaseUrl: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="ยอดเครดิตเริ่มต้น (฿)" type="number" min="0" placeholder="0"
              value={newProvider.balance} onChange={e => setNewProvider({ ...newProvider, balance: e.target.value })} />
            <Input label="Alert Threshold (฿)" type="number" min="0" placeholder="1000"
              value={newProvider.alertThreshold} onChange={e => setNewProvider({ ...newProvider, alertThreshold: e.target.value })} />
          </div>
          <button onClick={handleAddProvider} disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            เพิ่มผู้ให้บริการ
          </button>
        </div>
      </Modal>

      {/* Edit Provider Modal */}
      <Modal open={editModal.open} onClose={() => setEditModal({ open: false, provider: null })}
        title={`แก้ไข — ${editModal.provider?.name || ""}`}>
        <div className="space-y-4">
          <Input label="ชื่อผู้ให้บริการ" type="text"
            value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
          <Input label="คำอธิบาย" type="text"
            value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} />
          <Input label="API Base URL" type="text"
            value={editData.apiBaseUrl} onChange={e => setEditData({ ...editData, apiBaseUrl: e.target.value })} />
          <Input label="Alert Threshold (฿)" type="number" min="0"
            value={editData.alertThreshold} onChange={e => setEditData({ ...editData, alertThreshold: e.target.value })} />
          <button onClick={handleEdit} disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            บันทึก
          </button>
        </div>
      </Modal>
    </div>
  );
}
