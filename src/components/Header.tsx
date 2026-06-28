"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, LogOut, LogIn, Headphones, Star, Moon, Sun, Coins, Gamepad2, Wallet, ShoppingCart, Ticket, Crown, Users, History, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/components/language-context";
import { useSidebar } from "@/components/sidebar-context";
import { useState, useRef, useEffect } from "react";

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const { lang, t } = useLanguage();
    const { open, toggle } = useSidebar();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);
    const [balance, setBalance] = useState<number>(0);
    const [allGames, setAllGames] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                const response = await fetch(`${API_BASE_URL}/games/list`);
                if (response.ok) {
                    const data = await response.json();
                    setAllGames(data.data || []);
                }
            } catch (err) {
                console.error("Error fetching games list in Header:", err);
            }
        };
        fetchGames();
    }, []);

    const suggestions = searchQuery.trim()
        ? allGames
            .filter(game => {
                const queryClean = searchQuery.trim().toLowerCase();
                if (!queryClean) return true;
                return game.name.toLowerCase().startsWith(queryClean);
            })
            .sort((a, b) => a.name.localeCompare(b.name, 'th'))
            .slice(0, 5)
        : [];

    // Gacha Lucky Wheel States
    const [txHistory, setTxHistory] = useState<any[]>([]);
    const [usedSpins, setUsedSpins] = useState(0);
    const [showGachaModal, setShowGachaModal] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [winningSegmentIndex, setWinningSegmentIndex] = useState(0);
    const [showPrizeClaimed, setShowPrizeClaimed] = useState(false);
    const [claimedPrizeText, setClaimedPrizeText] = useState("");
    const [showSpinHistory, setShowSpinHistory] = useState(false);
    const [spinHistoryData, setSpinHistoryData] = useState<{ items: any[]; total: number }>({ items: [], total: 0 });

    const fetchTopupsAndSpins = () => {
        if (user) {
            api.getTopupTransactions({ limit: 100 })
                .then((d) => setTxHistory(d?.items ?? []))
                .catch(() => setTxHistory([]));

            const stored = localStorage.getItem(`gachapay_used_spins_${user.id}`);
            setUsedSpins(stored ? parseInt(stored, 10) : 0);
        }
    };

    const fetchSpinHistory = () => {
        if (user) {
            api.getGachaSpins({ limit: 50 })
                .then((d) => {
                    // Map snake_case from backend to camelCase for frontend
                    const mappedItems = (d?.items ?? []).map((item: any) => ({
                        id: item.id,
                        prizeAmount: item.prize_amount,
                        prizeLabel: item.prize_label,
                        won: item.won,
                        createdAt: item.created_at,
                        orderId: item.order_id,
                    }));
                    setSpinHistoryData({ items: mappedItems, total: d?.total ?? 0 });
                })
                .catch(() => setSpinHistoryData({ items: [], total: 0 }));
        }
    };

    useEffect(() => {
        fetchTopupsAndSpins();
        window.addEventListener("balance-changed", fetchTopupsAndSpins);
        return () => {
            window.removeEventListener("balance-changed", fetchTopupsAndSpins);
        };
    }, [user]);

    const fetchBalance = () => {
        if (user) {
            api.getWalletBalance()
                .then((resData) => {
                    setBalance(parseFloat(resData?.amount ?? "0"));
                })
                .catch(() => {
                    setBalance(user.balance ?? 0);
                });
        }
    };

    useEffect(() => {
        fetchBalance();
        window.addEventListener("balance-changed", fetchBalance);
        return () => {
            window.removeEventListener("balance-changed", fetchBalance);
        };
    }, [user]);

    // Gacha setup
    const SEGMENTS = [
        { value: 5, label: "5 COINS" },
        { value: 0, label: "เกลือ (ไม่ได้)" },
        { value: 10, label: "10 COINS" },
        { value: 50, label: "50 COINS" },
        { value: 0, label: "เกลือ (ไม่ได้)" },
        { value: 20, label: "20 COINS" },
        { value: 5, label: "5 COINS" },
        { value: 0, label: "เกลือ (ไม่ได้)" },
    ];

    const totalTopup = txHistory
        .filter((tx) => tx.status === "completed")
        .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
    const totalSpins = Math.floor(totalTopup / 1000);
    const availableSpins = Math.max(0, totalSpins - usedSpins);
    const progressToNextSpin = totalTopup % 1000;

    const spinGacha = () => {
        const rand = Math.random() * 100;
        if (rand < 30) {
            // Salt (Segments 1, 4, 7)
            const salts = [1, 4, 7];
            return salts[Math.floor(Math.random() * salts.length)];
        } else if (rand < 65) {
            // 5 Coins (Segments 0, 6)
            const fives = [0, 6];
            return fives[Math.floor(Math.random() * fives.length)];
        } else if (rand < 85) {
            // 10 Coins (Segment 2)
            return 2;
        } else if (rand < 95) {
            // 20 Coins (Segment 5)
            return 5;
        } else {
            // 50 Coins (Segment 3)
            return 3;
        }
    };

    const startSpin = () => {
        if (isSpinning || availableSpins <= 0) return;

        // Reset rotation first to rotate correctly on multiple spins
        setRotation(prev => prev % 360);

        setTimeout(() => {
            setIsSpinning(true);
            const winningIndex = spinGacha();
            setWinningSegmentIndex(winningIndex);

            const extraSpins = 6;
            const jitter = (Math.random() - 0.5) * 20; // -10 to +10 degrees
            const targetRotation = (extraSpins * 360) + (360 - (winningIndex * 45) - 22.5) + jitter;
            setRotation(targetRotation);
        }, 50);
    };

    const handleTransitionEnd = async () => {
        setIsSpinning(false);
        const prize = SEGMENTS[winningSegmentIndex];

        // Record used spin
        const newUsed = usedSpins + 1;
        setUsedSpins(newUsed);
        localStorage.setItem(`gachapay_used_spins_${user?.id}`, newUsed.toString());
        // Record spin for auditing (won or not)
        try {
            await api.recordGachaSpin({
                prizeAmount: prize.value ?? 0,
                prizeLabel: prize.label ?? null,
                won: (prize.value ?? 0) > 0,
                orderId: null,
            });
        } catch (err) {
            console.error("Failed to record gacha spin:", err);
        }

        if (prize.value > 0) {
            setClaimedPrizeText(`ได้รับ ${prize.value} COINS!`);
            setShowPrizeClaimed(true);

            try {
                // Call dedicated gacha claim endpoint to increment wallet balance directly
                const result = await api.claimGachaReward(prize.value);
                if (result && result.success) {
                    // Update gacha bonus coins in localStorage
                    if (user) {
                        const currentBonus = parseFloat(localStorage.getItem(`gachapay_bonus_coins_${user.id}`) || "0");
                        localStorage.setItem(`gachapay_bonus_coins_${user.id}`, String(currentBonus + prize.value));
                    }
                    // Dispatch change event to trigger reload across components
                    window.dispatchEvent(new Event("balance-changed"));
                }
            } catch (err) {
                console.error("Gacha payout fail:", err);
            }
        } else {
            setClaimedPrizeText("ไม่ได้รางวัล (เกลือ)");
            setShowPrizeClaimed(true);
        }
    };

    const [vipTier, setVipTier] = useState<string | null>(null);

    // Fetch VIP tier dynamically
    useEffect(() => {
        if (user) {
            api.getLoyalty()
                .then((data) => {
                    if (data && data.tier) {
                        const tierMap: Record<string, string> = {
                            MEMBER: "General Member",
                            BRONZE: "Bronze",
                            SILVER: "Platinum",
                            GOLD: "Platinum",
                            PLATINUM: "Platinum",
                            EMERALD: "Emerald",
                        };
                        const mapped = tierMap[data.tier.toUpperCase()] || data.tier;
                        setVipTier(mapped);
                    }
                })
                .catch(() => {
                    if (user.vipLevel) {
                        const legacyMap: Record<number, string> = {
                            1: "Bronze",
                            2: "Platinum",
                            3: "Emerald",
                        };
                        setVipTier(legacyMap[user.vipLevel] || `Level ${user.vipLevel}`);
                    }
                });
        } else {
            setVipTier(null);
        }
    }, [user]);

    // Wait until mounted to read theme (avoids SSR hydration mismatch)
    useEffect(() => { setMounted(true); }, []);

    // Always use resolvedTheme for display — it reads from localStorage correctly
    const currentTheme = mounted ? (resolvedTheme ?? "dark") : "dark";

    // ซ่อน Header ของ user เมื่ออยู่ในหน้า admin หรือหน้า auth
    const isAuthPage = ["/login", "/register", "/forgot-password", "/verify-otp", "/reset-password"].includes(pathname);
    if (pathname.startsWith("/admin") || isAuthPage) return null;

    // pages that have the account sidebar
    const hasSidebar = pathname.startsWith("/account") ||
        pathname === "/balance" ||
        pathname === "/invite" ||
        pathname === "/vip-tier" ||
        pathname.startsWith("/history");

    const getUserInitials = () => {
        if (!user?.email) return "U";
        return user.email.charAt(0).toUpperCase();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
        }
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border/50 shadow-sm">
                <div className="container mx-auto px-4 w-full">
                    <div className="flex items-center h-14 gap-3">

                        {/* ── LEFT: Logo + Nav ── */}
                        <div className="flex items-center gap-3 shrink-0">
                            {/* Logo — premium brand styling */}
                            <Link href="/" className="flex items-center gap-2 group shrink-0 select-none">
                                {/* Glowing Icon Badge */}
                                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/15 border border-primary/30 group-hover:border-primary/60 shadow-[0_0_12px_rgba(6,182,212,0.2)] transition-all duration-300">
                                    <Gamepad2 className="w-4.5 h-4.5 text-primary drop-shadow-[0_0_6px_rgba(6,182,212,0.5)] group-hover:scale-110 transition-transform duration-300" />
                                    <span className="absolute -inset-0.5 rounded-lg bg-gradient-to-br from-primary to-secondary opacity-0 group-hover:opacity-10 blur-sm transition-opacity duration-300" />
                                </div>
                                {/* Text Logo */}
                                <div className="flex flex-col">
                                    <span className="text-sm sm:text-base font-black tracking-widest text-primary drop-shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-transform duration-300">
                                        GACHA<span className="text-foreground dark:text-white drop-shadow-none">PAY</span>
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* ── CENTER: Search bar ── */}
                        <div className="flex-1 max-w-md hidden sm:block relative ml-6">
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    placeholder="ค้นหาชื่อเกม"
                                    className="w-full bg-muted/85 hover:bg-muted dark:bg-[#0c0d14] dark:hover:bg-[#121420] border border-border/80 hover:border-primary/50 focus:border-primary rounded-full pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/75 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm focus:shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                                />
                            </form>

                            {/* Desktop Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in duration-200">
                                    <div className="py-1">
                                        {suggestions.map((game) => (
                                            <button
                                                key={game.slug}
                                                type="button"
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setShowSuggestions(false);
                                                    router.push(`/game/${game.slug}`);
                                                }}
                                                className="w-full px-4 py-2 text-left text-xs hover:bg-muted/50 text-foreground font-medium flex items-center gap-3 transition-colors cursor-pointer"
                                            >
                                                <img src={game.image} alt={game.name} className="w-8 h-8 rounded-lg object-cover" />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground">{game.name}</span>
                                                    <span className="text-[9px] text-muted-foreground uppercase">{game.category}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── RIGHT: Coin + User ── */}
                        <div className="flex items-center gap-2 shrink-0 ml-auto">
                            {/* Mobile search icon */}
                            <Button variant="ghost" size="icon" className="sm:hidden hover:bg-muted w-8 h-8 cursor-pointer" onClick={() => setSearchOpen(!searchOpen)}>
                                <Search className="w-4 h-4" />
                            </Button>

                            {/* Coin balance — show when logged in */}
                            {user && (
                                <Link href="/balance" className="group hidden sm:flex items-center gap-1.5 bg-transparent hover:bg-gradient-to-r hover:from-amber-500 hover:to-yellow-400 border border-amber-500/35 hover:border-amber-400/50 text-amber-500 dark:text-amber-400 hover:text-slate-950 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.02)] hover:shadow-[0_4px_16px_rgba(245,158,11,0.3)] shrink-0">
                                    <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 dark:text-amber-400 group-hover:text-slate-950 transition-colors shrink-0" />
                                    <div className="flex items-baseline gap-0.5 sm:gap-1 font-mono">
                                        <span className="text-xs sm:text-sm font-black tracking-tight text-amber-600 dark:text-amber-400 group-hover:text-slate-950 transition-colors">{balance.toLocaleString()}</span>
                                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-amber-500/80 dark:text-amber-400/80 group-hover:text-slate-950/80 transition-colors">COIN</span>
                                    </div>
                                </Link>
                            )}

                            {/* Capsule Theme Switcher in Navbar */}
                            <div
                                className="relative flex items-center w-[72px] h-8 bg-muted/40 dark:bg-[#090a0f] border border-border/40 rounded-full p-1 cursor-pointer select-none transition-all duration-300 shrink-0 hover:scale-105 active:scale-95 shadow-sm ml-1"
                                onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                            >
                                {/* Sliding active pill indicator */}
                                <div
                                    className={cn(
                                        "absolute top-0.5 bottom-0.5 w-7 rounded-full bg-white dark:bg-[#2a303f] shadow-sm transition-transform duration-300 ease-out",
                                        currentTheme === "dark" ? "translate-x-[36px]" : "translate-x-0"
                                    )}
                                />
                                {/* Sun Icon (Left) */}
                                <div className="relative z-10 flex-1 flex items-center justify-center h-full">
                                    <Sun className={cn("w-3.5 h-3.5 transition-colors duration-300", currentTheme === "light" ? "text-amber-500 fill-current" : "text-muted-foreground")} />
                                </div>
                                {/* Moon Icon (Right) */}
                                <div className="relative z-10 flex-1 flex items-center justify-center h-full">
                                    <Moon className={cn("w-3.5 h-3.5 transition-colors duration-300", currentTheme === "dark" ? "text-blue-400 fill-current" : "text-muted-foreground")} />
                                </div>
                            </div>

                            {/* User Menu */}
                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="hover:bg-muted/10 rounded-full w-9 h-9 p-0 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ml-1 cursor-pointer outline-none shrink-0">
                                            <Avatar className="w-8 h-8 border-2 border-primary/80 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                                                <AvatarFallback className="bg-gradient-to-br from-cyan-500 via-[#0ea5e9] to-fuchsia-500 text-white text-xs font-extrabold select-none">
                                                    {getUserInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64 glass-card border-border/50 py-2">
                                        {/* Header */}
                                        <div className="px-3 py-2 mb-1 flex flex-col gap-1">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
                                                {vipTier && (
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm"
                                                            style={{
                                                                backgroundColor: vipTier === "General Member" ? "#94a3b8" : vipTier === "Bronze" ? "#b45309" : vipTier === "Platinum" ? "#38bdf8" : vipTier === "Emerald" ? "#10b981" : "#94a3b8"
                                                            }}
                                                        />
                                                        <span className="text-[11px] font-semibold text-muted-foreground">
                                                            {vipTier}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">ID: {user.id && user.id.length > 8 ? `${user.id.substring(0, 8)}...` : user.id}</span>

                                            {/* Mobile-only Wallet displays */}
                                            <div className="sm:hidden flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
                                                <Coins className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                                <span className="text-xs font-bold text-foreground">
                                                    {balance.toLocaleString()} COIN
                                                </span>
                                            </div>
                                        </div>

                                        <DropdownMenuSeparator className="mb-1" />

                                        {/* บัญชีของฉัน (My Account) */}
                                        <DropdownMenuItem asChild>
                                            <Link href="/account" className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 rounded-lg mx-1">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm">บัญชีของฉัน</span>
                                            </Link>
                                        </DropdownMenuItem>

                                        {/* เติมเงิน (Top-up) */}
                                        <DropdownMenuItem asChild>
                                            <Link href="/balance" className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 rounded-lg mx-1">
                                                <Wallet className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm">กระเป๋าคอยน์</span>
                                            </Link>
                                        </DropdownMenuItem>

                                        {/* คำสั่งซื้อ (Orders) */}
                                        <DropdownMenuItem asChild>
                                            <Link href="/history" className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 rounded-lg mx-1">
                                                <History className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm">ประวัติการสั่งซื้อ</span>
                                            </Link>
                                        </DropdownMenuItem>

                                        {/* เชิญเพื่อน (Invite Friends) */}
                                        <DropdownMenuItem asChild>
                                            <Link href="/invite" className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 rounded-lg mx-1">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm">เชิญเพื่อนเพื่อรับโบนัส</span>
                                            </Link>
                                        </DropdownMenuItem>


                                        {/* ติดต่อหรือขอความช่วยเหลือ (Support) */}
                                        <DropdownMenuItem asChild>
                                            <Link href="/support" className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 rounded-lg mx-1">
                                                <Headphones className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground font-medium">ติดต่อหรือขอความช่วยเหลือ</span>
                                            </Link>
                                        </DropdownMenuItem>


                                        <DropdownMenuSeparator className="my-1" />

                                        {/* ออกจากระบบ (Logout) */}
                                        <DropdownMenuItem asChild>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    router.push("/");
                                                }}
                                                className="w-[calc(100%-8px)] flex items-center gap-3 px-3 py-2.5 text-destructive cursor-pointer hover:bg-destructive/10 rounded-lg mx-1 text-left border-none bg-transparent"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span className="text-sm">ออกจากระบบ</span>
                                            </button>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link href="/login">
                                    <Button
                                        size="sm"
                                        className="bg-foreground text-background border-0 hover:bg-foreground/90 hover:text-background text-xs h-8 px-4 font-semibold shadow-sm transition-all"
                                    >
                                        <LogIn className="w-3.5 h-3.5 mr-1.5" />
                                        เข้าสู่ระบบ
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* ── Mobile Search Bar ── */}
                    {searchOpen && (
                        <div className="sm:hidden pb-3 w-full relative">
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    placeholder="ค้นหาชื่อเกม"
                                    className="w-full bg-muted/60 border border-border/40 rounded-full pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/80 transition-all outline-none"
                                    autoFocus
                                />
                            </form>

                            {/* Mobile Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in duration-200">
                                    <div className="py-1">
                                        {suggestions.map((game) => (
                                            <button
                                                key={game.slug}
                                                type="button"
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setShowSuggestions(false);
                                                    setSearchOpen(false);
                                                    router.push(`/game/${game.slug}`);
                                                }}
                                                className="w-full px-4 py-2 text-left text-xs hover:bg-muted/50 text-foreground font-medium flex items-center gap-3 transition-colors cursor-pointer"
                                            >
                                                <img src={game.image} alt={game.name} className="w-8 h-8 rounded-lg object-cover" />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground">{game.name}</span>
                                                    <span className="text-[9px] text-muted-foreground uppercase">{game.category}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Gacha Lucky Wheel Floating FAB Icon */}
            {user && (
                <div className="fixed bottom-6 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end animate-subtle-bounce hover:animate-none">
                    {/* FAB Button */}
                    <button
                        onClick={() => setShowGachaModal(true)}
                        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:to-red-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-6 h-6 animate-[spin_8s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite]"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 2v20" />
                            <path d="M2 12h20" />
                            <path d="m19.07 4.93-14.14 14.14" />
                            <path d="m4.93 4.93 14.14 14.14" />
                            <circle cx="12" cy="12" r="2" fill="currentColor" />
                        </svg>
                        {availableSpins > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-md border border-white">
                                {availableSpins}
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* Gacha Wheel Modal */}
            {showGachaModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-background rounded-2xl w-full max-w-md shadow-2xl border border-border/40 overflow-hidden relative p-6 flex flex-col items-center">
                        {/* Close button */}
                        <button
                            disabled={isSpinning}
                            onClick={() => {
                                if (!isSpinning) {
                                    setShowGachaModal(false);
                                    setShowPrizeClaimed(false);
                                }
                            }}
                            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl sm:text-2xl font-black text-center mb-1 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-amber-500 to-red-500 uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)] select-none">
                            Gacha Lucky Wheel
                        </h2>
                        <p className="text-xs text-muted-foreground text-center mb-6">
                            สุ่มรับคอยน์ฟรี เมื่อมียอดเติมเงินสะสมครบทุก 1,000 บาท
                        </p>

                        {!showPrizeClaimed ? (
                            <div className="flex flex-col items-center gap-6 w-full">
                                {/* Wheel Wrapper */}
                                <div className="relative p-4 bg-muted/30 rounded-full shadow-inner border border-border/20">
                                    {/* Top Pointer */}
                                    <div className="absolute top-1 left-1/2 -translate-x-1/2 z-30 select-none">
                                        <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-red-500 drop-shadow-md animate-bounce" />
                                    </div>

                                    {/* The Wheel */}
                                    <div
                                        onClick={() => {
                                            if (!isSpinning && availableSpins > 0) {
                                                startSpin();
                                            }
                                        }}
                                        className={cn(
                                            "relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-foreground/10 shadow-2xl overflow-hidden select-none transition-all duration-300",
                                            !isSpinning && availableSpins > 0
                                                ? "cursor-pointer hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(20,184,166,0.25)] active:scale-[0.99]"
                                                : ""
                                        )}
                                    >
                                        <div
                                            style={{
                                                background: 'conic-gradient(#14b8a6 0deg 45deg, #64748b 45deg 90deg, #3b82f6 90deg 135deg, #eab308 135deg 180deg, #475569 180deg 225deg, #a855f7 225deg 270deg, #0d9488 270deg 315deg, #334155 315deg 360deg)',
                                                transform: `rotate(${rotation}deg)`,
                                                transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.85, 0.15, 1)' : 'none'
                                            }}
                                            onTransitionEnd={handleTransitionEnd}
                                            className="w-full h-full rounded-full relative"
                                        >
                                            {SEGMENTS.map((seg, i) => {
                                                const angle = i * 45 + 22.5;
                                                return (
                                                    <div
                                                        key={i}
                                                        className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-start origin-center pt-8 text-[11px] font-black text-white select-none pointer-events-none drop-shadow-md"
                                                        style={{ transform: `rotate(${angle}deg)` }}
                                                    >
                                                        <div className="text-[12px] uppercase font-black tracking-wider">{seg.value > 0 ? `${seg.value}` : "เกลือ"}</div>
                                                        <div className="text-[7px] opacity-80 uppercase tracking-widest">{seg.value > 0 ? "Coins" : "เสียใจด้วย"}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Center Spin Button / Cap */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <button
                                                disabled={isSpinning || availableSpins <= 0}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startSpin();
                                                }}
                                                className={cn(
                                                    "w-16 h-16 rounded-full border-4 border-background shadow-xl flex flex-col items-center justify-center z-30 select-none transition-all duration-300 pointer-events-auto",
                                                    isSpinning
                                                        ? "bg-muted text-muted-foreground scale-95"
                                                        : availableSpins > 0
                                                            ? "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white font-black cursor-pointer scale-100 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                                                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-300 dark:border-zinc-700 cursor-not-allowed"
                                                )}
                                            >
                                                {isSpinning ? (
                                                    <span className="text-[9px] font-black tracking-tighter">SPINNING</span>
                                                ) : availableSpins > 0 ? (
                                                    <>
                                                        <span className="text-[11px] font-black tracking-wider drop-shadow-sm leading-none">SPIN</span>
                                                        <span className="text-[7px] font-bold text-amber-100 mt-0.5">หมุนเลย!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-[10px] font-bold leading-none">LOCK</span>
                                                        <span className="text-[6px] text-zinc-500 mt-0.5">สะสมยอด</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Spin Stats & Progress Bar (No Big Button below!) */}
                                <div className="text-center w-full mt-2">
                                    <div className="flex justify-between text-xs font-semibold text-muted-foreground px-4 mb-2">
                                        <span>ยอดเติมเงินสะสม: ฿{totalTopup.toLocaleString()}</span>
                                        <span>สิทธิ์คงเหลือ: <span className="text-primary font-bold">{availableSpins} ครั้ง</span></span>
                                    </div>
                                    {/* Progress Bar to next spin */}
                                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-primary h-full transition-all duration-500"
                                            style={{ width: `${(progressToNextSpin / 1000) * 100}%` }}
                                        />
                                    </div>
                                    {/* View History Button */}
                                    <button
                                        onClick={() => {
                                            fetchSpinHistory();
                                            setShowSpinHistory(true);
                                        }}
                                        className="mt-4 text-xs text-primary hover:text-primary/80 font-semibold flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
                                    >
                                        <History className="w-3.5 h-3.5" />
                                        ดูประวัติการสุ่ม
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Result Screen */
                            <div className="flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-95 duration-300 w-full">
                                {SEGMENTS[winningSegmentIndex].value > 0 ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-24 h-24 rounded-full bg-yellow-500/10 border-4 border-yellow-500 flex items-center justify-center mb-4 animate-bounce shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                                            <Coins className="w-12 h-12 text-yellow-500" />
                                        </div>
                                        <h3 className="text-2xl font-black text-primary mb-2">ยินดีด้วย!</h3>
                                        <p className="text-sm font-semibold text-foreground mb-1">คุณได้รับรางวัลฟรีคอยน์</p>
                                        <p className="text-3xl font-black text-amber-500 mb-6">+{SEGMENTS[winningSegmentIndex].value} COINS</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-20 h-20 rounded-full bg-muted border-4 border-muted-foreground/30 flex items-center justify-center mb-4">
                                            <Sparkles className="w-10 h-10 text-muted-foreground opacity-50" />
                                        </div>
                                        <h3 className="text-xl font-bold text-muted-foreground mb-2">เกลือซะแล้ว!</h3>
                                        <p className="text-xs text-muted-foreground mb-6 max-w-xs">
                                            ไม่เป็นไรนะ! โอกาสหน้ายังมี สะสมยอดเติมเงินครบทุก ฿1,000 ก็กลับมาลุ้นสุ่มใหม่ได้อีกครั้ง!
                                        </p>
                                    </div>
                                )}

                                <Button
                                    onClick={() => setShowPrizeClaimed(false)}
                                    className="w-full h-10 bg-foreground hover:bg-foreground/90 text-background font-bold rounded-xl"
                                >
                                    ตกลง
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Spin History Modal */}
            {showSpinHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-background rounded-2xl w-full max-w-lg shadow-2xl border border-border/40 overflow-hidden relative p-6 flex flex-col max-h-[80vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">ประวัติการสุ่ม</h3>
                                <p className="text-xs text-muted-foreground">ประวัติการหมุนวงล้อ Gacha Lucky Wheel</p>
                            </div>
                            <button
                                onClick={() => setShowSpinHistory(false)}
                                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-muted/40 rounded-xl p-3 text-center border border-border/30">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ทั้งหมด</p>
                                <p className="text-lg font-bold text-foreground">{spinHistoryData.total}</p>
                            </div>
                            <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">ชนะ</p>
                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                    {spinHistoryData.items.filter(s => s.won).length}
                                </p>
                            </div>
                            <div className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
                                <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider">รวม Coin</p>
                                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                    {spinHistoryData.items.reduce((sum, s) => sum + (s.won ? parseFloat(s.prizeAmount) : 0), 0).toFixed(0)}
                                </p>
                            </div>
                        </div>

                        {/* History List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {spinHistoryData.items.length === 0 ? (
                                <div className="text-center py-8">
                                    <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground">ยังไม่มีประวัติการสุ่ม</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {spinHistoryData.items.map((spin, index) => (
                                        <div
                                            key={spin.id || index}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-xl border transition-all",
                                                spin.won
                                                    ? "bg-emerald-500/5 border-emerald-500/20"
                                                    : "bg-muted/30 border-border/30"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                                    spin.won
                                                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                                        : "bg-muted/50 text-muted-foreground"
                                                )}>
                                                    {spin.won ? (
                                                        <Coins className="w-5 h-5" />
                                                    ) : (
                                                        <Sparkles className="w-5 h-5 opacity-50" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {spin.won ? `+${parseFloat(spin.prizeAmount).toFixed(0)} COINS` : "เกลือ"}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {new Date(spin.createdAt).toLocaleDateString('th-TH', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "px-2 py-1 rounded-full text-[10px] font-bold",
                                                spin.won
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-muted text-muted-foreground"
                                            )}>
                                                {spin.won ? "WIN" : "LOSE"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setShowSpinHistory(false)}
                            className="mt-4 w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all cursor-pointer"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
