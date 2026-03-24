"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search, ChevronDown, Check, Bell, Download,
  Edit2, X, Upload, ChevronLeft, ChevronRight, ImageIcon,
} from "lucide-react";

// ══════════════════════════════════════════════════════
// FLAGS & LANG DROPDOWN
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
    pageTitle: "จัดการรายการเกม", pageSubtitle: "จัดการรายชื่อเกม, การตั้งค่า API และการลงผลผ่านบ้าน",
    searchPh: "ค้นหาชื่อเกม, UID, หรือหมวดหมู่...", systemOnline: "ระบบออนไลน์", adminLabel: "แอดมิน",
    totalGames: "เกมทั้งหมด", activeGames: "เปิดให้บริการ", needsUpdate: "รอปรับปรุง", apiError: "API Error",
    items: "รายการ", games: "เกม", points: "จุด",
    category: "หมวดหมู่", allCategory: "ทั้งหมด",
    catMOBA: "MOBA", catFPS: "FPS", catRPG: "RPG", catBR: "Battle Royale", catSports: "Sports", catStrategy: "Strategy",
    colName: "ชื่อเกม / ID", colCategory: "หมวดหมู่", colUID: "รูปแบบ UID", colAPI: "API สถานะ", colToggle: "", colActions: "จัดการ",
    statusOnline: "ออนไลน์", statusOffline: "ออฟไลน์",
    exportBtn: "ส่งออก", editBtn: "แก้ไข", deleteBtn: "ลบ",
    showingOf: "แสดง", of: "จาก", total: "เกมทั้งหมด",
    // Modal
    modalTitle: "แก้ไขข้อมูลเกม", modalClose: "ยกเลิก", modalSave: "บันทึกข้อมูลเกม",
    fieldName: "ชื่อเกม", fieldCategory: "หมวดหมู่", fieldUID: "รูปแบบ UID (UID Format)",
    fieldImage: "อัปโหลด Picture Guide",
    fieldHasServer: "มีเลือก Server", fieldHasServerDesc: "เปิดใช้ให้ผู้ใช้เลือก Server ก่อนเติม",
    fieldAPI: "API Provider (Integration)", fieldAPIph: "ระบุ Endpoint หรือ Provider...",
    fieldAPIStatus: "สถานะ API",
    uidNumOnly: "Number Only", uidNumPlusServer: "Number + Server ID", uidCustom: "Custom Format",
    apiOnline: "ออนไลน์", apiOffline: "ออฟไลน์",
    helpTitle: "คู่มือช่วยเหลือ",
    imgUploadHint: "คลิกเพื่ออัปโหลด หรือลากไฟล์มาวางที่นี่",
  },
  en: {
    pageTitle: "Game Management", pageSubtitle: "Manage game list, API settings and top-up configuration",
    searchPh: "Search game name, UID, or category...", systemOnline: "System Online", adminLabel: "Admin",
    totalGames: "Total Games", activeGames: "Active", needsUpdate: "Needs Update", apiError: "API Error",
    items: "items", games: "games", points: "points",
    category: "Category", allCategory: "All",
    catMOBA: "MOBA", catFPS: "FPS", catRPG: "RPG", catBR: "Battle Royale", catSports: "Sports", catStrategy: "Strategy",
    colName: "Game Name / ID", colCategory: "Category", colUID: "UID Format", colAPI: "API Status", colToggle: "", colActions: "Actions",
    statusOnline: "Online", statusOffline: "Offline",
    exportBtn: "Export", editBtn: "Edit", deleteBtn: "Delete",
    showingOf: "Showing", of: "of", total: "total games",
    // Modal
    modalTitle: "Edit Game Info", modalClose: "Cancel", modalSave: "Save Game",
    fieldName: "Game Name", fieldCategory: "Category", fieldUID: "UID Format",
    fieldImage: "Upload Picture Guide",
    fieldHasServer: "Has Server Selection", fieldHasServerDesc: "Let users select a Server before top-up",
    fieldAPI: "API Provider (Integration)", fieldAPIph: "Enter Endpoint or Provider...",
    fieldAPIStatus: "API Status",
    uidNumOnly: "Number Only", uidNumPlusServer: "Number + Server ID", uidCustom: "Custom Format",
    apiOnline: "Online", apiOffline: "Offline",
    helpTitle: "Help Guide",
    imgUploadHint: "Click to upload or drag and drop file here",
  },
};

// ══════════════════════════════════════════════════════
// DATA — 42 games, 6 categories × 7 each
// ══════════════════════════════════════════════════════
type Category = "MOBA"|"FPS"|"RPG"|"Battle Royale"|"Sports"|"Strategy";
type UIDFormat = "number_only"|"number_server"|"custom";

interface Game {
  id: string; nameTH: string; nameEN: string; category: Category;
  uidFormat: UIDFormat; apiOnline: boolean; enabled: boolean;
  logo: string; color: string; apiEndpoint: string; hasServer: boolean;
}

const LOGO_COLORS: Record<Category, string[]> = {
  "MOBA":         ["#38bdf8","#818cf8","#34d399","#f59e0b","#f472b6","#a78bfa","#22d3ee"],
  "FPS":          ["#f87171","#fb923c","#fbbf24","#4ade80","#60a5fa","#c084fc","#f43f5e"],
  "RPG":          ["#a78bfa","#818cf8","#6366f1","#8b5cf6","#7c3aed","#4f46e5","#7e22ce"],
  "Battle Royale":["#fbbf24","#f59e0b","#d97706","#b45309","#92400e","#78350f","#ea580c"],
  "Sports":       ["#34d399","#10b981","#059669","#047857","#065f46","#6ee7b7","#a7f3d0"],
  "Strategy":     ["#94a3b8","#64748b","#475569","#334155","#cbd5e1","#e2e8f0","#f1f5f9"],
};

const GAMES: Game[] = [
  // MOBA ×7
  { id:"ROV-001", nameTH:"Arena of Valor (ROV)",  nameEN:"Arena of Valor (ROV)",   category:"MOBA", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"⚔️",  color:"#38bdf8", apiEndpoint:"https://api.rov.com/topup",    hasServer:false },
  { id:"ML-002",  nameTH:"Mobile Legends",         nameEN:"Mobile Legends",          category:"MOBA", uidFormat:"number_server", apiOnline:true,  enabled:true,  logo:"🗡️",  color:"#818cf8", apiEndpoint:"https://api.mobilelegends.com", hasServer:true  },
  { id:"DT-003",  nameTH:"Dota 2",                 nameEN:"Dota 2",                  category:"MOBA", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🔱",  color:"#34d399", apiEndpoint:"https://api.dota2.com/topup",   hasServer:false },
  { id:"HK-004",  nameTH:"Honor of Kings",         nameEN:"Honor of Kings",          category:"MOBA", uidFormat:"number_server", apiOnline:true,  enabled:true,  logo:"👑",  color:"#f59e0b", apiEndpoint:"https://api.hok.com/topup",     hasServer:true  },
  { id:"WR-005",  nameTH:"Wild Rift",              nameEN:"Wild Rift",               category:"MOBA", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🦁",  color:"#f472b6", apiEndpoint:"https://api.wildrift.com",      hasServer:false },
  { id:"SM-006",  nameTH:"Smite",                  nameEN:"Smite",                   category:"MOBA", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"⚡",  color:"#a78bfa", apiEndpoint:"https://api.smite.com/topup",   hasServer:false },
  { id:"PU-007",  nameTH:"Pokémon Unite",          nameEN:"Pokémon Unite",           category:"MOBA", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"⚽",  color:"#22d3ee", apiEndpoint:"https://api.pokemonunite.com",  hasServer:false },
  // FPS ×7
  { id:"VL-008",  nameTH:"Valorant",               nameEN:"Valorant",                category:"FPS",  uidFormat:"custom",        apiOnline:true,  enabled:true,  logo:"🎯",  color:"#f87171", apiEndpoint:"https://api.valorant.com",      hasServer:false },
  { id:"CS-009",  nameTH:"CS2",                    nameEN:"CS2",                     category:"FPS",  uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🔫",  color:"#fb923c", apiEndpoint:"https://api.cs2.com/topup",     hasServer:false },
  { id:"OW-010",  nameTH:"Overwatch 2",            nameEN:"Overwatch 2",             category:"FPS",  uidFormat:"custom",        apiOnline:true,  enabled:true,  logo:"🦸",  color:"#fbbf24", apiEndpoint:"https://api.blizzard.com/ow2",  hasServer:false },
  { id:"AP-011",  nameTH:"Apex Legends",           nameEN:"Apex Legends",            category:"FPS",  uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🔥",  color:"#4ade80", apiEndpoint:"https://api.ea.com/apex",       hasServer:false },
  { id:"PB-012",  nameTH:"PUBG Mobile",            nameEN:"PUBG Mobile",             category:"FPS",  uidFormat:"number_server", apiOnline:true,  enabled:true,  logo:"🎮",  color:"#60a5fa", apiEndpoint:"https://api.pubgmobile.com",    hasServer:true  },
  { id:"FF-013",  nameTH:"Free Fire",              nameEN:"Free Fire",               category:"FPS",  uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🧨",  color:"#c084fc", apiEndpoint:"https://api.freefire.com",      hasServer:false },
  { id:"CD-014",  nameTH:"Call of Duty Mobile",    nameEN:"Call of Duty Mobile",     category:"FPS",  uidFormat:"number_server", apiOnline:true,  enabled:true,  logo:"💣",  color:"#f43f5e", apiEndpoint:"https://api.activision.com/codm",hasServer:true },
  // RPG ×7
  { id:"GI-015",  nameTH:"Genshin Impact",         nameEN:"Genshin Impact",          category:"RPG",  uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"✨",  color:"#a78bfa", apiEndpoint:"https://api.hoyoverse.com/gi",  hasServer:false },
  { id:"HS-016",  nameTH:"Honkai: Star Rail",      nameEN:"Honkai: Star Rail",       category:"RPG",  uidFormat:"number_server", apiOnline:true,  enabled:true,  logo:"⭐",  color:"#818cf8", apiEndpoint:"https://api.hoyoverse.com/hsr", hasServer:true  },
  { id:"ZZ-017",  nameTH:"Zenless Zone Zero",      nameEN:"Zenless Zone Zero",       category:"RPG",  uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🌀",  color:"#6366f1", apiEndpoint:"https://api.hoyoverse.com/zzz", hasServer:false },
  { id:"WW-018",  nameTH:"Wuthering Waves",        nameEN:"Wuthering Waves",         category:"RPG",  uidFormat:"number_server", apiOnline:true,  enabled:true,  logo:"🌊",  color:"#8b5cf6", apiEndpoint:"https://api.kurogame.com/ww",   hasServer:true  },
  { id:"TF-019",  nameTH:"Tower of Fantasy",       nameEN:"Tower of Fantasy",        category:"RPG",  uidFormat:"number_server", apiOnline:true,  enabled:true,  logo:"🗼",  color:"#7c3aed", apiEndpoint:"https://api.hotta.com/tof",     hasServer:true  },
  { id:"BD-020",  nameTH:"Black Desert Mobile",    nameEN:"Black Desert Mobile",     category:"RPG",  uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"⚗️",  color:"#4f46e5", apiEndpoint:"https://api.pearlabyss.com/bdm",hasServer:false },
  { id:"NI-021",  nameTH:"Ni No Kuni: Cross Worlds",nameEN:"Ni No Kuni: Cross Worlds",category:"RPG", uidFormat:"custom",        apiOnline:true,  enabled:true,  logo:"🧙",  color:"#7e22ce", apiEndpoint:"https://api.netmarble.com/nnk", hasServer:false },
  // Battle Royale ×7
  { id:"PG-022",  nameTH:"PUBG: Battlegrounds",    nameEN:"PUBG: Battlegrounds",     category:"Battle Royale", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🪖",  color:"#fbbf24", apiEndpoint:"https://api.pubg.com/topup",    hasServer:false },
  { id:"FM-023",  nameTH:"Free Fire MAX",          nameEN:"Free Fire MAX",           category:"Battle Royale", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"💥",  color:"#f59e0b", apiEndpoint:"https://api.ffmax.com",         hasServer:false },
  { id:"FN-024",  nameTH:"Fortnite",               nameEN:"Fortnite",                category:"Battle Royale", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🏗️",  color:"#d97706", apiEndpoint:"https://api.epicgames.com/fn",  hasServer:false },
  { id:"PN-025",  nameTH:"PUBG New State",         nameEN:"PUBG New State",          category:"Battle Royale", uidFormat:"number_server", apiOnline:true,  enabled:true,  logo:"🚀",  color:"#b45309", apiEndpoint:"https://api.pubgnewstate.com",  hasServer:true  },
  { id:"NK-026",  nameTH:"Naraka: Bladepoint",     nameEN:"Naraka: Bladepoint",      category:"Battle Royale", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🗺️",  color:"#92400e", apiEndpoint:"https://api.naraka.com/topup",  hasServer:false },
  { id:"SQ-027",  nameTH:"Super Squad",            nameEN:"Super Squad",             category:"Battle Royale", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🛡️",  color:"#78350f", apiEndpoint:"https://api.supersquad.com",    hasServer:false },
  { id:"ZO-028",  nameTH:"Zooba: Fun Battle Game", nameEN:"Zooba: Fun Battle Game",  category:"Battle Royale", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🦊",  color:"#ea580c", apiEndpoint:"https://api.zooba.com/topup",   hasServer:false },
  // Sports ×7
  { id:"FI-029",  nameTH:"FIFA Mobile",            nameEN:"FIFA Mobile",             category:"Sports", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"⚽",  color:"#34d399", apiEndpoint:"https://api.ea.com/fifa",       hasServer:false },
  { id:"NB-030",  nameTH:"NBA 2K Mobile",          nameEN:"NBA 2K Mobile",           category:"Sports", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🏀",  color:"#10b981", apiEndpoint:"https://api.2k.com/nba",        hasServer:false },
  { id:"EF-031",  nameTH:"eFootball 2025",         nameEN:"eFootball 2025",          category:"Sports", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🦅",  color:"#059669", apiEndpoint:"https://api.konami.com/efootball",hasServer:false },
  { id:"F1-032",  nameTH:"F1 Mobile Racing",       nameEN:"F1 Mobile Racing",        category:"Sports", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🏎️",  color:"#047857", apiEndpoint:"https://api.ea.com/f1",         hasServer:false },
  { id:"MF-033",  nameTH:"Madden NFL Mobile",      nameEN:"Madden NFL Mobile",       category:"Sports", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🏈",  color:"#065f46", apiEndpoint:"https://api.ea.com/madden",      hasServer:false },
  { id:"BB-034",  nameTH:"MLB Perfect Inning",     nameEN:"MLB Perfect Inning",      category:"Sports", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"⚾",  color:"#6ee7b7", apiEndpoint:"https://api.mlbpi.com/topup",   hasServer:false },
  { id:"RL-035",  nameTH:"Rocket League Sideswipe",nameEN:"Rocket League Sideswipe", category:"Sports", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🚗",  color:"#a7f3d0", apiEndpoint:"https://api.epicgames.com/rl",  hasServer:false },
  // Strategy ×7
  { id:"CC-036",  nameTH:"Clash of Clans",         nameEN:"Clash of Clans",          category:"Strategy", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🏰",  color:"#94a3b8", apiEndpoint:"https://api.supercell.com/coc", hasServer:false },
  { id:"CR-037",  nameTH:"Clash Royale",           nameEN:"Clash Royale",            category:"Strategy", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"👸",  color:"#64748b", apiEndpoint:"https://api.supercell.com/cr",  hasServer:false },
  { id:"RK-038",  nameTH:"Rise of Kingdoms",       nameEN:"Rise of Kingdoms",        category:"Strategy", uidFormat:"number_server", apiOnline:true,  enabled:true,  logo:"🏛️",  color:"#475569", apiEndpoint:"https://api.lilithgames.com/rok",hasServer:true },
  { id:"LM-039",  nameTH:"Lords Mobile",           nameEN:"Lords Mobile",            category:"Strategy", uidFormat:"number_server", apiOnline:true,  enabled:true,  logo:"⚜️",  color:"#334155", apiEndpoint:"https://api.igg.com/lords",     hasServer:true  },
  { id:"SS-040",  nameTH:"State of Survival",      nameEN:"State of Survival",       category:"Strategy", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🧟",  color:"#cbd5e1", apiEndpoint:"https://api.kinggroup.com/sos", hasServer:false },
  { id:"LS-041",  nameTH:"Last Shelter: Survival", nameEN:"Last Shelter: Survival",  category:"Strategy", uidFormat:"number_server", apiOnline:true,  enabled:true,  logo:"🔒",  color:"#e2e8f0", apiEndpoint:"https://api.igg.com/ls",        hasServer:true  },
  { id:"AZ-042",  nameTH:"Age of Z Origins",       nameEN:"Age of Z Origins",        category:"Strategy", uidFormat:"number_only",   apiOnline:true,  enabled:true,  logo:"🧱",  color:"#f1f5f9", apiEndpoint:"https://api.camelstudio.com/az",hasServer:false },
];

const CATEGORIES: Category[] = ["MOBA","FPS","RPG","Battle Royale","Sports","Strategy"];
const UID_OPTIONS: { value: UIDFormat; labelKey: "uidNumOnly"|"uidNumPlusServer"|"uidCustom" }[] = [
  { value:"number_only",   labelKey:"uidNumOnly"      },
  { value:"number_server", labelKey:"uidNumPlusServer" },
  { value:"custom",        labelKey:"uidCustom"        },
];

const PAGE_SIZE = 7;

// ══════════════════════════════════════════════════════
// TOGGLE
// ══════════════════════════════════════════════════════
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="relative flex-shrink-0 transition-all duration-200" style={{ width: 40, height: 22 }}>
      <div className="absolute inset-0 rounded-full transition-all duration-200"
        style={{ background: on ? "#34d399" : "rgba(100,116,139,0.3)", border: `1px solid ${on ? "#34d399aa" : "#3a4a6a"}` }} />
      <div className="absolute top-0.5 rounded-full transition-all duration-200"
        style={{ width: 18, height: 18, left: on ? 20 : 2, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
    </button>
  );
}

// ══════════════════════════════════════════════════════
// EDIT MODAL
// ══════════════════════════════════════════════════════
function EditModal({ game, onClose, onSave, t, lang }: {
  game: Game; onClose: () => void; onSave: (g: Game) => void; t: typeof T["th"]; lang: "th"|"en";
}) {
  const [draft, setDraft] = useState<Game>({ ...game });
  const [showCatDrop, setShowCatDrop] = useState(false);
  const [showUIDDrop, setShowUIDDrop] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const uidRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setShowCatDrop(false);
      if (uidRef.current && !uidRef.current.contains(e.target as Node)) setShowUIDDrop(false);
    };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  const uidLabel = (v: UIDFormat) => {
    if (v === "number_only")   return t.uidNumOnly;
    if (v === "number_server") return t.uidNumPlusServer;
    return t.uidCustom;
  };

  const catLabel = (c: Category) => {
    const map: Record<Category,string> = {
      "MOBA": t.catMOBA, "FPS": t.catFPS, "RPG": t.catRPG,
      "Battle Royale": t.catBR, "Sports": t.catSports, "Strategy": t.catStrategy,
    };
    return map[c];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ background: "rgba(0,0,0,0.75)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl"
        style={{ background: "#0f1729", border: "1px solid #1e293b", boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
          style={{ background: "#0f1729", borderBottom: "1px solid #1e293b" }}>
          <p className="text-base font-bold text-white">{lang === "th" ? "จัดการข้อมูลเกม" : "Manage Game Info"}</p>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "#64748b" }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-5">

          {/* TOP: 2 columns — Left info | Right uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* LEFT: name + category + banner */}
            <div className="space-y-4">
              {/* Game name — read-only */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#64748b" }}>{t.fieldName}</p>
                <p className="text-xl font-extrabold text-white leading-tight">{lang === "th" ? draft.nameTH : draft.nameEN}</p>
              </div>

              {/* Category dropdown */}
              <div ref={catRef}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8" }}>{t.fieldCategory}</label>
                <button onClick={() => setShowCatDrop(o => !o)}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-left"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #2a3550", color: "#fff" }}>
                  <span style={{ color: draft.color }}>{catLabel(draft.category)}</span>
                  <ChevronDown size={14} style={{ color: "#64748b", transform: showCatDrop ? "rotate(180deg)" : "none", transition: ".18s" }} />
                </button>
                {showCatDrop && (
                  <div className="rounded-xl overflow-hidden mt-1 z-30 relative" style={{ background: "#1e293b", border: "1px solid #2a3550" }}>
                    {CATEGORIES.map(c => (
                      <button key={c} onClick={() => { setDraft(p => ({ ...p, category: c })); setShowCatDrop(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-white/5 transition"
                        style={{ color: draft.category === c ? "#a78bfa" : "#e2e8f0", borderBottom: "1px solid #2a3550" }}>
                        {catLabel(c)}
                        {draft.category === c && <Check size={13} style={{ color: "#a78bfa" }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Banner upload — 1200×630 */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8" }}>
                  {lang === "th" ? "รูปภาพประกอบเกม (Banner)" : "Game Banner Image"}
                </label>
                <div className="rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition"
                  style={{ background: "rgba(255,255,255,0.03)", border: "2px dashed #2a3550", aspectRatio: "1200/630", maxHeight: 140 }}>
                  <ImageIcon size={22} style={{ color: "#3a4a6a" }} />
                  <p className="text-xs text-center px-3" style={{ color: "#64748b" }}>
                    {lang === "th" ? "คลิกเพื่อเปลี่ยนรูปภาพแบนเนอร์" : "Click to change banner image"}
                  </p>
                  <p className="text-[10px]" style={{ color: "#3a4a6a" }}>
                    {lang === "th" ? "แนะนำขนาด 1200 × 630 px" : "Recommended size 1200 × 630 px"}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: picture guide + API status + info box */}
            <div className="space-y-4">
              {/* Picture Guide upload */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8" }}>{t.fieldImage}</label>
                <div className="rounded-xl flex flex-col items-center justify-center gap-2 py-6 cursor-pointer hover:bg-white/5 transition"
                  style={{ background: "rgba(56,189,248,0.06)", border: "2px dashed rgba(56,189,248,0.25)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(56,189,248,0.15)" }}>
                    <Upload size={18} style={{ color: "#38bdf8" }} />
                  </div>
                  <p className="text-xs font-semibold" style={{ color: "#38bdf8" }}>
                    {lang === "th" ? "คลิกเพื่ออัปโหลดไฟล์ใหม่" : "Click to upload new file"}
                  </p>
                  <p className="text-[10px]" style={{ color: "#64748b" }}>
                    {lang === "th" ? "รองรับ PNG, JPG (สัดส่วน 16:9)" : "Supports PNG, JPG (16:9 ratio)"}
                  </p>
                </div>
              </div>

              {/* API Status — pill buttons like screenshot */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>{t.fieldAPIStatus}</label>
                <div className="flex gap-2">
                  {([true, false] as const).map(val => (
                    <button key={String(val)} onClick={() => setDraft(p => ({ ...p, apiOnline: val }))}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition"
                      style={draft.apiOnline === val
                        ? val
                          ? { background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1.5px solid #34d399" }
                          : { background: "rgba(100,116,139,0.12)", color: "#94a3b8", border: "1.5px solid #64748b" }
                        : { background: "rgba(255,255,255,0.03)", color: "#3a4a6a", border: "1px solid #1c2540" }}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: val ? "#34d399" : "#64748b", opacity: draft.apiOnline === val ? 1 : 0.3 }} />
                      {val ? t.apiOnline : t.apiOffline}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info box */}
              <div className="flex items-start gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)" }}>
                <span className="text-sm flex-shrink-0 mt-0.5" style={{ color: "#38bdf8" }}>ℹ</span>
                <p className="text-[11px] leading-relaxed" style={{ color: "#94a3b8" }}>
                  {lang === "th"
                    ? 'ข้อแนะนำ: การอัปโหลดข้อมูลและการเปลี่ยนรูปภาพจะมีผลทันทีหลังจากกด "บันทึกข้อมูลเกม" กรุณาตรวจสอบความถูกต้องก่อนบันทึก'
                    : 'Note: Uploading data and changing images will take effect immediately after clicking "Save Game". Please verify before saving.'}
                </p>
              </div>
            </div>
          </div>

          {/* BOTTOM: คู่มือเติมเงิน — full width, stacked vertically */}
          <div className="rounded-2xl p-4 space-y-4" style={{ background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.25)" }}>
            <div className="flex items-center gap-2">
              <span style={{ color: "#818cf8", fontSize: 15 }}>✏️</span>
              <p className="text-sm font-bold" style={{ color: "#818cf8" }}>
                {lang === "th" ? "จัดการคู่มือเติมเงิน" : "Manage Top-Up Guide"}
              </p>
            </div>
            {/* วิธีเติมเงิน */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8" }}>
                {lang === "th" ? "วิธีเติมเงิน" : "How to Top-Up"}
              </label>
              <textarea rows={4} placeholder={lang === "th" ? "เช่น: 1. เลือกจำนวนเพชรที่ต้องการ..." : "e.g. 1. Select the diamond amount..."}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #2a3550", color: "#e2e8f0" }} />
            </div>
            {/* วิธีค้นหา UID */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8" }}>
                {lang === "th" ? "วิธีค้นหา UID" : "How to Find UID"}
              </label>
              <textarea rows={4} placeholder={lang === "th" ? "เช่น: เข้าไปในโปรไฟล์ และคัดลอกตัวเลขหลังชื่อ..." : "e.g. Go to your profile and copy the number after your name..."}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #2a3550", color: "#e2e8f0" }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition hover:bg-white/5"
            style={{ border: "1px solid #2a3550", color: "#94a3b8" }}>{t.modalClose}</button>
          <button onClick={() => { onSave(draft); onClose(); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
            style={{ background: "#111827", color: "#fff", border: "1px solid #334155" }}>{t.modalSave}</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════
export default function GameManagementPage() {
  const [lang, setLang]       = useState<"th"|"en">("th");
  const [games, setGames]     = useState(GAMES);
  const [catFilter, setCatFilter] = useState<Category|"all">("all");
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const [editGame, setEditGame] = useState<Game|null>(null);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const catMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) setShowCatMenu(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  const t = T[lang];

  const catLabel = (c: Category|"all") => {
    if (c === "all") return t.allCategory;
    const map: Record<Category,string> = {
      "MOBA": t.catMOBA, "FPS": t.catFPS, "RPG": t.catRPG,
      "Battle Royale": t.catBR, "Sports": t.catSports, "Strategy": t.catStrategy,
    };
    return map[c];
  };

  const uidLabel = (v: UIDFormat) => {
    if (v === "number_only")   return lang === "th" ? "Number Only (10 หลัก)" : "Number Only (10 digits)";
    if (v === "number_server") return "User#Tag / Server ID";
    return "UID + Server Selection";
  };

  // Filter
  const filtered = games.filter(g => {
    if (catFilter !== "all" && g.category !== catFilter) return false;
    const q = search.toLowerCase();
    if (q && !(lang === "th" ? g.nameTH : g.nameEN).toLowerCase().includes(q) && !g.id.toLowerCase().includes(q)) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const activeCount  = games.filter(g => g.enabled).length;
  const offlineCount = games.filter(g => !g.apiOnline).length;
  const apiErrCount  = games.filter(g => !g.apiOnline && g.enabled).length;

  const card = { background: "rgba(11,15,32,0.9)", border: "1px solid #1c2540" };

  return (
    <div className="flex flex-col min-h-full"
      style={{ background: "linear-gradient(160deg,#080c18 0%,#0a0e1e 60%,#060911 100%)", fontFamily: "'Noto Sans Thai','Inter',sans-serif" }}>

      {editGame && (
        <EditModal game={editGame} onClose={() => setEditGame(null)}
          onSave={g => setGames(p => p.map(x => x.id === g.id ? g : x))} t={t} lang={lang} />
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

        {/* Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t.pageTitle}</h1>
          <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{t.pageSubtitle}</p>
        </div>

        {/* ── 4 Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:t.totalGames,  value:games.length,  sub:t.items,   accent:"#38bdf8", bordered:false },
            { label:t.activeGames, value:activeCount,   sub:t.games,   accent:"#34d399", bordered:true  },
            { label:t.needsUpdate, value:offlineCount,  sub:t.games,   accent:"#fbbf24", bordered:true  },
            { label:t.apiError,    value:apiErrCount,   sub:t.points,  accent:"#f87171", bordered:true  },
          ].map((c, i) => (
            <div key={i} className="rounded-2xl p-4" style={c.bordered
              ? { background:"rgba(11,15,32,0.9)", border:`1px solid ${c.accent}40` }
              : card}>
              <p className="text-[11px] font-semibold mb-2" style={{ color: "#94a3b8" }}>{c.label}</p>
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: c.accent }}>{c.value}</p>
              <p className="text-xs mt-1" style={{ color: "#64748b" }}>{c.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Table card ── */}
        <div className="rounded-2xl overflow-hidden" style={card}>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 flex-wrap"
            style={{ borderBottom: "1px solid #1c2540" }}>
            {/* Category filter dropdown */}
            <div className="relative flex-shrink-0" ref={catMenuRef}>
              <button onClick={() => setShowCatMenu(o => !o)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition hover:bg-white/5"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid #2a3550", color: "#e2e8f0", minWidth: 120 }}>
                <span>{catLabel(catFilter)}</span>
                <ChevronDown size={12} style={{ color: "#64748b", transform: showCatMenu ? "rotate(180deg)" : "none", transition: ".18s" }} />
              </button>
              {showCatMenu && (
                <div className="absolute top-full left-0 mt-1.5 rounded-xl overflow-hidden z-30"
                  style={{ background: "#131929", border: "1px solid #2a3550", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", minWidth: 150 }}>
                  {(["all", ...CATEGORIES] as (Category|"all")[]).map(c => (
                    <button key={c} onClick={() => { setCatFilter(c); setPage(1); setShowCatMenu(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-left transition hover:bg-white/5"
                      style={{ color: catFilter === c ? "#38bdf8" : "#e2e8f0", borderBottom: "1px solid #1e293b" }}>
                      {catLabel(c)}
                      {catFilter === c && <Check size={11} style={{ color: "#38bdf8" }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export button */}
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition hover:opacity-80"
              style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.3)", color: "#38bdf8" }}>
              <Download size={13} />{t.exportBtn}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 640 }}>
              <thead>
                <tr style={{ background: "rgba(5,7,18,0.7)", borderBottom: "1px solid #1c2540" }}>
                  {[t.colName, t.colCategory, t.colUID, t.colAPI, t.colToggle, t.colActions].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-[11px] font-bold tracking-wide"
                      style={{ color: "#3a4a6a" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((g, i) => (
                  <tr key={g.id} className="hover:bg-white/[0.02] transition" style={{ borderBottom: "1px solid #0f1525" }}>
                    {/* Name + ID */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: `${g.color}18`, border: `1px solid ${g.color}30` }}>
                          {g.logo}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{lang === "th" ? g.nameTH : g.nameEN}</p>
                          <p className="text-[10px] font-mono mt-0.5" style={{ color: "#3a4a6a" }}>ID {g.id}</p>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${g.color}18`, color: g.color, border: `1px solid ${g.color}30` }}>
                        {catLabel(g.category)}
                      </span>
                    </td>
                    {/* UID Format */}
                    <td className="px-4 py-3 text-xs" style={{ color: "#94a3b8" }}>{uidLabel(g.uidFormat)}</td>
                    {/* API Status */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold"
                        style={{ color: g.apiOnline ? "#34d399" : "#f87171" }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: g.apiOnline ? "#34d399" : "#f87171", boxShadow: g.apiOnline ? "0 0 6px #34d399" : "none" }} />
                        {g.apiOnline ? t.statusOnline : t.statusOffline}
                      </span>
                    </td>
                    {/* Toggle */}
                    <td className="px-4 py-3">
                      <Toggle on={g.enabled} onChange={() => setGames(p => p.map(x => x.id === g.id ? { ...x, enabled: !x.enabled } : x))} />
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditGame(g)}
                          className="p-2 rounded-lg hover:bg-white/10 transition"
                          style={{ color: "#38bdf8", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)" }}>
                          <Edit2 size={13} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 flex-wrap gap-2"
            style={{ borderTop: "1px solid #1c2540" }}>
            <p className="text-xs" style={{ color: "#64748b" }}>
              {t.showingOf} {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} {t.of} {filtered.length} {t.total}
            </p>
            {(() => {
              const start = Math.max(1, page - 1);
              const end   = Math.min(totalPages - 1, page + 1);
              const pages: (number|"...")[] = [];
              for (let i = start; i <= end; i++) pages.push(i);
              if (end < totalPages - 1) pages.push("...");
              if (totalPages > end) pages.push(totalPages);
              return (
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition hover:bg-white/5"
                    style={{ color:page===1?"#3a4a6a":"#94a3b8", border:"1px solid #1c2540" }}>
                    <ChevronLeft size={13} />
                  </button>
                  {pages.map((n,i) => n==="..."
                    ? <span key={`e${i}`} className="w-6 text-center text-xs" style={{ color:"#3a4a6a" }}>…</span>
                    : <button key={n} onClick={() => setPage(n as number)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition hover:bg-white/5"
                        style={page===n
                          ? { background:"rgba(56,189,248,0.2)", color:"#38bdf8", border:"1px solid rgba(56,189,248,0.4)" }
                          : { color:"#64748b", border:"1px solid #1c2540" }}>{n}</button>
                  )}
                  <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition hover:bg-white/5"
                    style={{ color:page===totalPages?"#3a4a6a":"#94a3b8", border:"1px solid #1c2540" }}>
                    <ChevronRight size={13} />
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}