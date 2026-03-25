"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search, ChevronDown, ChevronUp, X, Check,
  Bell, Zap, Edit2, Clock,
  AlertTriangle, ArrowRight, CalendarDays,
} from "lucide-react";

// ══════════════════════════════════════════════════════
// FLAGS & LANG
// ══════════════════════════════════════════════════════
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
const LANG_OPTIONS = [{ code: "th" as const, label: "ภาษาไทย", Flag: FlagTH }, { code: "en" as const, label: "English", Flag: FlagUK }];

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
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 px-2 py-1.5 rounded-xl transition hover:bg-white/5"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid #1e293b" }}>
        <cur.Flag /><ChevronDown size={11} style={{ color: "#64748b", transition: "transform .18s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1.5 rounded-xl overflow-hidden z-50"
          style={{ background: "#1a2235", border: "1px solid #1e293b", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", minWidth: 140 }}>
          {LANG_OPTIONS.map(o => (
            <button key={o.code} onClick={() => { setLang(o.code); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-white/5"
              style={{ borderBottom: o.code === "th" ? "1px solid #1e293b" : "none" }}>
              <o.Flag /><span className="text-[13px] font-medium" style={{ color: lang === o.code ? "#38bdf8" : "#e2e8f0" }}>{o.label}</span>
              {lang === o.code && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#38bdf8" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// i18n
// ══════════════════════════════════════════════════════
const T = {
  th: {
    pageTitle: "Top-Up Packages", pageSubtitle: "จัดการรายการแพ็กเกจและแต้มสะสมทั้งหมดในระบบ",
    searchPh: "ค้นหารายชื่อเกม...", systemOnline: "ระบบออนไลน์", adminLabel: "แอดมิน",
    alertTitle: "ตรวจพบแพ็กเกจใหม่จาก API!!",
    alertDesc: (n: number) => `มี ${n} รายการใหม่ที่ยังไม่ได้ตั้งราคาและแต้มสะสม กรุณาดำเนินการก่อนเปิดใช้งาน`,
    alertBtn: "ไปที่รายการใหม่",
    colGame: "เกม / แพ็กเกจที่ให้บริการ", colStatus: "สถานะ",
    colName: "ชื่อแพ็กเกจ", colPrice: "ราคา (PRICE)", colCost: "ต้นทุน (COST)",
    colProfit: "กำไร (PROFIT)", colPromo: "โปรโมชั่น", colDiamond: "แต้มสะสม (DIAMOND)", colActions: "การจัดการ",
    packages: (n: number) => `${n} รายการแพ็กเกจย่อย`,
    active: "Active", inactive: "ปิด",
    modalTitle: "แก้ไขข้อมูลแพ็กเกจ",
    fieldName: "ชื่อแพ็กเกจ", fieldNameHint: "ชื่อแพ็กเกจและต้นทุนจะแก้เองไม่ได้",
    fieldPrice: "ราคา (PRICE)", fieldCost: "ต้นทุน (COST)",
    fieldDiamond: "แต้มสะสม (DIAMOND)", fieldPromo: "โปรโมชั่น",
    fieldTimer: "เวลาจำกัดในการขาย",
    promoNone: "ไม่มีโปรโมชั่น", promoFlash: "Flash Sale", promoHappy: "Happy Hour",
    cancel: "ยกเลิก", save: "บันทึกข้อมูล",
    calTitle: "ลงวันที่", calSave: "บันทึก", calCancel: "ยกเลิก",
    calStartLabel: "วันที่เริ่มต้นใช้งาน", calDeadlineLabel: "วันครบกำหนด",
    next: "ถัดไป",
  },
  en: {
    pageTitle: "Top-Up Packages", pageSubtitle: "Manage all top-up packages and loyalty points in the system",
    searchPh: "Search game name...", systemOnline: "System Online", adminLabel: "Admin",
    alertTitle: "New packages detected from API!!",
    alertDesc: (n: number) => `${n} new items have no price or points set. Please configure before enabling.`,
    alertBtn: "Go to new items",
    colGame: "Game / Packages Available", colStatus: "Status",
    colName: "Package Name", colPrice: "Price (PRICE)", colCost: "Cost (COST)",
    colProfit: "Profit (PROFIT)", colPromo: "Promotion", colDiamond: "Points (DIAMOND)", colActions: "Actions",
    packages: (n: number) => `${n} sub-packages`,
    active: "Active", inactive: "Inactive",
    modalTitle: "Edit Package Info",
    fieldName: "Package Name", fieldNameHint: "Package name and cost cannot be edited manually",
    fieldPrice: "Price (PRICE)", fieldCost: "Cost (COST)",
    fieldDiamond: "Points (DIAMOND)", fieldPromo: "Promotion",
    fieldTimer: "Sale Time Limit",
    promoNone: "No Promotion", promoFlash: "Flash Sale", promoHappy: "Happy Hour",
    cancel: "Cancel", save: "Save Data",
    calTitle: "Set Date", calSave: "Save", calCancel: "Cancel",
    calStartLabel: "Start Date", calDeadlineLabel: "Deadline",
    next: "Next",
  },
};

// ══════════════════════════════════════════════════════
// Data
// ══════════════════════════════════════════════════════
type PromoType = "none" | "flash" | "happy";

interface Package {
  id: string; name: string; price: number; cost: number;
  diamond: number; promo: PromoType; timer: string; enabled: boolean;
}

interface Game {
  id: string; nameTH: string; nameEN: string;
  publisher: string; initials: string; color: string;
  packages: Package[];
}

const GAMES: Game[] = [
  {
    id: "ml", nameTH: "Mobile Legends", nameEN: "Mobile Legends",
    publisher: "Moonton", initials: "ML", color: "#38bdf8",
    packages: [
      { id:"ml1", name:"Diamond 78+8",    price:69,  cost:55,  diamond:500,  promo:"flash", timer:"02:45:10", enabled:true  },
      { id:"ml2", name:"Diamond 234+23",  price:185, cost:160, diamond:1200, promo:"none",  timer:"",          enabled:true  },
      { id:"ml3", name:"Diamond 468+48",  price:369, cost:320, diamond:2500, promo:"none",  timer:"",          enabled:true  },
      { id:"ml4", name:"Diamond 936+96",  price:729, cost:640, diamond:5000, promo:"happy", timer:"06:00:00", enabled:false },
      { id:"ml5", name:"Twilight Pass",   price:299, cost:250, diamond:800,  promo:"none",  timer:"",          enabled:true  },
      { id:"ml6", name:"Weekly Diamond",  price:99,  cost:80,  diamond:300,  promo:"none",  timer:"",          enabled:true  },
      { id:"ml7", name:"Monthly Diamond", price:249, cost:200, diamond:750,  promo:"none",  timer:"",          enabled:true  },
      { id:"ml8", name:"Starlight Pass",  price:159, cost:130, diamond:400,  promo:"flash", timer:"01:30:00", enabled:true  },
    ],
  },
  {
    id: "pm", nameTH: "PUBG Mobile UC", nameEN: "PUBG Mobile UC",
    publisher: "Tencent", initials: "PM", color: "#f59e0b",
    packages: [
      { id:"pm1", name:"60 UC",    price:29,  cost:22,  diamond:100,  promo:"none",  timer:"", enabled:true  },
      { id:"pm2", name:"325 UC",   price:149, cost:120, diamond:500,  promo:"flash", timer:"03:00:00", enabled:true  },
      { id:"pm3", name:"660 UC",   price:299, cost:245, diamond:1000, promo:"none",  timer:"", enabled:true  },
      { id:"pm4", name:"1800 UC",  price:799, cost:660, diamond:2500, promo:"none",  timer:"", enabled:true  },
      { id:"pm5", name:"3850 UC",  price:1699,cost:1400,diamond:5500, promo:"happy", timer:"08:00:00", enabled:false },
      { id:"pm6", name:"8100 UC",  price:3499,cost:2900,diamond:11000,promo:"none",  timer:"", enabled:true  },
      { id:"pm7", name:"UC Bonus 120", price:59, cost:48, diamond:200, promo:"none", timer:"", enabled:true  },
      { id:"pm8", name:"Elite Pass",   price:349,cost:290,diamond:1200,promo:"none", timer:"", enabled:true  },
      { id:"pm9", name:"Elite Pass Plus",price:599,cost:500,diamond:2000,promo:"flash",timer:"05:00:00",enabled:true},
      { id:"pm10",name:"Royale Pass M1",price:899,cost:750,diamond:3000,promo:"none",timer:"",enabled:true  },
      { id:"pm11",name:"Royale Pass M2",price:899,cost:750,diamond:3000,promo:"none",timer:"",enabled:false },
      { id:"pm12",name:"Season Pass",  price:199,cost:160,diamond:700, promo:"none", timer:"", enabled:true  },
    ],
  },
  {
    id: "gi", nameTH: "Genshin Impact", nameEN: "Genshin Impact",
    publisher: "HoYoverse", initials: "GI", color: "#a78bfa",
    packages: [
      { id:"gi1", name:"60 Genesis Crystals",   price:29,  cost:22,  diamond:100,  promo:"none",  timer:"", enabled:true  },
      { id:"gi2", name:"300+30 Genesis",         price:149, cost:120, diamond:500,  promo:"flash", timer:"02:00:00", enabled:true  },
      { id:"gi3", name:"980+110 Genesis",        price:479, cost:400, diamond:1500, promo:"none",  timer:"", enabled:true  },
      { id:"gi4", name:"1980+260 Genesis",       price:949, cost:790, diamond:3000, promo:"none",  timer:"", enabled:true  },
      { id:"gi5", name:"3280+600 Genesis",       price:1549,cost:1290,diamond:5000, promo:"happy", timer:"06:00:00", enabled:true  },
      { id:"gi6", name:"6480+1600 Genesis",      price:2999,cost:2500,diamond:9500, promo:"none",  timer:"", enabled:false },
      { id:"gi7", name:"Blessing of Welkin Moon",price:149, cost:120, diamond:400,  promo:"none",  timer:"", enabled:true  },
    ],
  },
  {
    id: "ff", nameTH: "Free Fire", nameEN: "Free Fire",
    publisher: "Garena", initials: "FF", color: "#f87171",
    packages: [
      { id:"ff1", name:"100 Diamonds",  price:29,  cost:22,  diamond:100,  promo:"flash", timer:"01:00:00", enabled:true  },
      { id:"ff2", name:"310 Diamonds",  price:79,  cost:62,  diamond:300,  promo:"none",  timer:"", enabled:true  },
      { id:"ff3", name:"520 Diamonds",  price:129, cost:104, diamond:500,  promo:"none",  timer:"", enabled:true  },
      { id:"ff4", name:"1060 Diamonds", price:249, cost:200, diamond:1000, promo:"none",  timer:"", enabled:true  },
      { id:"ff5", name:"2180 Diamonds", price:499, cost:410, diamond:2000, promo:"happy", timer:"04:00:00", enabled:true  },
      { id:"ff6", name:"5600 Diamonds", price:1199,cost:1000,diamond:5000, promo:"none",  timer:"", enabled:false },
      { id:"ff7", name:"Booyah Pass",   price:149, cost:120, diamond:400,  promo:"none",  timer:"", enabled:true  },
    ],
  },
  {
    id: "rov", nameTH: "Arena of Valor (ROV)", nameEN: "Arena of Valor (ROV)",
    publisher: "Level Infinite", initials: "RV", color: "#34d399",
    packages: [
      { id:"rv1", name:"90 Vouchers",   price:35,  cost:27,  diamond:90,   promo:"none",  timer:"", enabled:true  },
      { id:"rv2", name:"180 Vouchers",  price:65,  cost:50,  diamond:180,  promo:"flash", timer:"02:30:00", enabled:true  },
      { id:"rv3", name:"375 Vouchers",  price:129, cost:100, diamond:375,  promo:"none",  timer:"", enabled:true  },
      { id:"rv4", name:"750 Vouchers",  price:249, cost:198, diamond:750,  promo:"none",  timer:"", enabled:true  },
      { id:"rv5", name:"1575 Vouchers", price:499, cost:399, diamond:1575, promo:"happy", timer:"03:00:00", enabled:false },
      { id:"rv6", name:"Battle Pass",   price:129, cost:100, diamond:350,  promo:"none",  timer:"", enabled:true  },
      { id:"rv7", name:"Season Pass",   price:79,  cost:60,  diamond:200,  promo:"none",  timer:"", enabled:true  },
    ],
  },
  {
    id: "vl", nameTH: "Valorant", nameEN: "Valorant",
    publisher: "Riot Games", initials: "VL", color: "#f43f5e",
    packages: [
      { id:"vl1", name:"475 VP",   price:149, cost:120, diamond:475,  promo:"none",  timer:"", enabled:true  },
      { id:"vl2", name:"1000 VP",  price:299, cost:245, diamond:1000, promo:"flash", timer:"03:30:00", enabled:true  },
      { id:"vl3", name:"2050 VP",  price:599, cost:490, diamond:2050, promo:"none",  timer:"", enabled:true  },
      { id:"vl4", name:"3650 VP",  price:999, cost:820, diamond:3650, promo:"none",  timer:"", enabled:false },
      { id:"vl5", name:"5350 VP",  price:1499,cost:1230,diamond:5350, promo:"happy", timer:"05:00:00", enabled:true  },
      { id:"vl6", name:"11000 VP", price:2999,cost:2460,diamond:11000,promo:"none",  timer:"", enabled:true  },
      { id:"vl7", name:"Battlepass",price:299,cost:240, diamond:800,  promo:"none",  timer:"", enabled:true  },
    ],
  },
  {
    id: "hsr", nameTH: "Honkai: Star Rail", nameEN: "Honkai: Star Rail",
    publisher: "HoYoverse", initials: "HS", color: "#818cf8",
    packages: [
      { id:"hs1", name:"60 Oneiric",   price:29,  cost:22,  diamond:100,  promo:"none",  timer:"", enabled:true  },
      { id:"hs2", name:"300 Oneiric",  price:149, cost:120, diamond:500,  promo:"flash", timer:"02:00:00", enabled:true  },
      { id:"hs3", name:"980 Oneiric",  price:479, cost:395, diamond:1500, promo:"none",  timer:"", enabled:true  },
      { id:"hs4", name:"1980 Oneiric", price:949, cost:780, diamond:3000, promo:"none",  timer:"", enabled:true  },
      { id:"hs5", name:"3280 Oneiric", price:1549,cost:1270,diamond:5000, promo:"happy", timer:"04:00:00", enabled:true  },
      { id:"hs6", name:"6480 Oneiric", price:2999,cost:2460,diamond:9500, promo:"none",  timer:"", enabled:false },
      { id:"hs7", name:"Express Pass", price:149, cost:120, diamond:400,  promo:"none",  timer:"", enabled:true  },
    ],
  },
  {
    id: "cod", nameTH: "Call of Duty Mobile", nameEN: "Call of Duty Mobile",
    publisher: "Activision", initials: "CD", color: "#64748b",
    packages: [
      { id:"cd1", name:"80 CP",    price:29,  cost:22,  diamond:80,   promo:"none",  timer:"", enabled:true  },
      { id:"cd2", name:"400 CP",   price:129, cost:102, diamond:400,  promo:"flash", timer:"02:00:00", enabled:true  },
      { id:"cd3", name:"800 CP",   price:249, cost:200, diamond:800,  promo:"none",  timer:"", enabled:true  },
      { id:"cd4", name:"2000 CP",  price:599, cost:490, diamond:2000, promo:"none",  timer:"", enabled:false },
      { id:"cd5", name:"5000 CP",  price:1399,cost:1150,diamond:5000, promo:"happy", timer:"03:00:00", enabled:true  },
      { id:"cd6", name:"10000 CP", price:2699,cost:2220,diamond:10000,promo:"none",  timer:"", enabled:true  },
      { id:"cd7", name:"Battle Pass", price:249, cost:200, diamond:700, promo:"none", timer:"", enabled:true  },
    ],
  },
  // page 2
  { id:"zzz",nameTH:"Zenless Zone Zero",nameEN:"Zenless Zone Zero",publisher:"HoYoverse",initials:"ZZ",color:"#6366f1",packages:[
    {id:"zz1",name:"60 Monochrome",  price:29,  cost:22,  diamond:100,  promo:"none",  timer:"",          enabled:true },
    {id:"zz2",name:"300 Monochrome", price:149, cost:120, diamond:500,  promo:"flash", timer:"02:00:00",  enabled:true },
    {id:"zz3",name:"980 Monochrome", price:479, cost:395, diamond:1500, promo:"none",  timer:"",          enabled:true },
    {id:"zz4",name:"1980 Monochrome",price:949, cost:780, diamond:3000, promo:"none",  timer:"",          enabled:true },
    {id:"zz5",name:"3280 Monochrome",price:1549,cost:1270,diamond:5000, promo:"happy", timer:"04:00:00",  enabled:true },
    {id:"zz6",name:"6480 Monochrome",price:2999,cost:2460,diamond:9500, promo:"none",  timer:"",          enabled:false},
    {id:"zz7",name:"Bangboo Pass",   price:149, cost:120, diamond:400,  promo:"none",  timer:"",          enabled:true },
  ]},
  { id:"ww",nameTH:"Wuthering Waves",nameEN:"Wuthering Waves",publisher:"Kuro Games",initials:"WW",color:"#22d3ee",packages:[
    {id:"ww1",name:"60 Lunite",   price:29,  cost:22,  diamond:100,  promo:"none",  timer:"",         enabled:true },
    {id:"ww2",name:"300 Lunite",  price:149, cost:120, diamond:500,  promo:"flash", timer:"02:30:00", enabled:true },
    {id:"ww3",name:"980 Lunite",  price:479, cost:395, diamond:1500, promo:"none",  timer:"",         enabled:true },
    {id:"ww4",name:"1980 Lunite", price:949, cost:780, diamond:3000, promo:"none",  timer:"",         enabled:true },
    {id:"ww5",name:"3280 Lunite", price:1549,cost:1270,diamond:5000, promo:"happy", timer:"06:00:00", enabled:true },
    {id:"ww6",name:"6480 Lunite", price:2999,cost:2460,diamond:9500, promo:"none",  timer:"",         enabled:false},
    {id:"ww7",name:"Pioneer Pass",price:149, cost:120, diamond:400,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"tof",nameTH:"Tower of Fantasy",nameEN:"Tower of Fantasy",publisher:"Hotta Studio",initials:"TF",color:"#f472b6",packages:[
    {id:"tf1",name:"50 Tanium",   price:29,  cost:22,  diamond:100,  promo:"none",  timer:"",         enabled:true },
    {id:"tf2",name:"250 Tanium",  price:149, cost:120, diamond:500,  promo:"flash", timer:"01:30:00", enabled:true },
    {id:"tf3",name:"830 Tanium",  price:479, cost:395, diamond:1500, promo:"none",  timer:"",         enabled:true },
    {id:"tf4",name:"1680 Tanium", price:949, cost:780, diamond:3000, promo:"none",  timer:"",         enabled:true },
    {id:"tf5",name:"2800 Tanium", price:1549,cost:1270,diamond:5000, promo:"happy", timer:"03:00:00", enabled:true },
    {id:"tf6",name:"5600 Tanium", price:2999,cost:2460,diamond:9500, promo:"none",  timer:"",         enabled:false},
    {id:"tf7",name:"Anniversary Pass",price:199,cost:160,diamond:500,promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"bdm",nameTH:"Black Desert Mobile",nameEN:"Black Desert Mobile",publisher:"Pearl Abyss",initials:"BD",color:"#a3e635",packages:[
    {id:"bd1",name:"100 Pearl",  price:29,  cost:22,  diamond:100,  promo:"none",  timer:"",         enabled:true },
    {id:"bd2",name:"500 Pearl",  price:149, cost:120, diamond:500,  promo:"flash", timer:"02:00:00", enabled:true },
    {id:"bd3",name:"1650 Pearl", price:479, cost:395, diamond:1500, promo:"none",  timer:"",         enabled:true },
    {id:"bd4",name:"3300 Pearl", price:949, cost:780, diamond:3000, promo:"none",  timer:"",         enabled:true },
    {id:"bd5",name:"5500 Pearl", price:1549,cost:1270,diamond:5000, promo:"happy", timer:"05:00:00", enabled:true },
    {id:"bd6",name:"11000 Pearl",price:2999,cost:2460,diamond:9500, promo:"none",  timer:"",         enabled:false},
    {id:"bd7",name:"Season Pass",price:199, cost:160, diamond:500,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"apex",nameTH:"Apex Legends Mobile",nameEN:"Apex Legends Mobile",publisher:"EA / Respawn",initials:"AL",color:"#ef4444",packages:[
    {id:"al1",name:"500 Coins",   price:29,  cost:22,  diamond:100,  promo:"none",  timer:"",         enabled:true },
    {id:"al2",name:"1000 Coins",  price:59,  cost:47,  diamond:200,  promo:"flash", timer:"01:00:00", enabled:true },
    {id:"al3",name:"2150 Coins",  price:119, cost:96,  diamond:400,  promo:"none",  timer:"",         enabled:true },
    {id:"al4",name:"4350 Coins",  price:229, cost:185, diamond:800,  promo:"none",  timer:"",         enabled:true },
    {id:"al5",name:"6700 Coins",  price:349, cost:283, diamond:1200, promo:"happy", timer:"03:00:00", enabled:true },
    {id:"al6",name:"11500 Coins", price:579, cost:470, diamond:2000, promo:"none",  timer:"",         enabled:false},
    {id:"al7",name:"Battle Pass", price:249, cost:200, diamond:700,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"ni",nameTH:"Ni No Kuni: Cross Worlds",nameEN:"Ni No Kuni: Cross Worlds",publisher:"Netmarble",initials:"NK",color:"#fb923c",packages:[
    {id:"nk1",name:"30 Gems",    price:29,  cost:22,  diamond:100,  promo:"none",  timer:"",         enabled:true },
    {id:"nk2",name:"150 Gems",   price:149, cost:120, diamond:500,  promo:"flash", timer:"02:00:00", enabled:true },
    {id:"nk3",name:"490 Gems",   price:479, cost:395, diamond:1500, promo:"none",  timer:"",         enabled:true },
    {id:"nk4",name:"980 Gems",   price:949, cost:780, diamond:3000, promo:"none",  timer:"",         enabled:true },
    {id:"nk5",name:"1980 Gems",  price:1549,cost:1270,diamond:5000, promo:"happy", timer:"04:00:00", enabled:true },
    {id:"nk6",name:"3280 Gems",  price:2999,cost:2460,diamond:9500, promo:"none",  timer:"",         enabled:false},
    {id:"nk7",name:"Kingdom Pass",price:149,cost:120, diamond:400,  promo:"none",  timer:"",         enabled:true },
  ]},
  // page 3
  { id:"ow2",nameTH:"Overwatch 2",nameEN:"Overwatch 2",publisher:"Blizzard",initials:"OW",color:"#f97316",packages:[
    {id:"ow1",name:"500 Coins",   price:149, cost:120, diamond:500,  promo:"none",  timer:"",         enabled:true },
    {id:"ow2a",name:"1000 Coins", price:299, cost:245, diamond:1000, promo:"flash", timer:"03:00:00", enabled:true },
    {id:"ow3",name:"2000 Coins",  price:579, cost:475, diamond:2000, promo:"none",  timer:"",         enabled:true },
    {id:"ow4",name:"5000 Coins",  price:1399,cost:1150,diamond:5000, promo:"none",  timer:"",         enabled:true },
    {id:"ow5",name:"10000 Coins", price:2699,cost:2215,diamond:10000,promo:"happy", timer:"06:00:00", enabled:true },
    {id:"ow6",name:"Battle Pass", price:299, cost:245, diamond:800,  promo:"none",  timer:"",         enabled:true },
    {id:"ow7",name:"Watchpoint Pack",price:599,cost:490,diamond:1500,promo:"none", timer:"",         enabled:false},
  ]},
  { id:"fn",nameTH:"Fortnite",nameEN:"Fortnite",publisher:"Epic Games",initials:"FN",color:"#7c3aed",packages:[
    {id:"fn1",name:"1000 V-Bucks",  price:149, cost:120, diamond:1000, promo:"none",  timer:"",         enabled:true },
    {id:"fn2",name:"2800 V-Bucks",  price:399, cost:328, diamond:2800, promo:"flash", timer:"02:00:00", enabled:true },
    {id:"fn3",name:"5000 V-Bucks",  price:699, cost:574, diamond:5000, promo:"none",  timer:"",         enabled:true },
    {id:"fn4",name:"13500 V-Bucks", price:1799,cost:1478,diamond:13500,promo:"none",  timer:"",         enabled:true },
    {id:"fn5",name:"Battle Pass",   price:149, cost:120, diamond:950,  promo:"happy", timer:"04:00:00", enabled:true },
    {id:"fn6",name:"Crew Pack",     price:299, cost:245, diamond:1000, promo:"none",  timer:"",         enabled:true },
    {id:"fn7",name:"Starter Pack",  price:99,  cost:79,  diamond:600,  promo:"none",  timer:"",         enabled:false},
  ]},
  { id:"ns",nameTH:"PUBG New State",nameEN:"PUBG New State",publisher:"Krafton",initials:"NS",color:"#10b981",packages:[
    {id:"ns1",name:"60 NC",    price:29,  cost:22,  diamond:60,   promo:"none",  timer:"",         enabled:true },
    {id:"ns2",name:"300 NC",   price:149, cost:120, diamond:300,  promo:"flash", timer:"01:30:00", enabled:true },
    {id:"ns3",name:"600 NC",   price:299, cost:245, diamond:600,  promo:"none",  timer:"",         enabled:true },
    {id:"ns4",name:"1500 NC",  price:699, cost:574, diamond:1500, promo:"none",  timer:"",         enabled:true },
    {id:"ns5",name:"3000 NC",  price:1399,cost:1150,diamond:3000, promo:"happy", timer:"03:00:00", enabled:true },
    {id:"ns6",name:"6500 NC",  price:2799,cost:2300,diamond:6500, promo:"none",  timer:"",         enabled:false},
    {id:"ns7",name:"Survivor Pass",price:149,cost:120,diamond:400,promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"nr",nameTH:"Naraka: Bladepoint",nameEN:"Naraka: Bladepoint",publisher:"NetEase",initials:"NR",color:"#dc2626",packages:[
    {id:"nr1",name:"60 Gold",   price:29,  cost:22,  diamond:60,   promo:"none",  timer:"",         enabled:true },
    {id:"nr2",name:"300 Gold",  price:149, cost:120, diamond:300,  promo:"flash", timer:"02:00:00", enabled:true },
    {id:"nr3",name:"980 Gold",  price:479, cost:393, diamond:980,  promo:"none",  timer:"",         enabled:true },
    {id:"nr4",name:"1980 Gold", price:949, cost:779, diamond:1980, promo:"none",  timer:"",         enabled:true },
    {id:"nr5",name:"3280 Gold", price:1549,cost:1271,diamond:3280, promo:"happy", timer:"05:00:00", enabled:true },
    {id:"nr6",name:"6480 Gold", price:2999,cost:2462,diamond:6480, promo:"none",  timer:"",         enabled:false},
    {id:"nr7",name:"Battle Pass",price:249,cost:204, diamond:700,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"cs2g",nameTH:"CS2 (Counter-Strike 2)",nameEN:"CS2 (Counter-Strike 2)",publisher:"Valve",initials:"CS",color:"#facc15",packages:[
    {id:"cs1",name:"Prime Status",    price:149, cost:120, diamond:400,  promo:"none",  timer:"",         enabled:true },
    {id:"cs2a",name:"1000 VP",        price:299, cost:245, diamond:1000, promo:"flash", timer:"02:00:00", enabled:true },
    {id:"cs3",name:"2100 VP",         price:599, cost:490, diamond:2000, promo:"none",  timer:"",         enabled:true },
    {id:"cs4",name:"Operation Pass",  price:249, cost:200, diamond:700,  promo:"none",  timer:"",         enabled:true },
    {id:"cs5",name:"5000 VP",         price:1399,cost:1150,diamond:5000, promo:"happy", timer:"04:00:00", enabled:true },
    {id:"cs6",name:"10500 VP",        price:2799,cost:2300,diamond:10000,promo:"none",  timer:"",         enabled:false},
    {id:"cs7",name:"Capsule Key",     price:59,  cost:47,  diamond:150,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"pbgpc",nameTH:"PUBG: Battlegrounds (PC)",nameEN:"PUBG: Battlegrounds (PC)",publisher:"Krafton",initials:"PG",color:"#eab308",packages:[
    {id:"pg1",name:"300 G-Coin",  price:149, cost:120, diamond:300,  promo:"none",  timer:"",         enabled:true },
    {id:"pg2",name:"600 G-Coin",  price:299, cost:245, diamond:600,  promo:"flash", timer:"02:00:00", enabled:true },
    {id:"pg3",name:"1500 G-Coin", price:699, cost:574, diamond:1500, promo:"none",  timer:"",         enabled:true },
    {id:"pg4",name:"3000 G-Coin", price:1399,cost:1150,diamond:3000, promo:"none",  timer:"",         enabled:true },
    {id:"pg5",name:"6500 G-Coin", price:2799,cost:2300,diamond:6500, promo:"happy", timer:"05:00:00", enabled:true },
    {id:"pg6",name:"Survivor Pass",price:299,cost:245, diamond:800,  promo:"none",  timer:"",         enabled:false},
    {id:"pg7",name:"PUBG Plus",   price:149, cost:120, diamond:400,  promo:"none",  timer:"",         enabled:true },
  ]},
  // page 4
  { id:"fifa",nameTH:"FIFA Mobile",nameEN:"FIFA Mobile",publisher:"EA Sports",initials:"FM",color:"#16a34a",packages:[
    {id:"fm1",name:"100 FIFA Points",  price:29,  cost:22,  diamond:100,  promo:"none",  timer:"",         enabled:true },
    {id:"fm2",name:"500 FIFA Points",  price:129, cost:102, diamond:500,  promo:"flash", timer:"02:00:00", enabled:true },
    {id:"fm3",name:"1050 FIFA Points", price:249, cost:200, diamond:1000, promo:"none",  timer:"",         enabled:true },
    {id:"fm4",name:"2200 FIFA Points", price:499, cost:410, diamond:2000, promo:"none",  timer:"",         enabled:true },
    {id:"fm5",name:"4600 FIFA Points", price:999, cost:820, diamond:4000, promo:"happy", timer:"04:00:00", enabled:true },
    {id:"fm6",name:"Bundle Premium",   price:299, cost:245, diamond:1100, promo:"none",  timer:"",         enabled:false},
    {id:"fm7",name:"Season Token",     price:149, cost:120, diamond:500,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"nba",nameTH:"NBA 2K Mobile",nameEN:"NBA 2K Mobile",publisher:"2K Sports",initials:"NB",color:"#dc2626",packages:[
    {id:"nb1",name:"200 VC",    price:29,  cost:22,  diamond:200,  promo:"none",  timer:"",         enabled:true },
    {id:"nb2",name:"1000 VC",   price:129, cost:102, diamond:1000, promo:"flash", timer:"02:00:00", enabled:true },
    {id:"nb3",name:"2500 VC",   price:299, cost:245, diamond:2500, promo:"none",  timer:"",         enabled:true },
    {id:"nb4",name:"5000 VC",   price:579, cost:476, diamond:5000, promo:"none",  timer:"",         enabled:true },
    {id:"nb5",name:"10000 VC",  price:1099,cost:903, diamond:10000,promo:"happy", timer:"03:00:00", enabled:true },
    {id:"nb6",name:"15000 VC",  price:1599,cost:1313,diamond:15000,promo:"none",  timer:"",         enabled:false},
    {id:"nb7",name:"Season Pass",price:299,cost:245, diamond:1000, promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"ef",nameTH:"eFootball 2025",nameEN:"eFootball 2025",publisher:"Konami",initials:"EF",color:"#2563eb",packages:[
    {id:"ef1",name:"330 Coins",   price:29,  cost:22,  diamond:330,  promo:"none",  timer:"",         enabled:true },
    {id:"ef2",name:"660 Coins",   price:59,  cost:47,  diamond:660,  promo:"flash", timer:"01:00:00", enabled:true },
    {id:"ef3",name:"1650 Coins",  price:149, cost:120, diamond:1650, promo:"none",  timer:"",         enabled:true },
    {id:"ef4",name:"3300 Coins",  price:299, cost:245, diamond:3300, promo:"none",  timer:"",         enabled:true },
    {id:"ef5",name:"8250 Coins",  price:699, cost:574, diamond:8250, promo:"happy", timer:"04:00:00", enabled:true },
    {id:"ef6",name:"16500 Coins", price:1399,cost:1149,diamond:16500,promo:"none",  timer:"",         enabled:false},
    {id:"ef7",name:"myClub Coin", price:79,  cost:63,  diamond:250,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"f1m",nameTH:"F1 Mobile Racing",nameEN:"F1 Mobile Racing",publisher:"EA Sports",initials:"F1",color:"#e11d48",packages:[
    {id:"f11",name:"50 F1 Cash",   price:29,  cost:22,  diamond:50,   promo:"none",  timer:"",         enabled:true },
    {id:"f12",name:"250 F1 Cash",  price:129, cost:102, diamond:250,  promo:"flash", timer:"02:00:00", enabled:true },
    {id:"f13",name:"650 F1 Cash",  price:299, cost:245, diamond:650,  promo:"none",  timer:"",         enabled:true },
    {id:"f14",name:"1300 F1 Cash", price:579, cost:476, diamond:1300, promo:"none",  timer:"",         enabled:true },
    {id:"f15",name:"Season Pass",  price:249, cost:200, diamond:800,  promo:"happy", timer:"03:00:00", enabled:true },
    {id:"f16",name:"Team Bundle",  price:499, cost:410, diamond:1500, promo:"none",  timer:"",         enabled:false},
    {id:"f17",name:"Driver Pack",  price:149, cost:120, diamond:400,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"rl",nameTH:"Rocket League Sideswipe",nameEN:"Rocket League Sideswipe",publisher:"Epic Games",initials:"RL",color:"#06b6d4",packages:[
    {id:"rl1",name:"500 Credits",   price:49,  cost:39,  diamond:500,  promo:"none",  timer:"",         enabled:true },
    {id:"rl2",name:"1100 Credits",  price:99,  cost:79,  diamond:1100, promo:"flash", timer:"01:30:00", enabled:true },
    {id:"rl3",name:"3000 Credits",  price:249, cost:200, diamond:3000, promo:"none",  timer:"",         enabled:true },
    {id:"rl4",name:"6500 Credits",  price:499, cost:410, diamond:6500, promo:"none",  timer:"",         enabled:true },
    {id:"rl5",name:"Rocket Pass",   price:249, cost:200, diamond:800,  promo:"happy", timer:"05:00:00", enabled:true },
    {id:"rl6",name:"14000 Credits", price:999, cost:820, diamond:14000,promo:"none",  timer:"",         enabled:false},
    {id:"rl7",name:"Starter Pack",  price:99,  cost:79,  diamond:300,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"mlb",nameTH:"MLB Perfect Inning",nameEN:"MLB Perfect Inning",publisher:"Com2uS",initials:"MB",color:"#0369a1",packages:[
    {id:"mb1",name:"100 Stars",  price:29,  cost:22,  diamond:100,  promo:"none",  timer:"",         enabled:true },
    {id:"mb2",name:"500 Stars",  price:129, cost:102, diamond:500,  promo:"flash", timer:"02:00:00", enabled:true },
    {id:"mb3",name:"1200 Stars", price:299, cost:245, diamond:1200, promo:"none",  timer:"",         enabled:true },
    {id:"mb4",name:"2500 Stars", price:579, cost:476, diamond:2500, promo:"none",  timer:"",         enabled:true },
    {id:"mb5",name:"6500 Stars", price:1399,cost:1149,diamond:6500, promo:"happy", timer:"04:00:00", enabled:true },
    {id:"mb6",name:"Season Pass",price:249, cost:200, diamond:800,  promo:"none",  timer:"",         enabled:false},
    {id:"mb7",name:"Club Pack",  price:149, cost:120, diamond:400,  promo:"none",  timer:"",         enabled:true },
  ]},
  // page 5
  { id:"coc",nameTH:"Clash of Clans",nameEN:"Clash of Clans",publisher:"Supercell",initials:"CC",color:"#84cc16",packages:[
    {id:"cc1",name:"80 Gems",    price:29,  cost:22,  diamond:80,   promo:"none",  timer:"",         enabled:true },
    {id:"cc2",name:"500 Gems",   price:149, cost:120, diamond:500,  promo:"flash", timer:"02:00:00", enabled:true },
    {id:"cc3",name:"1200 Gems",  price:349, cost:287, diamond:1200, promo:"none",  timer:"",         enabled:true },
    {id:"cc4",name:"2500 Gems",  price:699, cost:574, diamond:2500, promo:"none",  timer:"",         enabled:true },
    {id:"cc5",name:"6500 Gems",  price:1799,cost:1477,diamond:6500, promo:"happy", timer:"06:00:00", enabled:true },
    {id:"cc6",name:"14000 Gems", price:3499,cost:2875,diamond:14000,promo:"none",  timer:"",         enabled:false},
    {id:"cc7",name:"Gold Pass",  price:149, cost:120, diamond:400,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"cr",nameTH:"Clash Royale",nameEN:"Clash Royale",publisher:"Supercell",initials:"CR",color:"#8b5cf6",packages:[
    {id:"cr1",name:"80 Gems",    price:29,  cost:22,  diamond:80,   promo:"none",  timer:"",         enabled:true },
    {id:"cr2",name:"500 Gems",   price:149, cost:120, diamond:500,  promo:"flash", timer:"01:30:00", enabled:true },
    {id:"cr3",name:"1200 Gems",  price:349, cost:287, diamond:1200, promo:"none",  timer:"",         enabled:true },
    {id:"cr4",name:"2500 Gems",  price:699, cost:574, diamond:2500, promo:"none",  timer:"",         enabled:true },
    {id:"cr5",name:"6500 Gems",  price:1799,cost:1477,diamond:6500, promo:"happy", timer:"04:00:00", enabled:true },
    {id:"cr6",name:"Pass Royale",price:149, cost:120, diamond:400,  promo:"none",  timer:"",         enabled:true },
    {id:"cr7",name:"Wild Pass",  price:99,  cost:79,  diamond:250,  promo:"none",  timer:"",         enabled:false},
  ]},
  { id:"rok",nameTH:"Rise of Kingdoms",nameEN:"Rise of Kingdoms",publisher:"Lilith Games",initials:"RK",color:"#ca8a04",packages:[
    {id:"rk1",name:"80 Gems",    price:29,  cost:22,  diamond:80,   promo:"none",  timer:"",         enabled:true },
    {id:"rk2",name:"400 Gems",   price:149, cost:120, diamond:400,  promo:"flash", timer:"02:00:00", enabled:true },
    {id:"rk3",name:"1000 Gems",  price:349, cost:287, diamond:1000, promo:"none",  timer:"",         enabled:true },
    {id:"rk4",name:"2500 Gems",  price:799, cost:656, diamond:2500, promo:"none",  timer:"",         enabled:true },
    {id:"rk5",name:"6000 Gems",  price:1899,cost:1560,diamond:6000, promo:"happy", timer:"05:00:00", enabled:true },
    {id:"rk6",name:"12000 Gems", price:3699,cost:3037,diamond:12000,promo:"none",  timer:"",         enabled:false},
    {id:"rk7",name:"VIP Pack",   price:249, cost:200, diamond:700,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"lm",nameTH:"Lords Mobile",nameEN:"Lords Mobile",publisher:"IGG",initials:"LM",color:"#dc2626",packages:[
    {id:"lm1",name:"170 Gems",   price:29,  cost:22,  diamond:170,  promo:"none",  timer:"",         enabled:true },
    {id:"lm2",name:"880 Gems",   price:149, cost:120, diamond:880,  promo:"flash", timer:"02:00:00", enabled:true },
    {id:"lm3",name:"2200 Gems",  price:349, cost:287, diamond:2200, promo:"none",  timer:"",         enabled:true },
    {id:"lm4",name:"4400 Gems",  price:699, cost:574, diamond:4400, promo:"none",  timer:"",         enabled:true },
    {id:"lm5",name:"8800 Gems",  price:1399,cost:1149,diamond:8800, promo:"happy", timer:"04:00:00", enabled:true },
    {id:"lm6",name:"Gem Feast",  price:2799,cost:2298,diamond:17600,promo:"none",  timer:"",         enabled:false},
    {id:"lm7",name:"Kingdom Pass",price:199,cost:160, diamond:600,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"sos",nameTH:"State of Survival",nameEN:"State of Survival",publisher:"FunPlus",initials:"SS",color:"#78716c",packages:[
    {id:"ss1",name:"80 Biocaps",    price:29,  cost:22,  diamond:80,   promo:"none",  timer:"",         enabled:true },
    {id:"ss2",name:"400 Biocaps",   price:129, cost:102, diamond:400,  promo:"flash", timer:"01:30:00", enabled:true },
    {id:"ss3",name:"1000 Biocaps",  price:299, cost:245, diamond:1000, promo:"none",  timer:"",         enabled:true },
    {id:"ss4",name:"2500 Biocaps",  price:699, cost:574, diamond:2500, promo:"none",  timer:"",         enabled:true },
    {id:"ss5",name:"6500 Biocaps",  price:1799,cost:1477,diamond:6500, promo:"happy", timer:"05:00:00", enabled:true },
    {id:"ss6",name:"Alliance Pack", price:249, cost:200, diamond:700,  promo:"none",  timer:"",         enabled:false},
    {id:"ss7",name:"Hero Shards",   price:149, cost:120, diamond:400,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"ls",nameTH:"Last Shelter: Survival",nameEN:"Last Shelter: Survival",publisher:"Long Tech",initials:"LS",color:"#374151",packages:[
    {id:"ls1",name:"60 Gold",    price:29,  cost:22,  diamond:60,   promo:"none",  timer:"",         enabled:true },
    {id:"ls2",name:"300 Gold",   price:129, cost:102, diamond:300,  promo:"flash", timer:"02:00:00", enabled:true },
    {id:"ls3",name:"750 Gold",   price:299, cost:245, diamond:750,  promo:"none",  timer:"",         enabled:true },
    {id:"ls4",name:"1600 Gold",  price:599, cost:492, diamond:1600, promo:"none",  timer:"",         enabled:true },
    {id:"ls5",name:"4000 Gold",  price:1399,cost:1149,diamond:4000, promo:"happy", timer:"04:00:00", enabled:true },
    {id:"ls6",name:"8500 Gold",  price:2799,cost:2298,diamond:8500, promo:"none",  timer:"",         enabled:false},
    {id:"ls7",name:"Season Pass",price:199, cost:160, diamond:500,  promo:"none",  timer:"",         enabled:true },
  ]},
  // page 6
  { id:"az",nameTH:"Age of Z Origins",nameEN:"Age of Z Origins",publisher:"Camel Studio",initials:"AZ",color:"#9ca3af",packages:[
    {id:"az1",name:"60 Diamonds",   price:29,  cost:22,  diamond:60,   promo:"none",  timer:"",         enabled:true },
    {id:"az2",name:"300 Diamonds",  price:129, cost:102, diamond:300,  promo:"flash", timer:"01:30:00", enabled:true },
    {id:"az3",name:"750 Diamonds",  price:299, cost:245, diamond:750,  promo:"none",  timer:"",         enabled:true },
    {id:"az4",name:"1600 Diamonds", price:599, cost:492, diamond:1600, promo:"none",  timer:"",         enabled:true },
    {id:"az5",name:"4000 Diamonds", price:1399,cost:1149,diamond:4000, promo:"happy", timer:"03:00:00", enabled:true },
    {id:"az6",name:"Alliance Pack", price:249, cost:200, diamond:700,  promo:"none",  timer:"",         enabled:false},
    {id:"az7",name:"VIP Bundle",    price:149, cost:120, diamond:400,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"hok",nameTH:"Honor of Kings",nameEN:"Honor of Kings",publisher:"TiMi Studio",initials:"HK",color:"#f59e0b",packages:[
    {id:"hk1",name:"60 Tokens",   price:29,  cost:22,  diamond:60,   promo:"none",  timer:"",         enabled:true },
    {id:"hk2",name:"300 Tokens",  price:149, cost:120, diamond:300,  promo:"flash", timer:"02:00:00", enabled:true },
    {id:"hk3",name:"980 Tokens",  price:479, cost:393, diamond:980,  promo:"none",  timer:"",         enabled:true },
    {id:"hk4",name:"1980 Tokens", price:949, cost:779, diamond:1980, promo:"none",  timer:"",         enabled:true },
    {id:"hk5",name:"3280 Tokens", price:1549,cost:1271,diamond:3280, promo:"happy", timer:"05:00:00", enabled:true },
    {id:"hk6",name:"Season Pass", price:149, cost:120, diamond:400,  promo:"none",  timer:"",         enabled:true },
    {id:"hk7",name:"Hero Bundle", price:299, cost:245, diamond:800,  promo:"none",  timer:"",         enabled:false},
  ]},
  { id:"wr",nameTH:"Wild Rift",nameEN:"Wild Rift",publisher:"Riot Games",initials:"WR",color:"#3b82f6",packages:[
    {id:"wr1",name:"325 Wild Cores",  price:49,  cost:39,  diamond:325,  promo:"none",  timer:"",         enabled:true },
    {id:"wr2",name:"1050 Wild Cores", price:149, cost:120, diamond:1050, promo:"flash", timer:"02:00:00", enabled:true },
    {id:"wr3",name:"2175 Wild Cores", price:299, cost:245, diamond:2175, promo:"none",  timer:"",         enabled:true },
    {id:"wr4",name:"3725 Wild Cores", price:499, cost:410, diamond:3725, promo:"none",  timer:"",         enabled:true },
    {id:"wr5",name:"7200 Wild Cores", price:949, cost:779, diamond:7200, promo:"happy", timer:"04:00:00", enabled:true },
    {id:"wr6",name:"Wild Pass",       price:149, cost:120, diamond:400,  promo:"none",  timer:"",         enabled:true },
    {id:"wr7",name:"Champion Pack",   price:249, cost:200, diamond:700,  promo:"none",  timer:"",         enabled:false},
  ]},
  { id:"dota2",nameTH:"Dota 2",nameEN:"Dota 2",publisher:"Valve",initials:"D2",color:"#b45309",packages:[
    {id:"d21",name:"200 Shards",  price:29,  cost:22,  diamond:200,  promo:"none",  timer:"",         enabled:true },
    {id:"d22",name:"1000 Shards", price:129, cost:102, diamond:1000, promo:"flash", timer:"01:30:00", enabled:true },
    {id:"d23",name:"2500 Shards", price:299, cost:245, diamond:2500, promo:"none",  timer:"",         enabled:true },
    {id:"d24",name:"Battle Pass", price:249, cost:200, diamond:800,  promo:"none",  timer:"",         enabled:true },
    {id:"d25",name:"Plus Sub",    price:149, cost:120, diamond:400,  promo:"happy", timer:"03:00:00", enabled:true },
    {id:"d26",name:"Immortal Bundle",price:999,cost:820,diamond:3000,promo:"none",  timer:"",         enabled:false},
    {id:"d27",name:"Arcana",      price:599, cost:492, diamond:1500, promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"smite",nameTH:"Smite",nameEN:"Smite",publisher:"Hi-Rez Studios",initials:"SM",color:"#0891b2",packages:[
    {id:"sm1",name:"400 Gems",   price:29,  cost:22,  diamond:400,  promo:"none",  timer:"",         enabled:true },
    {id:"sm2",name:"2000 Gems",  price:129, cost:102, diamond:2000, promo:"flash", timer:"02:00:00", enabled:true },
    {id:"sm3",name:"4300 Gems",  price:249, cost:200, diamond:4300, promo:"none",  timer:"",         enabled:true },
    {id:"sm4",name:"9800 Gems",  price:549, cost:451, diamond:9800, promo:"none",  timer:"",         enabled:true },
    {id:"sm5",name:"God Bundle", price:149, cost:120, diamond:500,  promo:"happy", timer:"04:00:00", enabled:true },
    {id:"sm6",name:"Odyssey Pass",price:299,cost:245, diamond:800,  promo:"none",  timer:"",         enabled:false},
    {id:"sm7",name:"Starter Bundle",price:99,cost:79, diamond:300,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"pu",nameTH:"Pokémon Unite",nameEN:"Pokémon Unite",publisher:"TiMi Studio",initials:"PU",color:"#facc15",packages:[
    {id:"pu1",name:"60 Aeos Coins",   price:29,  cost:22,  diamond:60,   promo:"none",  timer:"",         enabled:true },
    {id:"pu2",name:"300 Aeos Coins",  price:129, cost:102, diamond:300,  promo:"flash", timer:"01:30:00", enabled:true },
    {id:"pu3",name:"980 Aeos Coins",  price:399, cost:328, diamond:980,  promo:"none",  timer:"",         enabled:true },
    {id:"pu4",name:"1980 Aeos Coins", price:799, cost:656, diamond:1980, promo:"none",  timer:"",         enabled:true },
    {id:"pu5",name:"Battle Pass",     price:249, cost:200, diamond:700,  promo:"happy", timer:"05:00:00", enabled:true },
    {id:"pu6",name:"Holowear Ticket", price:149, cost:120, diamond:400,  promo:"none",  timer:"",         enabled:false},
    {id:"pu7",name:"Trainer Bundle",  price:99,  cost:79,  diamond:250,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"madden",nameTH:"Madden NFL Mobile",nameEN:"Madden NFL Mobile",publisher:"EA Sports",initials:"MN",color:"#166534",packages:[
    {id:"mn1",name:"500 Madden Cash", price:49,  cost:39,  diamond:500,  promo:"none",  timer:"",         enabled:true },
    {id:"mn2",name:"1050 Madden Cash",price:99,  cost:79,  diamond:1050, promo:"flash", timer:"01:30:00", enabled:true },
    {id:"mn3",name:"2800 Madden Cash",price:249, cost:200, diamond:2800, promo:"none",  timer:"",         enabled:true },
    {id:"mn4",name:"5750 Madden Cash",price:499, cost:410, diamond:5750, promo:"none",  timer:"",         enabled:true },
    {id:"mn5",name:"MUT Season Pass", price:249, cost:200, diamond:700,  promo:"happy", timer:"03:00:00", enabled:true },
    {id:"mn6",name:"Elite Bundle",    price:599, cost:492, diamond:1500, promo:"none",  timer:"",         enabled:false},
    {id:"mn7",name:"Starter Pack",    price:99,  cost:79,  diamond:300,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"ragnarok",nameTH:"Ragnarok Origin",nameEN:"Ragnarok Origin",publisher:"Gravity",initials:"RO",color:"#7e22ce",packages:[
    {id:"ro1",name:"100 KP",   price:29,  cost:22,  diamond:100,  promo:"none",  timer:"",         enabled:true },
    {id:"ro2",name:"500 KP",   price:129, cost:102, diamond:500,  promo:"flash", timer:"02:00:00", enabled:true },
    {id:"ro3",name:"1200 KP",  price:299, cost:245, diamond:1200, promo:"none",  timer:"",         enabled:true },
    {id:"ro4",name:"2500 KP",  price:599, cost:492, diamond:2500, promo:"none",  timer:"",         enabled:true },
    {id:"ro5",name:"6000 KP",  price:1399,cost:1149,diamond:6000, promo:"happy", timer:"05:00:00", enabled:true },
    {id:"ro6",name:"VIP Pass", price:249, cost:200, diamond:700,  promo:"none",  timer:"",         enabled:false},
    {id:"ro7",name:"Guild Pack",price:149,cost:120, diamond:400,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"lineage",nameTH:"Lineage W",nameEN:"Lineage W",publisher:"NCSoft",initials:"LW",color:"#1d4ed8",packages:[
    {id:"lw1",name:"100 Diamond", price:29,  cost:22,  diamond:100,  promo:"none",  timer:"",         enabled:true },
    {id:"lw2",name:"500 Diamond", price:129, cost:102, diamond:500,  promo:"flash", timer:"02:00:00", enabled:true },
    {id:"lw3",name:"1300 Diamond",price:299, cost:245, diamond:1300, promo:"none",  timer:"",         enabled:true },
    {id:"lw4",name:"2700 Diamond",price:599, cost:492, diamond:2700, promo:"none",  timer:"",         enabled:true },
    {id:"lw5",name:"7000 Diamond",price:1499,cost:1232,diamond:7000, promo:"happy", timer:"04:00:00", enabled:true },
    {id:"lw6",name:"Royal Pass",  price:249, cost:200, diamond:700,  promo:"none",  timer:"",         enabled:false},
    {id:"lw7",name:"Clan Pack",   price:149, cost:120, diamond:400,  promo:"none",  timer:"",         enabled:true },
  ]},
  { id:"arena",nameTH:"Arena Breakout",nameEN:"Arena Breakout",publisher:"MoreFun Studios",initials:"AB",color:"#57534e",packages:[
    {id:"ab1",name:"60 Coins",    price:29,  cost:22,  diamond:60,   promo:"none",  timer:"",         enabled:true },
    {id:"ab2",name:"300 Coins",   price:129, cost:102, diamond:300,  promo:"flash", timer:"01:30:00", enabled:true },
    {id:"ab3",name:"980 Coins",   price:399, cost:328, diamond:980,  promo:"none",  timer:"",         enabled:true },
    {id:"ab4",name:"1980 Coins",  price:799, cost:656, diamond:1980, promo:"none",  timer:"",         enabled:true },
    {id:"ab5",name:"3280 Coins",  price:1299,cost:1068,diamond:3280, promo:"happy", timer:"03:00:00", enabled:true },
    {id:"ab6",name:"Season Pass", price:249, cost:200, diamond:700,  promo:"none",  timer:"",         enabled:false},
    {id:"ab7",name:"Operator Bundle",price:149,cost:120,diamond:400, promo:"none",  timer:"",         enabled:true },
  ]},
];

const PAGE_SIZE = 7;

// ══════════════════════════════════════════════════════
// Toggle
// ══════════════════════════════════════════════════════
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={e => { e.stopPropagation(); onChange(); }}
      className="relative flex-shrink-0 transition-all duration-200" style={{ width: 40, height: 22 }}>
      <div className="absolute inset-0 rounded-full transition-all duration-200"
        style={{ background: on ? "#34d399" : "rgba(100,116,139,0.3)", border: `1px solid ${on ? "#34d399" : "#3a4a6a"}` }} />
      <div className="absolute top-0.5 rounded-full transition-all duration-200"
        style={{ width: 18, height: 18, left: on ? 20 : 2, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
    </button>
  );
}

// ══════════════════════════════════════════════════════
// Promo Badge
// ══════════════════════════════════════════════════════
function PromoBadge({ promo, t }: { promo: PromoType; t: typeof T["th"] }) {
  if (promo === "none") return <span style={{ color: "#3a4a6a" }}>—</span>;
  const cfg = promo === "flash"
    ? { label: `⚡ ${t.promoFlash}`, color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" }
    : { label: `🌙 ${t.promoHappy}`, color: "#818cf8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.3)" };
  return (
    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
}

// ══════════════════════════════════════════════════════
// Promo Dropdown
// ══════════════════════════════════════════════════════
function PromoSelect({ value, onChange, t }: { value: PromoType; onChange: (v: PromoType) => void; t: typeof T["th"] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const OPTIONS: { value: PromoType; label: string; color?: string }[] = [
    { value: "none",  label: t.promoNone  },
    { value: "flash", label: `⚡ ${t.promoFlash}`, color: "#d97706" },
    { value: "happy", label: `🌙 ${t.promoHappy}`, color: "#7c3aed" },
  ];
  const cur = OPTIONS.find(o => o.value === value)!;
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-left transition"
        style={{ background: "#fff", border: "1px solid #d1d5db", color: cur.color ?? "#374151", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)" }}>
        <span className="font-medium">{cur.label}</span>
        <ChevronDown size={13} style={{ color: "#9ca3af", transform: open ? "rotate(180deg)" : "none", transition: ".18s", flexShrink: 0 }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 w-full mt-1 rounded-xl overflow-hidden z-50"
          style={{ background: "#fff", border: "1px solid #e5e7eb", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
          {OPTIONS.map(o => (
            <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-gray-50 transition"
              style={{ color: o.color ?? "#374151", borderBottom: "1px solid #f3f4f6" }}>
              {o.label}
              {value === o.value && <Check size={13} style={{ color: "#16a34a", flexShrink: 0 }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// Edit Modal
// ══════════════════════════════════════════════════════
function EditModal({ pkg, onClose, onSave, t, lang }: {
  pkg: Package; onClose: () => void; onSave: (p: Package) => void; t: typeof T["th"]; lang: "th"|"en";
}) {
  const [draft, setDraft] = useState({ ...pkg });
  const [showCal, setShowCal] = useState(false);

  // Parse deadline from "DD/M/YYYY HH:MM" or empty
  const today = new Date();
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-based
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("00:00");
  const [hasDeadline, setHasDeadline] = useState(!!draft.timer);
  const [startDate, setStartDate]   = useState("");
  const [startTime, setStartTime]   = useState("00:00");
  const [hasStart,  setHasStart]    = useState(false);
  // which field calendar is picking for: "start" | "deadline"
  const [calTarget, setCalTarget]   = useState<"start"|"deadline">("deadline");

  const MONTHS_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const MONTHS = lang === "th" ? MONTHS_TH : MONTHS_EN;
  const DAYS_TH = ["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."];
  const DAYS_EN = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const DAYS = lang === "th" ? DAYS_TH : DAYS_EN;

  const daysInMonth = (y: number, m: number) => new Date(y, m+1, 0).getDate();
  const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const selectDate = (d: number) => {
    const dateStr = `${d}/${calMonth+1}/${calYear}`;
    if (calTarget === "start") {
      setStartDate(dateStr);
      setHasStart(true);
    } else {
      setDeadlineDate(dateStr);
      setHasDeadline(true);
      if (!deadlineTime) setDeadlineTime("00:00");
      setDraft(p => ({ ...p, timer: `${dateStr} ${deadlineTime || "00:00"}` }));
    }
  };

  const isSelectedDay = (d: number) => {
    const ds = `${d}/${calMonth+1}/${calYear}`;
    return deadlineDate === ds || startDate === ds;
  };
  const isStartDay = (d: number) => startDate === `${d}/${calMonth+1}/${calYear}`;
  const isDeadlineDay = (d: number) => deadlineDate === `${d}/${calMonth+1}/${calYear}`;
  const isTodayDay = (d: number) => {
    const t2 = new Date();
    return t2.getDate() === d && t2.getMonth() === calMonth && t2.getFullYear() === calYear;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.6)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{ background: "#fff", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #e5e7eb" }}>
          <p className="text-base font-bold" style={{ color: "#111827" }}>{t.modalTitle}</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition" style={{ color: "#9ca3af" }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Package name (read-only) */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>{t.fieldName}</label>
            <input value={draft.name} readOnly
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#6b7280", cursor: "not-allowed" }} />
            <p className="text-[11px] mt-1" style={{ color: "#9ca3af" }}>{t.fieldNameHint}</p>
          </div>

          {/* Price + Cost */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t.fieldPrice, key: "price" as const, readonly: false },
              { label: t.fieldCost,  key: "cost"  as const, readonly: true  },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>{f.label}</label>
                <div className="flex items-center rounded-xl px-3 py-2.5" style={{ background: f.readonly ? "#f3f4f6" : "#fff", border: "1px solid #e5e7eb" }}>
                  <span className="text-sm mr-1" style={{ color: "#9ca3af" }}>฿</span>
                  <input type="number" value={draft[f.key]} readOnly={f.readonly}
                    onChange={e => !f.readonly && setDraft(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: f.readonly ? "#6b7280" : "#111827", cursor: f.readonly ? "not-allowed" : "text" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Diamond + Promo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>{t.fieldDiamond}</label>
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
                <span style={{ color: "#818cf8" }}>◆</span>
                <input type="number" value={draft.diamond}
                  onChange={e => setDraft(p => ({ ...p, diamond: Number(e.target.value) }))}
                  className="flex-1 bg-transparent outline-none text-sm" style={{ color: "#111827" }} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>{t.fieldPromo}</label>
              <PromoSelect value={draft.promo} onChange={v => setDraft(p => ({ ...p, promo: v }))} t={t} />
            </div>
          </div>

          {/* Timer — date picker (inline) */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>{t.fieldTimer}</label>
            {/* Trigger button */}
            <button type="button" onClick={() => setShowCal(o => !o)}
              className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-left transition hover:bg-gray-50 mb-2"
              style={{ background: "#fff", border: "1px solid #d1d5db", color: draft.timer ? "#111827" : "#9ca3af" }}>
              <CalendarDays size={14} style={{ color: "#9ca3af", flexShrink: 0 }} />
              <span className="font-mono">{draft.timer || "เลือกวันที่สิ้นสุด..."}</span>
            </button>

            {/* Fixed calendar popup — centered, above everything */}
            {showCal && (
              <>
                {/* backdrop */}
                <div className="fixed inset-0 z-[70]" onClick={() => setShowCal(false)} />
                <div className="fixed z-[80] rounded-2xl overflow-hidden"
                  style={{ background: "#fff", border: "1px solid #e5e7eb", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", width: 312, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
                  {/* Calendar header with title */}
                  <div className="px-4 pt-3 pb-2" style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <p className="text-sm font-bold text-center mb-2" style={{ color: "#111827" }}>{t.calTitle}</p>
                    <div className="flex items-center justify-between">
                      {/* « prev year */}
                      <button onClick={() => setCalYear(y=>y-1)}
                        className="p-1 rounded-lg hover:bg-gray-100 transition text-xs font-bold" style={{ color: "#9ca3af" }}>«</button>
                      {/* < prev month */}
                      <button onClick={() => { if (calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1); }}
                        className="p-1 rounded-lg hover:bg-gray-100 transition" style={{ color: "#6b7280" }}>
                        <ChevronDown size={13} style={{ transform: "rotate(90deg)" }} />
                      </button>
                      <span className="text-sm font-bold" style={{ color: "#111827" }}>
                        {MONTHS[calMonth]} {calYear}
                      </span>
                      {/* > next month */}
                      <button onClick={() => { if (calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1); }}
                        className="p-1 rounded-lg hover:bg-gray-100 transition" style={{ color: "#6b7280" }}>
                        <ChevronDown size={13} style={{ transform: "rotate(-90deg)" }} />
                      </button>
                      {/* » next year */}
                      <button onClick={() => setCalYear(y=>y+1)}
                        className="p-1 rounded-lg hover:bg-gray-100 transition text-xs font-bold" style={{ color: "#9ca3af" }}>»</button>
                    </div>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 px-2 pt-2 pb-1">
                    {DAYS.map(d => (
                      <div key={d} className="text-center text-[10px] font-bold py-1" style={{ color: "#9ca3af" }}>{d}</div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 px-2 pb-2">
                    {Array.from({ length: firstDayOfMonth(calYear, calMonth) }).map((_, i) => <div key={`e${i}`} />)}
                    {Array.from({ length: daysInMonth(calYear, calMonth) }, (_, i) => i+1).map(d => (
                      <button key={d} onClick={() => selectDate(d)}
                        className="w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs transition"
                        style={{
                          background: isDeadlineDay(d) ? "#16a34a" : isStartDay(d) ? "#2563eb" : isTodayDay(d) ? "#dbeafe" : "transparent",
                          color: isDeadlineDay(d)||isStartDay(d) ? "#fff" : isTodayDay(d) ? "#1d4ed8" : "#374151",
                          fontWeight: isSelectedDay(d)||isTodayDay(d) ? 700 : 400,
                        }}>
                        {d}
                      </button>
                    ))}
                  </div>

                  {/* วันที่เริ่มต้น + วันครบกำหนด */}
                  <div style={{ borderTop: "1px solid #f3f4f6", padding: "12px 16px 12px" }}>

                    {/* วันที่เริ่มต้นใช้งาน */}
                    <p className="text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>{t.calStartLabel}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <input type="checkbox" checked={hasStart}
                        onChange={e => { setHasStart(e.target.checked); if(!e.target.checked) setStartDate(""); }}
                        className="w-4 h-4 flex-shrink-0" style={{ accentColor: "#16a34a" }} />
                      <button onClick={() => setCalTarget("start")}
                        className="flex-1 rounded-lg px-2 py-1.5 text-xs text-left outline-none transition hover:bg-gray-50"
                        style={{ border: `1px solid ${calTarget==="start" ? "#2563eb" : "#d1d5db"}`, color: startDate ? "#374151" : "#9ca3af", background: hasStart ? "#eff6ff" : "#f9fafb", fontFamily: "monospace" }}>
                        {startDate || "ว/ด/ปปปป"}
                      </button>
                      <input type="time" value={startTime}
                        onChange={e => { setStartTime(e.target.value); }}
                        className="rounded-lg px-2 py-1.5 text-xs font-mono outline-none"
                        style={{ border: "1px solid #d1d5db", color: "#374151", background: "#fff", width: 80, borderRadius: 8 }} />
                    </div>

                    {/* วันครบกำหนด */}
                    <p className="text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>{t.calDeadlineLabel}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <input type="checkbox" checked={hasDeadline}
                        onChange={e => { setHasDeadline(e.target.checked); if (!e.target.checked) { setDraft(p => ({ ...p, timer: "" })); setDeadlineDate(""); } }}
                        className="w-4 h-4 flex-shrink-0" style={{ accentColor: "#16a34a" }} />
                      <button onClick={() => setCalTarget("deadline")}
                        className="flex-1 rounded-lg px-2 py-1.5 text-xs text-left outline-none transition hover:bg-gray-50"
                        style={{ border: `1px solid ${calTarget==="deadline"&&hasDeadline ? "#16a34a" : "#d1d5db"}`, color: deadlineDate ? "#374151" : "#9ca3af", background: hasDeadline ? "#f0fdf4" : "#fff", fontFamily: "monospace" }}>
                        {deadlineDate || "ว/ด/ปปปป"}
                      </button>
                      <input type="time" value={deadlineTime}
                        onChange={e => { setDeadlineTime(e.target.value); if (deadlineDate) setDraft(p => ({ ...p, timer: `${deadlineDate} ${e.target.value}` })); }}
                        className="rounded-lg px-2 py-1.5 text-xs font-mono outline-none"
                        style={{ border: "1px solid #d1d5db", color: "#374151", background: "#fff", width: 80, borderRadius: 8 }} />
                    </div>
                  </div>

                  {/* ยกเลิก + บันทึก */}
                  <div className="flex gap-2 px-4 pb-4 pt-1">
                    <button onClick={() => setShowCal(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition hover:bg-gray-50"
                      style={{ border: "1px solid #d1d5db", color: "#6b7280" }}>
                      {t.calCancel}
                    </button>
                    <button onClick={() => setShowCal(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
                      style={{ background: "#16a34a", color: "#fff" }}>
                      {t.calSave}
                    </button>
                  </div>
              </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition hover:bg-gray-50"
            style={{ border: "1px solid #e5e7eb", color: "#6b7280" }}>{t.cancel}</button>
          <button onClick={() => { onSave(draft); onClose(); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
            style={{ background: "#16a34a", color: "#fff" }}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════
export default function TopUpPackagesPage() {
  const [lang, setLang]       = useState<"th"|"en">("th");
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [games, setGames]     = useState(GAMES);
  const [editPkg, setEditPkg] = useState<{ pkg: Package; gameId: string } | null>(null);

  const t = T[lang];

  const filtered = games.filter(g =>
    (lang === "th" ? g.nameTH : g.nameEN).toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const updatePkg = (gameId: string, pkg: Package) => {
    setGames(prev => prev.map(g =>
      g.id === gameId ? { ...g, packages: g.packages.map(p => p.id === pkg.id ? pkg : p) } : g
    ));
  };

  const togglePkg = (gameId: string, pkgId: string) => {
    setGames(prev => prev.map(g =>
      g.id === gameId ? { ...g, packages: g.packages.map(p => p.id === pkgId ? { ...p, enabled: !p.enabled } : p) } : g
    ));
  };

  const newCount = 3;
  const card = { background: "rgba(11,15,32,0.9)", border: "1px solid #1c2540" };

  return (
    <div className="flex flex-col min-h-full"
      style={{ background: "linear-gradient(160deg,#080c18 0%,#0a0e1e 60%,#060911 100%)", fontFamily: "'Noto Sans Thai','Inter',sans-serif" }}>

      {editPkg && (
        <EditModal pkg={editPkg.pkg} onClose={() => setEditPkg(null)}
          onSave={p => updatePkg(editPkg.gameId, p)} t={t} lang={lang} />
      )}

      {/* ══ TOPBAR ══ */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 flex-shrink-0"
        style={{ background: "#111827", borderBottom: "1px solid #1e293b", minHeight: 52 }}>
        <div className="flex items-center gap-2 flex-1 min-w-0 max-w-sm rounded-xl px-3 py-2"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1e293b" }}>
          <Search size={13} style={{ color: "#64748b", flexShrink: 0 }} />
          <input placeholder={t.searchPh} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
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
            <Bell size={15} style={{ color: "#94a3b8" }} />
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

        {/* Alert banner */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl flex-wrap"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}>
          <AlertTriangle size={16} style={{ color: "#f59e0b", flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: "#f59e0b" }}>{t.alertTitle}</p>
            <p className="text-xs mt-0.5" style={{ color: "#92400e" }}>{t.alertDesc(newCount)}</p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition hover:opacity-90"
            style={{ background: "#f59e0b", color: "#fff" }}>
            {t.alertBtn} <ArrowRight size={12} />
          </button>
        </div>

        {/* Page title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t.pageTitle}</h1>
          <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{t.pageSubtitle}</p>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e293b", maxWidth: 400 }}>
          <Search size={14} style={{ color: "#64748b", flexShrink: 0 }} />
          <input placeholder={t.searchPh} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent outline-none text-sm text-white placeholder-[#3a4a6a] w-full" />
        </div>

        {/* Table header */}
        <div className="rounded-t-2xl overflow-hidden" style={card}>
          <div className="flex items-center px-4 sm:px-5 py-3" style={{ borderBottom: "1px solid #1c2540" }}>
            <p className="text-xs font-bold tracking-wide flex-1" style={{ color: "#3a4a6a" }}>{t.colGame}</p>
            <p className="text-xs font-bold tracking-wide" style={{ color: "#3a4a6a" }}>{t.colStatus}</p>
          </div>

          {/* Game rows */}
          {pageItems.map(g => {
            const isOpen = expanded.has(g.id);
            const activePkgs = g.packages.filter(p => p.enabled).length;
            return (
              <div key={g.id} style={{ borderBottom: "1px solid #1c2540" }}>
                {/* Game header row */}
                <button onClick={() => toggle(g.id)}
                  className="w-full flex items-center gap-4 px-4 sm:px-5 py-4 hover:bg-white/[0.02] transition text-left">
                  {/* Initials avatar */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                    style={{ background: `${g.color}20`, border: `2px solid ${g.color}40`, color: g.color }}>
                    {g.initials}
                  </div>
                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{lang === "th" ? g.nameTH : g.nameEN}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{g.publisher}</p>
                  </div>
                  {/* Package count + active badge */}
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs" style={{ color: "#64748b" }}>{t.packages(g.packages.length)}</span>
                    {activePkgs > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
                        • {t.active}
                      </span>
                    )}
                  </div>
                  {/* Chevron */}
                  <div className="flex-shrink-0 ml-2" style={{ color: "#64748b" }}>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Expanded packages table */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid #1c2540", background: "rgba(5,7,18,0.5)" }}>
                    {/* Sub-table header — scrollable */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs" style={{ minWidth: 700 }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid #1c2540" }}>
                            {[t.colName, t.colPrice, t.colCost, t.colProfit, t.colPromo, t.colDiamond, t.colActions].map(h => (
                              <th key={h} className="px-4 py-2.5 text-left font-bold tracking-wide"
                                style={{ color: "#3a4a6a" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {g.packages.map(pkg => {
                            const profit = pkg.price - pkg.cost;
                            return (
                              <tr key={pkg.id} className="hover:bg-white/[0.02] transition"
                                style={{ borderBottom: "1px solid #0a0f1e" }}>
                                {/* Name */}
                                <td className="px-4 py-3">
                                  <p className="text-sm font-semibold text-white">{pkg.name}</p>
                                  {pkg.promo === "flash" && (
                                    <p className="text-[10px] font-bold mt-0.5" style={{ color: "#f59e0b" }}>CASHBACK 10%</p>
                                  )}
                                </td>
                                {/* Price */}
                                <td className="px-4 py-3 text-sm font-bold text-white">฿{pkg.price}</td>
                                {/* Cost */}
                                <td className="px-4 py-3 text-sm" style={{ color: "#64748b" }}>฿{pkg.cost}</td>
                                {/* Profit */}
                                <td className="px-4 py-3 text-sm font-bold" style={{ color: "#34d399" }}>+฿{profit}</td>
                                {/* Promo */}
                                <td className="px-4 py-3"><PromoBadge promo={pkg.promo} t={t} /></td>
                                {/* Diamond */}
                                <td className="px-4 py-3">
                                  <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: "#818cf8" }}>
                                    <span style={{ fontSize: 10 }}>◆</span>
                                    {pkg.diamond.toLocaleString()}
                                  </span>
                                </td>
                                {/* Actions */}
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <Toggle on={pkg.enabled} onChange={() => togglePkg(g.id, pkg.id)} />
                                    <button
                                      onClick={() => setEditPkg({ pkg, gameId: g.id })}
                                      className="p-1.5 rounded-lg hover:bg-white/10 transition"
                                      style={{ color: "#64748b" }}>
                                      <Edit2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {(() => {
          // Show: page-1, page, page+1, ..., last  (window of 3 around current)
          const pages: (number|"...")[] = [];
          const start = Math.max(1, page - 1);
          const end   = Math.min(totalPages - 1, page + 1);
          for (let i = start; i <= end; i++) pages.push(i);
          if (end < totalPages - 1) pages.push("...");
          if (totalPages > end) pages.push(totalPages);
          const btnBase = "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition";
          return (
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs" style={{ color: "#64748b" }}>
                {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} / {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                {/* ← prev */}
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  className={btnBase + " hover:bg-white/5"}
                  style={{ color:page===1?"#3a4a6a":"#94a3b8", border:"1px solid #1c2540" }}>
                  <ChevronDown size={13} style={{ transform:"rotate(90deg)" }} />
                </button>

                {pages.map((n,i) => n==="..."
                  ? <span key={`e${i}`} className="w-6 text-center text-xs" style={{ color:"#3a4a6a" }}>…</span>
                  : (
                    <button key={n} onClick={() => setPage(n as number)}
                      className={btnBase + " hover:bg-white/5"}
                      style={page===n
                        ? { background:"rgba(52,211,153,0.18)", color:"#34d399", border:"1px solid rgba(52,211,153,0.4)" }
                        : { color:"#64748b", border:"1px solid #1c2540" }}>
                      {n}
                    </button>
                  )
                )}

                {/* → next */}
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                  className={btnBase + " hover:bg-white/5"}
                  style={{ color:page===totalPages?"#3a4a6a":"#94a3b8", border:"1px solid #1c2540" }}>
                  <ChevronDown size={13} style={{ transform:"rotate(-90deg)" }} />
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}