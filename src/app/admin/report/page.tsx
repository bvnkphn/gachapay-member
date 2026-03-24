"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Search, ChevronDown, Check, Bell, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, DollarSign, Calculator,
  Download, MoreVertical, Filter,
} from "lucide-react";

function FlagTH() {
  return <svg viewBox="0 0 30 20" width="28" height="18" style={{ borderRadius:3, display:"block" }}>
    <rect width="30" height="20" fill="#A51931"/><rect y="3.33" width="30" height="13.34" fill="#F4F5F8"/><rect y="6.67" width="30" height="6.66" fill="#2D2A4A"/>
  </svg>;
}
function FlagUK() {
  return <svg viewBox="0 0 60 40" width="28" height="18" style={{ borderRadius:3, display:"block" }}>
    <rect width="60" height="40" fill="#012169"/>
    <line x1="0" y1="0" x2="60" y2="40" stroke="white" strokeWidth="8"/><line x1="60" y1="0" x2="0" y2="40" stroke="white" strokeWidth="8"/>
    <line x1="0" y1="0" x2="60" y2="40" stroke="#C8102E" strokeWidth="4.8"/><line x1="60" y1="0" x2="0" y2="40" stroke="#C8102E" strokeWidth="4.8"/>
    <rect x="24" y="0" width="12" height="40" fill="white"/><rect x="0" y="14" width="60" height="12" fill="white"/>
    <rect x="26" y="0" width="8" height="40" fill="#C8102E"/><rect x="0" y="16" width="60" height="8" fill="#C8102E"/>
  </svg>;
}
const LANG_OPT=[{code:"th" as const,label:"ภาษาไทย",Flag:FlagTH},{code:"en" as const,label:"English",Flag:FlagUK}];

function LangDropdown({lang,setLang}:{lang:"th"|"en";setLang:(l:"th"|"en")=>void}){
  const[open,setOpen]=useState(false);const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h)},[]);
  const cur=LANG_OPT.find(o=>o.code===lang)!;
  return(
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen(o=>!o)} className="flex items-center gap-1 px-2 py-1.5 rounded-xl transition hover:bg-white/5" style={{background:"rgba(255,255,255,0.06)",border:"1px solid #1e293b"}}>
        <cur.Flag/><ChevronDown size={11} style={{color:"#64748b",transition:"transform .18s",transform:open?"rotate(180deg)":"none"}}/>
      </button>
      {open&&(<div className="absolute top-full right-0 mt-1.5 rounded-xl overflow-hidden z-50" style={{background:"#1a2235",border:"1px solid #1e293b",boxShadow:"0 8px 24px rgba(0,0,0,0.5)",minWidth:140}}>
        {LANG_OPT.map(o=>(
          <button key={o.code} onClick={()=>{setLang(o.code);setOpen(false)}} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-white/5" style={{borderBottom:o.code==="th"?"1px solid #1e293b":"none"}}>
            <o.Flag/><span className="text-[13px] font-medium" style={{color:lang===o.code?"#38bdf8":"#e2e8f0"}}>{o.label}</span>
            {lang===o.code&&<span className="ml-auto w-1.5 h-1.5 rounded-full" style={{background:"#38bdf8"}}/>}
          </button>
        ))}
      </div>)}
    </div>
  );
}

// ── i18n ──
const T={
  th:{
    title:"FINANCIAL OVERVIEW",
    subtitle:"วิเคราะห์รายได้ ต้นทุน และประสิทธิภาพการขาย",
    systemOnline:"ระบบออนไลน์",
    adminLabel:"แอดมิน",
    searchPh:"ค้นหารายงาน, รายการ...",
    export:"ส่งออกข้อมูล",
    totalRevenue:"TOTAL REVENUE",
    netProfit:"NET PROFIT",
    totalCost:"TOTAL COSTS",
    taxProv:"TAX PROVISION",
    vsLastMonth:"vs เดือนที่แล้ว",
    calcAuto:"คำนวณ VAT อัตโนมัติ",
    chartTitle:"รายได้เทียบกับต้นทุนการดำเนินงาน",
    chartSub:"เปรียบเทียบ Revenue, Cost และ Net Profit รายเดือน",
    revenue:"รายได้",
    cost:"ต้นทุน (Cost)",
    profitLabel:"กำไรสุทธิ",
    profitShare:"PROFIT SHARE",
    profitShareSub:"สัดส่วนกำไรตามเกม",
    total:"TOTAL",
    tableTitle:"พอร์ตโฟลิโอและยอดขายเกม",
    tableSub:(n:number)=>`จัดการข้อมูลยอดขายและโปรโมชั่นจากเกมทั้งหมดในระบบ (${n}+ รายการ)`,
    colNo:"#",
    colGame:"ชื่อเกม",
    colCat:"แนวเกม",
    colTx:"จำนวนรายการ",
    colRev:"รายได้สะสม",
    colMargin:"อัตรากำไร",
    colPromo:"โปรโมชั่น",
    colActions:"จัดการ",
    allCats:"ทุกแนวเกม",
    searchGamePh:"ค้นหาชื่อเกม...",
    showing:(s:number,e:number,total:number)=>`แสดงรายการที่ ${s} ถึง ${e} จาก ${total} เกม`,
    monthly:"รายเดือน",
    quarterly:"รายไตรมาส",
    yearly:"รายปี",
    avgMargin:"AVG. MARGIN",
    highest:"HIGHEST",
    noPromo:"ไม่มี",
  },
  en:{
    title:"FINANCIAL OVERVIEW",
    subtitle:"Analyze revenue, costs and sales performance",
    systemOnline:"System Online",
    adminLabel:"Admin",
    searchPh:"Search reports, records...",
    export:"Export Data",
    totalRevenue:"TOTAL REVENUE",
    netProfit:"NET PROFIT",
    totalCost:"TOTAL COSTS",
    taxProv:"TAX PROVISION",
    vsLastMonth:"vs last month",
    calcAuto:"VAT calculated automatically",
    chartTitle:"Revenue vs Operating Cost",
    chartSub:"Compare Revenue, Cost and Net Profit monthly",
    revenue:"Revenue",
    cost:"Cost",
    profitLabel:"Net Profit",
    profitShare:"PROFIT SHARE",
    profitShareSub:"Profit share by game",
    total:"TOTAL",
    tableTitle:"Game Portfolio & Sales",
    tableSub:(n:number)=>`Manage sales data and promotions from all games in the system (${n}+ items)`,
    colNo:"#",
    colGame:"Game Name",
    colCat:"Category",
    colTx:"Transactions",
    colRev:"Revenue",
    colMargin:"Profit Margin",
    colPromo:"Promotion",
    colActions:"Actions",
    allCats:"All Categories",
    searchGamePh:"Search game...",
    showing:(s:number,e:number,total:number)=>`Showing ${s}–${e} of ${total} games`,
    monthly:"Monthly",
    quarterly:"Quarterly",
    yearly:"Yearly",
    avgMargin:"AVG. MARGIN",
    highest:"HIGHEST",
    noPromo:"None",
  },
};

// ── Game Data ──
type Cat="MOBA"|"FPS"|"RPG"|"Battle Royale"|"Sports"|"Strategy"|"Action"|"Simulation"|"Racing"|"Adventure";
interface Game{id:number;name:string;category:Cat;txCount:number;revenue:number;cost:number;profit:number;margin:number;promo:"FLASH SALE"|"HAPPY HOUR"|""}

const BASE:Record<Cat,string[]>={
  "MOBA":["Mobile Legends","Arena of Valor","Honor of Kings","Wild Rift","Dota 2","Pokémon Unite","Smite","Vainglory","Heroes Evolved","MLBB Advance","League of Legends M","Strike of Kings","Heroes Arena","Onmyoji Arena","Era of Celestials","Legendary Heroes","Infinix Arena","Cyber Arena","Storm Mobile","Titan Kings","Magic Chess GO","Realm of Valor","Mythic Heroes"],
  "FPS":["PUBG Mobile","Free Fire","Call of Duty Mobile","Valorant","CS2 Mobile","Overwatch Mobile","Apex Legends Mobile","Battlefield Mobile","Critical Ops","Standoff 2","Modern Combat 5","N.O.V.A. Legacy","Dead Trigger 2","Combat Master","Delta Force Mobile","Warface Mobile","Creative Destruction","Cyber Hunter","ScarFall","Rules of Survival","Garena AOV","Fortnite Mobile","Crossfire Mobile"],
  "RPG":["Genshin Impact","Honkai Star Rail","Zenless Zone Zero","Wuthering Waves","Tower of Fantasy","Black Desert Mobile","Ni No Kuni CW","Final Fantasy VII","Lineage W","Ragnarok Origin","Dragon Raja","AFK Arena","Raid Shadow Legends","Epic Seven","Brown Dust 2","Goddess of Victory","King's Raid","Seven Knights","Exos Heroes","Lord of Heroes","Guardian Tales","Langrisser Mobile"],
  "Battle Royale":["PUBG Battlegrounds","Free Fire MAX","Fortnite","PUBG New State","Naraka Bladepoint","Battlegrounds Mobile","Sigma Battle Royale","Knives Out","Cyber Hunter BR","Danger Close","Battleland Royale","Super Squad","Zooba","Grand Battle Royale","Mini Militia","Blockman Go BR","Farlight 84","Omega Legends","Next Island","Island War","Fort Stars","Survival Heroes"],
  "Sports":["FIFA Mobile","NBA 2K Mobile","eFootball 2025","F1 Mobile Racing","Madden NFL Mobile","MLB Perfect Inning","Rocket League Sideswipe","PGA Tour Golf","NBA Live Mobile","UFC Mobile 2","Golf Clash","Mini Golf King","Asphalt Street Storm","Motor Fest Mobile","Real Football","Top Eleven","Soccer Manager","Dream League Soccer","Score Match","Football Strike","Road to Valor","Stick Cricket"],
  "Strategy":["Clash of Clans","Clash Royale","Rise of Kingdoms","Lords Mobile","State of Survival","Last Shelter","Age of Z","Evony","Art of War","Top War","Call of Dragons","Wild Castle","Kingdom Guard","Puzzles Survival","Whiteout Survival","Guns of Glory","Iron Throne","Mobile Strike","Game of War","Dawn of Zombies","Stormfall Saga","Empire Warriors"],
  "Action":["Shadow Fight 3","Mortal Kombat Mobile","Injustice 2","Shadow Fight Arena","Asphalt 9","Infinity Blade","Oceanhorn 2","Sky Force Reloaded","Badminton Clash","Tennis Clash","Archero","Soul Knight","Pascal's Wager","Dead Cells Mobile","Grimvalor","Another Eden","World of Demons","Darkness Rises","Dynasty Warriors","Iron Blade","Flip Diving","Bullet Force"],
  "Simulation":["Stardew Valley","Hay Day","Township","My Café","Family Island","Cooking Fever","Cooking Craze","Cooking Dash","Restaurant Story","Bakery Story","Minicraft","Block Craft 3D","House Flip","Home Design Makeover","Design Home","Homecraft","My Home Design","Merge Mansion","Merge Gardens","Travel Town","Seaside Escape","Cooking City"],
  "Racing":["Asphalt 8 Airborne","Asphalt 9 Legends","Real Racing 3","CSR Racing 2","Need for Speed Mobile","Road Rush Cars","Traffic Rider","Moto Rider GO","Beach Buggy Racing","Mini Motor Racing","CarX Drift Racing","Drift Max Pro","Nitro Nation","Rebel Racing","Grid Autosport","Formula Rush","Riptide GP2","Jet Ski Racing","Offroad Outlaws","Hot Wheels","Mario Kart Tour","Sonic Racing"],
  "Adventure":["Alto's Odyssey","Minecraft","LEGO Tower","Among Us","Terraria","The Room","Monument Valley","Monument Valley 2","Florence","Prune","Leo's Fortune","Limbo Mobile","Badland","Oddmar","Vandals","Framed","Evo Explores","Lumino City","The Gardens Between","Mekorama","Kenshō","Oxenfree II"],
};
const REGIONS=["Thai","Global","SEA","Asia"];
const PROMOS:Game["promo"][]=["FLASH SALE","HAPPY HOUR","","","","","","","",""];

function seededRng(seed:number){let s=seed;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}

const ALL_GAMES:Game[]=(() => {
  const rand=seededRng(42);
  const ri=(min:number,max:number)=>Math.floor(rand()*(max-min+1))+min;
  const games:Game[]=[];let id=1;
  for(const cat of Object.keys(BASE) as Cat[]){
    for(const name of BASE[cat]){
      const region=REGIONS[Math.floor(rand()*4)];
      const rev=ri(48000,1800000);const cost=Math.floor(rev*(0.60+rand()*0.22));
      const profit=rev-cost;const margin=Math.round(profit/rev*1000)/10;
      games.push({id,name:`${name} ${region} #${id}`,category:cat,txCount:ri(200,6000),revenue:rev,cost,profit,margin,promo:PROMOS[Math.floor(rand()*10)]});
      id++;
    }
  }
  return games;
})();

const CATS=Object.keys(BASE) as Cat[];
const PAGE_SIZE=10;

// ── Monthly chart data ──
const MONTHS_TH=["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const MONTHS_EN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHLY=[
  {rev:320000,cost:235000,profit:85000},{rev:280000,cost:210000,profit:70000},
  {rev:590000,cost:430000,profit:160000},{rev:440000,cost:325000,profit:115000},
  {rev:510000,cost:375000,profit:135000},{rev:760000,cost:555000,profit:205000},
  {rev:620000,cost:455000,profit:165000},{rev:580000,cost:425000,profit:155000},
  {rev:695000,cost:508000,profit:187000},{rev:530000,cost:390000,profit:140000},
  {rev:480000,cost:352000,profit:128000},{rev:665000,cost:489000,profit:176000},
];

// ── Donut data — fixed percentages matching screenshot ──
const DONUT=[
  {name:"MLBB",   pct:38,color:"#34d399"},
  {name:"Free Fire",pct:28,color:"#f59e0b"},
  {name:"PUBG",   pct:22,color:"#818cf8"},
  {name:"Genshin",pct:12,color:"#f87171"},
];

function fmt(n:number){if(n>=1e6)return"฿"+(n/1e6).toFixed(2)+"M";if(n>=1000)return"฿"+(n/1000).toFixed(0)+"k";return"฿"+n.toLocaleString();}
function fmtFull(n:number){return"฿"+n.toLocaleString("th-TH");}

// ── Sparkline ──
function Sparkline({data,color}:{data:number[];color:string}){
  const mn=Math.min(...data),mx=Math.max(...data);
  const norm=data.map(v=>1-(v-mn)/(mx-mn||1));
  const W=200,H=48,step=W/(data.length-1);
  const pts=norm.map((y,i)=>`${i*step},${y*(H-6)+3}`).join(" ");
  return(<svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:48,display:"block"}}>
    <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points={`0,${H} ${pts} ${W},${H}`} fill={color} fillOpacity={0.08}/>
  </svg>);
}

// ── Bar+Line Chart ──
function BarLineChart({lang}:{lang:"th"|"en"}){
  const W=680,H=260,PT=20,PB=40,PL=52,PR=16;
  const months=lang==="th"?MONTHS_TH:MONTHS_EN;
  const maxV=Math.max(...MONTHLY.map(m=>m.rev));
  const cW=W-PL-PR,cH=H-PT-PB;
  const bW=cW/MONTHLY.length*0.2,gap=cW/MONTHLY.length;
  const xOf=(i:number)=>PL+i*gap+gap/2;
  const yOf=(v:number)=>PT+cH*(1-v/maxV);
  const linePts=MONTHLY.map((m,i)=>`${xOf(i)},${yOf(m.profit)}`).join(" ");
  return(
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",display:"block"}}>
      {[0,0.25,0.5,0.75,1].map(r=>{
        const y=PT+cH*r;
        return<g key={r}>
          <line x1={PL} y1={y} x2={W-PR} y2={y} stroke="#1c2540" strokeWidth={1} strokeDasharray={r===0?"none":"3,5"}/>
          <text x={PL-6} y={y+4} textAnchor="end" fontSize={9} fill="#3a4a6a">฿{Math.round((1-r)*maxV/1000)}k</text>
        </g>;
      })}
      {MONTHLY.map((m,i)=>{
        const cx=xOf(i);
        return<g key={i}>
          <rect x={cx-bW*1.2} y={yOf(m.rev)} width={bW} height={cH*(m.rev/maxV)} rx={2} fill="#34d399" opacity={0.85}/>
          <rect x={cx-bW*0.1} y={yOf(m.cost)} width={bW} height={cH*(m.cost/maxV)} rx={2} fill="#f87171" opacity={0.85}/>
          <text x={cx} y={H-PB+14} textAnchor="middle" fontSize={9} fill="#64748b">{months[i]}</text>
        </g>;
      })}
      <polyline points={linePts} fill="none" stroke="#38bdf8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {MONTHLY.map((m,i)=><circle key={i} cx={xOf(i)} cy={yOf(m.profit)} r={3} fill="#38bdf8"/>)}
    </svg>
  );
}

// ── Donut — fills full card height ──
function DonutChart({t}:{t:typeof T["th"]}){
  const R=72,SW=18,cx=90,cy=90,circ=2*Math.PI*R;
  let cumPct=0;
  return(
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="mb-4">
        <p className="text-xs font-bold text-white mb-0.5">{t.profitShare}</p>
        <p className="text-[10px]" style={{color:"#64748b"}}>{t.profitShareSub}</p>
      </div>

      {/* donut centered */}
      <div className="flex flex-col items-center flex-1 justify-center gap-5">
        <svg width={180} height={180} viewBox="0 0 180 180">
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#1c2540" strokeWidth={SW}/>
          {DONUT.map((g,i)=>{
            const dashLen=(g.pct/100)*circ;
            const offset=circ-(cumPct/100)*circ;
            cumPct+=g.pct;
            return<circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={g.color} strokeWidth={SW}
              strokeDasharray={`${dashLen} ${circ-dashLen}`}
              strokeDashoffset={offset}
              style={{transform:"rotate(-90deg)",transformOrigin:"50% 50%"}}/>;
          })}
          <text x={cx} y={cy-6} textAnchor="middle" fontSize={10} fill="#94a3b8" fontWeight={600}>{t.total}</text>
          <text x={cx} y={cx+16} textAnchor="middle" fontSize={22} fill="#fff" fontWeight={700}>100%</text>
        </svg>

        {/* legend */}
        <div className="w-full space-y-2">
          {DONUT.map((g,i)=>(
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{background:g.color}}/>
                <span className="text-xs font-medium" style={{color:"#94a3b8"}}>{g.name}</span>
              </div>
              <span className="text-xs font-bold text-white">{g.pct}.0%</span>
            </div>
          ))}
        </div>
      </div>

      {/* footer stats */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4" style={{borderTop:"1px solid #1c2540"}}>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{color:"#3a4a6a"}}>{t.avgMargin}</p>
          <p className="text-base font-bold" style={{color:"#34d399"}}>25.7%</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{color:"#3a4a6a"}}>{t.highest}</p>
          <p className="text-base font-bold" style={{color:"#38bdf8"}}>MLBB</p>
        </div>
      </div>
    </div>
  );
}

// ── Category Dropdown ──
function CatDrop({cat,setCat,t}:{cat:Cat|"all";setCat:(c:Cat|"all")=>void;t:typeof T["th"]}){
  const[open,setOpen]=useState(false);const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h)},[]);
  return(
    <div className="relative flex-shrink-0" ref={ref}>
      <button onClick={()=>setOpen(o=>!o)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition"
        style={{background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.25)",color:"#38bdf8",minWidth:140}}>
        <Filter size={12} style={{flexShrink:0}}/>
        <span className="flex-1 text-left truncate">{cat==="all"?t.allCats:cat}</span>
        <ChevronDown size={11} style={{color:"#38bdf8",transform:open?"rotate(180deg)":"none",transition:".18s",flexShrink:0}}/>
      </button>
      {open&&(
        <div className="absolute top-full left-0 mt-1.5 rounded-xl overflow-hidden z-30"
          style={{background:"#131929",border:"1px solid #1e293b",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",minWidth:160}}>
          {(["all",...CATS] as (Cat|"all")[]).map(c=>(
            <button key={c} onClick={()=>{setCat(c);setOpen(false)}} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left transition hover:bg-white/5"
              style={{color:cat===c?"#38bdf8":"#e2e8f0",borderBottom:"1px solid #1e293b"}}>
              {cat===c&&<Check size={11} style={{color:"#38bdf8",flexShrink:0}}/>}
              <span className={cat===c?"":"ml-4"}>{c==="all"?t.allCats:c}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// Main
// ══════════════════════════════════════════════════════
export default function FinancialPage(){
  const[lang,setLang]=useState<"th"|"en">("th");
  const[year,setYear]=useState(2026);
  const[period,setPeriod]=useState<"monthly"|"quarterly"|"yearly">("monthly");
  const[catFilter,setCatFilter]=useState<Cat|"all">("all");
  const[search,setSearch]=useState("");
  const[page,setPage]=useState(1);
  const t=T[lang];
  const card={background:"rgba(11,15,32,0.9)",border:"1px solid #1c2540"};

  const filtered=useMemo(()=>ALL_GAMES.filter(g=>{
    if(catFilter!=="all"&&g.category!==catFilter)return false;
    if(search&&!g.name.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  }),[catFilter,search]);

  const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const pageGames=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
  useEffect(()=>setPage(1),[catFilter,search]);

  const totRev=ALL_GAMES.reduce((s,g)=>s+g.revenue,0);
  const totProf=ALL_GAMES.reduce((s,g)=>s+g.profit,0);
  const totCost=ALL_GAMES.reduce((s,g)=>s+g.cost,0);
  const totVat=Math.round(totRev*0.07);

  const spRev=MONTHLY.map(m=>m.rev);
  const spProf=MONTHLY.map(m=>m.profit);
  const spCost=MONTHLY.map(m=>m.cost);
  const spVat=MONTHLY.map(m=>Math.round(m.rev*0.07));

  // ── Period tabs — fixed: no "as const" on tuple array ──
  const periodTabs: Array<["monthly"|"quarterly"|"yearly", string]> = [
    ["monthly",  t.monthly],
    ["quarterly",t.quarterly],
    ["yearly",   t.yearly],
  ];

  const getPages=()=>{
    const pages: Array<number|"...">=[];
    const start=Math.max(1,page-1),end=Math.min(totalPages-1,page+1);
    for(let i=start;i<=end;i++)pages.push(i);
    if(end<totalPages-1)pages.push("...");
    if(totalPages>end)pages.push(totalPages);
    return pages;
  };

  return(
    <div className="flex flex-col min-h-full" style={{background:"linear-gradient(160deg,#080c18 0%,#0a0e1e 60%,#060911 100%)",fontFamily:"'Noto Sans Thai','Inter',sans-serif"}}>

      {/* ── TOPBAR ── */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 flex-shrink-0"
        style={{background:"#111827",borderBottom:"1px solid #1e293b",minHeight:52}}>
        <div className="flex items-center gap-2 flex-1 min-w-0 max-w-sm rounded-xl px-3 py-2"
          style={{background:"rgba(255,255,255,0.05)",border:"1px solid #1e293b"}}>
          <Search size={13} style={{color:"#64748b",flexShrink:0}}/>
          <input placeholder={t.searchPh}
            className="bg-transparent outline-none text-xs text-white placeholder-[#3a4a6a] w-full min-w-0"/>
        </div>
        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{background:"#fff",color:"#0f172a"}}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>
            {t.systemOnline}
          </div>
          <LangDropdown lang={lang} setLang={setLang}/>
          <button className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5"
            style={{border:"1px solid #1e293b"}}>
            <Bell size={15} style={{color:"#94a3b8"}}/>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500"/>
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{background:"linear-gradient(135deg,#38bdf8,#818cf8)"}}>
            <span className="text-white text-xs font-bold">A</span>
          </button>
          <span className="text-sm font-semibold text-white hidden md:block">{t.adminLabel}</span>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 p-4 sm:p-5 space-y-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">{t.title}</h1>
            <p className="text-xs mt-1" style={{color:"#64748b"}}>{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Year nav */}
            <div className="flex items-center gap-1 rounded-xl px-3 py-2"
              style={{background:"rgba(255,255,255,0.05)",border:"1px solid #1e293b"}}>
              <button onClick={()=>setYear(y=>y-1)} className="p-0.5 rounded hover:bg-white/10"
                style={{color:"#64748b"}}><ChevronLeft size={14}/></button>
              <span className="text-xs font-bold text-white px-2 flex items-center gap-1.5">
                <span style={{color:"#34d399",fontSize:10}}>📅</span>{year}
              </span>
              <button onClick={()=>setYear(y=>y+1)} className="p-0.5 rounded hover:bg-white/10"
                style={{color:"#64748b"}}><ChevronRight size={14}/></button>
            </div>

            {/* Period tabs — fixed TS error */}
            {periodTabs.map(([k,label])=>(
              <button key={k} onClick={()=>setPeriod(k)}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition"
                style={period===k
                  ?{background:"rgba(56,189,248,0.15)",color:"#38bdf8",border:"1px solid rgba(56,189,248,0.35)"}
                  :{background:"rgba(255,255,255,0.04)",color:"#64748b",border:"1px solid #1e293b"}}>
                {label}
              </button>
            ))}

            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition hover:opacity-90"
              style={{background:"rgba(56,189,248,0.12)",border:"1px solid rgba(56,189,248,0.3)",color:"#38bdf8"}}>
              <Download size={12}/>{t.export}
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {label:t.totalRevenue,value:fmtFull(totRev), chg:"+15.3%",up:true, sub:t.vsLastMonth, Icon:DollarSign,  accent:"#34d399",bg:"rgba(52,211,153,0.1)", spark:spRev},
            {label:t.netProfit,   value:fmtFull(totProf),chg:"+22.8%",up:true, sub:t.vsLastMonth, Icon:TrendingUp,  accent:"#38bdf8",bg:"rgba(56,189,248,0.1)", spark:spProf},
            {label:t.totalCost,   value:fmtFull(totCost),chg:"+12.1%",up:false,sub:t.vsLastMonth, Icon:TrendingDown,accent:"#f59e0b",bg:"rgba(245,158,11,0.1)", spark:spCost},
            {label:t.taxProv,     value:fmtFull(totVat), chg:"VAT 7%",up:true, sub:t.calcAuto,    Icon:Calculator, accent:"#a78bfa",bg:"rgba(167,139,250,0.1)",spark:spVat},
          ].map((s,i)=>(
            <div key={i} className="rounded-2xl p-4 overflow-hidden relative" style={card}>
              <div className="absolute top-2 right-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{background:`${s.accent}20`,color:s.accent,border:`1px solid ${s.accent}40`}}>
                  {s.chg}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{background:s.bg}}>
                <s.Icon size={16} style={{color:s.accent}}/>
              </div>
              <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{color:"#64748b"}}>{s.label}</p>
              <p className="text-sm sm:text-lg font-extrabold text-white mb-1 leading-tight">{s.value}</p>
              <p className="text-[9px] mb-2" style={{color:"#3a4a6a"}}>{s.sub}</p>
              <Sparkline data={s.spark} color={s.accent}/>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          <div className="lg:col-span-2 rounded-2xl p-4 sm:p-5" style={card}>
            <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
              <div>
                <p className="text-sm font-bold text-white">{t.chartTitle}</p>
                <p className="text-[11px] mt-0.5" style={{color:"#64748b"}}>{t.chartSub}</p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                {[
                  {label:t.revenue,    color:"#34d399"},
                  {label:t.cost,       color:"#f87171"},
                  {label:t.profitLabel,color:"#38bdf8"},
                ].map(l=>(
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{background:l.color}}/>
                    <span className="text-[10px] font-semibold" style={{color:"#94a3b8"}}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <BarLineChart lang={lang}/>
          </div>
          <div className="rounded-2xl p-4 sm:p-5 flex flex-col" style={card}>
            <DonutChart t={t}/>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={card}>
          <div className="px-4 sm:px-5 py-4" style={{borderBottom:"1px solid #1c2540"}}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-bold text-white">{t.tableTitle}</p>
                <p className="text-[11px] mt-0.5" style={{color:"#64748b"}}>{t.tableSub(ALL_GAMES.length)}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <CatDrop cat={catFilter} setCat={setCatFilter} t={t}/>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{background:"rgba(255,255,255,0.04)",border:"1px solid #1e293b",minWidth:160}}>
                  <Search size={12} style={{color:"#64748b",flexShrink:0}}/>
                  <input placeholder={t.searchGamePh} value={search}
                    onChange={e=>setSearch(e.target.value)}
                    className="bg-transparent outline-none text-xs text-white placeholder-[#3a4a6a] w-full min-w-0"/>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{minWidth:640}}>
              <thead>
                <tr style={{background:"rgba(5,7,18,0.7)",borderBottom:"1px solid #1c2540"}}>
                  {[t.colNo,t.colGame,t.colCat,t.colTx,t.colRev,t.colMargin,t.colPromo,t.colActions].map(h=>(
                    <th key={h} className="px-3 sm:px-4 py-3 text-left font-bold tracking-wide"
                      style={{color:"#3a4a6a"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageGames.map((g,i)=>{
                  const rank=(page-1)*PAGE_SIZE+i+1;
                  return(
                    <tr key={g.id} className="hover:bg-white/[0.02] transition"
                      style={{borderBottom:"1px solid #0a0f1e"}}>
                      <td className="px-3 sm:px-4 py-3">
                        <span className="font-bold" style={{color:"#64748b"}}>#{rank}</span>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <p className="font-bold text-white">{g.name}</p>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{background:"rgba(56,189,248,0.08)",color:"#64748b",border:"1px solid #1c2540"}}>
                          {g.category}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 font-semibold text-white">
                        {g.txCount.toLocaleString()}
                      </td>
                      <td className="px-3 sm:px-4 py-3 font-mono font-bold" style={{color:"#34d399"}}>
                        {fmt(g.revenue)}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-full overflow-hidden"
                            style={{background:"#1c2540",height:5,minWidth:50}}>
                            <div className="h-full rounded-full"
                              style={{width:`${Math.min(g.margin,50)*2}%`,background:"#34d399"}}/>
                          </div>
                          <span className="text-[10px] font-bold flex-shrink-0" style={{color:"#34d399"}}>
                            {g.margin}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        {g.promo
                          ?<span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={g.promo==="FLASH SALE"
                              ?{background:"rgba(248,113,113,0.15)",color:"#f87171",border:"1px solid rgba(248,113,113,0.35)"}
                              :{background:"rgba(56,189,248,0.15)",color:"#38bdf8",border:"1px solid rgba(56,189,248,0.35)"}}>
                            {g.promo}
                          </span>
                          :<span style={{color:"#3a4a6a"}}>—</span>}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <button className="p-1.5 rounded-lg hover:bg-white/10 transition"
                          style={{color:"#64748b"}}><MoreVertical size={13}/></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 flex-wrap gap-2"
            style={{borderTop:"1px solid #1c2540"}}>
            <p className="text-[11px]" style={{color:"#64748b"}}>
              {t.showing((page-1)*PAGE_SIZE+1,Math.min(page*PAGE_SIZE,filtered.length),filtered.length)}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition hover:bg-white/5"
                style={{color:page===1?"#3a4a6a":"#94a3b8",border:"1px solid #1c2540"}}>
                <ChevronLeft size={13}/>
              </button>
              {getPages().map((n,i)=>n==="..."
                ?<span key={`e${i}`} className="w-6 text-center text-xs" style={{color:"#3a4a6a"}}>…</span>
                :<button key={n} onClick={()=>setPage(n as number)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition hover:bg-white/5"
                  style={page===n
                    ?{background:"rgba(56,189,248,0.2)",color:"#38bdf8",border:"1px solid rgba(56,189,248,0.4)"}
                    :{color:"#64748b",border:"1px solid #1c2540"}}>
                  {n}
                </button>
              )}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition hover:bg-white/5"
                style={{color:page===totalPages?"#3a4a6a":"#94a3b8",border:"1px solid #1c2540"}}>
                <ChevronRight size={13}/>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}