"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search, ChevronDown, Send, Check, MessageSquare,
  AlertCircle, Clock, CheckCircle2, X, FileText,
  CreditCard, Gamepad2, Image as ImageIcon, Bell, ArrowLeft,
} from "lucide-react";

// ── SVG Flags ─────────────────────────────────────────────────────
function FlagTH() {
  return <svg viewBox="0 0 30 20" width="28" height="18" style={{ borderRadius: 3, display: "block" }}>
    <rect width="30" height="20" fill="#A51931" /><rect y="3.33" width="30" height="13.34" fill="#F4F5F8" /><rect y="6.67" width="30" height="6.66" fill="#2D2A4A" />
  </svg>;
}
function FlagUK() {
  return <svg viewBox="0 0 60 40" width="28" height="18" style={{ borderRadius: 3, display: "block" }}>
    <rect width="60" height="40" fill="#012169" />
    <line x1="0" y1="0" x2="60" y2="40" stroke="white" strokeWidth="8" /><line x1="60" y1="0" x2="0" y2="40" stroke="white" strokeWidth="8" />
    <line x1="0" y1="0" x2="60" y2="40" stroke="#C8102E" strokeWidth="4.8" /><line x1="60" y1="0" x2="0" y2="40" stroke="#C8102E" strokeWidth="4.8" />
    <rect x="24" y="0" width="12" height="40" fill="white" /><rect x="0" y="14" width="60" height="12" fill="white" />
    <rect x="26" y="0" width="8" height="40" fill="#C8102E" /><rect x="0" y="16" width="60" height="8" fill="#C8102E" />
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
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 px-2 py-1.5 rounded-xl transition hover:bg-white/5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid #1e293b" }}>
        <cur.Flag /><ChevronDown size={11} style={{ color: "#64748b", transition: "transform .18s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1.5 rounded-xl overflow-hidden z-[60]" style={{ background: "#1a2235", border: "1px solid #1e293b", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", minWidth: 140 }}>
          {LANG_OPTIONS.map(o => (
            <button key={o.code} onClick={() => { setLang(o.code); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-white/5" style={{ borderBottom: o.code === "th" ? "1px solid #1e293b" : "none" }}>
              <o.Flag /><span className="text-[13px] font-medium" style={{ color: lang === o.code ? "#38bdf8" : "#e2e8f0" }}>{o.label}</span>
              {lang === o.code && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#38bdf8" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── i18n ──────────────────────────────────────────────────────────
const T = {
  th: {
    pageTitle:"Customer Support", pageSubOpen:(n:number)=>`มี ${n} ticket ที่รอการดูแล`,
    openCard:"Ticket ที่เปิดอยู่", pendingCard:"Ticket ที่รอดำเนินการ", resolvedCard:"Ticket ที่แก้ไขแล้ว",
    searchPh:"ค้นหา ticket...", allStatus:"ทุกสถานะ", open:"เปิดอยู่", pending:"รอดำเนินการ", resolved:"แก้ไขแล้ว",
    noTicket:"ไม่มี ticket ที่ตรงเงื่อนไข", selectTicket:"เลือก ticket เพื่อดูรายละเอียด",
    customerMsg:"ข้อความจากลูกค้า:", reply:"ตอบกลับ", replyPh:"พิมพ์ข้อความตอบกลับ...",
    sendReply:"ส่งข้อความ", resolve:"ปิด Ticket", resolved2:"✓ ปิดแล้ว",
    orderTitle:"รายละเอียด Order", txStatus:"สถานะธุรกรรม", paymentMethod:"วิธีชำระเงิน",
    gameDetails:"รายละเอียดเกม", financials:"การเงิน", gameName:"ชื่อเกม:", package2:"แพ็กเกจ:",
    uid:"Player ID (UID):", server:"เซิร์ฟเวอร์:", totalAmount:"ยอดรวม:", costPrice:"ต้นทุน:",
    adminProfit:"กำไรแอดมิน:", images:"รูปภาพทั้งหมด", noImages:"ไม่มีรูปภาพที่แนบ",
    systemOnline:"System Online", adminLabel:"แอดมิน", createdOn:"สร้างเมื่อ",
    backToList:"กลับไปรายการ",
  },
  en: {
    pageTitle:"Customer Support", pageSubOpen:(n:number)=>`${n} open ticket${n!==1?"s":""} need attention`,
    openCard:"Open Tickets", pendingCard:"Pending Tickets", resolvedCard:"Resolved Tickets",
    searchPh:"Search tickets...", allStatus:"All Status", open:"Open", pending:"Pending", resolved:"Resolved",
    noTicket:"No tickets match the filter", selectTicket:"Select a ticket to view details",
    customerMsg:"Customer message:", reply:"Reply", replyPh:"Type your reply...",
    sendReply:"Send Reply", resolve:"Resolve", resolved2:"✓ Resolved",
    orderTitle:"Order Details", txStatus:"Transaction Status", paymentMethod:"Payment Method",
    gameDetails:"Game Details", financials:"Financials", gameName:"Game Name:", package2:"Package:",
    uid:"Player ID (UID):", server:"Server:", totalAmount:"Total Amount:", costPrice:"Cost Price:",
    adminProfit:"Admin Profit:", images:"All Images", noImages:"No attached images",
    systemOnline:"System Online", adminLabel:"Admin", createdOn:"Created on",
    backToList:"Back to list",
  },
};

// ── Types & Data ──────────────────────────────────────────────────
type Status = "open"|"pending"|"resolved";
const STATUS_CFG: Record<Status,{color:string;bg:string;border:string}> = {
  open:    {color:"#f87171",bg:"rgba(248,113,113,0.12)",border:"rgba(248,113,113,0.3)"},
  pending: {color:"#fbbf24",bg:"rgba(251,191,36,0.12)", border:"rgba(251,191,36,0.3)"},
  resolved:{color:"#34d399",bg:"rgba(52,211,153,0.12)", border:"rgba(52,211,153,0.3)"},
};

const ALL_TICKETS = [
  {id:"TKT-1001",subjectTH:"ไม่ได้รับ Diamond",          subjectEN:"Diamond not received",      email:"user123@gmail.com", game:"Mobile Legends",status:"open" as Status,    time:"13:45",messageTH:"ผมชำระเงินเรียบร้อยแล้วแต่ยังไม่ได้รับ Diamond เลยครับ สั่งซื้อไปเมื่อ 30 นาทีที่แล้ว",messageEN:"I completed the payment but haven't received my diamonds yet. Order was placed 30 minutes ago."},
  {id:"TKT-1002",subjectTH:"กรอก UID ผิด",               subjectEN:"Wrong UID entered",         email:"player456@gmail.com",game:"Free Fire",     status:"pending" as Status,  time:"12:30",messageTH:"กรอก UID ผิดครับ ขอให้ทางทีมช่วยโอน Diamond ไปยัง UID ที่ถูกต้องให้ด้วยครับ",           messageEN:"I entered the wrong UID. Please help transfer the diamonds to the correct UID."},
  {id:"TKT-1003",subjectTH:"ชำระเงินล้มเหลวแต่ถูกตัดเงิน",subjectEN:"Payment failed but charged",email:"gamer789@gmail.com",game:"PUBG Mobile",  status:"open" as Status,    time:"11:15",messageTH:"ระบบแจ้งว่าชำระเงินล้มเหลวแต่เงินถูกหักจากบัญชีแล้วครับ รบกวนช่วยตรวจสอบด้วยครับ",        messageEN:"The system shows payment failed but money was deducted from my account. Please check."},
  {id:"TKT-1004",subjectTH:"ขอคืนเงิน",                  subjectEN:"Request refund",            email:"pro321@gmail.com",  game:"Genshin Impact",status:"resolved" as Status, time:"16:20",messageTH:"ต้องการขอคืนเงินเนื่องจากกรอกข้อมูลผิดครับ กรุณาพิจารณาด้วยครับ",                        messageEN:"I would like a refund because I entered the wrong information. Please consider my request."},
  {id:"TKT-1005",subjectTH:"หา UID ได้อย่างไร?",          subjectEN:"How to find my UID?",       email:"top654@gmail.com",  game:"Mobile Legends",status:"resolved" as Status, time:"14:10",messageTH:"ไม่ทราบว่าหา UID ในเกมได้จากที่ไหนครับ รบกวนแนะนำด้วยครับ",                              messageEN:"I don't know where to find my UID in the game. Please advise."},
];

const TICKET_ORDERS: Record<string,{orderId:string;createdAt:string;txStatus:"SUCCESS"|"FAILED"|"PENDING";paymentMethod:string;gameName:string;package:string;uid:string;server:string;totalAmount:number;costPrice:number;profit:number;images:string[]}> = {
  "TKT-1001":{orderId:"ORD-7842",createdAt:"2026-03-06 14:32:01",txStatus:"SUCCESS",paymentMethod:"QR PromptPay (KBANK)",gameName:"Mobile Legends",package:"599 Diamonds",uid:"123456789",server:"2541",totalAmount:299,costPrice:254,profit:45,images:[]},
  "TKT-1002":{orderId:"ORD-7801",createdAt:"2026-03-06 12:30:00",txStatus:"FAILED", paymentMethod:"QR PromptPay (SCB)", gameName:"Free Fire",       package:"100 Diamonds",uid:"987654321",server:"TH",  totalAmount:40, costPrice:35, profit:5, images:[]},
  "TKT-1003":{orderId:"ORD-7799",createdAt:"2026-03-06 11:15:00",txStatus:"SUCCESS",paymentMethod:"TrueMoney",           gameName:"PUBG Mobile",     package:"60 UC",        uid:"555000111",server:"Global",totalAmount:25, costPrice:21, profit:4, images:[]},
  "TKT-1004":{orderId:"ORD-7756",createdAt:"2026-03-06 16:20:00",txStatus:"SUCCESS",paymentMethod:"QR PromptPay (KMA)", gameName:"Genshin Impact",  package:"300 Genesis",  uid:"777888999",server:"Asia",  totalAmount:169,costPrice:150,profit:19,images:[]},
  "TKT-1005":{orderId:"ORD-7700",createdAt:"2026-03-06 14:10:00",txStatus:"SUCCESS",paymentMethod:"TrueMoney",           gameName:"Mobile Legends",  package:"172 Diamonds", uid:"112233445",server:"5521",  totalAmount:59, costPrice:52, profit:7, images:[]},
};
const TX_CFG = {
  SUCCESS:{color:"#34d399",bg:"rgba(52,211,153,0.15)", border:"rgba(52,211,153,0.3)"},
  FAILED: {color:"#f87171",bg:"rgba(248,113,113,0.15)",border:"rgba(248,113,113,0.3)"},
  PENDING:{color:"#fbbf24",bg:"rgba(251,191,36,0.15)", border:"rgba(251,191,36,0.3)"},
};

type FilterVal = "all"|Status;

// ── Components ────────────────────────────────────────────────────
function StatusIcon({status}:{status:Status}){
  const c=STATUS_CFG[status].color;
  if(status==="open")    return <AlertCircle  size={14} style={{color:c,flexShrink:0}}/>;
  if(status==="pending") return <Clock        size={14} style={{color:c,flexShrink:0}}/>;
  return                        <CheckCircle2 size={14} style={{color:c,flexShrink:0}}/>;
}

function Badge({status,label}:{status:Status;label:string}){
  const c=STATUS_CFG[status];
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{color:c.color,background:c.bg,border:`1px solid ${c.border}`}}>{label}</span>;
}

function FilterDropdown({value,onChange,t}:{value:FilterVal;onChange:(v:FilterVal)=>void;t:typeof T["th"]}){
  const [open,setOpen]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const OPTIONS=[{key:"all" as FilterVal,label:t.allStatus},{key:"open" as FilterVal,label:t.open},{key:"pending" as FilterVal,label:t.pending},{key:"resolved" as FilterVal,label:t.resolved}];
  const cur=OPTIONS.find(o=>o.key===value)!;
  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button onClick={()=>setOpen(o=>!o)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition" style={{background:"rgba(255,255,255,0.06)",border:"1px solid #2a3550",color:"#e2e8f0",minWidth:120}}>
        <span className="flex-1 text-left">{cur.label}</span>
        <ChevronDown size={12} style={{color:"#64748b",transform:open?"rotate(180deg)":"none",transition:"transform .18s"}}/>
      </button>
      {open&&(
        <div className="absolute top-full left-0 mt-1.5 w-full rounded-xl overflow-hidden z-50" style={{background:"#131929",border:"1px solid #2a3550",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
          {OPTIONS.map(o=>(
            <button key={o.key} onClick={()=>{onChange(o.key);setOpen(false);}} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left transition hover:bg-white/5" style={{color:value===o.key?"#7c3aed":"#e2e8f0"}}>
              {value===o.key?<Check size={12} style={{color:"#7c3aed",flexShrink:0}}/>:<span className="w-3 flex-shrink-0"/>}{o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderModal({ticketId,onClose,t,lang}:{ticketId:string;onClose:()=>void;t:typeof T["th"];lang:"th"|"en"}){
  const order=TICKET_ORDERS[ticketId];
  if(!order)return null;
  const txC=TX_CFG[order.txStatus];
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{background:"rgba(0,0,0,0.8)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl" style={{background:"#0f1729",border:"1px solid #1e293b",boxShadow:"0 24px 64px rgba(0,0,0,0.6)"}}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10" style={{background:"#0f1729",borderBottom:"1px solid #1e293b"}}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"rgba(56,189,248,0.15)",border:"1px solid rgba(56,189,248,0.3)"}}>
              <FileText size={16} style={{color:"#38bdf8"}}/>
            </div>
            <div>
              <p className="text-base font-bold text-white">Order #{order.orderId}</p>
              <p className="text-[11px]" style={{color:"#64748b"}}>{t.createdOn} {order.createdAt}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{color:"#64748b"}}><X size={16}/></button>
        </div>
        {/* TX Status */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 sm:py-5" style={{borderBottom:"1px solid #1e293b",background:"rgba(255,255,255,0.02)"}}>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{color:"#64748b"}}>{t.txStatus}</p>
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{background:txC.bg,color:txC.color,border:`1px solid ${txC.border}`}}>{order.txStatus}</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{color:"#64748b"}}>{t.paymentMethod}</p>
            <p className="text-sm font-semibold text-white">{order.paymentMethod}</p>
          </div>
        </div>
        {/* Game + Financials — stack on mobile, grid on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 px-5 sm:px-8 py-5 sm:py-6" style={{borderBottom:"1px solid #1e293b"}}>
          <div>
            <div className="flex items-center gap-1.5 mb-3"><Gamepad2 size={13} style={{color:"#38bdf8"}}/><p className="text-[11px] font-bold tracking-widest uppercase" style={{color:"#38bdf8"}}>{t.gameDetails}</p></div>
            <div className="space-y-2">
              {[[t.gameName,order.gameName],[t.package2,order.package],[t.uid,order.uid],[t.server,order.server]].map(([label,val])=>(
                <div key={label} className="flex justify-between text-sm gap-3">
                  <span style={{color:"#64748b"}}>{label}</span>
                  <span className="font-semibold text-white text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-3"><CreditCard size={13} style={{color:"#34d399"}}/><p className="text-[11px] font-bold tracking-widest uppercase" style={{color:"#34d399"}}>{t.financials}</p></div>
            <div className="rounded-xl p-4 space-y-3" style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1e293b"}}>
              {[[t.totalAmount,`฿${order.totalAmount.toFixed(2)}`,"#e2e8f0"],[t.costPrice,`฿${order.costPrice.toFixed(2)}`,"#94a3b8"]].map(([label,val,color])=>(
                <div key={label} className="flex justify-between text-xs">
                  <span style={{color:"#64748b"}}>{label}</span>
                  <span className="font-semibold" style={{color}}>{val}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2" style={{borderTop:"1px solid #1e293b"}}>
                <span className="font-bold tracking-wide uppercase text-[10px]" style={{color:"#34d399"}}>{t.adminProfit}</span>
                <span className="text-xl font-bold" style={{color:"#34d399"}}>฿{order.profit.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Images */}
        <div className="px-5 sm:px-8 py-5">
          <div className="flex items-center gap-1.5 mb-3"><ImageIcon size={13} style={{color:"#94a3b8"}}/><p className="text-sm font-bold text-white">{t.images}</p></div>
          {order.images.length===0?<p className="text-xs" style={{color:"#3a4a6a"}}>{t.noImages}</p>:
            <div className="grid grid-cols-3 gap-2">{order.images.map((src,i)=><div key={i} className="aspect-square rounded-xl overflow-hidden" style={{background:"#1a2235",border:"1px solid #1e293b"}}><img src={src} alt="" className="w-full h-full object-cover"/></div>)}</div>}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function SupportPage(){
  const [lang,setLang]       = useState<"th"|"en">("th");
  const [filter,setFilter]   = useState<FilterVal>("all");
  const [search,setSearch]   = useState("");
  const [selected,setSelected] = useState<typeof ALL_TICKETS[0]|null>(null);
  const [reply,setReply]     = useState("");
  const [tickets,setTickets] = useState(ALL_TICKETS);
  const [orderModal,setOrderModal] = useState<string|null>(null);
  // Mobile: show list or detail
  const [mobileView,setMobileView] = useState<"list"|"detail">("list");

  const t=T[lang];

  const visible=tickets.filter(tk=>{
    if(filter!=="all"&&tk.status!==filter)return false;
    if(search&&!tk.subjectTH.toLowerCase().includes(search.toLowerCase())&&!tk.subjectEN.toLowerCase().includes(search.toLowerCase())&&!tk.email.includes(search))return false;
    return true;
  });

  const counts={
    open:tickets.filter(tk=>tk.status==="open").length,
    pending:tickets.filter(tk=>tk.status==="pending").length,
    resolved:tickets.filter(tk=>tk.status==="resolved").length,
  };

  const resolve=()=>{
    if(!selected)return;
    setTickets(p=>p.map(tk=>tk.id===selected.id?{...tk,status:"resolved" as Status}:tk));
    setSelected(prev=>prev?{...prev,status:"resolved" as Status}:null);
  };

  const handleSelectTicket=(tk:typeof ALL_TICKETS[0])=>{
    setSelected(tk);
    setMobileView("detail");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{background:"linear-gradient(160deg,#080c18 0%,#0a0e1e 60%,#060911 100%)",fontFamily:"'Noto Sans Thai','Inter',sans-serif"}}>

      {orderModal&&<OrderModal ticketId={orderModal} onClose={()=>setOrderModal(null)} t={t} lang={lang}/>}

      {/* ── TOPBAR ── */}
      <div className="flex items-center gap-2 px-3 md:px-4 py-2.5 flex-shrink-0" style={{background:"#111827",borderBottom:"1px solid #1e293b",minHeight:52}}>
        <div className="flex items-center gap-2 flex-1 min-w-0 rounded-xl px-3 py-2 max-w-xs sm:max-w-sm" style={{background:"rgba(255,255,255,0.05)",border:"1px solid #1e293b"}}>
          <Search size={13} style={{color:"#64748b",flexShrink:0}}/>
          <input placeholder={t.searchPh} value={search} onChange={e=>setSearch(e.target.value)} className="bg-transparent outline-none text-xs text-white placeholder-[#3a4a6a] w-full min-w-0"/>
        </div>
        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{background:"#fff",color:"#0f172a"}}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>{t.systemOnline}
          </div>
          <LangDropdown lang={lang} setLang={setLang}/>
          <button className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5" style={{border:"1px solid #1e293b"}}>
            <Bell size={15} style={{color:"#94a3b8"}}/><span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500"/>
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{background:"linear-gradient(135deg,#38bdf8,#818cf8)"}}>
            <span className="text-white text-xs font-bold">A</span>
          </button>
          <span className="text-sm font-semibold text-white hidden md:block">{t.adminLabel}</span>
        </div>
      </div>

      {/* ── PAGE HEADER ── */}
      <div className="px-4 sm:px-6 pt-4 pb-3 flex-shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-0.5">{t.pageTitle}</h1>
        <p className="text-xs" style={{color:"#64748b"}}>{t.pageSubOpen(counts.open)}</p>
        {/* Summary cards: 3 col always, shrink on mobile */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-4">
          {([
            {key:"open" as const,   label:t.openCard,    num:counts.open,     color:"#f87171"},
            {key:"pending" as const,label:t.pendingCard, num:counts.pending,  color:"#fbbf24"},
            {key:"resolved" as const,label:t.resolvedCard,num:counts.resolved,color:"#34d399"},
          ]).map(c=>(
            <button key={c.key} onClick={()=>setFilter(f=>f===c.key?"all":c.key)}
              className="rounded-xl sm:rounded-2xl py-3 sm:py-5 px-2 sm:px-4 text-center transition hover:opacity-90"
              style={{background:filter===c.key?"rgba(255,255,255,0.07)":"rgba(255,255,255,0.04)",border:filter===c.key?`1px solid ${c.color}40`:"1px solid #1e293b"}}>
              <p className="text-2xl sm:text-3xl font-bold mb-0.5 sm:mb-1" style={{color:c.color}}>{c.num}</p>
              <p className="text-[10px] sm:text-sm font-medium leading-tight" style={{color:"#94a3b8"}}>{c.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden px-3 sm:px-6 pb-3 sm:pb-6 gap-3 sm:gap-4">

        {/* ── LEFT: Ticket List ──
            Mobile: full width, hidden when showing detail
            Desktop lg+: fixed 360px, always visible */}
        <div
          className={`flex-col rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 w-full lg:w-[360px] ${mobileView==="list"?"flex":"hidden"} lg:flex`}
          style={{background:"rgba(11,15,32,0.9)",border:"1px solid #1e293b"}}
        >
          <div className="flex flex-col h-full">
            {/* Search + filter */}
            <div className="flex gap-2 p-3 flex-shrink-0" style={{borderBottom:"1px solid #1e293b"}}>
              <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2" style={{background:"rgba(255,255,255,0.04)",border:"1px solid #1e293b"}}>
                <Search size={13} style={{color:"#64748b",flexShrink:0}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchPh} className="bg-transparent outline-none text-xs text-white placeholder-[#3a4a6a] w-full"/>
              </div>
              <FilterDropdown value={filter} onChange={setFilter} t={t}/>
            </div>
            {/* Rows */}
            <div className="flex-1 overflow-y-auto">
              {visible.length===0?(
                <div className="flex flex-col items-center justify-center h-full gap-2" style={{color:"#3a4a6a"}}>
                  <MessageSquare size={28}/><p className="text-xs">{t.noTicket}</p>
                </div>
              ):visible.map(tk=>(
                <button key={tk.id} onClick={()=>handleSelectTicket(tk)} className="w-full text-left transition"
                  style={{borderBottom:"1px solid #0f1525",background:selected?.id===tk.id?"rgba(124,58,237,0.1)":"transparent",borderLeft:selected?.id===tk.id?"2px solid #7c3aed":"2px solid transparent"}}>
                  <div className="px-4 py-3.5">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5"><StatusIcon status={tk.status}/></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-white leading-tight truncate">{lang==="th"?tk.subjectTH:tk.subjectEN}</p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Badge status={tk.status} label={t[tk.status]}/>
                            <span className="text-[10px]" style={{color:"#3a4a6a"}}>{tk.time}</span>
                          </div>
                        </div>
                        <p className="text-[11px] mt-0.5" style={{color:"#64748b"}}>{tk.email} · {tk.game}</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Detail panel ──
            Mobile: visible only when mobileView==="detail" and something is selected
            Desktop: always visible as flex-1 */}
        <div
          className={`flex-1 min-w-0 rounded-xl sm:rounded-2xl overflow-hidden flex-col ${mobileView==="detail" ? "flex" : "hidden"} lg:flex`}
          style={{background:"rgba(11,15,32,0.9)",border:"1px solid #1e293b"}}
        >
          {!selected?(
            <div className="flex flex-col items-center justify-center h-full gap-3" style={{color:"#3a4a6a"}}>
              <MessageSquare size={36} strokeWidth={1.5}/><p className="text-sm">{t.selectTicket}</p>
            </div>
          ):(
            <div className="flex flex-col h-full overflow-hidden">
              {/* Mobile back button */}
              <div className="lg:hidden px-4 pt-3 flex-shrink-0">
                <button onClick={()=>setMobileView("list")} className="flex items-center gap-1.5 text-xs font-semibold" style={{color:"#38bdf8"}}>
                  <ArrowLeft size={14}/>{t.backToList}
                </button>
              </div>
              {/* Header */}
              <div className="px-4 sm:px-5 py-3 sm:py-4 flex-shrink-0" style={{borderBottom:"1px solid #1e293b"}}>
                <p className="text-xs font-mono mb-1" style={{color:"#64748b"}}>{selected.id}</p>
                <div className="flex items-center gap-2 mb-1.5">
                  <h2 className="text-base sm:text-lg font-bold text-white">{lang==="th"?selected.subjectTH:selected.subjectEN}</h2>
                  <button onClick={()=>setOrderModal(selected.id)} title={t.orderTitle} className="p-1.5 rounded-lg hover:opacity-80 transition flex-shrink-0" style={{color:"#fbbf24",background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.3)"}}>
                    <FileText size={13}/>
                  </button>
                </div>
                <p className="text-xs mb-2.5" style={{color:"#64748b"}}>{selected.email}</p>
                {/* Status + game tag + change status buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge status={selected.status} label={t[selected.status]}/>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full" style={{background:"rgba(99,102,241,0.15)",color:"#a5b4fc",border:"1px solid rgba(129,140,248,0.3)"}}>{selected.game}</span>
                  {(["open","pending","resolved"] as Status[]).map(s=>(
                    <button key={s} className="px-2 py-0.5 rounded-lg text-[10px] font-bold transition" style={selected.status===s?{background:STATUS_CFG[s].bg,color:STATUS_CFG[s].color,border:`1px solid ${STATUS_CFG[s].border}`}:{color:"#64748b",border:"1px solid #1c2540"}}
                      onClick={()=>{setTickets(p=>p.map(tk=>tk.id===selected.id?{...tk,status:s}:tk));setSelected(prev=>prev?{...prev,status:s}:null);}}>
                      {t[s]}
                    </button>
                  ))}
                </div>
              </div>
              {/* Customer message */}
              <div className="px-4 sm:px-5 py-3 sm:py-4 flex-shrink-0" style={{borderBottom:"1px solid #1e293b"}}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{color:"#64748b"}}>{t.customerMsg}</p>
                <p className="text-sm leading-relaxed" style={{color:"#cbd5e1"}}>{lang==="th"?selected.messageTH:selected.messageEN}</p>
              </div>
              {/* Reply */}
              <div className="flex flex-col flex-1 px-4 sm:px-5 py-3 sm:py-4 min-h-0">
                <p className="text-sm font-semibold text-white mb-2">{t.reply}</p>
                <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder={t.replyPh}
                  className="flex-1 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none placeholder-[#3a4a6a]"
                  style={{background:"rgba(255,255,255,0.04)",border:"1px solid #2a3550",minHeight:80}}/>
              </div>
              {/* Buttons */}
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex gap-2 sm:gap-3 flex-shrink-0">
                <button onClick={()=>setReply("")} className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl text-sm font-bold transition hover:opacity-90" style={{background:"linear-gradient(135deg,#38bdf8,#7c3aed)",color:"#fff"}}>
                  <Send size={14}/>{t.sendReply}
                </button>
                <button onClick={resolve} className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-bold transition hover:bg-white/10"
                  style={{color:selected.status==="resolved"?"#34d399":"#94a3b8",border:selected.status==="resolved"?"1px solid rgba(52,211,153,0.4)":"1px solid #2a3550",background:selected.status==="resolved"?"rgba(52,211,153,0.08)":"transparent"}}>
                  {selected.status==="resolved"?t.resolved2:t.resolve}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}