"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Zap, ArrowRight, Star, ChevronRight, ChevronLeft } from "lucide-react";
import { GamesSection } from "@/components/game-card";
import { useLanguage } from "@/components/language-context";
import BannerSlider from "@/components/BannerSlider";
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
        <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm sm:text-base font-black tabular-nums shadow-[0_0_10px_rgba(239,68,68,0.05)]">
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

function getFlashSalePrices(name: string) {
    const lower = name.toLowerCase();
    if (lower.includes("valorant")) return { original: 350, sale: 289 };
    if (lower.includes("genshin")) return { original: 180, sale: 139 };
    if (lower.includes("roblox")) return { original: 150, sale: 119 };
    if (lower.includes("free fire") || lower.includes("freefire")) return { original: 90, sale: 69 };
    if (lower.includes("pubg")) return { original: 220, sale: 169 };
    if (lower.includes("rov") || lower.includes("arena of valor")) return { original: 120, sale: 89 };
    if (lower.includes("mobile legends")) return { original: 160, sale: 129 };
    const val = (name.length * 7) % 150 + 49;
    return { original: Math.round(val * 1.3), sale: val };
}

function getFlashSaleStock(name: string) {
    const percent = (name.length * 13) % 40 + 55;
    const remaining = (name.length * 3) % 15 + 3;
    return { percent, remaining };
}

// ---- Flash Sale Card ----
function FlashCard({ game }: { game: Game }) {
    const badge = discountLabel[game.label] || discountLabel.NONE;
    const { original, sale } = getFlashSalePrices(game.name);
    const { percent, remaining } = getFlashSaleStock(game.name);

    return (
        <Link href={`/game/${game.slug}`} className="group block relative">
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 dark:bg-gradient-to-b dark:from-[#18181b]/90 dark:to-[#09090b]/90 dark:border-white/10 p-3 hover:border-red-500/50 hover:shadow-[0_0_25px_rgba(239,68,68,0.2)] transition-all duration-300 group-hover:-translate-y-1">
                {/* Neon glow effect behind card on hover */}
                <div className="absolute -inset-px bg-gradient-to-t from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

                {/* Image Section */}
                <div className="relative h-40 w-full overflow-hidden rounded-xl bg-muted mb-3">
                    {game.image ? (
                        <img
                            src={game.image}
                            alt={game.name}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />

                    {/* Badge */}
                    <span className="absolute top-2 left-2 text-[10px] font-black text-white px-2.5 py-1 rounded bg-gradient-to-r from-red-600 to-orange-500 shadow-lg animate-pulse uppercase tracking-wider">
                        {badge}
                    </span>

                    {/* Remaining Stock Indicator */}
                    <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-black/70 text-orange-400 backdrop-blur-md px-2 py-0.5 rounded border border-orange-500/30">
                        🔥 เหลือ {remaining} ชิ้นสุดท้าย
                    </span>
                </div>

                {/* Info Section */}
                <div className="space-y-2">
                    <p className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-red-400 transition-colors">
                        {game.name}
                    </p>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2">
                        <span className="text-red-500 font-extrabold text-base sm:text-lg">
                            ฿{sale.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-xs line-through">
                            ฿{original.toLocaleString()}
                        </span>
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

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const reviewsContainerRef = useRef<HTMLDivElement>(null);

    // Flash sale ends in a few hours
    const flashEnd = useRef(new Date(Date.now() + 12 * 3600 * 1000 + 45 * 60 * 1000 + 8 * 1000));
    const countdown = useCountdown(flashEnd.current);

    // Games state
    const [games, setGames] = useState<Game[]>([]);
    const [loadingGames, setLoadingGames] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [visibleGamesCount, setVisibleGamesCount] = useState(12);

    const flashGames = games.slice(0, 10);

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

    // Autoplay looping slide for Flash Sale
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || loadingGames || games.length === 0) return;
        
        let intervalId: any;
        let isHovered = false;
        
        const handleMouseEnter = () => { isHovered = true; };
        const handleMouseLeave = () => { isHovered = false; };
        
        container.addEventListener("mouseenter", handleMouseEnter);
        container.addEventListener("mouseleave", handleMouseLeave);
        
        intervalId = setInterval(() => {
            if (isHovered) return;
            const { scrollLeft, scrollWidth, clientWidth } = container;
            if (scrollLeft + clientWidth >= scrollWidth - 50) {
                container.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                container.scrollBy({ left: 280, behavior: "smooth" });
            }
        }, 3000);
        
        return () => {
            clearInterval(intervalId);
            if (container) {
                container.removeEventListener("mouseenter", handleMouseEnter);
                container.removeEventListener("mouseleave", handleMouseLeave);
            }
        };
    }, [loadingGames, games]);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const { scrollLeft, scrollWidth, clientWidth } = container;
            const scrollAmount = 300;
            
            if (direction === "left") {
                if (scrollLeft <= 5) {
                    container.scrollTo({
                        left: scrollWidth - clientWidth,
                        behavior: "smooth"
                    });
                } else {
                    container.scrollBy({
                        left: -scrollAmount,
                        behavior: "smooth",
                    });
                }
            } else {
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    container.scrollTo({
                        left: 0,
                        behavior: "smooth"
                    });
                } else {
                    container.scrollBy({
                        left: scrollAmount,
                        behavior: "smooth",
                    });
                }
            }
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
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white border-transparent dark:from-red-950 dark:via-red-900 dark:to-red-950 dark:border-red-500/30 dark:text-red-500 text-xs sm:text-base font-black px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.15)] uppercase tracking-wider">
                            <Zap className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 fill-current animate-bounce text-yellow-300 dark:text-yellow-500" />
                            Flash Sale
                        </div>
                        {/* Countdown */}
                        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground ml-1.5 sm:ml-4">
                            <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mr-1">จบใน</span>
                            <Digit n={countdown.h} />
                            <span className="text-sm font-black text-red-500 animate-pulse">:</span>
                            <Digit n={countdown.m} />
                            <span className="text-sm font-black text-red-500 animate-pulse">:</span>
                            <Digit n={countdown.s} />
                        </div>
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
                    <div className="relative group/slider w-full">
                        {/* Floating Arrow Left */}
                        <button
                            onClick={() => scroll("left")}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full border border-border/80 bg-background/90 text-muted-foreground hover:text-foreground hover:bg-background shadow-lg transition-all opacity-0 group-hover/slider:opacity-100 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Scrolling track */}
                        <div 
                            ref={scrollContainerRef} 
                            className="flex gap-4 overflow-x-auto pt-4 pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth relative"
                        >
                            {flashGames.map((g) => (
                                <div key={g.id} className="w-[180px] sm:w-[260px] flex-shrink-0 snap-start">
                                    <FlashCard game={g} />
                                </div>
                            ))}
                        </div>

                        {/* Floating Arrow Right */}
                        <button
                            onClick={() => scroll("right")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full border border-border/80 bg-background/90 text-muted-foreground hover:text-foreground hover:bg-background shadow-lg transition-all opacity-0 group-hover/slider:opacity-100 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
                            aria-label="Next"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
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
        </div>
    );
}
