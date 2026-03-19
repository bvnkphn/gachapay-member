"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, Shield, Info } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Package {
  id: string;
  gems: number;
  bonus?: number;
  price: number;
  originalPrice?: number;
  badge?: string;
  badgeColor?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  desc: string;
  tag: string;
  iconBg: string;
  emoji: string;
}

interface Game {
  id: string;
  name: string;
  emoji: string;
  tag: string;
  currency: string;
  packages: Package[];
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const GAMES: Game[] = [
  {
    id: "freefire",
    name: "Free Fire",
    emoji: "🔥",
    tag: "Battle Royale · Mobile",
    currency: "Diamonds",
    packages: [
      { id: "p1", gems: 100, price: 35 },
      { id: "p2", gems: 310, bonus: 31, price: 99, badge: "+31 โบนัส", badgeColor: "#06b6d4" },
      { id: "p3", gems: 520, bonus: 52, price: 165 },
      { id: "p4", gems: 1060, bonus: 106, price: 330 },
      { id: "p5", gems: 2180, bonus: 218, price: 660, badge: "ยอดนิยม", badgeColor: "#f59e0b" },
      { id: "p6", gems: 5600, bonus: 560, price: 1650, originalPrice: 1900, badge: "ราคาดี", badgeColor: "#ef4444" },
    ],
  },
  {
    id: "mlbb",
    name: "Mobile Legends",
    emoji: "⚔️",
    tag: "MOBA · Mobile",
    currency: "Diamonds",
    packages: [
      { id: "p1", gems: 56, price: 35 },
      { id: "p2", gems: 172, price: 99 },
      { id: "p3", gems: 257, price: 165 },
      { id: "p4", gems: 706, price: 330, badge: "ยอดนิยม", badgeColor: "#f59e0b" },
      { id: "p5", gems: 1412, price: 660 },
      { id: "p6", gems: 3688, price: 1650, originalPrice: 1900, badge: "ราคาดี", badgeColor: "#ef4444" },
    ],
  },
  {
    id: "pubg",
    name: "PUBG Mobile",
    emoji: "🎯",
    tag: "Battle Royale · Mobile",
    currency: "UC",
    packages: [
      { id: "p1", gems: 60, price: 35 },
      { id: "p2", gems: 180, bonus: 10, price: 99 },
      { id: "p3", gems: 325, bonus: 18, price: 165 },
      { id: "p4", gems: 660, bonus: 37, price: 330, badge: "ยอดนิยม", badgeColor: "#f59e0b" },
      { id: "p5", gems: 1800, bonus: 100, price: 660 },
      { id: "p6", gems: 4500, bonus: 250, price: 1650, badge: "ราคาดี", badgeColor: "#ef4444" },
    ],
  },
];

const SERVERS = ["Asia", "NA", "EU", "SAC", "MENA"];

interface PaymentGroup {
  label: string;
  methods: PaymentMethod[];
}

const PAYMENT_GROUPS: PaymentGroup[] = [
  {
    label: "ช่องทางไทย",
    methods: [
      { id: "promptpay", name: "PromptPay", desc: "สแกน QR Code ชำระเงินทันที", tag: "ทันที · ฟรีค่าธรรมเนียม", iconBg: "#1a4fa3", emoji: "🏦" },
      { id: "truemoney", name: "TrueMoney Wallet", desc: "ชำระผ่าน TrueMoney Wallet", tag: "ทันที · ฟรีค่าธรรมเนียม", iconBg: "#e8581a", emoji: "🧡" },
      { id: "banking", name: "Mobile Banking", desc: "โอนผ่านแอปธนาคาร", tag: "1-5 นาที · ฟรีค่าธรรมเนียม", iconBg: "#0ea5e9", emoji: "🏛️" },
      { id: "seven", name: "7-Eleven", desc: "ชำระเงินที่ร้าน 7-Eleven", tag: "5-15 นาที · ค่าธรรมเนียม ฿15", iconBg: "#16a34a", emoji: "🏪" },
    ],
  },
  {
    label: "ช่องทางต่างประเทศ",
    methods: [
      { id: "card", name: "Credit/Debit Card", desc: "Visa, Mastercard, JCB", tag: "ทันที · ฟรีค่าธรรมเนียม", iconBg: "#6366f1", emoji: "💳" },
      { id: "paypal", name: "PayPal", desc: "ชำระผ่าน PayPal", tag: "ทันที · ฟรีค่าธรรมเนียม", iconBg: "#003087", emoji: "💲" },
    ],
  },
  {
    label: "คริปโตเคอเรนซี",
    methods: [
      { id: "usdt", name: "USDT (TRC20)", desc: "Tether Stablecoin", tag: "5-30 นาที · ฟรีค่าธรรมเนียม", iconBg: "#16a34a", emoji: "💵" },
      { id: "btc", name: "Bitcoin", desc: "BTC Network", tag: "10-60 นาที · ฟรีค่าธรรมเนียม", iconBg: "#f59e0b", emoji: "₿" },
    ],
  },
];

const PAYMENT_METHODS: PaymentMethod[] = PAYMENT_GROUPS.flatMap(g => g.methods);

const PROMPTPAY_PHONE = "0812345678";

// ─── PromptPay EMV QR Generator ───────────────────────────────────────────────

function crc16ccitt(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
    }
  }
  return ((crc & 0xffff).toString(16).toUpperCase()).padStart(4, "0");
}

function tlv(tag: string, value: string): string {
  return `${tag}${String(value.length).padStart(2, "0")}${value}`;
}

function buildPromptPayQR(phone: string, amount: number): string {
  const normalized = "0066" + phone.replace(/^0/, "");
  const merchantAccount = tlv("00", "A000000677010111") + tlv("01", normalized);
  const amtStr = amount.toFixed(2);
  const body =
    tlv("00", "01") +
    "010212" +
    tlv("29", merchantAccount) +
    tlv("53", "764") +
    tlv("54", amtStr) +
    tlv("58", "TH") +
    "6304";
  return body + crc16ccitt(body);
}

// ─── GF math for QR ───────────────────────────────────────────────────────────

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

const gfMul = (a: number, b: number) =>
  a === 0 || b === 0 ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]];

function rsEncode(data: number[], ecLen: number): number[] {
  let gen = [1];
  for (let i = 0; i < ecLen; i++) {
    const factor = [1, GF_EXP[i]];
    const res = new Array(gen.length + 1).fill(0);
    for (let a = 0; a < gen.length; a++)
      for (let b = 0; b < factor.length; b++)
        res[a + b] ^= gfMul(gen[a], factor[b]);
    gen = res;
  }
  const msg = [...data, ...new Array(ecLen).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const c = msg[i];
    if (c !== 0)
      for (let j = 0; j < gen.length; j++)
        msg[i + j] ^= gfMul(gen[j], c);
  }
  return msg.slice(data.length);
}

const VER_CAP_M = [0,13,22,34,48,64,84,93,122,154,180];
const VER_EC_M  = [0,10,16,26,36,48,64,72,88,110,130];

function makeQR(text: string): boolean[][] | null {
  const bytes = Array.from(text).map(c => c.charCodeAt(0) & 0xff);
  let ver = 1;
  while (ver <= 10 && VER_CAP_M[ver] < bytes.length) ver++;
  if (ver > 10) return null;

  const sz = ver * 4 + 17;
  const mat = Array.from({length: sz}, () => new Array(sz).fill(0));
  const fnc = Array.from({length: sz}, () => new Array(sz).fill(false));
  const setM = (r: number, c: number, v: number, f = false) => { mat[r][c] = v; if (f) fnc[r][c] = true; };

  const finder = (tr: number, tc: number) => {
    for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
      const rr = tr+r, cc = tc+c;
      if (rr < 0 || rr >= sz || cc < 0 || cc >= sz) continue;
      const v = (r===0||r===6||c===0||c===6) ? 1 : (r>=2&&r<=4&&c>=2&&c<=4) ? 1 : 0;
      setM(rr, cc, v, true);
    }
  };
  finder(0,0); finder(0,sz-7); finder(sz-7,0);

  for (let i = 8; i < sz-8; i++) {
    setM(6, i, i%2===0?1:0, true);
    setM(i, 6, i%2===0?1:0, true);
  }
  setM(sz-8, 8, 1, true);

  for (let i = 0; i <= 8; i++) {
    if (!fnc[8][i]) { mat[8][i]=0; fnc[8][i]=true; }
    if (!fnc[i][8]) { mat[i][8]=0; fnc[i][8]=true; }
    if (i < 8) { mat[sz-1-i][8]=0; fnc[sz-1-i][8]=true; mat[8][sz-1-i]=0; fnc[8][sz-1-i]=true; }
  }

  const aligCoords: Record<number,number[]> = {
    2:[6,18],3:[6,22],4:[6,26],5:[6,30],6:[6,34],
    7:[6,22,38],8:[6,24,42],9:[6,26,46],10:[6,28,50]
  };
  if (ver >= 2) {
    const coords = aligCoords[ver] ?? [];
    for (const pr of coords) for (const pc of coords) {
      if (fnc[pr][pc]) continue;
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
        const v = (Math.abs(dr)===2||Math.abs(dc)===2)?1:(dr===0&&dc===0)?1:0;
        setM(pr+dr, pc+dc, v, true);
      }
    }
  }

  const bits: number[] = [];
  const push = (val: number, n: number) => { for (let i=n-1;i>=0;i--) bits.push((val>>i)&1); };
  push(0b0100, 4);
  push(bytes.length, ver < 10 ? 8 : 16);
  for (const b of bytes) push(b, 8);
  const totalData = VER_CAP_M[ver] * 8;
  for (let i=0;i<4&&bits.length<totalData;i++) push(0,1);
  while (bits.length%8!==0) push(0,1);
  const pads=[0xec,0x11]; let pi=0;
  while (bits.length<totalData) { push(pads[pi%2],8); pi++; }

  const dataCW: number[] = [];
  for (let i=0;i<bits.length;i+=8) {
    let b=0; for(let j=0;j<8;j++) b=(b<<1)|(bits[i+j]??0);
    dataCW.push(b);
  }
  const ecCW = rsEncode(dataCW, VER_EC_M[ver]);
  const allCW = [...dataCW, ...ecCW];
  const finalBits: number[] = [];
  for (const cw of allCW) for (let i=7;i>=0;i--) finalBits.push((cw>>i)&1);
  const remBitsMap: Record<number,number> = {2:7,3:7,4:7,5:7,6:7};
  for (let i=0;i<(remBitsMap[ver]??0);i++) finalBits.push(0);

  let bitIdx=0, up=true;
  for (let right=sz-1;right>=1;right-=2) {
    if (right===6) right=5;
    for (let vert=0;vert<sz;vert++) {
      const row = up ? sz-1-vert : vert;
      for (let lr=0;lr<2;lr++) {
        const col=right-lr;
        if (!fnc[row][col]) { mat[row][col]=finalBits[bitIdx]??0; bitIdx++; }
      }
    }
    up=!up;
  }

  for (let r=0;r<sz;r++) for (let c=0;c<sz;c++)
    if (!fnc[r][c] && (r+c)%2===0) mat[r][c]^=1;

  const fmtSeq = [1,0,1,0,0,0,0,0,1,0,0,0,1,0,1];
  const fp1=[[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
  const fp2=[[sz-1,8],[sz-2,8],[sz-3,8],[sz-4,8],[sz-5,8],[sz-6,8],[sz-7,8],[8,sz-8],[8,sz-7],[8,sz-6],[8,sz-5],[8,sz-4],[8,sz-3],[8,sz-2],[8,sz-1]];
  for (let i=0;i<15;i++) {
    mat[fp1[i][0]][fp1[i][1]]=fmtSeq[i];
    mat[fp2[i][0]][fp2[i][1]]=fmtSeq[i];
  }

  return mat.map(row => row.map(v => v===1));
}

// ─── QR Canvas ────────────────────────────────────────────────────────────────

function QRCanvas({ data, size=220 }: { data: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const matrix = makeQR(data);
    if (!matrix) { ctx.fillStyle = "#fff"; ctx.fillRect(0,0,size,size); return; }
    const n = matrix.length;
    const cell = size / n;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,size,size);
    ctx.fillStyle = "#000000";
    for (let r=0;r<n;r++) for (let c=0;c<n;c++) {
      if (matrix[r][c])
        ctx.fillRect(Math.floor(c*cell), Math.floor(r*cell), Math.ceil(cell), Math.ceil(cell));
    }
  }, [data, size]);
  return <canvas ref={ref} width={size} height={size} style={{display:"block",borderRadius:8}} />;
}

// ─── Game Selector Dropdown ───────────────────────────────────────────────────

function GameSelector({ selectedGame, onSelect }: { selectedGame: Game; onSelect: (g: Game) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 rounded-2xl border border-slate-800/80 p-4 transition-all hover:border-slate-700"
        style={{ background: "rgba(15,23,42,0.9)" }}
      >
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
          {selectedGame.emoji}
        </div>
        <div className="flex-1 text-left">
          <div className="font-bold text-slate-100 text-sm">{selectedGame.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">คลิกเพื่อเปลี่ยนเกม</div>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 rounded-2xl border border-slate-800 overflow-hidden z-20"
            style={{ background: "rgba(10,15,35,0.98)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
          >
            {GAMES.map(game => (
              <button
                key={game.id}
                onClick={() => { onSelect(game); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors"
              >
                <span className="text-xl">{game.emoji}</span>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-200">{game.name}</div>
                  <div className="text-xs text-slate-500">{game.tag}</div>
                </div>
                {selectedGame.id === game.id && (
                  <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#06b6d4,#8b5cf6)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const steps = ["เลือกแพ็กเกจ", "กรอก ID", "ชำระเงิน"];
  return (
    <div className="flex items-start justify-center gap-0 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <div key={idx} className="flex items-start">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 flex-shrink-0"
                style={{
                  background: done
                    ? "linear-gradient(135deg,#06b6d4,#3b82f6)"
                    : active
                    ? "linear-gradient(135deg,#06b6d4,#8b5cf6)"
                    : "transparent",
                  border: done || active ? "none" : "2px solid #334155",
                  color: done || active ? "#fff" : "#475569",
                  boxShadow: active ? "0 0 24px rgba(6,182,212,0.6)" : "none",
                }}
              >
                {done ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : idx}
              </div>
              <span
                className="text-xs whitespace-nowrap"
                style={{
                  color: active ? "#06b6d4" : done ? "#64748b" : "#475569",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="h-0.5 mt-5 mx-1 flex-shrink-0 transition-all duration-500"
                style={{
                  width: 80,
                  background: current > idx
                    ? "linear-gradient(90deg,#06b6d4,#3b82f6)"
                    : "#1e293b",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Bottom Summary Bar ───────────────────────────────────────────────────────

function SummaryBar({
  selectedPkg,
  playerId,
  paymentMethod,
  step,
  totalPrice,
}: {
  selectedPkg: Package | null;
  playerId: string;
  paymentMethod: string;
  step: number;
  totalPrice: number;
}) {
  const progress = ((step - 1) / 2) * 100;
  const pm = PAYMENT_METHODS.find(p => p.id === paymentMethod);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800/80 backdrop-blur-xl" style={{ background: "rgba(2,6,23,0.97)" }}>
      <div className="max-w-[760px] mx-auto px-6 py-3">
        {/* Progress bar */}
        <div className="h-0.5 bg-slate-800 rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#06b6d4,#8b5cf6)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-xs text-slate-500">
              ขั้นตอน {step}/3
            </div>
            <div className="w-px h-3 bg-slate-700" />
            {selectedPkg ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">แพ็กเกจ</span>
                <span className="text-xs font-bold text-cyan-400">
                  {selectedPkg.gems.toLocaleString()} Diamonds
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-500">ยังไม่ได้เลือก</span>
            )}
            {playerId && (
              <>
                <div className="w-px h-3 bg-slate-700" />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Player ID</span>
                  <span className="text-xs font-bold text-slate-200">{playerId}</span>
                </div>
              </>
            )}
            {pm && (
              <>
                <div className="w-px h-3 bg-slate-700" />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-200">{pm.name}</span>
                </div>
              </>
            )}
            {!pm && (
              <>
                <div className="w-px h-3 bg-slate-700" />
                <span className="text-xs text-slate-500">ช่องทางชำระ-ยังไม่ได้เลือก</span>
              </>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-[10px] text-slate-500">ยอดชำระ</div>
            <div className="text-base font-extrabold" style={{ color: selectedPkg ? "#06b6d4" : "#334155" }}>
              {selectedPkg ? `฿${totalPrice.toLocaleString()}` : "—"}
            </div>
          </div>
        </div>
        {/* Step % */}
        <div className="flex justify-end mt-1">
          <span className="text-[10px] text-slate-600">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const backBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: "13px",
  borderRadius: 10,
  border: "1.5px solid #1e293b",
  background: "transparent",
  color: "#64748b",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
};

// ─── Step 1: Package Selection ────────────────────────────────────────────────

function PackageStep({
  game,
  onGameChange,
  selected,
  onSelect,
  onNext,
}: {
  game: Game;
  onGameChange: (g: Game) => void;
  selected: Package | null;
  onSelect: (p: Package) => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      key="s1"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      {/* Game Selector */}
      <GameSelector selectedGame={game} onSelect={onGameChange} />

      {/* Package section */}
      <div
        className="rounded-2xl border border-slate-800/80 p-6"
        style={{ background: "rgba(15,23,42,0.8)" }}
      >
        <h3 className="text-base font-bold text-slate-100 mb-5">เลือกแพ็กเกจ</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {game.packages.map((pkg) => {
            const isSel = selected?.id === pkg.id;
            return (
              <motion.div
                key={pkg.id}
                onClick={() => onSelect(pkg)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative rounded-xl p-4 cursor-pointer transition-all"
                style={{
                  background: isSel
                    ? "linear-gradient(135deg,rgba(6,182,212,0.12),rgba(139,92,246,0.08))"
                    : "rgba(10,15,30,0.6)",
                  border: isSel
                    ? "1.5px solid rgba(6,182,212,0.5)"
                    : "1.5px solid rgba(30,41,59,0.8)",
                  boxShadow: isSel ? "0 0 20px rgba(6,182,212,0.15)" : "none",
                }}
              >
                {/* Badge */}
                {pkg.badge && (
                  <div
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold text-white whitespace-nowrap z-10"
                    style={{ background: pkg.badgeColor ?? "#ef4444" }}
                  >
                    {pkg.badge}
                  </div>
                )}

                {/* Selected check */}
                {isSel && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#06b6d4,#8b5cf6)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}

                <div className="text-xl mb-1.5 mt-1">💎</div>
                <div className="font-extrabold text-lg text-slate-100 leading-tight">
                  {pkg.gems.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mb-2">{game.currency}</div>
                {pkg.bonus && (
                  <div className="text-[11px] text-emerald-400 font-semibold mb-1">
                    +{pkg.bonus} โบนัส
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800/60 mt-1">
                  {pkg.originalPrice && (
                    <div className="text-xs text-slate-600 line-through">
                      ฿{pkg.originalPrice.toLocaleString()}
                    </div>
                  )}
                  <div className="font-extrabold text-base" style={{ color: "#06b6d4" }}>
                    ฿{pkg.price.toLocaleString()}
                  </div>
                  {isSel ? (
                    <div className="text-[10px] text-cyan-500 mt-0.5">+{Math.floor(pkg.price / 10)} แต้ม</div>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            style={{
              ...backBtnStyle,
              opacity: 0.5,
            }}
            disabled
          >
            ย้อนกลับ
          </button>
          <motion.button
            onClick={() => selected && onNext()}
            whileHover={selected ? { scale: 1.02 } : {}}
            whileTap={selected ? { scale: 0.98 } : {}}
            className="flex-[3] py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
            style={{
              background: selected
                ? "linear-gradient(135deg,#06b6d4,#8b5cf6)"
                : "rgba(15,23,42,0.5)",
              color: selected ? "#fff" : "#334155",
              border: "none",
              cursor: selected ? "pointer" : "not-allowed",
              boxShadow: selected ? "0 4px 20px rgba(6,182,212,0.35)" : "none",
            }}
          >
            {selected ? "ถัดไป →" : "กรุณาเลือกแพ็กเกจ"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Step 2: Player Info ──────────────────────────────────────────────────────

function PlayerStep({
  uid, setUid,
  playerId, setPlayerId,
  server, setServer,
  onNext, onBack,
}: {
  uid: string; setUid: (v: string) => void;
  playerId: string; setPlayerId: (v: string) => void;
  server: string; setServer: (v: string) => void;
  onNext: () => void; onBack: () => void;
}) {
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  const validate = async () => {
    if (!uid.trim() || attempts >= MAX_ATTEMPTS) return;
    setValidating(true);
    setError("");
    setValidated(false);
    await new Promise(r => setTimeout(r, 1200));
    setAttempts(a => a + 1);
    if (uid.trim().length >= 4) {
      const names = ["RushKing", "CyberHero", "ShadowX", "NightWolf", "StarPlayer"];
      setNickname(names[Math.floor(Math.random() * names.length)]);
      setPlayerId(uid.trim());
      setValidated(true);
    } else {
      setError("ไม่พบผู้เล่น กรุณาตรวจสอบ UID อีกครั้ง");
    }
    setValidating(false);
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: "rgba(15,23,42,0.8)",
    border: "1.5px solid #1e293b",
    borderRadius: 10,
    padding: "12px 16px",
    color: "#e2e8f0",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  };

  return (
    <motion.div
      key="s2"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="rounded-2xl border border-slate-800/80 p-6 mb-4"
        style={{ background: "rgba(15,23,42,0.8)" }}
      >
        <h3 className="text-base font-bold text-slate-100 mb-5">
          กรอกข้อมูลผู้เล่น
        </h3>

        {/* UID */}
        <div className="mb-5">
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "#94a3b8" }}>
            UID / Player ID <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <input
              style={inputStyle}
              placeholder="กรอก UID ของคุณ"
              value={uid}
              onChange={e => { setUid(e.target.value); setValidated(false); setNickname(""); setError(""); }}
              onFocus={e => (e.target.style.borderColor = "#06b6d4")}
              onBlur={e => (e.target.style.borderColor = "#1e293b")}
            />
            <motion.button
              onClick={validate}
              disabled={!uid.trim() || validating || attempts >= MAX_ATTEMPTS}
              whileHover={uid.trim() && !validating && attempts < MAX_ATTEMPTS ? { scale: 1.03 } : {}}
              whileTap={uid.trim() && !validating && attempts < MAX_ATTEMPTS ? { scale: 0.97 } : {}}
              className="flex-shrink-0 px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              style={{
                background: uid.trim() && !validating && attempts < MAX_ATTEMPTS
                  ? "linear-gradient(135deg,#06b6d4,#8b5cf6)"
                  : "#1e293b",
                color: uid.trim() && !validating && attempts < MAX_ATTEMPTS ? "#fff" : "#475569",
                border: "none",
                cursor: uid.trim() && !validating && attempts < MAX_ATTEMPTS ? "pointer" : "not-allowed",
                minWidth: 90,
              }}
            >
              {validating ? (
                <span style={{ display:"inline-block", width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
              ) : (
                <>
                  <Shield className="h-3.5 w-3.5" />
                  ตรวจสอบข้อมูล
                </>
              )}
            </motion.button>
          </div>
          <div className="flex justify-end mt-1.5">
            <span className="text-[11px] text-slate-600">
              {attempts}/{MAX_ATTEMPTS} ครั้ง (Rate Limit per min)
            </span>
          </div>
        </div>

        {/* Server */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
            Server
          </label>
          <div className="relative">
            <select
              value={server}
              onChange={e => setServer(e.target.value)}
              className="w-full appearance-none rounded-xl text-slate-200 text-sm font-medium px-4 py-3 pr-10 outline-none transition-colors"
              style={{
                background: "rgba(15,23,42,0.8)",
                border: "1.5px solid #1e293b",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
              onFocus={e => (e.target.style.borderColor = "#06b6d4")}
              onBlur={e => (e.target.style.borderColor = "#1e293b")}
            >
              {SERVERS.map(s => (
                <option key={s} value={s} style={{ background: "#0f172a" }}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Validation result */}
        <AnimatePresence>
          {(validated || error) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center gap-3 rounded-xl p-3.5"
              style={{
                background: validated ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                border: `1.5px solid ${validated ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: validated
                    ? "linear-gradient(135deg,#06b6d4,#10b981)"
                    : "linear-gradient(135deg,#ef4444,#f97316)",
                }}
              >
                {validated ? "✓" : "✗"}
              </div>
              <div>
                {validated ? (
                  <>
                    <div className="text-xs text-emerald-400 mb-0.5">ตรวจสอบสำเร็จ</div>
                    <div className="text-sm font-bold text-slate-100">{nickname}</div>
                  </>
                ) : (
                  <>
                    <div className="text-xs text-red-400 mb-0.5">ไม่พบผู้เล่น</div>
                    <div className="text-sm text-slate-400">{error}</div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-3">
        <motion.button onClick={onBack} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} style={backBtnStyle}>
          ย้อนกลับ
        </motion.button>
        <motion.button
          onClick={() => validated && onNext()}
          whileHover={validated ? { scale: 1.02 } : {}}
          whileTap={validated ? { scale: 0.98 } : {}}
          className="flex-[3] py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all"
          style={{
            background: validated ? "linear-gradient(135deg,#06b6d4,#8b5cf6)" : "rgba(15,23,42,0.5)",
            color: validated ? "#fff" : "#334155",
            border: "none",
            cursor: validated ? "pointer" : "not-allowed",
            boxShadow: validated ? "0 4px 20px rgba(6,182,212,0.35)" : "none",
          }}
        >
          ถัดไป →
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Step 3: Checkout ─────────────────────────────────────────────────────────

function CheckoutStep({
  game,
  selectedPkg,
  playerId,
  uid,
  paymentMethod,
  setPaymentMethod,
  onBack,
  onSuccess,
  onShowQRStep,
}: {
  game: Game;
  selectedPkg: Package | null;
  playerId: string;
  uid: string;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  onBack: () => void;
  onSuccess: () => void;
  onShowQRStep: () => void;
}) {
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponErr, setCouponErr] = useState("");
  const [couponOk, setCouponOk] = useState(false);
  const [paying, setPaying] = useState(false);
  const [nickname] = useState(`RushKing`);

  const base = selectedPkg?.price ?? 0;
  const discAmt = Math.round(base * discount);
  const total = base - discAmt;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === "CYBER10" || code === "VIP15") {
      const pct = code === "VIP15" ? 0.15 : 0.10;
      setDiscount(pct); setCouponOk(true); setCouponErr("");
    } else {
      setCouponErr("โค้ดไม่ถูกต้องหรือหมดอายุแล้ว"); setDiscount(0); setCouponOk(false);
    }
  };

  const pay = async () => {
    if (!paymentMethod) return;
    if (paymentMethod === "promptpay" || paymentMethod === "truemoney" || paymentMethod === "banking") {
      onShowQRStep(); return;
    }
    setPaying(true);
    await new Promise(r => setTimeout(r, 2000));
    setPaying(false);
    onSuccess();
  };

  const rowStyle: React.CSSProperties = {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    fontSize: 13, color: "#94a3b8", marginBottom: 10,
  };

  return (
    <motion.div
      key="s3"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      {/* Order summary */}
      <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(30,41,59,0.8)", borderRadius: 16, padding: "24px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <Info className="h-4 w-4 text-cyan-400" />
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>สรุปคำสั่งซื้อ (Checkout)</h2>
        </div>
        {[
          { l: "เกม", v: `${game.emoji} ${game.name}`, c: "#e2e8f0" },
          { l: "แพ็กเกจ", v: `${selectedPkg?.gems.toLocaleString()} ${game.currency}`, c: "#e2e8f0", fw: 600 },
          { l: "User ID", v: uid || "—", c: "#e2e8f0", mono: true },
          { l: "ชื่อตัวละคร", v: playerId ? nickname : "—", c: "#e2e8f0", fw: 600 },
          { l: "Server", v: "Asia", c: "#94a3b8" },
        ].map(item => (
          <div key={item.l} style={rowStyle}>
            <span>{item.l}</span>
            <span style={{ color: item.c, fontWeight: item.fw, fontFamily: item.mono ? "monospace" : undefined }}>{item.v}</span>
          </div>
        ))}

        <div style={{ height: 1, background: "rgba(30,41,59,0.8)", marginBlock: 16 }} />

        {/* Coupon */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(15,23,42,0.8)", border: couponOk ? "1.5px solid rgba(16,185,129,0.4)" : "1.5px solid #1e293b", borderRadius: 10, padding: "11px 14px", marginBottom: 8 }}>
          <span style={{ fontSize: 14 }}>🏷️</span>
          <input
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e2e8f0", fontSize: 13, padding: 0, fontFamily: "inherit" }}
            placeholder="Coupon Code (เช่น VIP15)"
            value={coupon}
            disabled={couponOk}
            onChange={e => { setCoupon(e.target.value); setCouponOk(false); setDiscount(0); setCouponErr(""); }}
          />
          <motion.button
            onClick={applyCoupon}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!coupon.trim() || couponOk}
            style={{ padding: "6px 14px", borderRadius: 7, border: "none", fontSize: 12, fontWeight: 700, cursor: coupon.trim() && !couponOk ? "pointer" : "default", whiteSpace: "nowrap", background: couponOk ? "rgba(16,185,129,0.15)" : "rgba(6,182,212,0.15)", color: couponOk ? "#6ee7b7" : "#06b6d4" }}
          >
            {couponOk ? "✓ ใช้แล้ว" : "ใช้โค้ด"}
          </motion.button>
        </div>
        {couponErr && <div style={{ fontSize: 12, color: "#fca5a5", marginBottom: 10, paddingLeft: 4 }}>⚠️ {couponErr}</div>}

        {/* Price summary */}
        <div style={{ marginTop: 14 }}>
          <div style={rowStyle}>
            <span>ราคาปกติ</span>
            <span>฿{base.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div style={{ ...rowStyle, color: "#10b981" }}>
              <span>ส่วนลด ({(discount * 100).toFixed(0)}%)</span>
              <span>-฿{discAmt.toLocaleString()}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 12, borderTop: "1px solid rgba(30,41,59,0.6)" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>ยอดชำระทั้งหมด</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#06b6d4" }}>฿{total.toLocaleString()}</span>
          </div>
          <div style={{ textAlign: "right", marginTop: 4, fontSize: 12, color: "#f59e0b" }}>
            +{Math.floor(total / 10)} แต้มสะสม 🔥 (ทุก ฿10 = 1 แต้ม)
          </div>
        </div>
      </div>

      {/* Payment methods */}
      <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(30,41,59,0.8)", borderRadius: 16, padding: "24px", marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 20 }}>เลือกช่องทางชำระเงิน</h3>
        {PAYMENT_GROUPS.map(group => (
          <div key={group.label} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{group.label}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {group.methods.map(pm => {
                const sel = paymentMethod === pm.id;
                return (
                  <motion.div
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s", background: sel ? "rgba(6,182,212,0.08)" : "rgba(15,23,42,0.5)", border: sel ? "1.5px solid rgba(6,182,212,0.4)" : "1.5px solid rgba(30,41,59,0.6)" }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: pm.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {pm.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: sel ? "#e2e8f0" : "#94a3b8", marginBottom: 2 }}>{pm.name}</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>{pm.desc}</div>
                      <div style={{ display: "inline-block", marginTop: 4, fontSize: 10, color: "#06b6d4", background: "rgba(6,182,212,0.1)", padding: "2px 7px", borderRadius: 4, fontWeight: 600 }}>{pm.tag}</div>
                    </div>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: sel ? "none" : "2px solid #334155", background: sel ? "linear-gradient(135deg,#06b6d4,#8b5cf6)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                      {sel && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <motion.button onClick={onBack} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} style={backBtnStyle}>
          ย้อนกลับ
        </motion.button>
        <motion.button
          onClick={pay}
          disabled={!paymentMethod || paying}
          whileHover={paymentMethod ? { scale: 1.02 } : {}}
          whileTap={paymentMethod ? { scale: 0.98 } : {}}
          style={{ flex: 3, padding: "13px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14, letterSpacing: "0.03em", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: paymentMethod && !paying ? "pointer" : "not-allowed", background: paymentMethod ? "linear-gradient(135deg,#06b6d4,#8b5cf6)" : "rgba(15,23,42,0.5)", color: paymentMethod ? "#fff" : "#334155", boxShadow: paymentMethod ? "0 4px 20px rgba(6,182,212,0.35)" : "none" }}
        >
          {paying
            ? (<><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> กำลังดำเนินการ...</>)
            : (paymentMethod === "promptpay" || paymentMethod === "truemoney" || paymentMethod === "banking")
              ? `ชำระเงิน ฿${total.toLocaleString()} 📱`
              : `ชำระเงิน ฿${total.toLocaleString()}`}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Step 4: QR Payment ───────────────────────────────────────────────────────

const QR_METHOD_CONFIG: Record<string, { label: string; subLabel: string; iconBg: string; emoji: string; accentColor: string; bankName: string }> = {
  promptpay: {
    label: "PromptPay QR Code",
    subLabel: "สแกนด้วยแอปธนาคาร / Mobile Banking ใดก็ได้",
    iconBg: "#1a4fa3",
    emoji: "🏦",
    accentColor: "#06b6d4",
    bankName: "พร้อมเพย์",
  },
  truemoney: {
    label: "TrueMoney Wallet QR",
    subLabel: "สแกนด้วยแอป TrueMoney Wallet เท่านั้น",
    iconBg: "#e8581a",
    emoji: "🧡",
    accentColor: "#f97316",
    bankName: "TrueMoney",
  },
  banking: {
    label: "Mobile Banking QR",
    subLabel: "สแกนด้วยแอปธนาคารของคุณ",
    iconBg: "#0ea5e9",
    emoji: "🏛️",
    accentColor: "#38bdf8",
    bankName: "ธนาคาร",
  },
};

function QRPaymentStep({
  game,
  selectedPkg,
  paymentMethod,
  totalPrice,
  onBack,
  onSuccess,
}: {
  game: Game;
  selectedPkg: Package | null;
  paymentMethod: string;
  totalPrice: number;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [timer, setTimer] = useState(300);
  const [expired, setExpired] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  const cfg = QR_METHOD_CONFIG[paymentMethod] ?? QR_METHOD_CONFIG.promptpay;
  const qrPayload = buildPromptPayQR(PROMPTPAY_PHONE, totalPrice);
  const refCode = "PP" + Date.now().toString().slice(-8);

  useEffect(() => {
    setTimer(300);
    setExpired(false);
    const iv = setInterval(() => setTimer(t => {
      if (t <= 1) { clearInterval(iv); setExpired(true); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(iv);
  }, []);

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleConfirm = async () => {
    setConfirming(true);
    await new Promise(r => setTimeout(r, 1800));
    setConfirming(false);
    onSuccess();
  };

  const copyRef = () => {
    navigator.clipboard?.writeText(refCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timerPct = (timer / 300) * 100;
  const timerColor = timer > 120 ? cfg.accentColor : timer > 60 ? "#f59e0b" : "#ef4444";

  return (
    <motion.div
      key="s4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      style={{ maxWidth: 460, margin: "0 auto", paddingBottom: 120 }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(15,23,42,0.9)", border: `1px solid ${cfg.accentColor}40`, borderRadius: 40, padding: "8px 20px", marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, background: cfg.iconBg, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{cfg.emoji}</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{cfg.label}</span>
        </div>
        <p style={{ fontSize: 12, color: "#475569" }}>{cfg.subLabel}</p>
      </div>

      {/* QR Card */}
      <motion.div
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        style={{ background: "rgba(15,23,42,0.95)", border: `1px solid ${cfg.accentColor}30`, borderRadius: 20, padding: "28px 24px", marginBottom: 16, boxShadow: `0 0 40px ${cfg.accentColor}15, 0 20px 60px rgba(0,0,0,0.5)`, textAlign: "center" }}
      >
        {/* Timer ring */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
          {/* QR with white bg */}
          <div style={{ display: "inline-flex", padding: 16, background: "#ffffff", borderRadius: 16, boxShadow: `0 0 0 3px ${cfg.accentColor}50, 0 8px 32px rgba(0,0,0,0.5)`, position: "relative" }}>
            {expired ? (
              <div style={{ width: 200, height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: "#f1f5f9", borderRadius: 8 }}>
                <span style={{ fontSize: 40 }}>⏰</span>
                <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>QR หมดอายุแล้ว</span>
              </div>
            ) : (
              <QRCanvas data={qrPayload} size={200} />
            )}
          </div>

          {/* Live indicator */}
          {!expired && (
            <div style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, background: "#10b981", borderRadius: "50%", border: "2px solid rgba(15,23,42,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 7, height: 7, background: "#fff", borderRadius: "50%", animation: "pulse 1s infinite" }} />
            </div>
          )}
        </div>

        {/* Amount */}
        <div style={{ fontSize: 36, fontWeight: 900, color: cfg.accentColor, letterSpacing: "-0.04em", marginBottom: 4 }}>
          ฿{totalPrice.toLocaleString()}
        </div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
          {selectedPkg?.gems.toLocaleString()} {game.currency} · {game.emoji} {game.name}
        </div>

        {/* Timer bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ height: 4, background: "rgba(30,41,59,0.8)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
            <motion.div
              style={{ height: "100%", background: timerColor, borderRadius: 4 }}
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: timerColor, animation: expired ? "none" : "pulse 1s infinite" }} />
            <span style={{ fontSize: 13, color: expired ? "#ef4444" : timerColor, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              {expired ? "QR หมดอายุแล้ว — กดสร้างใหม่" : `QR หมดอายุใน ${fmtTime(timer)}`}
            </span>
          </div>
        </div>

        {/* Reference info */}
        <div
          onClick={copyRef}
          style={{ background: `${cfg.accentColor}08`, border: `1px solid ${cfg.accentColor}25`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", transition: "all 0.2s" }}
        >
          <div style={{ fontSize: 10, color: "#475569", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Reference Number</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <code style={{ fontSize: 13, color: cfg.accentColor, fontFamily: "monospace", fontWeight: 700 }}>{refCode}</code>
            <span style={{ fontSize: 11, color: copied ? "#10b981" : "#475569", transition: "color 0.2s" }}>{copied ? "✓ คัดลอกแล้ว" : "แตะเพื่อคัดลอก"}</span>
          </div>
          <div style={{ fontSize: 11, color: "#334155", marginTop: 4 }}>
            {cfg.bankName}: {PROMPTPAY_PHONE}
          </div>
        </div>
      </motion.div>

      {/* Instructions */}
      <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(30,41,59,0.6)", borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginBottom: 12 }}>📋 วิธีชำระเงิน</div>
        {[
          `เปิดแอป${cfg.bankName} บนมือถือของคุณ`,
          "เลือก สแกน QR Code หรือ จ่ายเงิน",
          `สแกน QR Code ด้านบน แล้วตรวจสอบจำนวน ฿${totalPrice.toLocaleString()}`,
          "กดยืนยันการชำระเงิน",
          'กลับมากด "ฉันชำระเงินแล้ว" เพื่อรับไอเกม',
        ].map((step, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < 4 ? 8 : 0 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${cfg.accentColor}20`, border: `1px solid ${cfg.accentColor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: cfg.accentColor, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
            <span style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{step}</span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          style={{ ...backBtnStyle, flex: 1 }}
        >
          ย้อนกลับ
        </motion.button>

        {expired ? (
          <motion.button
            onClick={() => { setTimer(300); setExpired(false); }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ flex: 2, padding: "13px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            🔄 สร้าง QR ใหม่
          </motion.button>
        ) : (
          <motion.button
            onClick={handleConfirm}
            disabled={confirming}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ flex: 2, padding: "13px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${cfg.accentColor},#10b981)`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: confirming ? "wait" : "pointer", boxShadow: `0 4px 20px ${cfg.accentColor}40`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {confirming ? (
              <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> กำลังตรวจสอบ...</>
            ) : "✓ ฉันชำระเงินแล้ว"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Step 5: Success ──────────────────────────────────────────────────────────

function SuccessStep({
  game,
  selectedPkg,
  playerId,
  uid,
  paymentMethod,
  totalPrice,
  onReset,
}: {
  game: Game;
  selectedPkg: Package | null;
  playerId: string;
  uid: string;
  paymentMethod: string;
  totalPrice: number;
  onReset: () => void;
}) {
  const txId = "TXN-" + Math.random().toString(36).slice(2, 8).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  const pm = PAYMENT_METHODS.find(p => p.id === paymentMethod);
  const points = Math.floor(totalPrice / 10);

  const STATUS_STEPS = [
    { icon: "⏳", label: "รอดำเนินการ", done: true },
    { icon: "💳", label: "ชำระแล้ว", done: true },
    { icon: "🎮", label: "ส่งไอเกมแล้ว", done: true, dot: true },
  ];

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      style={{ textAlign: "center", padding: "40px 0 120px" }}
    >
      {/* Big checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
        style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "transparent",
          border: "3px solid #10b981",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: "0 0 32px rgba(16,185,129,0.35)",
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </motion.div>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0", marginBottom: 6 }}>
        ชำระเงินสำเร็จ! 🎉
      </h2>
      <p style={{ fontSize: 13, color: "#475569", marginBottom: 28 }}>
        ไอเกมจะถูกส่งเข้าบัญชีของคุณภายใน 1–5 นาที
      </p>

      {/* Status steps */}
      <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(30,41,59,0.8)", borderRadius: 16, padding: "20px 24px", marginBottom: 20, textAlign: "left" }}>
        {STATUS_STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < STATUS_STEPS.length - 1 ? "1px solid rgba(30,41,59,0.5)" : "none" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(15,23,42,0.9)", border: "1px solid rgba(30,41,59,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {s.icon}
            </div>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{s.label}</span>
            {s.dot && (
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.6)" }} />
            )}
          </div>
        ))}
      </div>

      {/* Order summary card */}
      <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(30,41,59,0.8)", borderRadius: 16, padding: "20px 24px", marginBottom: 24, textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 16 }}>🧾</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>สรุปคำสั่งซื้อ</span>
        </div>
        {[
          { l: "Transaction ID", v: txId, mono: true, c: "#e2e8f0" },
          { l: "เกม", v: `${game.emoji} ${game.name}`, c: "#e2e8f0" },
          { l: "แพ็กเกจ", v: `${selectedPkg?.gems.toLocaleString()} ${game.currency}`, c: "#e2e8f0" },
          { l: "User ID", v: uid || playerId, c: "#e2e8f0", mono: true },
          { l: "ช่องทางชำระ", v: pm?.name ?? "—", c: "#e2e8f0" },
        ].map(item => (
          <div key={item.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#64748b", marginBottom: 10 }}>
            <span>{item.l}</span>
            <span style={{ color: item.c, fontFamily: item.mono ? "monospace" : undefined, fontSize: item.mono ? 12 : 13 }}>{item.v}</span>
          </div>
        ))}
        <div style={{ height: 1, background: "rgba(30,41,59,0.8)", marginBlock: 12 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>ยอดชำระ</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#06b6d4" }}>฿{totalPrice.toLocaleString()}</span>
        </div>
        <div style={{ textAlign: "right", marginTop: 4, fontSize: 12, color: "#f59e0b" }}>
          +{points} แต้มสะสม 🔥
        </div>
      </div>

      <motion.button
        onClick={onReset}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        style={{ padding: "13px 40px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#06b6d4,#8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "0.03em", boxShadow: "0 4px 20px rgba(6,182,212,0.35)", display: "inline-flex", alignItems: "center", gap: 8 }}
      >
        กลับหน้าแรก →
      </motion.button>
    </motion.div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function TopUpFlow() {
  const [step, setStep] = useState(1);
  const [game, setGame] = useState<Game>(GAMES[0]);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [uid, setUid] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [server, setServer] = useState("Asia");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [success, setSuccess] = useState(false);
  const [couponDiscount] = useState(0);
  const [showQRStep, setShowQRStep] = useState(false);

  const base = selectedPkg?.price ?? 0;
  const total = base - Math.round(base * couponDiscount);

  const reset = () => {
    setStep(1); setSelectedPkg(null); setUid(""); setPlayerId("");
    setServer("Asia"); setPaymentMethod(""); setSuccess(false);
    setGame(GAMES[0]); setShowQRStep(false);
  };

  const handleGameChange = (g: Game) => {
    setGame(g);
    setSelectedPkg(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&family=Noto+Sans+Thai:wght@400;500;600;700;800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#020617;font-family:'Noto Sans Thai','Barlow',sans-serif;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
        input::placeholder{color:#334155;}
        input:-webkit-autofill{-webkit-box-shadow:0 0 0 100px #0f172a inset!important;-webkit-text-fill-color:#e2e8f0!important;}
        select option{background:#0f172a;color:#e2e8f0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:#0f172a;}
        ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:2px;}
      `}</style>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, background: "#020617", zIndex: -1, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse at center,rgba(6,182,212,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -100, right: -100, width: 400, height: 400, background: "radial-gradient(ellipse at center,rgba(139,92,246,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 140px", minHeight: "100vh" }}>
        {!success && !showQRStep && <StepIndicator current={step} />}
        {showQRStep && !success && (
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: 20, padding: "5px 14px", fontSize: 12, color: "#06b6d4", fontWeight: 600 }}>
              📱 ขั้นตอนที่ 4 — สแกน QR ชำระเงิน
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          {success
            ? <SuccessStep key="success" game={game} selectedPkg={selectedPkg} playerId={playerId} uid={uid} paymentMethod={paymentMethod} totalPrice={total} onReset={reset} />
            : showQRStep
              ? <QRPaymentStep key="qr" game={game} selectedPkg={selectedPkg} paymentMethod={paymentMethod} totalPrice={total} onBack={() => setShowQRStep(false)} onSuccess={() => { setShowQRStep(false); setSuccess(true); }} />
              : step === 1
                ? <PackageStep key="s1" game={game} onGameChange={handleGameChange} selected={selectedPkg} onSelect={setSelectedPkg} onNext={() => setStep(2)} />
                : step === 2
                  ? <PlayerStep key="s2" uid={uid} setUid={setUid} playerId={playerId} setPlayerId={setPlayerId} server={server} setServer={setServer} onNext={() => setStep(3)} onBack={() => setStep(1)} />
                  : <CheckoutStep key="s3" game={game} selectedPkg={selectedPkg} playerId={playerId} uid={uid} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} onBack={() => setStep(2)} onSuccess={() => setSuccess(true)} onShowQRStep={() => setShowQRStep(true)} />
          }
        </AnimatePresence>
      </div>

      {!success && !showQRStep && (
        <SummaryBar
          selectedPkg={selectedPkg}
          playerId={playerId}
          paymentMethod={paymentMethod}
          step={step}
          totalPrice={total}
        />
      )}
    </>
  );
}
