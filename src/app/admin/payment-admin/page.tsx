"use client";

import { useState, useRef, useEffect } from "react";
import {
  Eye, EyeOff, Check, Bell, Search,
  ChevronDown, Copy, Shield, Activity, TrendingUp,
  TrendingDown, DollarSign, X, Settings, RefreshCw,
} from "lucide-react";

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

const LANG_OPTIONS = [{ code:"th" as const, label:"ภาษาไทย", Flag:FlagTH }, { code:"en" as const, label:"English", Flag:FlagUK }];

function LangDropdown({ lang, setLang }: { lang:"th"|"en"; setLang:(l:"th"|"en")=>void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const cur = LANG_OPTIONS.find(o => o.code === lang)!;
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 px-2 py-1.5 rounded-xl transition hover:bg-white/5"
        style={{ background:"rgba(255,255,255,0.06)", border:"1px solid #1e293b" }}>
        <cur.Flag /><ChevronDown size={11} style={{ color:"#64748b", transition:"transform .18s", transform:open?"rotate(180deg)":"none" }} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1.5 rounded-xl overflow-hidden z-50"
          style={{ background:"#1a2235", border:"1px solid #1e293b", boxShadow:"0 8px 24px rgba(0,0,0,0.5)", minWidth:140 }}>
          {LANG_OPTIONS.map(o => (
            <button key={o.code} onClick={() => { setLang(o.code); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-white/5"
              style={{ borderBottom: o.code==="th"?"1px solid #1e293b":"none" }}>
              <o.Flag /><span className="text-[13px] font-medium" style={{ color:lang===o.code?"#38bdf8":"#e2e8f0" }}>{o.label}</span>
              {lang===o.code && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background:"#38bdf8" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── i18n ──────────────────────────────────────────────
const T = {
  th: {
    pageTitle:"Payment Gateway",
    pageSubtitle:"จัดการช่องทางการชำระเงินและตรวจสอบ Log ล่าสุด",
    systemOnline:"ระบบออนไลน์", adminLabel:"แอดมิน", searchPh:"ค้นหาออเดอร์, การชำระเงิน...",
    statToday:"ยอดรวมวันนี้",
    statSuccess:"สำเร็จ (SUCCESS RATE)",
    statPayout:"ยอดเงินรอโอนออก",
    statYesterday:"↑ 12% จากเมื่อวาน",
    statAvg:"จากทั้งหมด 1,240 รายการ",
    statUntil:"ถัดถอนได้ใน 00:00 น.",
    fee:"FEE", statusActive:"Active", statusInactive:"ปิด",
    transactions:"ธุรกรรม",
    webhookSettings:"Webhook Settings",
    callbackUrl:"CALLBACK URL", secretKey:"SECRET KEY",
    autoSettle:"Auto-Settle",
    autoSettleDesc:"โอนเงินอัตโนมัติเมื่อครบกำหนด (วันที่ 1+1)",
    updateAPI:"อัปเดตตั้งค่า API",
    paymentLogs:"Payment Logs", viewAll:"View All Logs",
    colOrder:"ORDER / ID", colMethod:"METHOD", colAmount:"AMOUNT",
    colRef:"REF ID / BANK", colStatus:"STATUS", colTime:"TIME",
    warning:"ข้อควรระวัง", savedMsg:"บันทึกแล้ว",
    // Modal
    configurePrefix:"ตั้งค่า",
    modalSubtitle:"CONFIGURE PAYMENT PARAMETERS AND RULES",
    sec1:"1. ข้อมูลการเชื่อมต่อ (CREDENTIALS)",
    sec2:"2. ค่าธรรมเนียมและภาษี (FEE & TAX)",
    sec3:"3. ข้อจำกัด (LIMITS & TIMING)",
    sec4:"4. การแสดงผลหน้าบ้าน (CHECKOUT UI)",
    // PromptPay fields
    ppAccountId:"ACCOUNT ID (โทรโทร/เลขบัตร/MERCHANT ID)",
    ppAccountName:"ACCOUNT NAME (ชื่อที่แสดงในแอป)",
    // TrueMoney fields
    tmMerchantId:"MERCHANT ID / PARTNER ID",
    tmApiSecret:"API SECRET KEY",
    modeSwitch:"โหมดการใช้งาน (Mode Switch)",
    modeSwitchDesc:'เลือก "Live" เมื่อพร้อมรับเงินจริง',
    sandbox:"SANDBOX", live:"LIVE",
    feePayer:"ผู้รับภาระค่าธรรมเนียม",
    fixedFee:"FIXED FEE (บาท)",
    vatLabel:"คำนวณ VAT 7%",
    feeAbsorb:"ร้านค้าจ่ายเอง (Absorb)",
    minAmount:"ยอดขั้นต่ำ (MIN)", maxAmount:"ยอดสูงสุด (MAX)",
    qrExpiry:"อายุ QR (นาที)", dailyLimit:"จำกัดต่อวัน",
    displayName:"ชื่อช่องทางที่ถูกตั้งค่าให้",
    description:"คำแนะนำสั้นๆ (DESCRIPTION)",
    successMsg:"ข้อความเมื่อจ่ายสำเร็จ",
    cancel:"ยกเลิก", saveSettings:"บันทึกการตั้งค่า",
  },
  en: {
    pageTitle:"Payment Gateway",
    pageSubtitle:"Manage payment channels and monitor latest logs",
    systemOnline:"System Online", adminLabel:"Admin", searchPh:"Search orders, payments...",
    statToday:"Today's Total",
    statSuccess:"Success (SUCCESS RATE)",
    statPayout:"Pending Payout",
    statYesterday:"↑ 12% vs yesterday",
    statAvg:"avg 1,240 transactions",
    statUntil:"Withdraw available at 00:00",
    fee:"FEE", statusActive:"Active", statusInactive:"Inactive",
    transactions:"transactions",
    webhookSettings:"Webhook Settings",
    callbackUrl:"CALLBACK URL", secretKey:"SECRET KEY",
    autoSettle:"Auto-Settle",
    autoSettleDesc:"Auto-transfer when due (day 1+1)",
    updateAPI:"Update API Settings",
    paymentLogs:"Payment Logs", viewAll:"View All Logs",
    colOrder:"ORDER / ID", colMethod:"METHOD", colAmount:"AMOUNT",
    colRef:"REF ID / BANK", colStatus:"STATUS", colTime:"TIME",
    warning:"Notice", savedMsg:"Saved!",
    configurePrefix:"Configure",
    modalSubtitle:"CONFIGURE PAYMENT PARAMETERS AND RULES",
    sec1:"1. Credentials",
    sec2:"2. Fee & Tax",
    sec3:"3. Limits & Timing",
    sec4:"4. Checkout UI",
    ppAccountId:"ACCOUNT ID (Phone/Card/MERCHANT ID)",
    ppAccountName:"ACCOUNT NAME (Display name in app)",
    tmMerchantId:"MERCHANT ID / PARTNER ID",
    tmApiSecret:"API SECRET KEY",
    modeSwitch:"Mode Switch",
    modeSwitchDesc:'Select "Live" when ready for real payments',
    sandbox:"SANDBOX", live:"LIVE",
    feePayer:"Fee Payer",
    fixedFee:"FIXED FEE (THB)",
    vatLabel:"Include VAT 7%",
    feeAbsorb:"Merchant Absorbs (Absorb)",
    minAmount:"Min Amount", maxAmount:"Max Amount",
    qrExpiry:"QR Expiry (min)", dailyLimit:"Daily Limit",
    displayName:"Payment channel display name",
    description:"Short description (DESCRIPTION)",
    successMsg:"Success message",
    cancel:"Cancel", saveSettings:"Save Settings",
  },
};

// ── Types ─────────────────────────────────────────────
type PayStatus = "SUCCESS"|"FAILED"|"PENDING";

interface PayMethod {
  id: "promptpay"|"truemoney";
  nameTH: string; nameEN: string;
  icon: string; color: string; bg: string;
  enabled: boolean; fee: string; txCount: number;
  subTitleTH: string; subTitleEN: string;
  // promptpay only
  accountId: string; accountName: string;
  // truemoney only
  merchantId: string; apiKey: string;
  // shared
  isLive: boolean;
  fixedFee: string; vatIncluded: boolean;
  minAmt: string; maxAmt: string; qrExpiry: string; dailyLimit: string;
  displayNameTH: string; displayNameEN: string;
}

const INIT_METHODS: PayMethod[] = [
  {
    id:"promptpay", nameTH:"PromptPay", nameEN:"PromptPay",
    icon:"⊞", color:"#34d399", bg:"rgba(52,211,153,0.1)",
    enabled:true, fee:"0.5%", txCount:247,
    subTitleTH:"สแกน QR Code ทุกธนาคาร", subTitleEN:"Scan QR Code via any bank",
    accountId:"081-234-5678", accountName:"บริษัท ซอยดี จำกัด",
    merchantId:"", apiKey:"",
    isLive:true, fixedFee:"0.00", vatIncluded:true,
    minAmt:"20.00", maxAmt:"50000.00", qrExpiry:"15", dailyLimit:"ไม่จำกัด",
    displayNameTH:"สแกนจ่ายผ่านแอปธนาคาร (PromptPay)", displayNameEN:"Scan via Banking App (PromptPay)",
  },
  {
    id:"truemoney", nameTH:"TrueMoney Wallet", nameEN:"TrueMoney Wallet",
    icon:"🟠", color:"#f59e0b", bg:"rgba(245,158,11,0.1)",
    enabled:true, fee:"1.5%", txCount:892,
    subTitleTH:"จ่ายผ่านบัญชีที่ผูกไว้ในแอปทรู", subTitleEN:"Pay via TrueMoney Wallet app",
    accountId:"", accountName:"",
    merchantId:"TMN-882299", apiKey:"tm_sec_•••••••••••••••",
    isLive:true, fixedFee:"0.00", vatIncluded:true,
    minAmt:"20.00", maxAmt:"50000.00", qrExpiry:"15", dailyLimit:"ไม่จำกัด",
    displayNameTH:"จ่ายผ่าน TrueMoney Wallet", displayNameEN:"Pay via TrueMoney Wallet",
  },
];

const LOGS = [
  { orderId:"PAY-9821", subId:"ORD-44210", method:"PromptPay", methodIcon:"⊞", amount:8350,  ref:"77182x99a", bank:"KBANK",  status:"SUCCESS" as PayStatus, time:"14:32:10" },
  { orderId:"PAY-9820", subId:"ORD-44209", method:"TrueMoney", methodIcon:"🟠", amount:81200, ref:"tr_9218aa", bank:"WALLET", status:"FAILED"  as PayStatus, time:"14:28:45" },
  { orderId:"PAY-9819", subId:"ORD-44208", method:"PromptPay", methodIcon:"⊞", amount:350,   ref:"88ab2011c", bank:"SCB",    status:"SUCCESS" as PayStatus, time:"14:15:02" },

  { orderId:"PAY-9817", subId:"ORD-44206", method:"PromptPay", methodIcon:"⊞", amount:2500,  ref:"55cc12def", bank:"KTB",    status:"SUCCESS" as PayStatus, time:"13:44:18" },
];

const ST: Record<PayStatus,{color:string;bg:string;border:string}> = {
  SUCCESS: { color:"#34d399", bg:"rgba(52,211,153,0.12)",  border:"rgba(52,211,153,0.3)"  },
  FAILED:  { color:"#f87171", bg:"rgba(248,113,113,0.12)", border:"rgba(248,113,113,0.3)" },
  PENDING: { color:"#fbbf24", bg:"rgba(251,191,36,0.12)",  border:"rgba(251,191,36,0.3)"  },
};

// ── Toggle ────────────────────────────────────────────
function Toggle({ on, onChange, color="#34d399" }: { on:boolean; onChange:()=>void; color?:string }) {
  return (
    <button onClick={onChange} className="relative flex-shrink-0" style={{ width:40, height:22 }}>
      <div className="absolute inset-0 rounded-full transition-all duration-200"
        style={{ background: on?color:"rgba(100,116,139,0.3)", border:`1px solid ${on?color:"#3a4a6a"}` }} />
      <div className="absolute top-0.5 rounded-full transition-all duration-200"
        style={{ width:18, height:18, left:on?20:2, background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }} />
    </button>
  );
}

function CopyBtn({ value }: { value:string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(()=>setCopied(false),1500); }}
      className="p-1.5 rounded-lg hover:bg-white/10 transition flex-shrink-0"
      style={{ color:copied?"#34d399":"#64748b" }}>
      {copied ? <Check size={13}/> : <Copy size={13}/>}
    </button>
  );
}

// ── Settings Modal ────────────────────────────────────
function SettingsModal({ method, onClose, onSave, t, lang }: {
  method:PayMethod; onClose:()=>void; onSave:(m:PayMethod)=>void; t:typeof T["th"]; lang:"th"|"en";
}) {
  const [draft, setDraft] = useState({...method});
  const [showKey, setShowKey] = useState(false);
  const isPromptpay = draft.id === "promptpay";

  const inp: React.CSSProperties = {
    background:"#f8f9fa", border:"1px solid #e5e7eb", borderRadius:8,
    padding:"8px 12px", fontSize:13, color:"#111827", width:"100%", outline:"none",
  };
  const lbl: React.CSSProperties = {
    fontSize:10, fontWeight:700, color:"#6b7280", letterSpacing:"0.08em",
    textTransform:"uppercase", display:"block", marginBottom:4,
  };

  const secTitle = (txt:string, color="#38bdf8") => (
    <p className="text-sm font-bold mb-3" style={{ color }}>{txt}</p>
  );
  const divider = <div style={{ borderBottom:"1px solid #f3f4f6", marginBottom:20, paddingBottom:4 }} />;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background:"rgba(0,0,0,0.6)" }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{ background:"#fff", boxShadow:"0 24px 64px rgba(0,0,0,0.4)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white z-10"
          style={{ borderBottom:"1px solid #f3f4f6" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background:draft.bg }}>
              {isPromptpay
                ? <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                    <rect x="2" y="2" width="9" height="9" rx="1.5" stroke="#34d399" strokeWidth="2"/>
                    <rect x="4" y="4" width="5" height="5" rx="0.5" fill="#34d399"/>
                    <rect x="13" y="2" width="9" height="9" rx="1.5" stroke="#34d399" strokeWidth="2"/>
                    <rect x="15" y="4" width="5" height="5" rx="0.5" fill="#34d399"/>
                    <rect x="2" y="13" width="9" height="9" rx="1.5" stroke="#34d399" strokeWidth="2"/>
                    <rect x="4" y="15" width="5" height="5" rx="0.5" fill="#34d399"/>
                    <rect x="13" y="13" width="3" height="3" rx="0.5" fill="#34d399"/>
                    <rect x="18" y="13" width="3" height="3" rx="0.5" fill="#34d399"/>
                    <rect x="13" y="18" width="3" height="3" rx="0.5" fill="#34d399"/>
                    <rect x="18" y="18" width="3" height="3" rx="0.5" fill="#34d399"/>
                  </svg>
                : <span style={{fontSize:20}}>🟠</span>
              }
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color:"#111827" }}>
                {t.configurePrefix} {lang==="th"?draft.nameTH:draft.nameEN}
              </p>
              <p className="text-[10px] font-bold tracking-widest mt-0.5" style={{ color:"#9ca3af" }}>{t.modalSubtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color:"#9ca3af" }}><X size={18}/></button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* 1. Credentials */}
          <div>
            {secTitle(t.sec1)}
            {isPromptpay ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label style={lbl}>{t.ppAccountId}</label>
                  <input style={inp} value={draft.accountId} onChange={e=>setDraft(p=>({...p,accountId:e.target.value}))} />
                </div>
                <div>
                  <label style={lbl}>{t.ppAccountName}</label>
                  <input style={inp} value={draft.accountName} onChange={e=>setDraft(p=>({...p,accountName:e.target.value}))} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label style={lbl}>{t.tmMerchantId}</label>
                  <input style={inp} value={draft.merchantId} onChange={e=>setDraft(p=>({...p,merchantId:e.target.value}))} />
                </div>
                <div>
                  <label style={lbl}>{t.tmApiSecret}</label>
                  <div style={{ position:"relative" }}>
                    <input type={showKey?"text":"password"} style={{ ...inp, paddingRight:36 }}
                      value={draft.apiKey} onChange={e=>setDraft(p=>({...p,apiKey:e.target.value}))} />
                    <button onClick={()=>setShowKey(v=>!v)}
                      style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9ca3af" }}>
                      {showKey ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-xl p-3 flex items-center justify-between"
              style={{ border:"1px solid #e5e7eb", background:"#f9fafb" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color:"#111827" }}>{t.modeSwitch}</p>
                <p className="text-xs mt-0.5" style={{ color:"#9ca3af" }}>{t.modeSwitchDesc}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-bold" style={{ color:draft.isLive?"#9ca3af":"#374151" }}>{t.sandbox}</span>
                <Toggle on={draft.isLive} onChange={()=>setDraft(p=>({...p,isLive:!p.isLive}))} color="#34d399"/>
                <span className="text-xs font-bold" style={{ color:draft.isLive?"#34d399":"#9ca3af" }}>{t.live}</span>
              </div>
            </div>
          </div>
          {divider}

          {/* 2. Fee & Tax */}
          <div>
            {secTitle(t.sec2, "#f59e0b")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label style={lbl}>{t.feePayer}</label>
                {/* Plain text box — no dropdown */}
                <div style={{ ...inp, color:"#374151", fontSize:13 }}>{t.feeAbsorb}</div>
              </div>
              <div>
                <label style={lbl}>{t.fixedFee}</label>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <input type="number" style={{ ...inp, flex:1 }} value={draft.fixedFee}
                    onChange={e=>setDraft(p=>({...p,fixedFee:e.target.value}))} />
                  <label style={{ display:"flex", alignItems:"center", gap:5, cursor:"pointer", whiteSpace:"nowrap", fontSize:12, color:"#374151" }}>
                    <input type="checkbox" checked={draft.vatIncluded}
                      onChange={e=>setDraft(p=>({...p,vatIncluded:e.target.checked}))}
                      style={{ accentColor:"#38bdf8", width:15, height:15 }} />
                    {t.vatLabel}
                  </label>
                </div>
              </div>
            </div>
          </div>
          {divider}

          {/* 3. Limits */}
          <div>
            {secTitle(t.sec3, "#f59e0b")}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label style={lbl}>{t.minAmount}</label>
                <input style={inp} value={draft.minAmt} onChange={e=>setDraft(p=>({...p,minAmt:e.target.value}))}/>
              </div>
              <div>
                <label style={lbl}>{t.maxAmount}</label>
                <input style={inp} value={draft.maxAmt} onChange={e=>setDraft(p=>({...p,maxAmt:e.target.value}))}/>
              </div>
              <div>
                <label style={lbl}>{t.qrExpiry}</label>
                <input style={inp} value={draft.qrExpiry} onChange={e=>setDraft(p=>({...p,qrExpiry:e.target.value}))}/>
              </div>
              <div>
                <label style={lbl}>{t.dailyLimit}</label>
                <input style={inp} value={draft.dailyLimit} onChange={e=>setDraft(p=>({...p,dailyLimit:e.target.value}))}/>
              </div>
            </div>
          </div>
          {divider}

          {/* 4. Checkout UI */}
          <div>
            {secTitle(t.sec4, "#a78bfa")}
            <div className="mb-3">
              <label style={lbl}>{t.displayName}</label>
              <input style={inp}
                value={lang==="th"?draft.displayNameTH:draft.displayNameEN}
                onChange={e=>setDraft(p=>lang==="th"?{...p,displayNameTH:e.target.value}:{...p,displayNameEN:e.target.value})} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label style={lbl}>{t.description}</label>
                <textarea rows={2} style={{ ...inp, resize:"none" }} placeholder={t.description}/>
              </div>
              <div>
                <label style={lbl}>{t.successMsg}</label>
                <textarea rows={2} style={{ ...inp, resize:"none" }} placeholder={t.successMsg}/>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 sticky bottom-0 bg-white" style={{ borderTop:"1px solid #f3f4f6" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition hover:bg-gray-50"
            style={{ border:"1px solid #e5e7eb", color:"#6b7280" }}>{t.cancel}</button>
          <button onClick={()=>{onSave(draft);onClose();}}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
            style={{ background:"#111827", color:"#fff" }}>
            <Settings size={14}/>{t.saveSettings}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── QR Icon (PromptPay card) ──────────────────────────
function QRIcon({ color="#34d399" }: { color?:string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <rect x="2" y="2" width="9" height="9" rx="1.5" stroke={color} strokeWidth="2"/>
      <rect x="4" y="4" width="5" height="5" rx="0.5" fill={color}/>
      <rect x="13" y="2" width="9" height="9" rx="1.5" stroke={color} strokeWidth="2"/>
      <rect x="15" y="4" width="5" height="5" rx="0.5" fill={color}/>
      <rect x="2" y="13" width="9" height="9" rx="1.5" stroke={color} strokeWidth="2"/>
      <rect x="4" y="15" width="5" height="5" rx="0.5" fill={color}/>
      <rect x="13" y="13" width="3" height="3" rx="0.5" fill={color}/>
      <rect x="18" y="13" width="3" height="3" rx="0.5" fill={color}/>
      <rect x="13" y="18" width="3" height="3" rx="0.5" fill={color}/>
      <rect x="18" y="18" width="3" height="3" rx="0.5" fill={color}/>
    </svg>
  );
}

// ══════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════
export default function PaymentGatewayPage() {
  const [lang, setLang] = useState<"th"|"en">("th");
  const [methods, setMethods] = useState(INIT_METHODS);
  const [editMethod, setEditMethod] = useState<PayMethod|null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [autoSettle, setAutoSettle] = useState(false);
  const [saved, setSaved] = useState(false);

  const t = T[lang];
  const card = { background:"rgba(11,15,32,0.9)", border:"1px solid #1c2540" };

  const warnings = lang==="th"
    ? [
        "การแก้ไข Webhook อาจทำให้การชำระเงินไม่สมบูรณ์",
        "ค่าธรรมเนียม TrueMoney รวมภาษีมูลค่าเพิ่มแล้ว",
        "หากมีรายการคืนเงิน (Refund) โปรดตรวจสอบใน Log",
      ]
    : [
        "Editing Webhook may cause incomplete payments",
        "TrueMoney fee already includes VAT",
        "For refunds, please verify in Log",
      ];

  return (
    <div className="flex flex-col min-h-full"
      style={{ background:"linear-gradient(160deg,#080c18 0%,#0a0e1e 60%,#060911 100%)", fontFamily:"'Noto Sans Thai','Inter',sans-serif" }}>

      {editMethod && (
        <SettingsModal
          method={editMethod}
          onClose={()=>setEditMethod(null)}
          onSave={m=>setMethods(p=>p.map(x=>x.id===m.id?m:x))}
          t={t} lang={lang}
        />
      )}

      {/* ── TOPBAR ── */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 flex-shrink-0"
        style={{ background:"#111827", borderBottom:"1px solid #1e293b", minHeight:52 }}>
        <div className="flex items-center gap-2 flex-1 min-w-0 max-w-sm rounded-xl px-3 py-2"
          style={{ background:"rgba(255,255,255,0.05)", border:"1px solid #1e293b" }}>
          <Search size={13} style={{ color:"#64748b", flexShrink:0 }}/>
          <input placeholder={t.searchPh} className="bg-transparent outline-none text-xs text-white placeholder-[#3a4a6a] w-full min-w-0"/>
        </div>
        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background:"#fff", color:"#0f172a" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>{t.systemOnline}
          </div>
          <LangDropdown lang={lang} setLang={setLang}/>
          <button className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5"
            style={{ border:"1px solid #1e293b" }}>
            <Bell size={15} style={{ color:"#94a3b8" }}/>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500"/>
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background:"linear-gradient(135deg,#38bdf8,#818cf8)" }}>
            <span className="text-white text-xs font-bold">A</span>
          </button>
          <span className="text-sm font-semibold text-white hidden md:block">{t.adminLabel}</span>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 p-4 sm:p-5 space-y-4">

        {/* Page title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t.pageTitle}</h1>
          <p className="text-xs mt-0.5" style={{ color:"#64748b" }}>{t.pageSubtitle}</p>
        </div>

        {/* 3 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label:t.statToday,   value:"฿ 45,200.00", sub:t.statYesterday, Icon:DollarSign,   color:"#38bdf8", accent:"rgba(56,189,248,0.1)" },
            { label:t.statSuccess, value:"98.5%",        sub:t.statAvg,       Icon:TrendingUp,   color:"#34d399", accent:"rgba(52,211,153,0.1)" },
            { label:t.statPayout,  value:"฿ 12,850.50", sub:t.statUntil,     Icon:TrendingDown, color:"#f59e0b", accent:"rgba(245,158,11,0.1)" },
          ].map((s,i) => (
            <div key={i} className="rounded-2xl p-4 sm:p-5" style={card}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold" style={{ color:"#64748b" }}>{s.label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:s.accent }}>
                  <s.Icon size={15} style={{ color:s.color }}/>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-white mb-1">{s.value}</p>
              <p className="text-[11px]" style={{ color:"#64748b" }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left: 2 payment cards + logs */}
          <div className="lg:col-span-2 space-y-4">

            {/* 2 Payment cards side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {methods.map(m => (
                <div key={m.id} className="rounded-2xl p-4" style={card}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background:m.bg, border:`1px solid ${m.color}30` }}>
                        {m.id==="promptpay"
                          ? <QRIcon color={m.color}/>
                          : <span style={{fontSize:20}}>🟠</span>
                        }
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{lang==="th"?m.nameTH:m.nameEN}</p>
                        <p className="text-[11px] mt-0.5" style={{ color:"#64748b" }}>
                          {lang==="th"?m.subTitleTH:m.subTitleEN}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={()=>setEditMethod(m)} className="p-1.5 rounded-lg hover:bg-white/10 transition" style={{ color:"#64748b" }}>
                        <Settings size={14}/>
                      </button>
                      <Toggle on={m.enabled} color={m.color}
                        onChange={()=>setMethods(p=>p.map(x=>x.id===m.id?{...x,enabled:!x.enabled}:x))}/>
                    </div>
                  </div>
                  <div style={{ borderTop:"1px solid #1c2540", margin:"0 0 10px" }}/>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color:"#3a4a6a" }}>{t.fee}</p>
                      <p className="text-sm font-bold text-white">{m.fee}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={m.enabled
                        ? { background:"rgba(52,211,153,0.12)", color:"#34d399", border:"1px solid rgba(52,211,153,0.3)" }
                        : { background:"rgba(100,116,139,0.12)", color:"#64748b", border:"1px solid #1c2540" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background:m.enabled?"#34d399":"#64748b" }}/>
                      {m.enabled ? t.statusActive : t.statusInactive}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Logs table */}
            <div className="rounded-2xl overflow-hidden" style={card}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom:"1px solid #1c2540" }}>
                <div className="flex items-center gap-2">
                  <Activity size={14} style={{ color:"#38bdf8" }}/>
                  <p className="text-sm font-bold text-white">{t.paymentLogs}</p>
                </div>
                <button className="text-xs font-semibold" style={{ color:"#38bdf8" }}>{t.viewAll}</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ minWidth:520 }}>
                  <thead>
                    <tr style={{ background:"rgba(5,7,18,0.7)", borderBottom:"1px solid #1c2540" }}>
                      {[t.colOrder, t.colMethod, t.colAmount, t.colRef, t.colStatus, t.colTime].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left font-bold tracking-wide" style={{ color:"#3a4a6a" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {LOGS.map((log,i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition" style={{ borderBottom:"1px solid #0a0f1e" }}>
                        <td className="px-3 py-2.5">
                          <p className="font-bold text-white">{log.orderId}</p>
                          <p className="text-[10px] font-mono mt-0.5" style={{ color:"#3a4a6a" }}>{log.subId}</p>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span style={{fontSize:14}}>{log.methodIcon}</span>
                            <span className="font-semibold text-white">{log.method}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-bold text-white">฿{log.amount.toLocaleString()}</td>
                        <td className="px-3 py-2.5">
                          <p className="font-mono text-white">{log.ref}</p>
                          <p className="text-[10px] mt-0.5" style={{ color:"#64748b" }}>{log.bank}</p>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background:ST[log.status].bg, color:ST[log.status].color, border:`1px solid ${ST[log.status].border}` }}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-mono" style={{ color:"#94a3b8" }}>{log.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Webhook + Warnings */}
          <div className="space-y-3">
            <div className="rounded-2xl p-4" style={card}>
              <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom:"1px solid #1c2540" }}>
                <Shield size={14} style={{ color:"#a78bfa" }}/>
                <p className="text-sm font-bold text-white">{t.webhookSettings}</p>
              </div>

              {/* Callback URL */}
              <div className="mb-3">
                <label className="block text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color:"#64748b" }}>{t.callbackUrl}</label>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #1c2540" }}>
                  <input defaultValue="https://api.cyberpay.com/v1/webhook" readOnly
                    className="flex-1 bg-transparent outline-none text-[11px] font-mono min-w-0 truncate" style={{ color:"#94a3b8" }}/>
                  <CopyBtn value="https://api.cyberpay.com/v1/webhook"/>
                </div>
              </div>

              {/* Secret Key */}
              <div className="mb-4">
                <label className="block text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color:"#64748b" }}>{t.secretKey}</label>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #1c2540" }}>
                  <input type={showSecret?"text":"password"} defaultValue="wh_sec_AbC123XyZ789MnO" readOnly
                    className="flex-1 bg-transparent outline-none text-[11px] font-mono min-w-0" style={{ color:"#94a3b8" }}/>
                  <button onClick={()=>setShowSecret(v=>!v)} className="p-1.5 rounded-lg hover:bg-white/10 transition" style={{ color:"#64748b" }}>
                    {showSecret ? <EyeOff size={13}/> : <Eye size={13}/>}
                  </button>
                  <CopyBtn value="wh_sec_AbC123XyZ789MnO"/>
                </div>
              </div>

              {/* Auto-Settle */}
              <div className="flex items-center justify-between rounded-xl px-3 py-2.5 mb-4"
                style={{ background:"rgba(255,255,255,0.03)", border:"1px solid #1c2540" }}>
                <div className="min-w-0 mr-3">
                  <p className="text-xs font-semibold text-white">{t.autoSettle}</p>
                  <p className="text-[10px] mt-0.5" style={{ color:"#64748b" }}>{t.autoSettleDesc}</p>
                </div>
                <Toggle on={autoSettle} onChange={()=>setAutoSettle(v=>!v)} color="#38bdf8"/>
              </div>

              {/* Update Button */}
              <button
                onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition"
                style={saved
                  ? { background:"rgba(52,211,153,0.15)", color:"#34d399", border:"1px solid rgba(52,211,153,0.35)" }
                  : { background:"#111827", color:"#fff", border:"1px solid #334155" }}>
                {saved ? <><Check size={14}/>{t.savedMsg}</> : <><Settings size={14}/>{t.updateAPI}</>}
              </button>
            </div>

            {/* Warnings */}
            <div className="rounded-2xl p-4" style={{ background:"rgba(52,211,153,0.05)", border:"1px solid rgba(52,211,153,0.2)" }}>
              <p className="text-xs font-bold mb-3" style={{ color:"#34d399" }}>⚠ {t.warning}</p>
              <ul className="space-y-2">
                {warnings.map((w,i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px]" style={{ color:"#94a3b8" }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background:"#34d399" }}/>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}