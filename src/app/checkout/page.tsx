"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, AlertCircle, Loader2,
  Tag, Star, CreditCard, Banknote, Wallet, ShieldCheck,
  ChevronRight,
} from "lucide-react";

/* ================= CONFIG ================= */
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

/* ================= TYPES ================= */
interface PriceData {
  packageId: number;
  packageName: string;
  gameName: string;
  currency: string;
  amount: number;
  bonusAmount: number;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  pointsEarned: number;
  coupon: { code: string; discountAmount: number } | null;
}

const PAYMENT_METHODS = [
  { id: "promptpay",   label: "PromptPay",       icon: "💳", desc: "สแกน QR จ่ายทันที" },
  { id: "truemoney",   label: "TrueMoney Wallet", icon: "🟠", desc: "จ่ายผ่าน TrueMoney" },
  { id: "bank",        label: "โอนผ่านธนาคาร",   icon: "🏦", desc: "KBank, SCB, BBL, ฯลฯ" },
  { id: "credit_card", label: "บัตรเครดิต/เดบิต", icon: "💰", desc: "Visa, Mastercard" },
  { id: "mock",        label: "Mock (ทดสอบ)",     icon: "⚡", desc: "สำหรับ dev เท่านั้น" },
];

const GAME_IMAGES: Record<string, string> = {
  "free-fire":        "/images/games/game-freefire.png",
  "mobile-legends":   "/images/games/game-mobilelegends.png",
  "pubg-mobile":      "/images/games/game-pubg.png",
  "genshin-impact":   "/images/games/game-genshin.png",
  "rov":              "/images/games/game-rov.png",
  "honkai-star-rail": "/images/games/game-honkai.png",
  "valorant":         "/images/games/game-valorant.png",
  "roblox":           "/images/games/game-roblox.png",
};

const GAME_ACCENTS: Record<string, string> = {
  "free-fire":        "#ff6030",
  "mobile-legends":   "#4fc3f7",
  "pubg-mobile":      "#f5c842",
  "genshin-impact":   "#7ec8e3",
  "rov":              "#c084fc",
  "honkai-star-rail": "#a5f3fc",
  "valorant":         "#ff4655",
  "roblox":           "#22c55e",
};

/* ================= PAGE ================= */
function CheckoutContent() {
  const router     = useRouter();
  const params     = useSearchParams();

  const gameSlug   = params.get("gameSlug")  ?? "";
  const packageId  = Number(params.get("packageId") ?? 0);
  const uid        = params.get("uid")       ?? "";
  const server     = params.get("server")    ?? "";
  const username   = params.get("username")  ?? "";

  const accent = GAME_ACCENTS[gameSlug] ?? "#00e5ff";
  const gameImg = GAME_IMAGES[gameSlug] ?? "/images/games/game-freefire.png";

  const [priceData,    setPrice]    = useState<PriceData | null>(null);
  const [couponCode,   setCoupon]   = useState("");
  const [couponInput,  setCInput]   = useState("");
  const [couponError,  setCError]   = useState("");
  const [couponLoading,setCLoading] = useState(false);
  const [payMethod,    setPayMethod]= useState("promptpay");
  const [buyerEmail,   setEmail]    = useState("");
  const [loading,      setLoading]  = useState(true);
  const [submitting,   setSubmitting]= useState(false);
  const [orderId,      setOrderId]  = useState<string | null>(null);
  const [error,        setError]    = useState("");

  /* ── Fetch price from backend (re-validate) ── */
  useEffect(() => {
    if (!packageId) return;
    setLoading(true);
    fetch(`${API}/topup/calculate-price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId, couponCode: couponCode || undefined }),
    })
      .then((r) => r.json())
      .then((d) => setPrice(d))
      .catch(() => setError("ไม่สามารถโหลดข้อมูลราคาได้"))
      .finally(() => setLoading(false));
  }, [packageId, couponCode]);

  /* ── Apply coupon ── */
  const handleApplyCoupon = async () => {
    if (!couponInput.trim() || !buyerEmail.trim()) {
      setCError("กรุณากรอกอีเมลและรหัสคูปอง");
      return;
    }
    setCLoading(true); setCError("");
    try {
      const res  = await fetch(`${API}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput.trim().toUpperCase(),
          orderAmount: priceData?.originalPrice ?? 0,
          buyerEmail: buyerEmail.trim(),
        }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon(couponInput.trim().toUpperCase());
        setCInput("");
      } else {
        setCError(data.message ?? "คูปองไม่ถูกต้อง");
      }
    } catch {
      setCError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally { setCLoading(false); }
  };

  const handleRemoveCoupon = () => {
    setCoupon(""); setCInput(""); setCError("");
  };

  /* ── Submit order ── */
  const handleSubmit = async () => {
    if (!buyerEmail.trim()) { setError("กรุณากรอกอีเมล"); return; }
    setSubmitting(true); setError("");
    try {
      // 1. Create order
      const orderRes  = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: 1, // TODO: map from slug
          packageId, buyerEmail: buyerEmail.trim(),
          gameAccountId: uid, gameServer: server || undefined,
          gameUsername: username || undefined,
        }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.message ?? "สร้าง order ไม่สำเร็จ");

      // 2. Pay
      const payRes = await fetch(`${API}/orders/${order.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentProvider: payMethod, paymentDetails: {} }),
      });
      const pay = await payRes.json();
      if (!payRes.ok) throw new Error(pay.message ?? "ชำระเงินไม่สำเร็จ");

      if (pay.success) {
        setOrderId(order.orderNumber ?? order.id);
      } else {
        setError("ชำระเงินไม่สำเร็จ กรุณาลองใหม่");
      }
    } catch (e: any) {
      setError(e.message ?? "เกิดข้อผิดพลาด");
    } finally { setSubmitting(false); }
  };

  /* ── SUCCESS STATE ── */
  if (orderId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-5 max-w-sm w-full">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-green-400 mb-1">ชำระเงินสำเร็จ!</h1>
            <p className="text-xs text-muted-foreground">Order #{orderId}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card/80 p-5 text-sm space-y-2 text-left">
            <div className="flex justify-between"><span className="text-muted-foreground">เกม</span><span className="font-semibold">{priceData?.gameName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">แพ็กเกจ</span><span className="font-semibold">{priceData?.packageName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">UID</span><span className="font-semibold">{uid}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">ราคา</span><span className="font-bold" style={{ color: accent }}>฿{priceData?.finalPrice?.toFixed(2)}</span></div>
          </div>
          <p className="text-xs text-muted-foreground">ระบบกำลังเติมเกมให้คุณ กรุณารอ 1-5 นาที</p>
          <button
            onClick={() => router.push("/")}
            className="w-full rounded-xl py-3 text-sm font-bold text-white transition"
            style={{ background: `linear-gradient(135deg, ${accent}, #7c3aed)` }}
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">

        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" /> กลับ
        </button>

        <h1 className="text-xl font-extrabold">สรุปคำสั่งซื้อ</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : priceData ? (
          <>
            {/* ── ORDER SUMMARY ── */}
            <div className="rounded-2xl border border-border bg-card/80 p-6 space-y-4">
              <h2 className="font-bold text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs flex items-center justify-center font-bold">1</span>
                รายละเอียดคำสั่งซื้อ
              </h2>

              <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background/40">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                  <Image src={gameImg} alt={priceData.gameName} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: accent }}>{priceData.gameName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{priceData.packageName}</p>
                  <p className="text-xs font-bold mt-1">
                    {priceData.amount.toLocaleString()}
                    {priceData.bonusAmount > 0 && <span className="text-green-400"> +{priceData.bonusAmount.toLocaleString()} โบนัส</span>}
                    {" "}{priceData.currency}
                  </p>
                </div>
                <p className="font-extrabold text-lg" style={{ color: accent }}>฿{priceData.originalPrice.toFixed(0)}</p>
              </div>

              {/* UID Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-background/40 p-3">
                  <p className="text-[10px] text-muted-foreground mb-1">Player UID</p>
                  <p className="text-sm font-bold truncate">{uid || "—"}</p>
                </div>
                {(server || username) && (
                  <div className="rounded-xl border border-border bg-background/40 p-3">
                    <p className="text-[10px] text-muted-foreground mb-1">{server ? "Server" : "ชื่อ"}</p>
                    <p className="text-sm font-bold truncate">{server || username}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── EMAIL ── */}
            <div className="rounded-2xl border border-border bg-card/80 p-6 space-y-3">
              <h2 className="font-bold text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs flex items-center justify-center font-bold">2</span>
                อีเมลรับสลิป
              </h2>
              <input
                value={buyerEmail}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="your@email.com"
                className="w-full rounded-xl border border-border bg-input py-3 px-4 text-sm focus:border-primary outline-none transition-colors"
              />
              <p className="text-[11px] text-muted-foreground">ใช้เพื่อรับสลิปและติดตาม Order</p>
            </div>

            {/* ── COUPON ── */}
            <div className="rounded-2xl border border-border bg-card/80 p-6 space-y-3">
              <h2 className="font-bold text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs flex items-center justify-center font-bold">3</span>
                <Tag className="h-4 w-4" /> Coupon Code
              </h2>

              {couponCode ? (
                <div className="flex items-center justify-between rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-green-400">{couponCode}</p>
                    <p className="text-xs text-green-400/70">ลด ฿{priceData.coupon?.discountAmount?.toFixed(2) ?? "—"}</p>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-xs text-red-400 hover:text-red-300 transition">ลบ</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => { setCInput(e.target.value.toUpperCase()); setCError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="กรอกรหัสคูปอง"
                      className="flex-1 rounded-xl border border-border bg-input py-3 px-4 text-sm focus:border-primary outline-none transition-colors uppercase"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim() || couponLoading}
                      className="rounded-xl bg-primary/10 border border-primary/30 text-primary px-4 text-sm font-semibold hover:bg-primary/20 transition disabled:opacity-40 flex items-center gap-1"
                    >
                      {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ใช้"}
                    </button>
                  </div>
                  {couponError && (
                    <div className="flex items-center gap-2 text-xs text-red-400">
                      <AlertCircle className="h-3.5 w-3.5" /> {couponError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── PAYMENT METHOD ── */}
            <div className="rounded-2xl border border-border bg-card/80 p-6 space-y-3">
              <h2 className="font-bold text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs flex items-center justify-center font-bold">4</span>
                เลือกช่องทางชำระเงิน
              </h2>

              <div className="space-y-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPayMethod(m.id)}
                    className={`w-full flex items-center gap-4 rounded-xl border p-4 transition-all ${
                      payMethod === m.id
                        ? "border-primary bg-primary/10 shadow-[0_0_12px_rgba(0,229,255,0.15)]"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      payMethod === m.id ? "border-primary bg-primary" : "border-border"
                    }`}>
                      {payMethod === m.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── PRICE BREAKDOWN ── */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3">
              <h3 className="text-sm font-bold text-primary">สรุปราคา</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ราคาแพ็กเกจ</span>
                  <span>฿{priceData.originalPrice.toFixed(2)}</span>
                </div>
                {priceData.discountAmount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>ส่วนลดคูปอง</span>
                    <span>-฿{priceData.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-border/50">
                  <span>ราคาสุทธิ</span>
                  <span style={{ color: accent }}>฿{priceData.finalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="h-3 w-3" /> แต้มที่จะได้รับ</span>
                  <span className="text-yellow-400 font-semibold">+{priceData.pointsEarned} แต้ม</span>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
              </div>
            )}

            {/* Secure note */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-400" />
              ข้อมูลของคุณได้รับการเข้ารหัส SSL และปลอดภัย 100%
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !buyerEmail.trim()}
              className="w-full rounded-xl py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              style={
                !submitting && buyerEmail.trim()
                  ? { background: `linear-gradient(135deg, ${accent}, #7c3aed)`, color: "#fff", boxShadow: `0 0 24px ${accent}40` }
                  : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
              }
            >
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> กำลังดำเนินการ...</>
                : <><CreditCard className="h-4 w-4" /> ชำระเงิน ฿{priceData.finalPrice.toFixed(2)} <ChevronRight className="h-4 w-4" /></>}
            </button>
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-sm">{error || "ไม่พบข้อมูลคำสั่งซื้อ"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
