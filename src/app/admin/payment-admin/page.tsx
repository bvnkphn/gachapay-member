"use client";

import { useState } from "react";
import {
  CreditCard, Wallet, Zap, Eye, EyeOff,
  Save, RefreshCw, CheckCircle2, XCircle,
  AlertCircle, ChevronDown, Shield, Activity,
  ToggleLeft, ToggleRight, Copy, Check
} from "lucide-react";

// ── Types & Mock Data ─────────────────────────────────────────────
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

const initialMethods: PaymentMethod[] = [
  {
    id: "promptpay",
    name: "PromptPay QR",
    nameEn: "PromptPay",
    icon: "⚡",
    enabled: true,
    fee: 0,
    webhookUrl: "https://api.cyberpay.th/webhook/promptpay",
    publicKey: "pkey_live_5xKZ2mN8qW3rT1uY",
    secretKey: "skey_live_••••••••••••••••",
    color: "#38bdf8",
    accent: "rgba(56,189,248,0.15)",
  },
  {
    id: "truemoney",
    name: "TrueMoney Wallet",
    nameEn: "TrueMoney",
    icon: "💰",
    enabled: true,
    fee: 1.5,
    webhookUrl: "https://api.cyberpay.th/webhook/truemoney",
    publicKey: "TM_PUB_9kLp4vXn2mQs",
    secretKey: "TM_SEC_••••••••••••••••",
    color: "#f59e0b",
    accent: "rgba(245,158,11,0.15)",
  },
  {
    id: "credit",
    name: "Credit / Debit Card",
    nameEn: "Card",
    icon: "💳",
    enabled: false,
    fee: 2.9,
    webhookUrl: "https://api.cyberpay.th/webhook/card",
    publicKey: "pk_live_AbC123XyZ789MnO",
    secretKey: "sk_live_••••••••••••••••",
    color: "#a78bfa",
    accent: "rgba(167,139,250,0.15)",
  },
  {
    id: "wallet",
    name: "CYBERPAY Wallet",
    nameEn: "Wallet",
    icon: "🎮",
    enabled: true,
    fee: 0,
    webhookUrl: "https://api.cyberpay.th/webhook/wallet",
    publicKey: "CW_PUB_7rBq1tNk5sVm",
    secretKey: "CW_SEC_••••••••••••••••",
    color: "#34d399",
    accent: "rgba(52,211,153,0.15)",
  },
];

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
  success: { label: "สำเร็จ",  color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)",  icon: CheckCircle2 },
  failed:  { label: "ล้มเหลว", color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", icon: XCircle      },
  pending: { label: "รอผล",    color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)",  icon: AlertCircle  },
};

const cardStyle = { background: "rgba(11,15,32,0.85)", border: "1px solid #1c2540" };

function StatusBadge({ status }: { status: PaymentStatus }) {
  const c = STATUS_CFG[status];
  const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
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
    <button onClick={copy} className="p-1.5 rounded-lg transition hover:bg-white/10"
      style={{ color: copied ? "#34d399" : "#64748b" }}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function PaymentGatewayAdmin() {
  const [methods, setMethods] = useState(initialMethods);
  const [selected, setSelected] = useState(initialMethods[0]);
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logFilter, setLogFilter] = useState<PaymentStatus | "all">("all");

  const update = (field: keyof PaymentMethod, value: any) => {
    setSelected(prev => ({ ...prev, [field]: value }));
    setMethods(prev => prev.map(m => m.id === selected.id ? { ...m, [field]: value } : m));
  };

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const filteredLogs = logFilter === "all" ? mockLogs : mockLogs.filter(l => l.status === logFilter);

  const logCounts = {
    success: mockLogs.filter(l => l.status === "success").length,
    failed:  mockLogs.filter(l => l.status === "failed").length,
    pending: mockLogs.filter(l => l.status === "pending").length,
  };

  return (
    <div className="min-h-screen relative pt-20 pb-24 px-4"
      style={{ background: "linear-gradient(160deg,#080c18 0%,#0a0e1e 60%,#060911 100%)" }}>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] -z-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(88,50,210,0.18) 0%, transparent 100%)" }} />

      <div className="relative max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <p className="text-[11px] text-[#3a4a6a] tracking-widest uppercase font-mono mb-1">Super Admin · Payment Settings</p>
          <h1 className="text-3xl font-bold text-white">
            จัดการ{" "}
            <span style={{ background: "linear-gradient(90deg,#38bdf8,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Payment Gateway
            </span>
          </h1>
        </div>

        {/* ── Method Selector Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {methods.map(m => (
            <button key={m.id} onClick={() => { setSelected(m); setShowSecret(false); }}
              className="rounded-2xl p-4 text-left transition-all relative overflow-hidden"
              style={selected.id === m.id
                ? { background: m.accent, border: `1px solid ${m.color}55` }
                : { ...cardStyle }}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{m.icon}</span>
                {/* Toggle */}
                <button onClick={e => { e.stopPropagation(); setMethods(prev => prev.map(x => x.id === m.id ? { ...x, enabled: !x.enabled } : x)); if (selected.id === m.id) update("enabled", !m.enabled); }}
                  style={{ color: m.enabled ? m.color : "#3a4a6a" }}>
                  {m.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
              </div>
              <p className="text-sm font-bold text-white leading-tight">{m.name}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs" style={{ color: "#94a3b8" }}>Fee {m.fee}%</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={m.enabled
                    ? { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }
                    : { background: "rgba(100,116,139,0.15)", color: "#64748b", border: "1px solid #1c2540" }}>
                  {m.enabled ? "เปิด" : "ปิด"}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* ── Settings Panel ── */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Connectivity Settings */}
          <div className="rounded-2xl p-6 space-y-5" style={cardStyle}>
            <div className="flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid #1c2540" }}>
              <Shield size={15} style={{ color: selected.color }} />
              <p className="text-sm font-bold text-white">Connectivity — {selected.name}</p>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
                style={{ background: selected.accent, color: selected.color, border: `1px solid ${selected.color}44` }}>
                {selected.enabled ? "Active" : "Disabled"}
              </span>
            </div>

            {/* Webhook URL */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>
                Webhook / Callback URL
              </label>
              <div className="flex gap-2 items-center rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1c2540" }}>
                <input value={selected.webhookUrl} onChange={e => update("webhookUrl", e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-white font-mono"
                  style={{ color: "#67e8f9" }} />
                <CopyBtn value={selected.webhookUrl} />
              </div>
            </div>

            {/* Public Key */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>
                Public Key / App ID
              </label>
              <div className="flex gap-2 items-center rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1c2540" }}>
                <input value={selected.publicKey} onChange={e => update("publicKey", e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm font-mono text-white" />
                <CopyBtn value={selected.publicKey} />
              </div>
            </div>

            {/* Secret Key */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>
                Secret Key
              </label>
              <div className="flex gap-2 items-center rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1c2540" }}>
                <input
                  type={showSecret ? "text" : "password"}
                  value={selected.secretKey}
                  onChange={e => update("secretKey", e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm font-mono text-white" />
                <button onClick={() => setShowSecret(v => !v)} className="p-1.5 rounded-lg hover:bg-white/10 transition"
                  style={{ color: "#64748b" }}>
                  {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <CopyBtn value={selected.secretKey} />
              </div>
            </div>

            <button onClick={save}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={saved
                ? { background: "rgba(52,211,153,0.2)", color: "#34d399", border: "1px solid rgba(52,211,153,0.4)" }
                : { background: "linear-gradient(135deg,#38bdf8,#818cf8)", color: "white" }}>
              {saved ? <><Check size={15} /> บันทึกแล้ว</> : <><Save size={15} /> บันทึกการตั้งค่า</>}
            </button>
          </div>

          {/* Fee + Toggle */}
          <div className="space-y-4">
            {/* Fee Management */}
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div className="flex items-center gap-2 pb-3 mb-4" style={{ borderBottom: "1px solid #1c2540" }}>
                <Activity size={15} style={{ color: "#f59e0b" }} />
                <p className="text-sm font-bold text-white">Fee Management</p>
              </div>
              <div className="space-y-3">
                {methods.map(m => (
                  <div key={m.id} className="flex items-center gap-3">
                    <span className="text-lg w-7">{m.icon}</span>
                    <span className="text-sm text-white flex-1">{m.name}</span>
                    <div className="flex items-center gap-1 rounded-xl px-3 py-1.5 w-28"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1c2540" }}>
                      <input
                        type="number" min={0} max={10} step={0.1}
                        value={m.fee}
                        onChange={e => setMethods(prev => prev.map(x => x.id === m.id ? { ...x, fee: parseFloat(e.target.value) || 0 } : x))}
                        className="w-full bg-transparent outline-none text-sm text-white text-right" />
                      <span className="text-xs" style={{ color: "#64748b" }}>%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability Toggle summary */}
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div className="flex items-center gap-2 pb-3 mb-4" style={{ borderBottom: "1px solid #1c2540" }}>
                <Zap size={15} style={{ color: "#818cf8" }} />
                <p className="text-sm font-bold text-white">Availability Control</p>
              </div>
              <div className="space-y-3">
                {methods.map(m => (
                  <div key={m.id} className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #141c30" }}>
                    <div className="flex items-center gap-3">
                      <span>{m.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{m.name}</p>
                        <p className="text-xs" style={{ color: "#64748b" }}>Fee {m.fee}%</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setMethods(prev => prev.map(x => x.id === m.id ? { ...x, enabled: !x.enabled } : x))}
                      style={{ color: m.enabled ? m.color : "#3a4a6a" }}
                      className="transition-all hover:scale-110">
                      {m.enabled ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Payment Log Table ── */}
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-4"
            style={{ borderBottom: "1px solid #1c2540" }}>
            <div className="flex items-center gap-2">
              <Activity size={15} style={{ color: "#38bdf8" }} />
              <p className="text-base font-bold text-white">Gateway Log</p>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(56,189,248,0.12)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.25)" }}>
                {mockLogs.length} รายการ
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setLogFilter("all")}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={logFilter === "all"
                  ? { background: "rgba(99,102,241,0.25)", color: "#a5b4fc", border: "1px solid rgba(129,140,248,0.4)" }
                  : { color: "#64748b", border: "1px solid #1c2540" }}>
                ทั้งหมด
              </button>
              {(["success", "failed", "pending"] as PaymentStatus[]).map(s => (
                <button key={s} onClick={() => setLogFilter(s)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={logFilter === s
                    ? { background: STATUS_CFG[s].bg, color: STATUS_CFG[s].color, border: `1px solid ${STATUS_CFG[s].border}` }
                    : { color: "#64748b", border: "1px solid #1c2540" }}>
                  {STATUS_CFG[s].label} ({logCounts[s]})
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(5,7,18,0.7)", borderBottom: "1px solid #1c2540" }}>
                  {["Log ID", "เวลา", "ช่องทาง", "Event Type", "Order ID", "ยอดเงิน", "Latency", "สถานะ"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider whitespace-nowrap"
                      style={{ color: "#3a4a6a" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, i) => (
                  <tr key={i} className="transition-colors hover:bg-white/[0.025]"
                    style={{ borderBottom: "1px solid #111828" }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "#67e8f9" }}>{log.id}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#94a3b8" }}>{log.time}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-white">{log.method}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "#a78bfa" }}>{log.type}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "#94a3b8" }}>{log.orderId}</td>
                    <td className="px-4 py-3 font-bold text-white">฿{log.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-xs"
                      style={{ color: log.latency === "timeout" ? "#f87171" : log.latency > "500ms" ? "#fbbf24" : "#34d399" }}>
                      {log.latency}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
