"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Zap, ArrowRight, Star, ChevronRight, ChevronLeft } from "lucide-react";
import { GamesSection } from "@/components/game-card";
import { useLanguage } from "@/components/language-context";
import BannerSlider from "@/components/BannerSlider";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ---- Types ----
interface Game {
    id: string;
    name: string;
    slug: string;
    image: string;
    category: string;
    label: "NONE" | "HOT" | "NEW" | "SALE";
}

// ---- Flash Sale Countdown ----
function useCountdown(target: Date) {
    const targetRef = useRef(target);
    const calc = () => {
        const diff = Math.max(0, targetRef.current.getTime() - Date.now());
        return {
            h: Math.floor(diff / 3600000),
            m: Math.floor((diff % 3600000) / 60000),
            s: Math.floor((diff % 60000) / 1000),
        };
    };
    const [time, setTime] = useState(calc);
    useEffect(() => {
        const id = setInterval(() => setTime(calc()), 1000);
        return () => clearInterval(id);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return time;
}

function Digit({ n }: { n: number }) {
    return (
        <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-muted border border-border text-foreground text-sm sm:text-lg font-semibold tabular-nums">
            {String(n).padStart(2, "0")}
        </span>
    );
}

// ---- Discount badge colours ----
const discountColor: Record<string, string> = {
    HOT: "bg-red-500",
    SALE: "bg-orange-500",
    NEW: "bg-blue-500",
    NONE: "bg-primary",
};

const discountLabel: Record<string, string> = {
    HOT: "-25% OFF",
    SALE: "-10% OFF",
    NEW: "-6% OFF",
    NONE: "-22% OFF",
};

// ---- Flash Sale Card ----
function FlashCard({ game }: { game: Game }) {
    const color = discountColor[game.label] || discountColor.NONE;
    const badge = discountLabel[game.label] || discountLabel.NONE;
    return (
        <Link href={`/game/${game.slug}`} className="group">
            <div className="glass-card rounded-xl overflow-hidden hover:glow-primary transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-36 overflow-hidden bg-muted">
                    {game.image ? (
                        <img
                            src={game.image}
                            alt={game.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
                    <span className={`absolute top-2 left-2 text-[10px] font-bold text-white px-2 py-0.5 rounded ${color}`}>
                        {badge}
                    </span>
                </div>
                <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{game.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-primary font-bold text-sm">฿29</span>
                        <span className="text-muted-foreground text-xs line-through">฿35</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ---- Review data ----
const reviews = [
    {
        id: 1,
        stars: 5,
        text: '"เติมง่ายมากครับ กดปุ๊บเข้าเกมเลย ไม่ต้องรอนานแน่นอน แนะนำสำหรับทุกคนเลยครับ"',
        name: "K.Somchai",
        role: "VIP Platinum",
        avatar: "S",
    },
    {
        id: 2,
        stars: 5,
        text: '"บริการดีมากครับ มีเกมให้เลือกเยอะมาก ใช้งานดี สปีด VIP คุ้มมากๆ"',
        name: "K. Rin",
        role: "VIP Gold",
        avatar: "R",
    },
    {
        id: 3,
        stars: 5,
        text: '"ราคาถูกกว่าที่อื่นเยอะเลยครับ แถมได้เงินสะสมแถมไปด้วย ลองสั่งซื้อแล้วประทับใจมากๆ"',
        name: "K. Anan",
        role: "VIP Diamond",
        avatar: "A",
    },
    {
        id: 4,
        stars: 5,
        text: '"แอดมินตอบแชทไวและบริการดีมากครับ มีปัญหาติดต่อได้ตลอด 24 ชั่วโมง ประทับใจสุดๆ"',
        name: "K. Tanawat",
        role: "VIP Gold",
        avatar: "T",
    },
    {
        id: 5,
        stars: 5,
        text: '"เติมเงินผ่านพร้อมเพย์สะดวกมากครับ ระบบสแกนคิวอาร์โค้ดแล้วทำรายการสำเร็จอัตโนมัติทันที แนะนำครับ"',
        name: "K. Pitchaya",
        role: "VIP Platinum",
        avatar: "P",
    },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// ---- CATEGORY FILTER TABS ----
const CATEGORY_TABS = [
    { key: "all", label: "All" },
    { key: "Action / Shooter", label: "Action & Shooter" },
    { key: "MOBA / Strategy", label: "MOBA" },
    { key: "RPG / Open World / MMO", label: "RPG" },
    { key: "Sports / Racing", label: "Sports & Racing" },
    { key: "Social / Casual / Simulation", label: "Casual & Social" },
    { key: "Other", label: "Other" },
];

// ---- Topup Card ----
function TopupCard({ game }: { game: Game }) {
    return (
        <Link href={`/game/${game.slug}`} className="group">
            <div className="glass-card rounded-xl overflow-hidden hover:glow-primary transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-32 overflow-hidden bg-muted">
                    {game.image ? (
                        <img
                            src={game.image}
                            alt={game.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
                    {/* Category chip */}
                    <span className="absolute top-2 left-2 text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-primary/80 uppercase tracking-wide">
                        {game.category?.toUpperCase() || "MOBILE"}
                    </span>
                    {/* HOT badge */}
                    {game.label === "HOT" && (
                        <span className="absolute top-2 right-2 text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-red-500">
                            HOT
                        </span>
                    )}
                </div>
                <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{game.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 uppercase tracking-wide">
                        {game.category || ""}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground">เริ่มต้น</span>
                        <span className="text-primary font-bold text-sm">฿35</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function Home() {
    const { t } = useLanguage();

    // Flash sale ends in a few hours
    const flashEnd = useRef(new Date(Date.now() + 12 * 3600 * 1000 + 45 * 60 * 1000 + 8 * 1000));
    const countdown = useCountdown(flashEnd.current);

    // Games state
    const [games, setGames] = useState<Game[]>([]);
    const [loadingGames, setLoadingGames] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [visibleGamesCount, setVisibleGamesCount] = useState(12);

    useEffect(() => {
        setVisibleGamesCount(12);
    }, [activeTab]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/games/list`)
            .then((r) => r.json())
            .then((d) => setGames(d.data || []))
            .catch(() => setGames([]))
            .finally(() => setLoadingGames(false));
    }, []);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const reviewsContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth } = scrollContainerRef.current;
            const scrollAmount = clientWidth * 0.75;
            scrollContainerRef.current.scrollTo({
                left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const scrollReviews = (direction: "left" | "right") => {
        if (reviewsContainerRef.current) {
            const { scrollLeft, clientWidth } = reviewsContainerRef.current;
            const scrollAmount = clientWidth * 0.75;
            reviewsContainerRef.current.scrollTo({
                left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const flashGames = games.slice(0, 10);
    const filteredGames = activeTab === "all"
        ? games
        : games.filter((g) =>
            g.category?.toLowerCase().includes(activeTab.toLowerCase())
        );

    return (
        <div className="min-h-screen">
            {/* ── Banner Slider ── */}
            <div className="w-full max-w-[1400px] mx-auto px-4 pt-6">
                <BannerSlider />
            </div>

            {/* ── Flash Sale ── */}
            <section className="container mx-auto px-4 mt-2 mb-8">
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#2a1616] border border-[#3a1a1a] text-[#fc5555] text-xs sm:text-base font-bold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                            Flash Sale
                        </div>
                        {/* Countdown */}
                        <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground ml-1.5 sm:ml-3">
                            <span className="text-xs sm:text-base text-muted-foreground mr-0.5 sm:mr-1">จบใน</span>
                            <Digit n={countdown.h} />
                            <span className="text-sm font-medium text-muted-foreground">:</span>
                            <Digit n={countdown.m} />
                            <span className="text-sm font-medium text-muted-foreground">:</span>
                            <Digit n={countdown.s} />
                        </div>
                    </div>
                    {/* Navigation Arrows */}
                    <div className="hidden sm:flex items-center gap-2">
                        <button
                            onClick={() => scroll("left")}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card transition-all"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card transition-all"
                            aria-label="Next"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Flash cards */}
                {loadingGames ? (
                    <div className="flex gap-4 overflow-x-auto pt-4 pb-4 scrollbar-hide snap-x snap-mandatory">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-[180px] sm:w-[260px] flex-shrink-0 snap-start glass-card rounded-xl h-48 shimmer" />
                        ))}
                    </div>
                ) : flashGames.length > 0 ? (
                    <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto pt-4 pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth">
                        {flashGames.map((g) => (
                            <div key={g.id} className="w-[180px] sm:w-[260px] flex-shrink-0 snap-start">
                                <FlashCard game={g} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8 text-sm">ยังไม่มีสินค้า Flash Sale ในขณะนี้</div>
                )}
            </section>

            {/* ── Game TOP-UP by UID ── */}
            <section id="all-games" className="container mx-auto px-4 mb-10">
                <div className="flex items-center justify-between mb-1">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Game TOP-UP by UID</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">{games.length} เกม</p>
                    </div>
                    {visibleGamesCount < filteredGames.length && (
                        <button
                            onClick={() => setVisibleGamesCount(prev => prev + 12)}
                            className="flex items-center gap-1 text-xs text-primary hover:underline bg-transparent border-0 cursor-pointer"
                        >
                            แสดงเพิ่มเติม <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Category filter tabs */}
                <div className="flex items-center gap-2 mt-3 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                    {CATEGORY_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${activeTab === tab.key
                                ? "bg-primary text-background border-primary"
                                : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Game grid */}
                {loadingGames ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="glass-card rounded-xl h-44 shimmer" />
                        ))}
                    </div>
                ) : filteredGames.length > 0 ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {filteredGames.slice(0, visibleGamesCount).map((g) => <TopupCard key={g.id} game={g} />)}
                        </div>
                        {visibleGamesCount < filteredGames.length && (
                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={() => setVisibleGamesCount(prev => prev + 16)}
                                    className="px-8 py-3 text-xs font-bold rounded-full bg-transparent border border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:glow-primary hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary/20"
                                >
                                    แสดงเพิ่มเติม ({filteredGames.length - visibleGamesCount} เกม)
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-10 text-sm">ไม่มีเกมในหมวดหมู่นี้</div>
                )}
            </section>

            {/* ── Review Section ── */}
            <section className="container mx-auto px-4 mb-16">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">รีวิวจากผู้ใช้บริการ</h2>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mt-1">
                            <p className="text-xs text-muted-foreground">ความประทับใจจากผู้ใช้บริการ</p>
                            <span className="w-fit inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-success/15 text-success border border-success/30 uppercase tracking-wider shadow-[0_0_8px_rgba(34,197,94,0.15)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                เติมสำเร็จแล้วกว่า 12,850 รายการ
                            </span>
                        </div>
                    </div>
                    {/* Navigation Arrows */}
                    <div className="hidden sm:flex items-center gap-2">
                        <button
                            onClick={() => scrollReviews("left")}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card transition-all"
                            aria-label="Previous review"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => scrollReviews("right")}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card transition-all"
                            aria-label="Next review"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div ref={reviewsContainerRef} className="flex gap-4 overflow-x-auto pt-4 pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth">
                    {reviews.map((r) => (
                        <div key={r.id} className="w-[285px] sm:w-[360px] flex-shrink-0 snap-start glass-card rounded-2xl p-5 hover-lift border border-border/40 hover:border-primary/40 transition-all duration-300 shadow-md hover:shadow-primary/5">
                            {/* Stars */}
                            <div className="flex gap-0.5 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < r.stars ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                                    />
                                ))}
                            </div>
                            {/* Quote */}
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4 min-h-[60px]">{r.text}</p>
                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <Avatar className="w-9 h-9 border border-primary/20 shadow-md">
                                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 via-[#0ea5e9] to-fuchsia-500 text-white text-xs font-extrabold select-none">
                                        {r.avatar}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <p className="text-sm font-semibold text-foreground leading-none">{r.name}</p>
                                    <span className="w-fit inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest mt-1.5 leading-none">
                                        {r.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}
