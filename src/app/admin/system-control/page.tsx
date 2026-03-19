"use client";

import { useState, useEffect } from "react";
import {
  Monitor, Smartphone, Tablet, Globe, Activity,
  AlertTriangle, CheckCircle2, XCircle, Save,
  Check, RefreshCw, Wifi, WifiOff, Moon, Sun,
  Languages, Shield, Eye, ToggleLeft, ToggleRight,
  Clock, Zap, Server
} from "lucide-react";

const cardStyle = { background: "rgba(11,15,32,0.85)", border: "1px solid #1c2540" };

// ── Mock realtime data ─────────────────────────────────────────────
const SERVICES = [
  { id: "topup",   label: "ระบบเติมเงิน",       icon: Zap,      status: true  },
  { id: "payment", label: "ระบบชำระเงิน",        icon: Activity, status: true  },
  { id: "game",    label: "Game API",            icon: Server,   status: true  },
  { id: "webhook", label: "Webhook Receiver",    icon: Wifi,     status: false },
  { id: "email",   label: "Email Notification",  icon: Globe,    status: true  },
  { id: "queue",   label: "Queue Worker",         icon: RefreshCw,status: true  },
];

const BREAKPOINTS = [
  { id: "mobile",  label: "Mobile",  icon: Smartphone, px: "< 768px",   ok: true  },
  { id: "tablet",  label: "Tablet",  icon: Tablet,     px: "768–1024px", ok: true  },
  { id: "desktop", label: "Desktop", icon: Monitor,    px: "> 1024px",  ok: true  },
];

const LANGUAGES = [
  { code: "th", label: "ภาษาไทย",  flag: "🇹🇭" },
  { code: "en", label: "English",  flag: "🇬🇧" },
];

function Toggle({ on, onChange, color = "#34d399" }: { on: boolean; onChange: () => void; color?: string }) {
  return (
    <button onClick={onChange} style={{ color: on ? color : "#3a4a6a" }} className="transition-all hover:scale-110">
      {on ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
    </button>
  );
}

function StatusDot({ on }: { on: boolean }) {
  return (
    <span className="relative flex items-center justify-center w-5 h-5">
      {on && <span className="absolute w-full h-full rounded-full animate-ping opacity-40" style={{ background: "#34d399" }} />}
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: on ? "#34d399" : "#f87171" }} />
    </span>
  );
}

export default function SystemControl() {
  const [services, setServices] = useState(SERVICES);
  const [defaultLang, setDefaultLang] = useState("th");
  const [multiLang, setMultiLang] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [maintMsg, setMaintMsg] = useState("ระบบกำลังปิดปรับปรุงชั่วคราว จะกลับมาให้บริการในเร็วๆ นี้ครับ 🙏");
  const [maintETA, setMaintETA] = useState("30");
  const [realtimeTopup, setRealtimeTopup] = useState(true);
  const [saved, setSaved] = useState(false);
  const [tick, setTick] = useState(0);

  // Fake realtime clock
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const now = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const toggleService = (id: string) =>
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: !s.status } : s));

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const onlineCount = services.filter(s => s.status).length;

  return (
    <div className="min-h-screen relative pt-20 pb-24 px-4"
      style={{ background: "linear-gradient(160deg,#080c18 0%,#0a0e1e 60%,#060911 100%)" }}>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] -z-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(88,50,210,0.18) 0%, transparent 100%)" }} />

      <div className="relative max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className="text-[11px] text-[#3a4a6a] tracking-widest uppercase font-mono mb-1">Super Admin · System</p>
            <h1 className="text-3xl font-bold text-white">
              System{" "}
              <span style={{ background: "linear-gradient(90deg,#38bdf8,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Control Panel
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono"
            style={{ background: "rgba(11,15,32,0.85)", border: "1px solid #1c2540", color: "#64748b" }}>
            <Clock size={13} style={{ color: "#38bdf8" }} />
            <span style={{ color: "#94a3b8" }}>{now}</span>
          </div>
        </div>

        {/* ── Row 1: Real-time Status + Responsive ── */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Real-time Service Status */}
          <div className="rounded-2xl p-6" style={cardStyle}>
            <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: "1px solid #1c2540" }}>
              <div className="flex items-center gap-2">
                <Activity size={15} style={{ color: "#38bdf8" }} />
                <p className="text-sm font-bold text-white">Real-time Service Monitor</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
                {onlineCount}/{services.length} Online
              </span>
            </div>

            {/* Realtime Topup toggle */}
            <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-3"
              style={{ background: realtimeTopup ? "rgba(56,189,248,0.08)" : "rgba(248,113,113,0.06)", border: `1px solid ${realtimeTopup ? "rgba(56,189,248,0.25)" : "rgba(248,113,113,0.2)"}` }}>
              <div className="flex items-center gap-3">
                <StatusDot on={realtimeTopup} />
                <div>
                  <p className="text-sm font-bold text-white">แสดงสถานะเติมเงิน Real-time</p>
                  <p className="text-xs" style={{ color: "#64748b" }}>ผู้ใช้เห็นความเคลื่อนไหวแบบสด</p>
                </div>
              </div>
              <Toggle on={realtimeTopup} onChange={() => setRealtimeTopup(v => !v)} color="#38bdf8" />
            </div>

            {/* Service list */}
            <div className="space-y-2">
              {services.map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.id} className="flex items-center justify-between rounded-xl px-4 py-2.5"
                    style={{ background: "rgba(255,255,255,0.025)", border: "1px solid #141c30" }}>
                    <div className="flex items-center gap-3">
                      <Icon size={14} style={{ color: s.status ? "#818cf8" : "#3a4a6a" }} />
                      <span className="text-sm text-white">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusDot on={s.status} />
                      <Toggle on={s.status} onChange={() => toggleService(s.id)}
                        color={s.status ? "#34d399" : "#f87171"} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Responsive Control */}
          <div className="space-y-4">
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div className="flex items-center gap-2 pb-3 mb-4" style={{ borderBottom: "1px solid #1c2540" }}>
                <Smartphone size={15} style={{ color: "#a78bfa" }} />
                <p className="text-sm font-bold text-white">Responsive Control Panel</p>
              </div>

              {/* Breakpoint status */}
              <div className="space-y-3 mb-4">
                {BREAKPOINTS.map(bp => {
                  const Icon = bp.icon;
                  return (
                    <div key={bp.id} className="flex items-center gap-4 rounded-xl px-4 py-3"
                      style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)" }}>
                      <Icon size={18} style={{ color: "#a78bfa" }} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{bp.label}</p>
                        <p className="text-xs font-mono" style={{ color: "#64748b" }}>{bp.px}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusDot on={bp.ok} />
                        <span className="text-xs font-semibold" style={{ color: bp.ok ? "#34d399" : "#f87171" }}>
                          {bp.ok ? "Passed" : "Failed"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Preview sizes */}
              <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #141c30" }}>
                <p className="text-xs font-semibold mb-3" style={{ color: "#64748b" }}>VIEWPORT PREVIEW</p>
                <div className="flex items-end gap-3 justify-center">
                  {/* Mobile */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="rounded-lg border-2 flex items-center justify-center"
                      style={{ width: 32, height: 52, borderColor: "#818cf8", background: "rgba(129,140,248,0.1)" }}>
                      <div className="w-4 h-8 rounded" style={{ background: "rgba(129,140,248,0.3)" }} />
                    </div>
                    <span className="text-[10px]" style={{ color: "#64748b" }}>375px</span>
                  </div>
                  {/* Tablet */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="rounded-lg border-2 flex items-center justify-center"
                      style={{ width: 52, height: 40, borderColor: "#818cf8", background: "rgba(129,140,248,0.1)" }}>
                      <div className="w-10 h-7 rounded" style={{ background: "rgba(129,140,248,0.3)" }} />
                    </div>
                    <span className="text-[10px]" style={{ color: "#64748b" }}>768px</span>
                  </div>
                  {/* Desktop */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="rounded-lg border-2 flex items-center justify-center"
                      style={{ width: 72, height: 48, borderColor: "#38bdf8", background: "rgba(56,189,248,0.08)" }}>
                      <div className="w-16 h-9 rounded" style={{ background: "rgba(56,189,248,0.2)" }} />
                    </div>
                    <span className="text-[10px]" style={{ color: "#64748b" }}>1280px</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div className="flex items-center gap-2 pb-3 mb-4" style={{ borderBottom: "1px solid #1c2540" }}>
                <Languages size={15} style={{ color: "#fbbf24" }} />
                <p className="text-sm font-bold text-white">Language Switcher Settings</p>
              </div>

              <div className="flex items-center justify-between mb-4 rounded-xl px-4 py-3"
                style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <div>
                  <p className="text-sm font-semibold text-white">Multi-language Support</p>
                  <p className="text-xs" style={{ color: "#64748b" }}>เปิดใช้งานระบบหลายภาษา</p>
                </div>
                <Toggle on={multiLang} onChange={() => setMultiLang(v => !v)} color="#fbbf24" />
              </div>

              <p className="text-xs font-semibold mb-2" style={{ color: "#64748b" }}>ภาษาเริ่มต้น (Default Language)</p>
              <div className="flex gap-2">
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => setDefaultLang(l.code)}
                    disabled={!multiLang && l.code !== "th"}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={defaultLang === l.code
                      ? { background: "rgba(251,191,36,0.18)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.4)" }
                      : { background: "rgba(255,255,255,0.03)", color: "#64748b", border: "1px solid #1c2540" }}>
                    <span className="text-lg">{l.flag}</span>
                    {l.label}
                    {defaultLang === l.code && <Check size={13} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Maintenance Mode ── */}
        <div className="rounded-2xl p-6" style={maintenance
          ? { background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.3)" }
          : cardStyle}>
          <div className="flex items-center justify-between pb-4 mb-5" style={{ borderBottom: "1px solid #1c2540" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: maintenance ? "rgba(248,113,113,0.2)" : "rgba(129,140,248,0.1)" }}>
                <Shield size={18} style={{ color: maintenance ? "#f87171" : "#818cf8" }} />
              </div>
              <div>
                <p className="text-base font-bold text-white">Maintenance Mode</p>
                <p className="text-xs" style={{ color: "#64748b" }}>ปิดปรับปรุงระบบชั่วคราว — ผู้ใช้จะเห็นหน้าแจ้งเตือนแทน</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {maintenance && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold animate-pulse"
                  style={{ background: "rgba(248,113,113,0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.4)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  MAINTENANCE ON
                </span>
              )}
              <Toggle on={maintenance} onChange={() => setMaintenance(v => !v)} color="#f87171" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Message input */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>
                ข้อความแจ้งเตือนผู้ใช้งาน
              </label>
              <textarea
                value={maintMsg}
                onChange={e => setMaintMsg(e.target.value)}
                rows={4}
                disabled={!maintenance}
                placeholder="กรอกข้อความที่จะแสดงให้ผู้ใช้เห็น..."
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none transition-all"
                style={{
                  background: maintenance ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                  border: maintenance ? "1px solid rgba(248,113,113,0.3)" : "1px solid #1c2540",
                  color: maintenance ? "white" : "#3a4a6a",
                }} />
            </div>

            {/* ETA + Preview */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>
                  เวลาโดยประมาณ (นาที)
                </label>
                <div className="flex gap-2">
                  {["15", "30", "60", "120"].map(t => (
                    <button key={t} onClick={() => setMaintETA(t)} disabled={!maintenance}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={maintETA === t && maintenance
                        ? { background: "rgba(248,113,113,0.2)", color: "#f87171", border: "1px solid rgba(248,113,113,0.4)" }
                        : { background: "rgba(255,255,255,0.03)", color: "#64748b", border: "1px solid #1c2540" }}>
                      {t}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview card */}
              <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #141c30" }}>
                <p className="text-[10px] font-semibold mb-2" style={{ color: "#64748b" }}>PREVIEW — หน้าที่ผู้ใช้เห็น</p>
                <div className="rounded-lg p-3 text-center" style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)" }}>
                  <Shield size={18} className="mx-auto mb-1" style={{ color: "#f87171" }} />
                  <p className="text-xs font-bold text-white mb-1">ปิดปรับปรุงระบบ</p>
                  <p className="text-[10px] leading-relaxed" style={{ color: "#94a3b8" }}>
                    {maintMsg.slice(0, 80)}{maintMsg.length > 80 ? "..." : ""}
                  </p>
                  {maintenance && (
                    <p className="text-[10px] mt-1" style={{ color: "#f87171" }}>คาดว่าจะกลับมา ~{maintETA} นาที</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button onClick={save}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={saved
              ? { background: "rgba(52,211,153,0.2)", color: "#34d399", border: "1px solid rgba(52,211,153,0.4)" }
              : { background: "linear-gradient(135deg,#38bdf8,#818cf8)", color: "white" }}>
            {saved ? <><Check size={15} /> บันทึกแล้ว</> : <><Save size={15} /> บันทึกการตั้งค่าทั้งหมด</>}
          </button>
        </div>

      </div>
    </div>
  );
}
