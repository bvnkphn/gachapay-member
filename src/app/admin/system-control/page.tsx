"use client";

import { useState, useEffect, useRef } from "react";
import {
  Shield, Bell, Activity, Save, Check,
  AlertTriangle, ChevronDown, Search, Bell as BellIcon,
  Zap, Server, Wifi, Globe, RefreshCw,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════
// SVG FLAGS
// ══════════════════════════════════════════════════════════════════
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
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-xl transition hover:bg-white/5"
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

// ══════════════════════════════════════════════════════════════════
// i18n
// ══════════════════════════════════════════════════════════════════
const T = {
  th: {
    pageTitle: "การตั้งค่า",
    searchPh: "ค้นหา...", systemOnline: "ระบบออนไลน์", adminLabel: "แอดมิน",
    // Maintenance
    maintenance: "การบำรุงรักษา",
    maintenanceMode: "โหมดปิดปรับปรุง",
    maintenanceDesc: "ปิดระบบชั่วคราวสำหรับผู้ใช้งาน",
    maintenanceWarning: "⚠ ระบบอยู่ในโหมดปิดปรับปรุง",
    maintenanceWarningDesc: "ผู้ใช้งานจะเห็นหน้าแจ้งปิดปรับปรุง",
    // Notifications
    notifications: "การแจ้งเตือน",
    notifNewOrder: "แจ้งเตือนออเดอร์ใหม่",
    notifFailedTx: "แจ้งเตือนธุรกรรมล้มเหลว",
    notifLowBalance: "แจ้งเตือน API balance ต่ำ",
    notifDailyReport: "ส่งรายงานรายวันทางอีเมล",
    // API Monitoring
    apiMonitoring: "ตรวจสอบ API",
    liveLabel: "สด",
    msUnit: "ms",
    // Save
    saveSettings: "บันทึกการตั้งค่า",
    saved: "บันทึกแล้ว ✓",
  },
  en: {
    pageTitle: "Settings",
    searchPh: "Search...", systemOnline: "System Online", adminLabel: "Admin",
    maintenance: "Maintenance",
    maintenanceMode: "Maintenance Mode",
    maintenanceDesc: "Temporarily disable the platform for users",
    maintenanceWarning: "⚠ Platform is in maintenance mode",
    maintenanceWarningDesc: "Users will see a maintenance page",
    notifications: "Notifications",
    notifNewOrder: "New order alerts",
    notifFailedTx: "Failed transaction alerts",
    notifLowBalance: "Low API balance alerts",
    notifDailyReport: "Daily report email",
    apiMonitoring: "API Monitoring",
    liveLabel: "Live",
    msUnit: "ms",
    saveSettings: "Save Settings",
    saved: "Saved!",
  },
};

// ══════════════════════════════════════════════════════════════════
// Toggle component — matches wireframe style (pill toggle)
// ══════════════════════════════════════════════════════════════════
function Toggle({ on, onChange, color = "#34d399" }: { on: boolean; onChange: () => void; color?: string }) {
  return (
    <button
      onClick={onChange}
      className="relative flex-shrink-0 transition-all duration-200"
      style={{ width: 44, height: 24 }}>
      <div className="absolute inset-0 rounded-full transition-all duration-200"
        style={{ background: on ? color : "rgba(100,116,139,0.3)", border: `1px solid ${on ? color + "88" : "#3a4a6a"}` }} />
      <div className="absolute top-0.5 rounded-full transition-all duration-200"
        style={{ width: 20, height: 20, left: on ? 22 : 2, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.35)" }} />
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════
// API Monitoring data
// ══════════════════════════════════════════════════════════════════
const API_SERVICES = [
  { name: "Mobile Legends API", ms: 45,   ok: true  },
  { name: "Free Fire API",       ms: 62,   ok: true  },
  { name: "Payment Gateway",     ms: 120,  ok: true  },
  { name: "PUBG API",            ms: 890,  ok: false },
];

function latencyColor(ms: number) {
  if (ms < 100)  return "#34d399";
  if (ms < 300)  return "#fbbf24";
  return "#f87171";
}

// ══════════════════════════════════════════════════════════════════
// Main
// ══════════════════════════════════════════════════════════════════
export default function SettingsPage() {
  const [lang, setLang]           = useState<"th"|"en">("th");
  const [maintenance, setMaintenance] = useState(true);
  const [notifs, setNotifs]       = useState({
    newOrder: true, failedTx: true, lowBalance: true, dailyReport: true,
  });
  const [saved, setSaved]         = useState(false);
  const [apiLatencies, setApiLatencies] = useState(API_SERVICES);

  const t = T[lang];

  // Simulate live latency updates
  useEffect(() => {
    const id = setInterval(() => {
      setApiLatencies(p => p.map(s => ({
        ...s,
        ms: Math.max(10, s.ms + Math.floor((Math.random() - 0.5) * 20)),
      })));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const card = { background: "rgba(11,15,32,0.9)", border: "1px solid #1c2540" };

  return (
    <div className="flex flex-col min-h-full"
      style={{ background: "linear-gradient(160deg,#080c18 0%,#0a0e1e 60%,#060911 100%)", fontFamily: "'Noto Sans Thai','Inter',sans-serif" }}>

      {/* ══ TOPBAR ══ */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 flex-shrink-0"
        style={{ background: "#111827", borderBottom: "1px solid #1e293b", minHeight: 52 }}>
        <div className="flex items-center gap-2 flex-1 min-w-0 max-w-xs rounded-xl px-3 py-2"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1e293b" }}>
          <Search size={13} style={{ color: "#64748b", flexShrink: 0 }} />
          <input placeholder={t.searchPh}
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
            <BellIcon size={15} style={{ color: "#94a3b8" }} />
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

        {/* Page title */}
        <h1 className="text-xl sm:text-2xl font-bold text-white">{t.pageTitle}</h1>

        {/* ── Maintenance card (full width) ── */}
        <div className="rounded-2xl p-4 sm:p-5" style={card}>
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-bold text-white">{t.maintenance}</p>
          </div>

          {/* Maintenance Mode row */}
          <div className="flex items-center justify-between rounded-2xl px-4 sm:px-5 py-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e293b" }}>
            <div>
              <p className="text-sm font-semibold text-white">{t.maintenanceMode}</p>
              <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{t.maintenanceDesc}</p>
            </div>
            <Toggle on={maintenance} onChange={() => setMaintenance(v => !v)} color="#34d399" />
          </div>

          {/* Warning banner — shown when maintenance ON */}
          {maintenance && (
            <div className="mt-3 flex items-start gap-2.5 rounded-xl px-4 py-3"
              style={{ background: "rgba(210,153,34,0.12)", border: "1px solid rgba(210,153,34,0.3)" }}>
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#d29922" }} />
              <div>
                <p className="text-xs font-bold" style={{ color: "#d29922" }}>{t.maintenanceWarning}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>{t.maintenanceWarningDesc}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom 2 panels: Notifications + API Monitoring ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Notifications */}
          <div className="rounded-2xl p-4 sm:p-5" style={card}>
            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid #1c2540" }}>
              <Bell size={14} style={{ color: "#38bdf8" }} />
              <p className="text-sm font-bold text-white">{t.notifications}</p>
            </div>

            <div className="space-y-1">
              {[
                { key: "newOrder"    as const, label: t.notifNewOrder     },
                { key: "failedTx"   as const, label: t.notifFailedTx     },
                { key: "lowBalance" as const, label: t.notifLowBalance   },
                { key: "dailyReport"as const, label: t.notifDailyReport  },
              ].map(item => (
                <div key={item.key}
                  className="flex items-center justify-between px-3 py-3 rounded-xl transition hover:bg-white/[0.02]"
                  style={{ borderBottom: "1px solid #0f1525" }}>
                  <p className="text-sm text-white">{item.label}</p>
                  <Toggle
                    on={notifs[item.key]}
                    onChange={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key] }))}
                    color="#34d399"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* API Monitoring */}
          <div className="rounded-2xl p-4 sm:p-5" style={card}>
            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid #1c2540" }}>
              <Activity size={14} style={{ color: "#a78bfa" }} />
              <p className="text-sm font-bold text-white">{t.apiMonitoring}</p>
              {/* Live indicator */}
              <span className="ml-auto flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />{t.liveLabel}
              </span>
            </div>

            <div className="space-y-1">
              {apiLatencies.map((svc, i) => (
                <div key={i}
                  className="flex items-center justify-between px-3 py-3 rounded-xl transition hover:bg-white/[0.02]"
                  style={{ borderBottom: i < apiLatencies.length - 1 ? "1px solid #0f1525" : "none" }}>
                  <div className="flex items-center gap-2.5">
                    {/* status dot */}
                    <span className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: svc.ok ? "#34d399" : "#f87171" }} />
                    <p className="text-sm text-white">{svc.name}</p>
                  </div>
                  <span className="text-sm font-bold font-mono flex-shrink-0"
                    style={{ color: latencyColor(svc.ms) }}>
                    {svc.ms}{t.msUnit}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Save Settings button (right-aligned) ── */}
        <div className="flex justify-end pt-1">
          <button onClick={save}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={saved
              ? { background: "rgba(52,211,153,0.18)", color: "#34d399", border: "1px solid rgba(52,211,153,0.4)" }
              : { background: "rgba(255,255,255,0.08)", color: "#e2e8f0", border: "1px solid #2a3550" }}>
            {saved
              ? <><Check size={14} /> {t.saved}</>
              : <><Save size={14} /> {t.saveSettings}</>}
          </button>
        </div>

      </div>
    </div>
  );
}