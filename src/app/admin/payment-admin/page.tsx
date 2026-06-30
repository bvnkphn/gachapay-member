"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CreditCard, Wallet, Zap, Eye, EyeOff,
  Save, RefreshCw, CheckCircle2, XCircle,
  AlertCircle, ChevronDown, Shield, Activity,
  ToggleLeft, ToggleRight, Copy, Check, Image,
  Search, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

const BACKEND_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace(/\/api\/?$/, "");

const makeSlipImageUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/api/') || url.startsWith('/uploads/')) return `${BACKEND_BASE_URL}${url}`;
  return `${BACKEND_BASE_URL}/${url}`;
};

// ── Types ─────────────────────────────────────────────────────────
type PaymentStatus = "success" | "failed" | "pending";

interface PaymentMethod {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  enabled: boolean;
  fee: number;
  webhookUrl: string;
  publicKey: string;
  secretKey: string;
  color: string;
  accent: string;
}

const mockLogs = [
  { id: "LOG-8821", time: "08 มี.ค. 68 · 14:32:01", method: "PromptPay", type: "charge.complete",  orderId: "ORD-4421", amount: 960,   status: "success" as PaymentStatus, latency: "182ms" },
  { id: "LOG-8820", time: "08 มี.ค. 68 · 14:28:47", method: "PromptPay", type: "charge.pending",   orderId: "ORD-4420", amount: 350,   status: "pending" as PaymentStatus, latency: "95ms"  },
  { id: "LOG-8819", time: "08 มี.ค. 68 · 13:55:12", method: "TrueMoney", type: "charge.complete",  orderId: "ORD-4419", amount: 650,   status: "success" as PaymentStatus, latency: "210ms" },
  { id: "LOG-8818", time: "08 มี.ค. 68 · 13:41:09", method: "TrueMoney", type: "charge.failed",    orderId: "ORD-4418", amount: 299,   status: "failed"  as PaymentStatus, latency: "3012ms"},
  { id: "LOG-8817", time: "08 มี.ค. 68 · 13:20:55", method: "Wallet",    type: "deduct.complete",  orderId: "ORD-4417", amount: 200,   status: "success" as PaymentStatus, latency: "44ms"  },
  { id: "LOG-8816", time: "08 มี.ค. 68 · 12:58:33", method: "PromptPay", type: "charge.complete",  orderId: "ORD-4416", amount: 980,   status: "success" as PaymentStatus, latency: "167ms" },
  { id: "LOG-8815", time: "08 มี.ค. 68 · 12:30:00", method: "PromptPay", type: "webhook.received", orderId: "ORD-4415", amount: 500,   status: "failed"  as PaymentStatus, latency: "timeout"},
  { id: "LOG-8814", time: "08 มี.ค. 68 · 11:44:21", method: "Wallet",    type: "deduct.complete",  orderId: "ORD-4414", amount: 150,   status: "success" as PaymentStatus, latency: "38ms"  },
];

const STATUS_CFG = {
  success: { label: "สำเร็จ",  color: "text-emerald-500", bg: "bg-emerald-500/10",  border: "border-emerald-500/20",  icon: CheckCircle2 },
  failed:  { label: "ล้มเหลว", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: XCircle      },
  pending: { label: "รอผล",    color: "text-amber-500", bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: AlertCircle  },
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  const c = STATUS_CFG[status];
  const Icon = c.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border", c.bg, c.color, c.border)}>
      <Icon size={11} />{c.label}
    </span>
  );
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="p-1.5 rounded-lg transition hover:bg-muted text-muted-foreground hover:text-foreground">
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
    </button>
  );
}

export default function PaymentGatewayAdmin() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logFilter, setLogFilter] = useState<PaymentStatus | "all">("all");
  const [methodFilter, setMethodFilter] = useState<"all" | "promptpay" | "truemoney" | "bank_transfer" | "wallet">("all");
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedTopup, setSelectedTopup] = useState<any | null>(null);

  const getTopupBadgeStatus = (tx: any): PaymentStatus => {
    if (!tx) return "pending";
    if (tx.transactionStatus === "completed") return "success";
    if (tx.transactionStatus === "failed") return "failed";
    return "pending";
  };

  const refreshLogs = async () => {
    try {
      const logsData = await api.getPaymentAdminLogs();
      if (Array.isArray(logsData)) {
        setLogs(logsData);
      }
    } catch (err: any) {
      toast.error("โหลดประวัติล้มเหลว: " + err.message);
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [settingsData, logsData] = await Promise.all([
        api.getPaymentAdminSettings(),
        api.getPaymentAdminLogs().catch(() => []) // fallback gracefully
      ]);
      if (Array.isArray(settingsData)) {
        setMethods(settingsData);
        if (settingsData.length > 0) {
          setSelected(settingsData[0]);
        }
      }
      if (Array.isArray(logsData)) {
        setLogs(logsData);
      }
    } catch (err: any) {
      toast.error("โหลดข้อมูลล้มเหลว: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Handle global navbar refresh action
  useEffect(() => {
    const handleRefresh = () => {
      loadSettings();
    };
    window.addEventListener("admin-refresh", handleRefresh);
    return () => window.removeEventListener("admin-refresh", handleRefresh);
  }, []);

  const handleAdminUpdateStatus = async (status: "completed" | "failed") => {
    if (!selectedTopup) return;
    try {
      const result = await api.adminUpdateTopupStatus(selectedTopup.referenceId, status, status === "failed" ? "Rejected manually by admin" : "Approved manually by admin");
      toast.success(`อัปเดตสถานะสำเร็จ: ${result.status}`);
      await refreshLogs();
      setSelectedTopup((prev: any) => prev ? { ...prev, transactionStatus: result.status, adminNote: result.adminNote ?? prev.adminNote, completedAt: result.completed_at ?? prev.completedAt } : prev);
    } catch (err: any) {
      toast.error(err.message || "อัปเดตสถานะล้มเหลว");
    }
  };

  const updateSelectedField = (field: keyof PaymentMethod, value: any) => {
    if (!selected) return;
    setSelected(prev => prev ? { ...prev, [field]: value } : null);
    setMethods(prev => prev.map(m => m.id === selected.id ? { ...m, [field]: value } : m));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.savePaymentAdminSettings(methods);
      toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว");
    } catch (err: any) {
      toast.error("บันทึกข้อมูลล้มเหลว: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (mId: string, currentEnabled: boolean) => {
    const nextEnabled = !currentEnabled;
    const updatedMethods = methods.map(x => x.id === mId ? { ...x, enabled: nextEnabled } : x);
    setMethods(updatedMethods);
    if (selected && selected.id === mId) {
      setSelected({ ...selected, enabled: nextEnabled });
    }
    try {
      await api.savePaymentAdminSettings(updatedMethods);
      toast.success("อัปเดตสถานะช่องทางชำระเงินเรียบร้อยแล้ว");
    } catch (err: any) {
      toast.error("อัปเดตข้อมูลล้มเหลว: " + err.message);
      // rollback state
      setMethods(methods);
      if (selected && selected.id === mId) {
        setSelected(selected);
      }
    }
  };

  const filteredLogs = useMemo(() => {
    let result = logFilter === "all" ? logs : logs.filter(l => l.status === logFilter);
    if (methodFilter !== "all") {
      result = result.filter(log => {
        const methodValue = (log.methodCode || log.method || "").toString().toLowerCase();
        return methodValue === methodFilter;
      });
    }
    return result;
  }, [logs, logFilter, methodFilter]);

  const logCounts = {
    success: logs.filter(l => l.status === "success").length,
    failed:  logs.filter(l => l.status === "failed").length,
    pending: logs.filter(l => l.status === "pending").length,
  };

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="animate-spin text-primary" size={32} />
        <p className="text-sm text-muted-foreground font-bold">กำลังโหลดข้อมูลระบบชำระเงิน...</p>
      </div>
    );
  }

  if (!selected || methods.length === 0) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="text-rose-500" size={32} />
        <p className="text-sm text-muted-foreground font-bold">ไม่สามารถโหลดข้อมูลระบบชำระเงินได้</p>
        <button onClick={loadSettings}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-foreground text-background hover:bg-foreground/90 transition">
          <RefreshCw size={14} className="inline mr-2" />ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5 space-y-5">
      {/* Header */}
      <div>
        <p className="text-[10px] tracking-widest uppercase font-mono mb-1 text-muted-foreground">
          Super Admin · Payment Settings
        </p>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          จัดการ <span className="text-primary">Payment Gateway</span>
        </h1>
      </div>

      {/* ── Method Selector Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {methods.map(m => {
          const isSel = selected.id === m.id;
          return (
            <button key={m.id} onClick={() => { setSelected(m); setShowSecret(false); }}
              className={cn(
                "rounded-2xl p-4 text-left transition relative border overflow-hidden bg-card text-card-foreground shadow-sm",
                isSel ? "border-primary ring-1 ring-primary" : "border-border/80 hover:border-border"
              )}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{m.icon}</span>
                {/* Toggle */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleToggle(m.id, m.enabled);
                  }}
                  className={cn(
                    "transition-all hover:scale-110",
                    m.enabled ? "text-primary" : "text-muted-foreground/50"
                  )}>
                  {m.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
              </div>
              <p className="text-sm font-extrabold text-foreground leading-tight">{m.name}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground font-bold">Fee {m.fee}%</span>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold border",
                  m.enabled
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-muted text-muted-foreground border-border"
                )}>
                  {m.enabled ? "เปิด" : "ปิด"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Settings Panel ── */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Connectivity Settings */}
        <div className="rounded-2xl p-6 space-y-5 bg-card border border-border/80 shadow-sm text-card-foreground">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40">
            <Shield size={15} className="text-primary" />
            <p className="text-sm font-bold text-foreground">Connectivity — {selected.name}</p>
            <span className={cn(
              "ml-auto text-[10px] px-2.5 py-0.5 rounded-full border font-bold",
              selected.enabled
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-muted text-muted-foreground border-border"
            )}>
              {selected.enabled ? "Active" : "Disabled"}
            </span>
          </div>

          {/* Webhook URL */}
          <div>
            <label className="block text-xs font-bold mb-2 text-muted-foreground">
              Webhook / Callback URL
            </label>
            <div className="flex gap-2 items-center rounded-xl px-3 py-2.5 bg-muted/40 border border-border">
              <input value={selected.webhookUrl} onChange={e => updateSelectedField("webhookUrl", e.target.value)}
                className="flex-1 bg-transparent outline-none text-xs text-cyan-600 dark:text-cyan-400 font-mono font-bold" />
              <CopyBtn value={selected.webhookUrl} />
            </div>
          </div>

          {/* Public Key */}
          <div>
            <label className="block text-xs font-bold mb-2 text-muted-foreground">
              Public Key / App ID
            </label>
            <div className="flex gap-2 items-center rounded-xl px-3 py-2.5 bg-muted/40 border border-border">
              <input value={selected.publicKey} onChange={e => updateSelectedField("publicKey", e.target.value)}
                className="flex-1 bg-transparent outline-none text-xs font-mono font-bold text-foreground" />
              <CopyBtn value={selected.publicKey} />
            </div>
          </div>

          {/* Secret Key */}
          <div>
            <label className="block text-xs font-bold mb-2 text-muted-foreground">
              Secret Key
            </label>
            <div className="flex gap-2 items-center rounded-xl px-3 py-2.5 bg-muted/40 border border-border">
              <input
                type={showSecret ? "text" : "password"}
                value={selected.secretKey}
                onChange={e => updateSelectedField("secretKey", e.target.value)}
                className="flex-1 bg-transparent outline-none text-xs font-mono font-bold text-foreground" />
              <button onClick={() => setShowSecret(v => !v)} className="p-1.5 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-foreground">
                {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <CopyBtn value={selected.secretKey} />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold bg-foreground text-background hover:bg-foreground/90 transition shadow-md disabled:opacity-50">
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            บันทึกการตั้งค่า
          </button>
        </div>

        {/* Fee + Toggle */}
        <div className="space-y-4">
          {/* Fee Management */}
          <div className="rounded-2xl p-6 bg-card border border-border/80 shadow-sm text-card-foreground">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border/40">
              <Activity size={15} className="text-primary" />
              <p className="text-sm font-bold text-foreground">Fee Management</p>
            </div>
            <div className="space-y-3">
              {methods.map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <span className="text-lg w-7">{m.icon}</span>
                  <span className="text-xs text-foreground font-bold flex-1">{m.name}</span>
                  <div className="flex items-center gap-1 rounded-xl px-3 py-1 bg-muted/40 border border-border w-28">
                    <input
                      type="number" min={0} max={10} step={0.1}
                      value={m.fee}
                      onChange={e => setMethods(prev => prev.map(x => x.id === m.id ? { ...x, fee: parseFloat(e.target.value) || 0 } : x))}
                      className="w-full bg-transparent outline-none text-xs font-mono font-bold text-foreground text-right" />
                    <span className="text-[10px] text-muted-foreground font-bold">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment Log Table ── */}
      <div className="rounded-2xl overflow-hidden bg-card border border-border/80 shadow-sm text-card-foreground">
        <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-primary" />
            <p className="text-sm font-bold text-foreground">Gateway Log</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
              {logs.length} รายการ
            </span>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1 ml-auto">
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Status</label>
                <select
                  value={logFilter}
                  onChange={e => setLogFilter(e.target.value as PaymentStatus | "all")}
                  className="min-w-[140px] rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-xs text-foreground shadow-sm outline-none"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="success">สำเร็จ</option>
                  <option value="failed">ล้มเหลว</option>
                  <option value="pending">รอผล</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Payment</label>
                <select
                  value={methodFilter}
                  onChange={e => setMethodFilter(e.target.value as typeof methodFilter)}
                  className="min-w-[150px] rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-xs text-foreground shadow-sm outline-none"
                >
                  <option value="all">ทุกประเภท</option>
                  <option value="promptpay">PromptPay</option>
                  <option value="truemoney">TrueMoney</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="wallet">Wallet</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20">
                {["Log ID", "เวลา", "ช่องทาง", "Event Type", "Order ID", "ยอดเงิน", "Latency", "สถานะ", "Slip"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, i) => (
                <tr key={i} className="hover:bg-muted/10 transition border-b border-border/40">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{log.id}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{log.time}</td>
                  <td className="px-4 py-3 text-xs font-bold text-foreground">{log.method}</td>
                  <td className="px-4 py-3 font-mono text-xs text-purple-600 dark:text-purple-400">{log.type}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground font-bold">{log.orderId}</td>
                  <td className="px-4 py-3 font-bold text-foreground text-xs">฿{log.amount.toLocaleString()}</td>
                  <td className={cn(
                    "px-4 py-3 font-mono text-xs font-bold",
                    log.latency === "timeout" ? "text-rose-500" : log.latency > "500ms" ? "text-amber-500" : "text-emerald-500"
                  )}>
                    {log.latency}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
                  <td className="px-4 py-3 text-xs text-foreground">
                    {log.methodCode === 'bank_transfer' && log.slipUrl ? (
                      <button onClick={() => setSelectedTopup(log)} className="rounded-full px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition">
                        ดูสลิป
                      </button>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {selectedTopup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-3xl w-full max-w-3xl p-5 shadow-2xl text-card-foreground overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-bold">Slip Preview — {selectedTopup.reference_id}</p>
                <p className="text-xs text-muted-foreground">Bank: {selectedTopup.bank_code || '-'}</p>
              </div>
              <button onClick={() => setSelectedTopup(null)} className="text-muted-foreground hover:text-foreground">Close</button>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl overflow-hidden border border-border/50 bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {selectedTopup.slipUrl ? (
                  <img src={makeSlipImageUrl(selectedTopup.slipUrl)} alt="Slip Image" className="w-full h-full object-contain max-h-[520px] bg-black/10" />
                ) : (
                  <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">ไม่มีรูปสลิปที่สามารถแสดงได้</div>
                )}
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl bg-muted/40 border border-border/40 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Status</span>
                    <StatusBadge status={getTopupBadgeStatus(selectedTopup)} />
                  </div>
                  <div className="text-xs text-muted-foreground space-y-2">
                    <div><span className="font-bold text-foreground">Reference:</span> {selectedTopup.reference_id}</div>
                    <div><span className="font-bold text-foreground">Amount:</span> ฿{Number(selectedTopup.amount).toFixed(2)}</div>
                    <div><span className="font-bold text-foreground">Bank Code:</span> {selectedTopup.bank_code || '-'}</div>
                    {selectedTopup.userEmail && (
                      <div><span className="font-bold text-foreground">ผู้ใช้:</span> {selectedTopup.userEmail}</div>
                    )}
                    {selectedTopup.slipUrl && (
                      <div className="break-words"><span className="font-bold text-foreground">Slip URL:</span> {selectedTopup.slipUrl}</div>
                    )}
                    <div><span className="font-bold text-foreground">Created:</span> {new Date(selectedTopup.created_at).toLocaleString('th-TH')}</div>
                    <div><span className="font-bold text-foreground">Completed:</span> {selectedTopup.completed_at ? new Date(selectedTopup.completed_at).toLocaleString('th-TH') : '-'}</div>
                  </div>
                </div>
                <div className="rounded-2xl bg-muted/40 border border-border/40 p-4 space-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Admin Note / Verification Reason</p>
                    <p className="text-xs text-foreground leading-relaxed">{selectedTopup.admin_note || 'ไม่มีหมายเหตุ'}</p>
                  </div>
                  {selectedTopup.verification && (
                    <div className="rounded-2xl bg-background p-3 border border-border/60">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Verification Data</p>
                      <pre className="whitespace-pre-wrap text-[10px] text-muted-foreground">{JSON.stringify(selectedTopup.verification, null, 2)}</pre>
                    </div>
                  )}
                </div>
                {(selectedTopup.transactionStatus === 'awaiting_review' || selectedTopup.transactionStatus === 'verification_failed') && (
                  <div className="grid gap-3">
                    <button
                      onClick={() => handleAdminUpdateStatus('completed')}
                      className="w-full py-3 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition"
                    >
                      อนุมัติสลิป (สำเร็จ)
                    </button>
                    <button
                      onClick={() => handleAdminUpdateStatus('failed')}
                      className="w-full py-3 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition"
                    >
                      ปฏิเสธสลิป (ล้มเหลว)
                    </button>
                  </div>
                )}
                <button onClick={() => setSelectedTopup(null)} className="w-full py-3 rounded-xl bg-primary text-white text-xs font-bold">ปิด</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
