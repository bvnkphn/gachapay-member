"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp, TrendingDown, DollarSign, Receipt,
  Download, ChevronDown, ArrowUpRight, ArrowDownRight,
  FileSpreadsheet, FileText, Filter
} from "lucide-react";

// ── Mock Data ─────────────────────────────────────────────────────
const mockSummary = {
  daily:   { revenue: 48200,   cost: 31800,   netProfit: 16400,   vat: 3374,   wht: 965,    orders: 142   },
  monthly: { revenue: 892400,  cost: 587300,  netProfit: 305100,  vat: 62468,  wht: 17848,  orders: 2841  },
  yearly:  { revenue: 9840000, cost: 6430000, netProfit: 3410000, vat: 688800, wht: 196560, orders: 31200 },
};

const mockRows = [
  { date: "08 มี.ค. 68", txId: "TXN-009821", game: "Genshin Impact",   pkg: "Eden's 6480",   revenue: 960,  cost: 672,  vat: 67.2, wht: 19.2, net: 201.6, status: "completed" },
  { date: "08 มี.ค. 68", txId: "TXN-009820", game: "PUBG Mobile",      pkg: "UC 1800",        revenue: 650,  cost: 455,  vat: 45.5, wht: 13.0, net: 136.5, status: "completed" },
  { date: "08 มี.ค. 68", txId: "TXN-009819", game: "Free Fire",        pkg: "Diamond 520",    revenue: 299,  cost: 209,  vat: 20.9, wht: 5.98, net: 63.12, status: "completed" },
  { date: "08 มี.ค. 68", txId: "TXN-009818", game: "Valorant",         pkg: "VP 1000",        revenue: 350,  cost: 245,  vat: 24.5, wht: 7.0,  net: 73.5,  status: "completed" },
  { date: "07 มี.ค. 68", txId: "TXN-009817", game: "ROV",              pkg: "Voucher 200",    revenue: 200,  cost: 140,  vat: 14.0, wht: 4.0,  net: 42.0,  status: "completed" },
  { date: "07 มี.ค. 68", txId: "TXN-009816", game: "Honkai Star Rail", pkg: "Oneiric 6480",   revenue: 980,  cost: 686,  vat: 68.6, wht: 19.6, net: 205.8, status: "completed" },
  { date: "07 มี.ค. 68", txId: "TXN-009815", game: "Mobile Legends",   pkg: "Diamond 500",    revenue: 500,  cost: 350,  vat: 35.0, wht: 10.0, net: 105.0, status: "failed"    },
  { date: "07 มี.ค. 68", txId: "TXN-009814", game: "Genshin Impact",   pkg: "Eden's 1980",    revenue: 320,  cost: 224,  vat: 22.4, wht: 6.4,  net: 67.2,  status: "completed" },
  { date: "06 มี.ค. 68", txId: "TXN-009813", game: "PUBG Mobile",      pkg: "UC 325",         revenue: 150,  cost: 105,  vat: 10.5, wht: 3.0,  net: 31.5,  status: "completed" },
  { date: "06 มี.ค. 68", txId: "TXN-009812", game: "Minecraft",        pkg: "Minecon 450",    revenue: 450,  cost: 315,  vat: 31.5, wht: 9.0,  net: 94.5,  status: "completed" },
];

const barData = [
  { label: "ม.ค.", revenue: 720000, cost: 470000 },
  { label: "ก.พ.", revenue: 810000, cost: 530000 },
  { label: "มี.ค.", revenue: 892400, cost: 587300 },
  { label: "เม.ย.", revenue: 750000, cost: 495000 },
  { label: "พ.ค.", revenue: 940000, cost: 620000 },
  { label: "มิ.ย.", revenue: 870000, cost: 572000 },
];
const maxBar = Math.max(...barData.map(d => d.revenue));

type Period = "daily" | "monthly" | "yearly";

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function exportCSV(rows: typeof mockRows, period: Period) {
  const headers = ["วันที่","Transaction ID","เกม","แพ็กเกจ","รายได้","ต้นทุน","VAT 7%","WHT 3%","กำไรสุทธิ","สถานะ"];
  const lines = [headers.join(","), ...rows.map(r =>
    [r.date,r.txId,r.game,r.pkg,r.revenue,r.cost,r.vat,r.wht,r.net,r.status==="completed"?"สำเร็จ":"ล้มเหลว"].join(",")
  )];
  const blob = new Blob(["\uFEFF"+lines.join("\n")],{type:"text/csv;charset=utf-8;"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `cyberpay-${period}-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

function exportXLSX(rows: typeof mockRows, period: Period) {
  const headers = ["วันที่","Transaction ID","เกม","แพ็กเกจ","รายได้","ต้นทุน","VAT 7%","WHT 3%","กำไรสุทธิ","สถานะ"];
  let tbl = `<table border="1"><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr>`;
  rows.forEach(r=>{tbl+=`<tr><td>${r.date}</td><td>${r.txId}</td><td>${r.game}</td><td>${r.pkg}</td><td>${r.revenue}</td><td>${r.cost}</td><td>${r.vat}</td><td>${r.wht}</td><td>${r.net}</td><td>${r.status==="completed"?"สำเร็จ":"ล้มเหลว"}</td></tr>`;});
  tbl+="</table>";
  const html=`<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/></head><body>${tbl}</body></html>`;
  const blob=new Blob(["\uFEFF"+html],{type:"application/vnd.ms-excel;charset=utf-8;"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`cyberpay-${period}-${new Date().toISOString().slice(0,10)}.xls`;
  a.click();
}

// card bg / border reused
const cardStyle = { background: "rgba(11,15,32,0.85)", border: "1px solid #1c2540" };

function StatCard({ label, value, sub, icon: Icon, accent, trend }: {
  label: string; value: string; sub?: string; icon: any; accent: string; trend?: "up"|"down";
}) {
  return (
    <div style={cardStyle} className="rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden select-none">
      <div className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle at 80% 20%, ${accent}14, transparent 60%)` }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[11px] tracking-widest uppercase font-semibold" style={{color:"#94a3b8"}}>{label}</p>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${accent}1a` }}>
            <Icon size={16} style={{ color: accent }} />
          </div>
        </div>
        <p className="text-[22px] font-bold text-white leading-none mb-1">{value}</p>
        {sub && <p className="text-[11px] mt-1" style={{color:"#94a3b8"}}>{sub}</p>}
        {trend && (
          <div className={`flex items-center gap-1 mt-3 text-[11px] font-semibold`}
            style={{ color: trend === "up" ? "#38bdf8" : "#f87171" }}>
            {trend === "up" ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
            {trend === "up" ? "+12.4% จากช่วงก่อน" : "-3.1% จากช่วงก่อน"}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FinancialDashboard() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [exportOpen, setExportOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all"|"completed"|"failed">("all");

  const s = mockSummary[period];
  const margin = ((s.netProfit / s.revenue) * 100).toFixed(1);
  const rows = useMemo(() =>
    statusFilter === "all" ? mockRows : mockRows.filter(r => r.status === statusFilter),
    [statusFilter]
  );

  return (
    <div className="min-h-screen relative overflow-hidden pt-20 pb-24 px-4"
      style={{ background: "#07091566" }}>

      {/* Dark base */}
      <div className="fixed inset-0 -z-10" style={{ background: "linear-gradient(160deg,#080c18 0%,#0a0e1e 60%,#060911 100%)" }} />

      {/* Purple glow top-center like screenshot */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] -z-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(88,50,210,0.22) 0%, transparent 100%)" }} />
      <div className="fixed top-[15%] right-[8%] w-[400px] h-[400px] -z-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)" }} />
      <div className="fixed bottom-[20%] left-[5%] w-[350px] h-[350px] -z-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)" }} />

      <div className="relative max-w-7xl mx-auto space-y-5 select-none">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-widest uppercase font-mono mb-2" style={{color:"#64748b"}}>
              Super Admin · Financial Report
            </p>
            <h1 className="text-3xl font-bold text-white">
              รายงานการเงิน{" "}
              <span style={{ background: "linear-gradient(90deg,#38bdf8,#818cf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                {{ daily:"รายวัน", monthly:"รายเดือน", yearly:"รายปี" }[period]}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Period selector */}
            <div className="flex p-1 gap-0.5 rounded-xl" style={cardStyle}>
              {(["daily","monthly","yearly"] as Period[]).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                  style={period === p
                    ? { background:"rgba(88,50,210,0.3)", color:"#a5b4fc", border:"1px solid rgba(129,140,248,0.4)" }
                    : { color:"#94a3b8", border:"1px solid transparent" }}>
                  {{ daily:"รายวัน", monthly:"รายเดือน", yearly:"รายปี" }[p]}
                </button>
              ))}
            </div>

            {/* Export */}
            <div className="relative">
              <button onClick={() => setExportOpen(v => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.28)", color:"#38bdf8" }}>
                <Download size={15}/> Export
                <ChevronDown size={13} className={`transition-transform ${exportOpen?"rotate-180":""}`}/>
              </button>
              {exportOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 rounded-xl overflow-hidden shadow-2xl"
                  style={{ background:"rgba(8,10,22,0.98)", border:"1px solid #1c2540", minWidth:210 }}>
                  <button onClick={() => { exportXLSX(rows,period); setExportOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-white/5 transition">
                    <FileSpreadsheet size={15} style={{color:"#34d399"}}/> Export เป็น .xlsx
                  </button>
                  <div style={{borderTop:"1px solid #1c2540"}}>
                    <button onClick={() => { exportCSV(rows,period); setExportOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-white/5 transition">
                      <FileText size={15} style={{color:"#38bdf8"}}/> Export เป็น .csv
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="กำไรสุทธิ"  value={`฿${fmt(s.netProfit)}`} sub={`Margin ${margin}%`}                              icon={TrendingUp}   accent="#38bdf8" trend="up"   />
          <StatCard label="รายได้รวม"  value={`฿${fmt(s.revenue)}`}  sub={`${s.orders.toLocaleString()} รายการ`}            icon={DollarSign}   accent="#818cf8" trend="up"   />
          <StatCard label="ต้นทุนรวม"  value={`฿${fmt(s.cost)}`}    sub={`${((s.cost/s.revenue)*100).toFixed(1)}% ของรายได้`} icon={TrendingDown} accent="#f472b6" trend="down" />
          <StatCard label="ภาษี / WHT" value={`฿${fmt(s.vat)}`}     sub={`WHT ฿${fmt(s.wht)}`}                              icon={Receipt}      accent="#a78bfa" />
        </div>

        {/* Tax + Chart */}
        <div className="grid md:grid-cols-5 gap-4">
          <div className="md:col-span-2 rounded-2xl p-6 backdrop-blur-xl" style={cardStyle}>
            <p className="text-sm font-bold text-white mb-5 flex items-center gap-2">
              <Receipt size={14} style={{color:"#a78bfa"}}/> รายละเอียดภาษี
            </p>
            <div className="space-y-5">
              {[
                { label:"VAT 7%",                 desc:"ภาษีมูลค่าเพิ่ม",     value:s.vat,               color:"#818cf8", w:Math.min(100,(s.vat/s.revenue)*700)    },
                { label:"WHT 3%",                 desc:"ภาษีหัก ณ ที่จ่าย",   value:s.wht,               color:"#f472b6", w:Math.min(100,(s.wht/s.cost)*700)       },
                { label:"กำไรสุทธิหลังหักภาษี",    desc:"Net after VAT + WHT", value:s.netProfit-s.wht,   color:"#38bdf8", w:Math.min(100,((s.netProfit-s.wht)/s.revenue)*150) },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-[11px]" style={{color:"#94a3b8"}}>{item.desc}</p>
                    </div>
                    <p className="text-sm font-bold" style={{color:item.color}}>฿{fmt(item.value)}</p>
                  </div>
                  <div className="w-full h-1 rounded-full" style={{background:"rgba(255,255,255,0.05)"}}>
                    <div className="h-full rounded-full" style={{width:`${item.w}%`,background:item.color}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 rounded-2xl p-6 backdrop-blur-xl" style={cardStyle}>
            <p className="text-sm font-bold text-white mb-5">รายได้ vs ต้นทุน (6 เดือน)</p>
            <div className="flex items-end gap-2" style={{height:120}}>
              {barData.map((d,i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5 items-end" style={{height:100}}>
                    <div className="flex-1 rounded-t-md"
                      style={{height:`${(d.revenue/maxBar)*100}%`, background:"linear-gradient(180deg,#38bdf8,#0e7490)"}}/>
                    <div className="flex-1 rounded-t-md"
                      style={{height:`${(d.cost/maxBar)*100}%`, background:"linear-gradient(180deg,#818cf8,#4338ca)"}}/>
                  </div>
                  <p className="text-[10px]" style={{color:"#94a3b8"}}>{d.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-5 mt-3">
              <div className="flex items-center gap-2"><div className="w-3 h-1.5 rounded" style={{background:"#38bdf8"}}/><span className="text-[11px]" style={{color:"#94a3b8"}}>รายได้</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-1.5 rounded" style={{background:"#818cf8"}}/><span className="text-[11px]" style={{color:"#94a3b8"}}>ต้นทุน</span></div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden backdrop-blur-xl" style={cardStyle}>
          <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-4"
            style={{borderBottom:"1px solid #1c2540"}}>
            <p className="text-base font-bold text-white">รายละเอียดรายการ</p>
            <div className="flex items-center gap-2">
              <Filter size={13} style={{color:"#94a3b8"}}/>
              {(["all","completed","failed"] as const).map(f => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={statusFilter===f
                    ? f==="all"       ? {background:"rgba(88,50,210,0.25)",color:"#a5b4fc",border:"1px solid rgba(129,140,248,0.4)"}
                    : f==="completed" ? {background:"rgba(56,189,248,0.15)",color:"#38bdf8",border:"1px solid rgba(56,189,248,0.35)"}
                                      : {background:"rgba(248,113,113,0.15)",color:"#f87171",border:"1px solid rgba(248,113,113,0.35)"}
                    : {color:"#94a3b8",border:"1px solid #1c2540"}}>
                  {{all:"ทั้งหมด",completed:"สำเร็จ",failed:"ล้มเหลว"}[f]}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{background:"rgba(5,7,18,0.7)",borderBottom:"1px solid #1c2540"}}>
                  {["วันที่","Transaction ID","เกม / แพ็กเกจ","รายได้","ต้นทุน","VAT 7%","WHT 3%","กำไรสุทธิ","สถานะ"].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748b] tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i) => (
                  <tr key={i} className="transition-colors hover:bg-white/[0.025]"
                    style={{borderBottom:"1px solid #111828"}}>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{color:"#94a3b8"}}>{r.date}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{color:"#67e8f9"}}>{r.txId}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white text-sm">{r.game}</p>
                      <p className="text-[11px]" style={{color:"#8892aa"}}>{r.pkg}</p>
                    </td>
                    <td className="px-4 py-3 font-bold whitespace-nowrap" style={{color:"#7dd3fc"}}>฿{fmt(r.revenue)}</td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{color:"#f9a8d4"}}>฿{fmt(r.cost)}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{color:"#c4b5fd"}}>฿{fmt(r.vat)}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{color:"#a5b4fc"}}>฿{fmt(r.wht)}</td>
                    <td className="px-4 py-3 font-bold whitespace-nowrap" style={{color:"#7dd3fc"}}>฿{fmt(r.net)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                        style={r.status==="completed"
                          ? {background:"rgba(56,189,248,0.1)",color:"#38bdf8",border:"1px solid rgba(56,189,248,0.25)"}
                          : {background:"rgba(248,113,113,0.1)",color:"#f87171",border:"1px solid rgba(248,113,113,0.25)"}}>
                        <span className="w-1.5 h-1.5 rounded-full"
                          style={{background:r.status==="completed"?"#38bdf8":"#f87171"}}/>
                        {r.status==="completed"?"สำเร็จ":"ล้มเหลว"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{background:"rgba(5,7,18,0.7)",borderTop:"1px solid #1c2540"}}>
                  <td colSpan={3} className="px-4 py-3 text-sm font-bold text-white">รวม ({rows.length} รายการ)</td>
                  <td className="px-4 py-3 font-bold whitespace-nowrap" style={{color:"#7dd3fc"}}>฿{fmt(rows.reduce((a,r)=>a+r.revenue,0))}</td>
                  <td className="px-4 py-3 font-bold whitespace-nowrap" style={{color:"#f9a8d4"}}>฿{fmt(rows.reduce((a,r)=>a+r.cost,0))}</td>
                  <td className="px-4 py-3 font-bold whitespace-nowrap" style={{color:"#c4b5fd"}}>฿{fmt(rows.reduce((a,r)=>a+r.vat,0))}</td>
                  <td className="px-4 py-3 font-bold whitespace-nowrap" style={{color:"#a5b4fc"}}>฿{fmt(rows.reduce((a,r)=>a+r.wht,0))}</td>
                  <td className="px-4 py-3 font-bold whitespace-nowrap" style={{color:"#7dd3fc"}}>฿{fmt(rows.reduce((a,r)=>a+r.net,0))}</td>
                  <td/>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
