"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Zap, Shield, Clock, Headphones, ArrowRight, Flame, ChevronLeft, ChevronRight } from "lucide-react";

/* ================= CONFIG ================= */
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

/* ================= TYPES ================= */
interface Banner {
  id: number; tag: string; title: string;
  desc?: string; description?: string;
  bg?: string; bgGradient?: string; href: string;
}
interface Game {
  id: number; slug: string; name: string;
  category?: string; tag?: string;
  platform: string; currency: string;
  price?: number; minPrice?: number;
  accent: string; hot?: boolean; isHot?: boolean;
  image: string; bg?: string; platformColor?: string;
  packages?: { price: number }[];
}

/* ================= STATIC DATA (fallback เหมือนเดิม) ================= */
const CATEGORIES = ["ทั้งหมด", "Mobile", "PC", "Battle Royale", "RPG", "FPS", "MOBA"];

const STATIC_BANNERS: Banner[] = [
  { id: 1, tag: "🔥 LIMITED TIME", title: "Free Fire Double Diamond",       desc: "เติม Diamond วันนี้รับโบนัสพิเศษ 2 เท่า! เฉพาะสัปดาห์นี้", bg: "from-orange-600 via-red-500 to-purple-700",   href: "/topup/free-fire" },
  { id: 2, tag: "⚡ โปรพิเศษ",     title: "Genshin Impact Genesis Crystal", desc: "เติม Crystal วันนี้ รับ Primogem โบนัส 20%",               bg: "from-cyan-600 via-blue-500 to-indigo-700",   href: "/topup/genshin-impact" },
  { id: 3, tag: "💎 BEST VALUE",   title: "PUBG Mobile UC Sale",            desc: "เติม UC ราคาพิเศษ ส่งตรงถึง Account ทันที",               bg: "from-yellow-600 via-orange-500 to-red-600", href: "/topup/pubg-mobile" },
];

const STATIC_GAMES: Game[] = [
  { id: 1, slug: "free-fire",        name: "Free Fire",         tag: "Battle Royale", platform: "Mobile", currency: "Diamonds",         price: 35,  accent: "#ff6030", hot: true,  image: "/images/games/game-freefire.png",      bg: "from-orange-900/80 to-red-900/80",     platformColor: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { id: 2, slug: "mobile-legends",   name: "Mobile Legends",    tag: "MOBA",          platform: "Mobile", currency: "Diamonds",         price: 35,  accent: "#4fc3f7", hot: false, image: "/images/games/game-mobilelegends.png", bg: "from-blue-900/80 to-cyan-900/80",      platformColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { id: 3, slug: "pubg-mobile",      name: "PUBG Mobile",       tag: "Battle Royale", platform: "Mobile", currency: "UC",               price: 35,  accent: "#f5c842", hot: false, image: "/images/games/game-pubg.png",          bg: "from-yellow-900/80 to-amber-900/80",   platformColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { id: 4, slug: "genshin-impact",   name: "Genshin Impact",    tag: "RPG",           platform: "PC",     currency: "Genesis Crystals", price: 55,  accent: "#7ec8e3", hot: false, image: "/images/games/game-genshin.png",       bg: "from-cyan-900/80 to-blue-900/80",      platformColor: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  { id: 5, slug: "rov",              name: "ROV",               tag: "MOBA",          platform: "Mobile", currency: "Vouchers",         price: 35,  accent: "#c084fc", hot: false, image: "/images/games/game-rov.png",           bg: "from-purple-900/80 to-violet-900/80",  platformColor: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { id: 6, slug: "honkai-star-rail", name: "Honkai: Star Rail", tag: "RPG",           platform: "PC",     currency: "Oneiric Shards",   price: 55,  accent: "#a5f3fc", hot: false, image: "/images/games/game-honkai.png",        bg: "from-slate-900/80 to-indigo-900/80",   platformColor: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  { id: 7, slug: "valorant",         name: "Valorant",          tag: "FPS",           platform: "PC",     currency: "VP",               price: 165, accent: "#ff4655", hot: false, image: "/images/games/game-valorant.png",      bg: "from-red-950/80 to-rose-900/80",       platformColor: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  { id: 8, slug: "roblox",           name: "Roblox",            tag: "Sandbox",       platform: "Mobile", currency: "Robux",            price: 35,  accent: "#22c55e", hot: false, image: "/images/games/game-roblox.png",        bg: "from-green-900/80 to-emerald-900/80",  platformColor: "bg-green-500/20 text-green-400 border-green-500/30" },
];

const FEATURES = [
  { icon: Zap,        label: "เติมไว",       desc: "รับโอเกมภายใน 1-5 นาที" },
  { icon: Shield,     label: "ปลอดภัย 100%", desc: "ระบบความปลอดภัยสูง" },
  { icon: Clock,      label: "24/7",         desc: "บริการตลอด 24 ชั่วโมง" },
  { icon: Headphones, label: "ซัพพอร์ต",    desc: "ทีมงานพร้อมช่วยเหลือ" },
];

/* ================= PAGE ================= */
export default function HomePage() {
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("ทั้งหมด");
  const [bannerIdx, setBannerIdx] = useState(0);
  const [banners,   setBanners]   = useState<Banner[]>(STATIC_BANNERS);
  const [games,     setGames]     = useState<Game[]>(STATIC_GAMES);

  /* ── Fetch banners from API (Admin sync) ── */
  useEffect(() => {
    fetch(`${API}/admin/banners`, { headers: { "x-api-key": "" } })
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d) && d.length) setBanners(d); })
      .catch(() => {}); // ใช้ static fallback
  }, []);

  /* ── Fetch games + filter from API ── */
  const fetchGames = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category !== "ทั้งหมด") {
        if (["Mobile", "PC"].includes(category)) params.set("platform", category);
        else params.set("category", category);
      }
      const res  = await fetch(`${API}/games?${params}`);
      const data = await res.json();
      const list = data.data ?? data;
      if (Array.isArray(list) && list.length) setGames(list);
    } catch {
      // ใช้ static fallback
    }
  }, [search, category]);

  useEffect(() => {
    const t = setTimeout(fetchGames, 300);
    return () => clearTimeout(t);
  }, [fetchGames]);

  /* ── Auto-advance banner ── */
  useEffect(() => {
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  /* ── Local filter (fallback) ── */
  const filtered = games.filter((g) => {
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === "ทั้งหมด" || g.platform === category || g.tag === category || g.category === category;
    return matchSearch && matchCat;
  });

  const banner = banners[bannerIdx];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 space-y-10">

        {/* ── HERO BANNER ── */}
        <div className="relative overflow-hidden rounded-2xl shadow-2xl">
          <div className={`bg-gradient-to-br ${banner.bg ?? banner.bgGradient} p-8 md:p-10 text-white transition-all duration-500`}>
            <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute right-20 bottom-0 w-40 h-40 rounded-full bg-white/5 translate-y-1/2 pointer-events-none" />

            <div className="relative">
              <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur mb-4">
                {banner.tag}
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">
                {banner.title}
              </h1>
              <p className="text-white/80 max-w-md text-sm md:text-base mb-6">
                {banner.desc ?? banner.description}
              </p>
              <Link
                href={banner.href}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black hover:bg-white/90 transition-all hover:scale-105"
              >
                เติมเลย <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <button
              onClick={() => setBannerIdx((i) => (i - 1 + banners.length) % banners.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur flex items-center justify-center text-white hover:bg-black/50 transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setBannerIdx((i) => (i + 1) % banners.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur flex items-center justify-center text-white hover:bg-black/50 transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-4 right-6 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setBannerIdx(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === bannerIdx ? "w-8 bg-white" : "w-4 bg-white/40"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── SEARCH ── */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อเกม (ภาษาไทย / EN)..."
            className="w-full rounded-xl border border-border bg-card/80 py-3.5 pl-11 pr-4 text-sm focus:border-primary outline-none transition-colors placeholder:text-muted-foreground/60"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50">
            games: {filtered.length} รายการ
          </div>
        </div>

        {/* ── CATEGORIES ── */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all ${
                category === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── FEATURES ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="rounded-2xl border border-border bg-card/80 p-5 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(0,229,255,0.08)] transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-bold mb-0.5">{f.label}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ── GAME GRID ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold">เกมทั้งหมด</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} เกม</p>
            </div>
            <Link href="/" className="text-xs text-primary flex items-center gap-1 hover:gap-2 transition-all">
              ดูทั้งหมด <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((game) => {
                const minP = game.price ?? game.minPrice ?? game.packages?.[0]?.price ?? 0;
                const isHot = game.hot ?? game.isHot ?? false;
                const bgCls = game.bg ?? "from-slate-900/80 to-gray-900/80";
                const pCol  = game.platformColor ?? "bg-slate-500/20 text-slate-300 border-slate-500/30";
                return (
                  <Link
                    key={game.id}
                    href={`/topup/${game.slug}`}
                    className="group relative rounded-2xl border border-border bg-card overflow-hidden transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                  >
                    <div className={`relative h-36 bg-gradient-to-br ${bgCls} overflow-hidden`}>
                      <div className="absolute inset-0 z-10 opacity-20" style={{ background: `radial-gradient(circle at 50% 80%, ${game.accent}, transparent 70%)` }} />
                      <Image
                        src={game.image}
                        alt={game.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                      <span className={`absolute top-3 left-3 z-20 text-[10px] font-bold px-2 py-0.5 rounded border ${pCol}`}>
                        {game.platform.toUpperCase()}
                      </span>
                      {isHot && (
                        <span className="absolute top-3 right-3 z-20 flex items-center gap-1 text-[10px] font-bold text-red-400">
                          <Flame className="h-3 w-3" /> HOT
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm mb-0.5 group-hover:text-primary transition-colors" style={{ color: game.accent }}>
                        {game.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        {game.tag ?? game.category} · {game.currency}
                      </p>
                      <p className="text-xs font-bold" style={{ color: game.accent }}>
                        เริ่มต้น ฿{minP}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm">ไม่พบเกมที่ค้นหา</p>
            </div>
          )}
        </div>

        {/* ── VIP BANNER ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-8 text-white shadow-2xl">
          <div className="absolute right-0 top-0 w-60 h-60 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative">
            <span className="inline-flex rounded-full bg-black/20 px-3 py-1 text-xs font-bold backdrop-blur mb-4">
              👑 โปรโมชั่นพิเศษ
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">
              สมัครสมาชิก VIP วันนี้ รับส่วนลดสูงสุด 15%
            </h2>
            <p className="text-white/80 text-sm mb-6">
              พร้อมรับแต้มสะสมทุกการเติม และสิทธิพิเศษมากมาย
            </p>
            <Link
              href="/vip"
              className="inline-flex items-center gap-2 rounded-xl bg-black/30 backdrop-blur px-6 py-3 text-sm font-bold hover:bg-black/40 transition border border-white/20"
            >
              สมัครเลย <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © 2026 CYBERPAY — Game Top-up Platform. All rights reserved.
      </footer>
    </div>
  );
}
