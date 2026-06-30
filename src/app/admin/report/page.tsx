"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  TrendingUp, TrendingDown, DollarSign, Receipt,
  Download, ChevronDown, ArrowUpRight, ArrowDownRight,
  FileSpreadsheet, FileText, Filter, RefreshCw,
  Gamepad2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Period = "today" | "week" | "month" | "year" | "custom";

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  coin: 'Coin', wallet: 'Coin', gacha_wallet: 'Coin',
  truemoney: 'TrueWallet', truewallet: 'TrueWallet', true_wallet: 'TrueWallet',
  qr: 'QR', promptpay: 'QR',
  bank_transfer: 'BankTransfer', banktransfer: 'BankTransfer',
  free: 'Free',
};
function fmtMethod(raw: string | null | undefined): string {
  if (!raw || raw === '-' || raw === 'unknown') return '-';
  return PAYMENT_METHOD_LABELS[raw.toLowerCase()] ?? raw;
}

function StatCard({ label, value, sub, icon: Icon, trend }: {
  label: string; value: string; sub?: string; icon: any; trend?: "up" | "down";
}) {
  return (
    <div className="rounded-2xl p-4 sm:p-5 relative overflow-hidden bg-card border border-border/80 shadow-sm text-card-foreground">
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[10px] tracking-widest uppercase font-bold text-muted-foreground">{label}</p>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
            <Icon size={16} />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-none mb-1">{value}</p>
        {sub && <p className="text-[11px] mt-1 text-muted-foreground font-medium">{sub}</p>}
        {trend && (
          <div className={cn(
            "flex items-center gap-1 mt-2 text-[11px] font-bold",
            trend === "up" ? "text-emerald-500" : "text-rose-500"
          )}>
            {trend === "up" ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {trend === "up" ? "เพิ่มขึ้น" : "ลดลง"}
          </div>
        )}
      </div>
    </div>
  );
}

// Mini bar chart
function MiniBarChart({ data }: { data: { label: string; revenue: number; cost: number }[] }) {
  const maxVal = Math.max(...data.map(d => d.revenue));
  return (
    <div className="flex items-end gap-2 w-full" style={{ height: 80 }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex gap-1 items-end" style={{ height: 70 }}>
            <div className="flex-1 rounded-t transition-all bg-primary"
              style={{ height: `${maxVal > 0 ? (d.revenue / maxVal) * 100 : 0}%`, minHeight: 2 }} />
            <div className="flex-1 rounded-t transition-all bg-muted-foreground/30"
              style={{ height: `${maxVal > 0 ? (d.cost / maxVal) * 100 : 0}%`, minHeight: 2 }} />
          </div>
          <p className="text-[9px] truncate w-full text-center text-muted-foreground font-bold">{d.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function FinancialDashboard() {
  const { token } = useAdminAuth();
  const [period, setPeriod]         = useState<Period>("month");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "failed">("all");
  const [page, setPage]             = useState(1);

  const [summary, setSummary]         = useState<any>(null);
  const [financial, setFinancial]     = useState<any>(null);
  const [transactions, setTransactions] = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [exporting, setExporting]     = useState(false);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ period, ...(dateFrom && { dateFrom }), ...(dateTo && { dateTo }) });
      const tp = new URLSearchParams({ period, page: String(page), limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(dateFrom && { dateFrom }), ...(dateTo && { dateTo }),
      });
      const headers = { Authorization: `Bearer ${token}` };
      const [sRes, fRes, tRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/summary?${p}`,      { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/financial?${p}`,    { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/transactions?${tp}`,{ headers }),
      ]);
      setSummary(sRes.data);
      setFinancial(fRes.data);
      setTransactions(tRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, period, dateFrom, dateTo, statusFilter, page]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Handle global navbar refresh action
  useEffect(() => {
    const handleRefresh = () => {
      fetchAll();
    };
    window.addEventListener("admin-refresh", handleRefresh);
    return () => window.removeEventListener("admin-refresh", handleRefresh);
  }, [fetchAll]);

  const handleExport = async (format: "csv" | "xlsx") => {
    if (!token) return;
    setExporting(true);
    try {
      const p = new URLSearchParams({ period, format, ...(dateFrom && { dateFrom }), ...(dateTo && { dateTo }) });
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/export?${p}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${period}_${new Date().toISOString().slice(0,10)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("ส่งออกรายงานสำเร็จ");
    } catch { 
      toast.error("ส่งออกรายงานไม่สำเร็จ"); 
    } finally { setExporting(false); setExportOpen(false); }
  };

  // Build daily chart data
  const chartData = summary?.daily
    ? Object.entries(summary.daily).slice(-7).map(([date, v]: [string, any]) => ({
        label: new Date(date).toLocaleDateString("th-TH", { day: "numeric", month: "short" }),
        revenue: v.revenue,
        cost: 0,
      }))
    : [];

  const periodLabel: Record<Period, string> = {
    today: "วันนี้", week: "สัปดาห์นี้", month: "เดือนนี้", year: "ปีนี้", custom: "กำหนดเอง",
  };

  const rev     = summary?.revenue?.total ?? 0;
  const cost    = summary?.cost ?? 0;
  const profit  = summary?.profit ?? 0;
  const vat     = summary?.revenue?.vat ?? 0;
  const margin  = rev > 0 ? ((profit / rev) * 100).toFixed(1) : "0.0";

  return (
    <div className="p-3 sm:p-5 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-widest uppercase font-mono mb-1 text-muted-foreground">
            Super Admin · Financial Report
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            รายงานการเงิน{" "}
            <span className="text-primary">
              {periodLabel[period]}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period */}
          <div className="flex gap-1 p-1 rounded-xl bg-card border border-border/80 shadow-sm flex-shrink-0">
            {(["today","week","month","year","custom"] as Period[]).map(p => (
              <button key={p} onClick={() => { setPeriod(p); setPage(1); }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  period === p
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                )}>
                {periodLabel[p]}
              </button>
            ))}
          </div>
          {/* Refresh */}
          <button onClick={fetchAll} disabled={loading}
            className="p-2 rounded-xl border border-border/80 bg-card text-muted-foreground hover:text-foreground transition disabled:opacity-50">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          {/* Export */}
          <div className="relative">
            <button onClick={() => setExportOpen(v => !v)} disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-foreground text-background hover:opacity-90 transition disabled:opacity-50">
              {exporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
              Export
              <ChevronDown size={12} className={cn("transition-transform", exportOpen && "rotate-180")} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-50 rounded-xl overflow-hidden shadow-2xl bg-card border border-border/80 min-w-[200px]">
                <button onClick={() => handleExport("xlsx")}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-foreground hover:bg-muted transition font-bold">
                  <FileSpreadsheet size={14} className="text-emerald-500" /> Export .xlsx (Excel)
                </button>
                <div className="border-t border-border/40">
                  <button onClick={() => handleExport("csv")}
                    className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-foreground hover:bg-muted transition font-bold">
                    <FileText size={14} className="text-sky-500" /> Export .csv
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom date range */}
      {period === "custom" && (
        <div className="flex gap-3 flex-wrap items-end bg-card border border-border/80 p-4 rounded-2xl max-w-md shadow-sm">
          <div>
            <label className="text-[10px] mb-1.5 block text-muted-foreground font-bold">ตั้งแต่</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="rounded-xl px-3 py-2 text-xs bg-muted text-foreground border border-border outline-none" />
          </div>
          <div>
            <label className="text-[10px] mb-1.5 block text-muted-foreground font-bold">ถึง</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="rounded-xl px-3 py-2 text-xs bg-muted text-foreground border border-border outline-none" />
          </div>
          <button onClick={fetchAll} disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow hover:opacity-90 transition">
            ตกลง
          </button>
        </div>
      )}

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-5 animate-pulse bg-card border border-border/60">
              <div className="h-3 w-20 rounded bg-muted/60 mb-3" />
              <div className="h-7 w-28 rounded bg-muted/60 mb-2" />
              <div className="h-2 w-16 rounded bg-muted/60" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="กำไรสุทธิ"  value={`฿${fmt(profit)}`} sub={`Margin ${margin}%`}               icon={TrendingUp}   trend="up"   />
          <StatCard label="รายได้รวม"  value={`฿${fmt(rev)}`}    sub={`${summary?.orders?.total ?? 0} ออเดอร์`} icon={DollarSign}   trend="up"   />
          <StatCard label="ต้นทุนรวม"  value={`฿${fmt(cost)}`}   sub={`${rev > 0 ? ((cost/rev)*100).toFixed(1) : 0}% ของรายได้`} icon={TrendingDown} />
          <StatCard label="VAT 7%"     value={`฿${fmt(vat)}`}    sub={`Success ${summary?.orders?.successRate ?? 0}%`} icon={Receipt}      />
        </div>
      )}

      {/* Chart + Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Chart */}
        <div className="lg:col-span-3 rounded-2xl p-5 bg-card border border-border/80 shadow-sm text-card-foreground">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-foreground">รายได้รายวัน</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1.5 rounded bg-primary" />
                <span className="text-[10px] text-muted-foreground font-bold">รายได้</span>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="animate-pulse rounded-xl bg-muted/60" style={{ height: 80 }} />
          ) : chartData.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
          ) : (
            <MiniBarChart data={chartData} />
          )}
        </div>

        {/* VAT Breakdown */}
        <div className="lg:col-span-2 rounded-2xl p-5 bg-card border border-border/80 shadow-sm text-card-foreground">
          <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Receipt size={14} className="text-primary" /> รายละเอียดภาษี (VAT)
          </p>
          {loading ? (
            <div className="space-y-3">
              {Array.from({length:4}).map((_,i) => (
                <div key={i} className="animate-pulse h-8 rounded bg-muted/60" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: "รายได้รวม (incl. VAT)", value: rev,                  color: "bg-primary" },
                { label: "VAT 7%",                 value: vat,                  color: "bg-rose-500" },
                { label: "รายได้ (excl. VAT)",     value: summary?.revenue?.exVat ?? 0, color: "bg-sky-500" },
                { label: "กำไรสุทธิ",               value: profit,              color: "bg-emerald-500" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1.5 text-xs">
                    <p className="text-muted-foreground font-semibold">{item.label}</p>
                    <p className="font-extrabold text-foreground">฿{fmt(item.value)}</p>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", item.color)}
                      style={{ width: `${rev > 0 ? Math.min(100, (item.value / rev) * 100) : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* By Game */}
      {financial?.byGame?.length > 0 && (
        <div className="rounded-2xl p-5 bg-card border border-border/80 shadow-sm text-card-foreground">
          <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Gamepad2 size={14} className="text-primary" /> รายได้แยกตามเกม
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20">
                  {["เกม", "รายได้", "ต้นทุน", "กำไร", "ออเดอร์"].map(h => (
                    <th key={h} className="pb-2 pt-2 px-3 text-left text-[10px] font-bold text-muted-foreground uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {financial.byGame.map((g: any, i: number) => (
                  <tr key={i} className="border-b border-border/45 hover:bg-muted/10 transition">
                    <td className="py-3 px-3 font-extrabold text-foreground">{g.game}</td>
                    <td className="py-3 px-3 font-bold font-mono text-cyan-600 dark:text-cyan-400">฿{fmt(g.revenue)}</td>
                    <td className="py-3 px-3 font-mono text-rose-500">฿{fmt(g.cost)}</td>
                    <td className="py-3 px-3 font-bold font-mono text-emerald-500">฿{fmt(g.profit)}</td>
                    <td className="py-3 px-3 text-muted-foreground font-semibold">{g.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="rounded-2xl overflow-hidden bg-card border border-border/80 shadow-sm text-card-foreground">
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 border-b border-border/60 bg-muted/20">
          <p className="text-sm font-bold text-foreground">รายการธุรกรรม</p>
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-muted-foreground" />
            {(["all", "completed", "failed"] as const).map(f => (
              <button key={f} onClick={() => { setStatusFilter(f); setPage(1); }}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold transition border",
                  statusFilter === f
                    ? f === "all"
                      ? "bg-primary/10 text-primary border-primary/30"
                      : f === "completed"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
                    : "bg-card text-muted-foreground border-border/80 hover:text-foreground hover:border-border"
                )}>
                {{ all: "ทั้งหมด", completed: "สำเร็จ", failed: "ล้มเหลว" }[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20">
                {["Order ID","วันที่","เกม / แพ็กเกจ","UID","รายได้","VAT 7%","ต้นทุน","กำไร","วิธีชำระ","สถานะ"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-muted-foreground uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({length:5}).map((_,i) => (
                <tr key={i} className="border-b border-border/40">
                  {Array.from({length:10}).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 rounded animate-pulse bg-muted/60" style={{ width: j === 2 ? 120 : 60 }} />
                    </td>
                  ))}
                </tr>
              )) : transactions?.data?.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-sm text-muted-foreground font-semibold">ไม่พบรายการ</td></tr>
              ) : transactions?.data?.map((r: any, i: number) => (
                <tr key={i} className="hover:bg-muted/10 transition border-b border-border/40">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{r.orderId}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString("th-TH", { day:"numeric",month:"short",year:"2-digit" })}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-extrabold text-foreground text-xs">{r.gameName}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold truncate max-w-[120px]">{r.packageName}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground font-semibold">{r.uid}</td>
                  <td className="px-4 py-3 font-bold font-mono text-xs text-cyan-600 dark:text-cyan-400 whitespace-nowrap">฿{fmt(r.revenue)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-purple-600 dark:text-purple-400 whitespace-nowrap">฿{fmt(r.vat)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-rose-500 whitespace-nowrap">฿{fmt(r.cost)}</td>
                  <td className="px-4 py-3 font-bold font-mono text-xs text-emerald-500 whitespace-nowrap">฿{fmt(r.profit)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-bold whitespace-nowrap">{fmtMethod(r.paymentMethod)}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap border",
                      r.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    )}>
                      <span className={cn("w-1 h-1 rounded-full", r.status === "completed" ? "bg-emerald-500" : "bg-rose-500")} />
                      {r.status === "completed" ? "สำเร็จ" : "ล้มเหลว"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {transactions?.pagination && transactions.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/10">
            <p className="text-xs text-muted-foreground font-bold">
              {transactions.pagination.page}/{transactions.pagination.totalPages} · {transactions.pagination.total.toLocaleString()} รายการ
            </p>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-1.5 rounded-lg border border-border/80 bg-card text-muted-foreground hover:text-foreground transition disabled:opacity-30">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= transactions.pagination.totalPages}
                className="p-1.5 rounded-lg border border-border/80 bg-card text-muted-foreground hover:text-foreground transition disabled:opacity-30">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
