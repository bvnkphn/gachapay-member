"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight, ArrowLeft, CheckCircle2, AlertCircle,
  Loader2, Star, Zap, User, Server,
} from "lucide-react";

/* ================= CONFIG ================= */
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

/* ================= TYPES ================= */
interface Package {
  id: number;
  name: string;
  amount: number;
  bonusAmount: number;
  price: number;
  discount: number;
  isPopular: boolean;
}

interface Game {
  id: number;
  slug: string;
  name: string;
  category: string;
  platform: string;
  currency: string;
  accent: string;
  image: string;
  packages: Package[];
}

interface ValidateResult {
  valid: boolean;
  username?: string;
  message: string;
  fallback: boolean;
}

interface PriceResult {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  pointsEarned: number;
}

/* ================= FALLBACK DATA ================= */
// ไม่มี hardcode fallback — fetch จาก API ตาม slug จริงๆ

/* ================= PAGE ================= */
export default function TopupPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug   = params?.slug ?? "free-fire";

  const [game,         setGame]      = useState<Game | null>(null);
  const [uid,          setUid]       = useState("");
  const [server,       setServer]    = useState("");
  const [validateRes,  setValRes]    = useState<ValidateResult | null>(null);
  const [validating,   setValidating]= useState(false);
  const [selectedPkg,  setPkg]       = useState<Package | null>(null);
  const [priceResult,  setPrice]     = useState<PriceResult | null>(null);
  const [loadingGame,  setLoadGame]  = useState(true);
  const [showDropdown, setShowDrop]  = useState(false);
  const [allGames,     setAllGames]  = useState<{ slug: string; name: string; image: string; category: string; platform: string }[]>([]);

  // ปิด dropdown เมื่อ click นอก
  useEffect(() => {
    if (!showDropdown) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // ไม่ปิดถ้า click อยู่ใน dropdown
      if (target.closest("[data-dropdown]")) return;
      setShowDrop(false);
    };
    // ใช้ setTimeout เพื่อให้ click handler ทำงานก่อน
    const timer = setTimeout(() => {
      document.addEventListener("click", close);
    }, 0);
    return () => { clearTimeout(timer); document.removeEventListener("click", close); };
  }, [showDropdown]);

  /* Fetch game ตาม slug จาก API */
  useEffect(() => {
    if (!slug) return;
    setLoadGame(true);
    fetch(`${API}/games/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        // Backend ส่ง { data: { ...game, packages: [...] } }
        const gameData = d?.data ?? d;
        if (gameData?.packages) setGame(gameData);
      })
      .catch(() => {})
      .finally(() => setLoadGame(false));
  }, [slug]);

  /* Fetch ทุกเกมสำหรับ Dropdown */
  useEffect(() => {
    fetch(`${API}/games`)
      .then((r) => r.json())
      .then((d) => {
        const list = d?.data ?? d ?? [];
        setAllGames(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, []);

  /* Calculate price when package changes */
  useEffect(() => {
    if (!selectedPkg) { setPrice(null); return; }
    const orig = selectedPkg.discount > 0
      ? selectedPkg.price * (1 - selectedPkg.discount / 100)
      : selectedPkg.price;
    fetch(`${API}/topup/calculate-price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId: selectedPkg.id }),
    })
      .then((r) => r.json())
      .then((d) => setPrice(d))
      .catch(() => setPrice({
        originalPrice: selectedPkg.price,
        discountAmount: selectedPkg.discount > 0 ? selectedPkg.price * selectedPkg.discount / 100 : 0,
        finalPrice: orig,
        pointsEarned: Math.floor(orig * 0.1),
      }));
  }, [selectedPkg]);

  /* Validate UID */
  const handleValidate = useCallback(async () => {
    if (!uid.trim()) return;
    setValidating(true); setValRes(null);
    try {
      const res  = await fetch(`${API}/topup/validate-uid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameSlug: slug, uid: uid.trim(), server: server.trim() || undefined }),
      });
      setValRes(await res.json());
    } catch {
      setValRes({ valid: true, message: "ไม่สามารถตรวจสอบชื่อได้ชั่วคราว แต่สามารถทำรายการต่อได้", fallback: true });
    } finally { setValidating(false); }
  }, [uid, server, slug]);

  /* Proceed to checkout */
  const handleNext = () => {
    if (!selectedPkg || !uid.trim()) return;
    const qs = new URLSearchParams({
      gameSlug: slug, packageId: String(selectedPkg.id),
      uid: uid.trim(), server: server.trim(),
      username: validateRes?.username ?? "",
    }).toString();
    router.push(`/checkout?${qs}`);
  };

  const needsServer = ["mobile-legends", "rov"].includes(slug);
  const canProceed  = !!selectedPkg && !!uid.trim() && validateRes?.valid !== false;
  const accent = game?.accent ?? "#00e5ff";

  if (loadingGame) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
    </div>
  );

  if (!game) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
      <div className="text-center space-y-3">
        <p className="text-4xl">🎮</p>
        <p className="text-sm">ไม่พบเกมนี้</p>
        <button onClick={() => router.push("/")} className="text-primary text-xs underline">กลับหน้าหลัก</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">

        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" /> กลับ
        </button>

        {/* Game Header + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDrop((v) => !v)}
            className="w-full flex items-center gap-4 rounded-2xl border border-border bg-card/80 p-5 hover:border-primary/40 transition text-left"
          >
            {game.image && (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                <Image src={game.image} alt={game.name} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                <span>{game.category}</span><span>·</span><span>{game.platform}</span>
              </div>
              <h1 className="text-xl font-extrabold" style={{ color: accent }}>{game.name}</h1>
              <span className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded border bg-primary/10 border-primary/30 text-primary mt-1">
                หน่วย: {game.currency}
              </span>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-lg px-3 py-1.5">
              เปลี่ยนเกม
              <svg className={`h-3.5 w-3.5 transition-transform ${showDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </button>

          {/* Dropdown list */}
          {showDropdown && allGames.length > 0 && (
            <div data-dropdown className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto">
              {allGames.map((g) => (
                <button
                  key={g.slug}
                  data-dropdown
                  onClick={() => {
                    if (g.slug === slug) { setShowDrop(false); return; }
                    setPkg(null);
                    setUid(""); setServer(""); setValRes(null);
                    setShowDrop(false);
                    router.push(`/topup/${g.slug}`);
                  }}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-primary/10 transition text-left ${g.slug === slug ? "bg-primary/5 border-l-2 border-primary" : ""}`}
                >
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                    <Image src={g.image || "/images/games/placeholder.png"} alt={g.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${g.slug === slug ? "text-primary" : ""}`}>{g.name}</p>
                    <p className="text-[10px] text-muted-foreground">{g.category} · {g.platform}</p>
                  </div>
                  {g.slug === slug && <div className="ml-auto w-2 h-2 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── STEP 1: กรอกข้อมูลผู้เล่น ── */}
        <div className="rounded-2xl border border-border bg-card/80 p-6 space-y-4">
          <h2 className="font-bold text-base flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs flex items-center justify-center font-bold">1</span>
            กรอกข้อมูลผู้เล่น
          </h2>

          {/* UID */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Player ID / UID
            </label>
            <div className="flex gap-2">
              <input
                value={uid}
                onChange={(e) => { setUid(e.target.value); setValRes(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                placeholder={`กรอก UID ของ ${game.name}`}
                className="flex-1 rounded-xl border border-border bg-input py-3 px-4 text-sm focus:border-primary outline-none transition-colors"
              />
              <button
                onClick={handleValidate}
                disabled={!uid.trim() || validating}
                className="rounded-xl bg-primary/10 border border-primary/30 text-primary px-4 text-sm font-semibold hover:bg-primary/20 transition disabled:opacity-40 flex items-center gap-2 whitespace-nowrap"
              >
                {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : "ตรวจสอบ"}
              </button>
            </div>
          </div>

          {/* Server */}
          {needsServer && (
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5" /> Server / Zone ID
              </label>
              <input
                value={server}
                onChange={(e) => setServer(e.target.value)}
                placeholder="กรอก Server ID"
                className="w-full rounded-xl border border-border bg-input py-3 px-4 text-sm focus:border-primary outline-none transition-colors"
              />
            </div>
          )}

          {/* Validate Result */}
          {validateRes && (
            <div className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm border ${
              validateRes.valid
                ? validateRes.fallback
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                  : "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
              {validateRes.valid
                ? <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                : <AlertCircle  className="h-4 w-4 mt-0.5 flex-shrink-0" />}
              <div>
                {validateRes.username && <p className="font-bold mb-0.5">ชื่อ: {validateRes.username}</p>}
                <p className="text-xs opacity-80">{validateRes.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── STEP 2: เลือกแพ็กเกจ ── */}
        <div className="rounded-2xl border border-border bg-card/80 p-6 space-y-4">
          <h2 className="font-bold text-base flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs flex items-center justify-center font-bold">2</span>
            เลือกแพ็กเกจ
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {game.packages.map((pkg) => {
              const isSelected  = selectedPkg?.id === pkg.id;
              // Prisma ส่ง Decimal object มา ต้องแปลงเป็น number ก่อน
              const price       = Number(pkg.price);
              const actualPrice = pkg.discount > 0 ? price * (1 - pkg.discount / 100) : price;
              const points      = Math.floor(actualPrice * 0.1);

              return (
                <button
                  key={pkg.id}
                  onClick={() => setPkg(isSelected ? null : pkg)}
                  className={`relative rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-[0_0_16px_rgba(0,229,255,0.2)]"
                      : "border-border bg-card hover:border-primary/40 hover:bg-card/60"
                  }`}
                >
                  {pkg.isPopular && (
                    <span className="absolute -top-2 left-3 text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      ยอดนิยม
                    </span>
                  )}

                  <p className="font-extrabold text-lg leading-none" style={{ color: isSelected ? accent : "inherit" }}>
                    {pkg.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{game.currency}</p>

                  <div className="mt-3 pt-3 border-t border-border/50">
                    {pkg.discount > 0 && (
                      <p className="text-[10px] line-through text-muted-foreground/60">฿{Number(pkg.price).toFixed(0)}</p>
                    )}
                    <p className="text-sm font-bold" style={{ color: isSelected ? accent : "inherit" }}>
                      ฿{actualPrice.toFixed(0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 flex items-center gap-0.5 mt-0.5">
                      <Star className="h-2.5 w-2.5" /> +{points} แต้ม
                    </p>
                  </div>

                  {isSelected && <CheckCircle2 className="absolute top-3 right-3 h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Summary */}
        {selectedPkg && priceResult && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3">
            <h3 className="text-sm font-bold text-primary">สรุปราคา</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ราคาปกติ</span>
                <span>฿{priceResult.originalPrice.toFixed(2)}</span>
              </div>
              {priceResult.discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>ส่วนลด</span>
                  <span>-฿{priceResult.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border/50">
                <span>ราคาสุทธิ</span>
                <span style={{ color: accent }}>฿{priceResult.finalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="h-3 w-3" /> แต้มที่จะได้รับ</span>
                <span className="text-yellow-400 font-semibold">+{priceResult.pointsEarned} แต้ม</span>
              </div>
            </div>
          </div>
        )}

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="w-full rounded-xl py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          style={canProceed
            ? { background: `linear-gradient(135deg, ${accent}, #7c3aed)`, color: "#fff", boxShadow: `0 0 24px ${accent}40` }
            : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}
        >
          <Zap className="h-4 w-4" />
          ดำเนินการชำระเงิน
          <ArrowRight className="h-4 w-4" />
        </button>

      </div>
    </div>
  );
}
