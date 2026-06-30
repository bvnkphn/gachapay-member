"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  Save, Check, RefreshCw, Shield, Clock, Activity, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Modern Tailwind Switch Toggle Component
function Toggle({ on, onChange, color = "bg-primary", disabled = false }: {
  on: boolean;
  onChange: () => void;
  color?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
        on ? color : "bg-slate-200 dark:bg-slate-800"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          on ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

export default function SystemControl() {
  const { token } = useAdminAuth();

  const [maintenance, setMaintenance] = useState(false);
  const [maintMsg, setMaintMsg]       = useState("ระบบกำลังปิดปรับปรุงชั่วคราว จะกลับมาให้บริการในเร็วๆ นี้ครับ 🙏");
  const [maintETA, setMaintETA]       = useState("30");
  const [notify, setNotify] = useState({
    newOrder: true,
    failedTransaction: true,
    lowApiBalance: true,
    dailyReport: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  // Clock state
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(
        `${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes()
        ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch status from API
  const fetchStatus = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/system/status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const d = res.data;
      setMaintenance(d.maintenance?.enabled ?? false);
      setMaintMsg(d.maintenance?.message ?? maintMsg);
      setMaintETA(String(d.maintenance?.etaMinutes ?? 30));
      setNotify({
        newOrder:          d.notifications?.newOrder          ?? true,
        failedTransaction: d.notifications?.failedTransaction ?? true,
        lowApiBalance:     d.notifications?.lowApiBalance     ?? true,
        dailyReport:       d.notifications?.dailyReport       ?? false,
      });
    } catch (err: any) {
      console.error("Failed to load system settings:", err);
      setError("ไม่สามารถดึงข้อมูลการตั้งค่าระบบได้");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Handle Save
  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      await Promise.all([
        axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/system/maintenance`,
          { enabled: maintenance, message: maintMsg, etaMinutes: Number(maintETA) },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/system/notifications`,
          notify,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);
      setSaved(true);
      toast.success("บันทึกการตั้งค่าระบบทั้งหมดเสร็จสิ้น");
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      setError("บันทึกข้อมูลตั้งค่าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      toast.error("ไม่สามารถบันทึกการตั้งค่าได้");
    } finally {
      setSaving(false);
    }
  };

  // Toggle maintenance mode with instant API callback
  const toggleMaintenance = async () => {
    if (!token) return;
    const next = !maintenance;
    setMaintenance(next);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/system/maintenance`,
        { enabled: next, message: maintMsg, etaMinutes: Number(maintETA) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(
        next ? "เปิดใช้งานโหมดปิดปรับปรุงแล้ว" : "ปิดโหมดปิดปรับปรุงแล้ว"
      );
    } catch (err: any) {
      setMaintenance(!next);
      toast.error("เปลี่ยนสถานะโหมดปิดปรับปรุงล้มเหลว");
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="animate-spin text-primary" size={32} />
        <p className="text-sm text-muted-foreground font-bold">กำลังโหลดการตั้งค่าระบบ...</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] tracking-widest uppercase font-mono mb-1 text-muted-foreground">
            Super Admin · System settings
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            ตั้งค่าระบบ <span className="text-primary font-bold">(System Control)</span>
          </h1>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl text-sm bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold shadow-sm animate-in fade-in duration-200">
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Containers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Card 1: Maintenance Settings */}
        <div
          className={cn(
            "bg-card border rounded-2xl shadow-sm p-4 sm:p-5 transition-all duration-300",
            maintenance ? "border-rose-500/30 ring-1 ring-rose-500/10 bg-rose-500/[0.01]" : "border-border"
          )}
        >
          <div className="flex items-center justify-between pb-3 mb-4 gap-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors",
                  maintenance
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                    : "bg-primary/10 border-primary/20 text-primary"
                )}
              >
                <Shield size={16} />
              </div>
              <div>
                <p className="text-sm font-black text-foreground">โหมดปิดปรับปรุงระบบ</p>
                <p className="text-[11px] text-muted-foreground font-bold">Maintenance Mode</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              {maintenance && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse bg-rose-500/10 border border-rose-500/30 text-rose-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  ACTIVE
                </span>
              )}
              <Toggle on={maintenance} onChange={toggleMaintenance} color="bg-rose-500" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">
                ข้อความประกาศปิดปรับปรุงถึงลูกค้า
              </label>
              <textarea
                value={maintMsg}
                onChange={e => setMaintMsg(e.target.value)}
                rows={3}
                disabled={!maintenance}
                className={cn(
                  "w-full rounded-xl px-3 py-2.5 text-sm text-foreground outline-none resize-none transition-all border",
                  maintenance
                    ? "bg-background border-rose-500/35 focus:ring-1 focus:ring-rose-500"
                    : "bg-muted/40 border-border cursor-not-allowed text-muted-foreground/80"
                )}
                placeholder="ระบุข้อความประกาศ..."
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">
                ระยะเวลาปิดปรับปรุงโดยประมาณ (ETA)
              </label>
              <div className="flex gap-2">
                {["15", "30", "60", "120"].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMaintETA(t)}
                    disabled={!maintenance}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-extrabold transition-all border",
                      !maintenance
                        ? "bg-muted/20 border-border/80 text-muted-foreground/50 cursor-not-allowed"
                        : maintETA === t
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                        : "bg-background hover:bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t} นาที
                  </button>
                ))}
              </div>
            </div>

            {maintenance && (
              <div className="rounded-xl p-3.5 bg-rose-500/5 border border-rose-500/10 space-y-1.5">
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <Shield size={13} />
                  พรีวิวข้อความประกาศที่จะแสดง:
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                  "{maintMsg}" (โดยประมาณ {maintETA} นาที)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Notification Settings */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-3 mb-4 border-b border-border">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10 border border-primary/20 text-primary">
                <Activity size={16} />
              </div>
              <div>
                <p className="text-sm font-black text-foreground">การแจ้งเตือนและระบบบริการ</p>
                <p className="text-[11px] text-muted-foreground font-bold">Notification & Reports</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto font-bold bg-sky-500/10 border border-sky-500/20 text-sky-500 select-none">
                EMAIL SERVICE
              </span>
            </div>

            <div className="space-y-3">
              {[
                { key: "newOrder",          label: "New order alerts",         sub: "ส่งอีเมลแจ้งเตือนผู้ดูแลระบบเมื่อมีคำสั่งซื้อใหม่"    },
                { key: "failedTransaction", label: "Failed transaction alerts", sub: "ส่งอีเมลแจ้งเตือนเมื่อการชำระเงินไม่ผ่านหรือถูกปฏิเสธ"  },
                { key: "lowApiBalance",     label: "Low API balance alerts",   sub: "ส่งอีเมลแจ้งเตือนทันทีเมื่อยอดเครดิต API คู่ค้าหลังบ้านต่ำ"  },
                { key: "dailyReport",       label: "Daily report email",       sub: "รับรายงานสรุปยอดขาย ประจำวันทุกคืนเวลา 00:00 น."             },
              ].map(n => (
                <div
                  key={n.key}
                  className="flex items-center justify-between rounded-xl px-3.5 py-3 gap-3 bg-muted/20 border border-border/80"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-foreground font-extrabold">{n.label}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{n.sub}</p>
                  </div>
                  <Toggle
                    on={notify[n.key as keyof typeof notify]}
                    onChange={() =>
                      setNotify(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof notify] }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save Action inside container footer */}
          <div className="pt-4 border-t border-border mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-md disabled:opacity-50 cursor-pointer",
                saved
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-foreground text-background hover:bg-foreground/90"
              )}
            >
              {saved ? (
                <>
                  <Check size={14} />
                  บันทึกสำเร็จ
                </>
              ) : saving ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save size={14} />
                  บันทึกการตั้งค่าทั้งหมด
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
