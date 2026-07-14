"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, LogOut, LogIn, Headphones, Star, Moon, Sun, Coins, Gamepad2, Wallet, ShoppingCart, Ticket, Crown, Users, History, Sparkles, X, Clock, Bookmark, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
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
import GachaModal from "@/components/GachaModal";

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, updateUser } = useAuth();
    const { lang, setLang, t } = useLanguage();
    useSidebar();
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);
    const [balance, setBalance] = useState<number>(0);
    const [allGames, setAllGames] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [vipTier, setVipTier] = useState<string | null>(null);
    const [showGachaModal, setShowGachaModal] = useState(false);
    const [availableSpins, setAvailableSpins] = useState(0);

    const fetchTopupsAndSpins = () => {
        if (user) {
            api.getTopupTransactions({ limit: 100 })
                .then((d) => {
                    const txs = d?.items ?? [];
                    const totalTopup = txs
                        .filter((tx: any) => tx.status === "completed")
                        .reduce((sum: number, tx: any) => sum + (Number.parseFloat(tx.amount) || 0), 0);
                    const totalSpins = Math.floor(totalTopup / 1000);
                    const stored = localStorage.getItem(`gachapay_used_spins_${user.id}`);
                    const used = stored ? Number.parseInt(stored, 10) : 0;
                    setAvailableSpins(Math.max(0, totalSpins - used));
                })
                .catch(() => {});
        } else {
            setAvailableSpins(0);
        }
    };

    useEffect(() => {
        fetchTopupsAndSpins();
        window.addEventListener("balance-changed", fetchTopupsAndSpins);
        return () => {
            window.removeEventListener("balance-changed", fetchTopupsAndSpins);
        };
    }, [user?.id]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem("gachapay_search_history");
                if (saved) {
                    setSearchHistory(JSON.parse(saved));
                }
            } catch (e) {
                console.error("Error loading search history:", e);
            }
        }
    }, []);

    const saveSearchQuery = (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        setSearchHistory(prev => {
            const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
            const newHistory = [trimmed, ...filtered].slice(0, 5);
            localStorage.setItem("gachapay_search_history", JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const clearHistory = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSearchHistory([]);
        localStorage.removeItem("gachapay_search_history");
    };

    const removeHistoryItem = (e: React.MouseEvent, itemToRemove: string) => {
        e.preventDefault();
        e.stopPropagation();
        setSearchHistory(prev => {
            const newHistory = prev.filter(item => item !== itemToRemove);
            localStorage.setItem("gachapay_search_history", JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const fetchBookmarks = async () => {
        if (user) {
            try {
                const fetched = await api.getBookmarks();
                setBookmarks(fetched || []);
            } catch (e) {
                console.error("Error fetching bookmarks in Header:", e);
            }
        } else {
            setBookmarks([]);
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, [allGames, user]);

    useEffect(() => {
        const handleUpdate = () => {
            fetchBookmarks();
        };
        window.addEventListener("gachapay_bookmarks_changed", handleUpdate);
        return () => window.removeEventListener("gachapay_bookmarks_changed", handleUpdate);
    }, [allGames, user]);

    useEffect(() => {
        const handleOpenGacha = () => {
            setShowGachaModal(true);
        };
        window.addEventListener("open-gacha-modal", handleOpenGacha);
        return () => window.removeEventListener("open-gacha-modal", handleOpenGacha);
    }, []);

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

    const fetchBalance = () => {
        if (user) {
            api.getWalletBalance()
                .then((resData) => {
                    const newBalance = Number.parseFloat(resData?.amount ?? "0");
                    setBalance(newBalance);
                    updateUser({ balance: newBalance });
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
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            setBalance(user.balance ?? 0);
        }
    }, [user?.balance]);

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


    const getUserInitials = () => {
        if (!user?.email) return "U";
        return user.email.charAt(0).toUpperCase();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            saveSearchQuery(searchQuery.trim());
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
        }
    };

    // Bookmark rendering helper to avoid nested ternaries and reduce complexity
    const renderBookmarkContent = () => {
        if (!user) {
            return (
                <div className="px-3 py-4 text-center text-xs text-muted-foreground whitespace-pre-line">
                    {t.headerLoginRequired}
                </div>
            );
        }
        if (bookmarks.length > 0) {
            return bookmarks.map((game) => (
                <DropdownMenuItem key={game.slug} asChild>
                    <Link
                        href={`/game/${game.slug}`}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50 rounded-lg mx-1"
                    >
                        <img src={game.image} alt={game.name} className="w-7 h-7 rounded-md object-cover" />
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-foreground truncate">{game.name}</span>
                            <span className="text-[8px] text-muted-foreground uppercase">{game.category}</span>
                        </div>
                    </Link>
                </DropdownMenuItem>
            ));
        }
        return (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground whitespace-pre-line">
                {t.headerNoPinned}
            </div>
        );
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
                        <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 ml-6">
                            <div className="relative flex-1">
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
                                {showSuggestions && (suggestions.length > 0 || (searchQuery.trim() === "" && !!user && searchHistory.length > 0)) && (
                                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in duration-200">
                                        <div className="py-1">
                                            {suggestions.length > 0 ? (
                                                suggestions.map((game) => (
                                                    <button
                                                        key={game.slug}
                                                        type="button"
                                                        onClick={() => {
                                                            saveSearchQuery(game.name);
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
                                                ))
                                            ) : (
                                                <div className="p-2">
                                                    <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                        <span>ประวัติการค้นหาล่าสุด</span>
                                                        <button
                                                            onMouseDown={clearHistory}
                                                            className="hover:text-primary transition-colors cursor-pointer normal-case"
                                                        >
                                                            ล้างทั้งหมด
                                                        </button>
                                                    </div>
                                                    <div className="mt-1 space-y-0.5">
                                                        {searchHistory.map((query) => (
                                                            <button
                                                                key={query}
                                                                type="button"
                                                                className="group w-full px-3 py-2 text-left text-xs hover:bg-muted/50 text-foreground font-medium flex items-center justify-between rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                                                                onClick={() => {
                                                                    setSearchQuery(query);
                                                                    saveSearchQuery(query);
                                                                    setShowSuggestions(false);
                                                                    router.push(`/search?q=${encodeURIComponent(query)}`);
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <History className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                                    <span>{query}</span>
                                                                </div>
                                                                <button
                                                                    onMouseDown={(e) => removeHistoryItem(e, query)}
                                                                    className="p-1 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                                                    title="ลบ"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bookmark Button */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="w-8 h-8 rounded-full border border-border/80 hover:border-primary/50 bg-muted/85 hover:bg-muted dark:bg-[#0c0d14] dark:hover:bg-[#121420] text-muted-foreground hover:text-primary transition-all shrink-0 cursor-pointer relative shadow-sm"
                                        title="เกมที่ปักหมุดไว้"
                                    >
                                        <Bookmark className="w-4 h-4" />
                                        {user && bookmarks.length > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center font-bold">
                                                {bookmarks.length}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 glass-card border-border/50 py-2">
                                    <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        เกมที่ปักหมุดไว้
                                    </div>
                                    <DropdownMenuSeparator className="my-1" />
                                    {renderBookmarkContent()}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* ── RIGHT: Coin + User ── */}
                        <div className="flex items-center gap-2 shrink-0 ml-auto">
                            {/* Mobile search icon */}
                            <Button variant="ghost" size="icon" className="sm:hidden hover:bg-muted w-8 h-8 cursor-pointer" onClick={() => setSearchOpen(!searchOpen)}>
                                <Search className="w-4 h-4" />
                            </Button>

                            {/* Mobile bookmark */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="sm:hidden hover:bg-muted w-8 h-8 cursor-pointer relative shrink-0">
                                        <Bookmark className="w-4 h-4" />
                                        {user && bookmarks.length > 0 && (
                                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground text-[7px] flex items-center justify-center font-bold">
                                                {bookmarks.length}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 glass-card border-border/50 py-2">
                                    <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        {t.headerPinnedGames}
                                    </div>
                                    <DropdownMenuSeparator className="my-1" />
                                    {renderBookmarkContent()}
                                </DropdownMenuContent>
                            </DropdownMenu>

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
                                                                backgroundColor: {
                                                                    "General Member": "#94a3b8",
                                                                    "Bronze": "#b45309",
                                                                    "Platinum": "#38bdf8",
                                                                    "Emerald": "#10b981"
                                                                }[vipTier] ?? "#94a3b8"
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

                                        {/* แผงควบคุมแอดมิน (Admin Panel) */}
                                        {user.role === "ADMIN" && (
                                            <DropdownMenuItem asChild>
                                                <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary rounded-lg mx-1 font-bold">
                                                    <Crown className="w-4 h-4 text-primary" />
                                                    <span className="text-sm">แผงควบคุมแอดมิน</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        )}

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

                                        <DropdownMenuSeparator className="my-1" />

                                        {/* ธีม (Theme Toggle) */}
                                        <DropdownMenuItem asChild>
                                            <div className="flex items-center justify-between w-[calc(100%-8px)] px-3 py-2.5 rounded-lg mx-1 select-none">
                                                <span className="text-sm flex-1 text-foreground">ธีม</span>

                                                {/* Capsule Theme Switcher */}
                                                <button
                                                    type="button"
                                                    className="relative flex items-center w-[72px] h-8 bg-[#eef2f6] dark:bg-[#090a0f] border border-transparent dark:border-zinc-800/80 rounded-full p-1 cursor-pointer select-none transition-colors duration-300"
                                                    onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                                                >
                                                    {/* Sliding active pill indicator */}
                                                    <div
                                                        className={cn(
                                                            "absolute top-1 left-2 w-6 h-6 rounded-full bg-white dark:bg-[#2a303f] shadow-sm transition-transform duration-300 ease-out",
                                                            currentTheme === "dark" ? "translate-x-8" : "translate-x-0"
                                                        )}
                                                    />
                                                    {/* Sun Icon (Left) */}
                                                    <div className="relative z-10 flex-1 flex items-center justify-center h-full">
                                                        <Sun className={cn("w-4 h-4 transition-colors duration-300", currentTheme === "light" ? "text-zinc-950" : "text-zinc-500")} />
                                                    </div>
                                                    {/* Moon Icon (Right) */}
                                                    <div className="relative z-10 flex-1 flex items-center justify-center h-full">
                                                        <Moon className={cn("w-3.5 h-3.5 transition-colors duration-300", currentTheme === "dark" ? "text-white" : "text-zinc-400")} />
                                                    </div>
                                                </button>
                                            </div>
                                        </DropdownMenuItem>

                                        {/* ภาษา (Language Toggle) */}
                                        <DropdownMenuItem asChild>
                                            <div className="flex items-center justify-between w-[calc(100%-8px)] px-3 py-2.5 rounded-lg mx-1 select-none">
                                                <span className="text-sm flex-1 text-foreground">ภาษา / Language</span>

                                                {/* Capsule Language Switcher */}
                                                <button
                                                    type="button"
                                                    className="relative flex items-center w-[72px] h-8 bg-[#eef2f6] dark:bg-[#090a0f] border border-transparent dark:border-zinc-800/80 rounded-full p-1 cursor-pointer select-none transition-colors duration-300"
                                                    onClick={() => setLang(lang === "th" ? "en" : "th")}
                                                >
                                                    {/* Sliding active pill indicator */}
                                                    <div
                                                        className={cn(
                                                            "absolute top-1 left-2 w-6 h-6 rounded-full bg-white dark:bg-[#2a303f] shadow-sm transition-transform duration-300 ease-out",
                                                            lang === "en" ? "translate-x-8" : "translate-x-0"
                                                        )}
                                                    />
                                                    {/* TH (Left) */}
                                                    <div className="relative z-10 flex-1 flex items-center justify-center h-full">
                                                        <span className={cn("text-[10px] font-black transition-colors duration-300", lang === "th" ? "text-zinc-950 dark:text-white" : "text-zinc-400")}>TH</span>
                                                    </div>
                                                    {/* EN (Right) */}
                                                    <div className="relative z-10 flex-1 flex items-center justify-center h-full">
                                                        <span className={cn("text-[10px] font-black transition-colors duration-300", lang === "en" ? "text-zinc-950 dark:text-white" : "text-zinc-400")}>EN</span>
                                                    </div>
                                                </button>
                                            </div>
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
                                                    router.push("/login");
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
                                <div className="flex items-center gap-2">
                                    {/* Settings Dropdown for Guest */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="hover:bg-muted w-8 h-8 cursor-pointer rounded-full shrink-0 flex items-center justify-center">
                                                <Globe className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 glass-card border-border/50 py-2">
                                            {/* ภาษา (Language Toggle) */}
                                            <DropdownMenuItem asChild>
                                                <div className="flex items-center justify-between w-[calc(100%-8px)] px-3 py-2 rounded-lg mx-1 select-none">
                                                    <span className="text-xs text-foreground font-semibold">ภาษา/Language</span>
                                                    <button
                                                        type="button"
                                                        className="relative flex items-center w-[72px] h-8 bg-[#eef2f6] dark:bg-[#090a0f] border border-transparent dark:border-zinc-800/80 rounded-full p-1 cursor-pointer select-none transition-colors duration-300"
                                                        onClick={() => setLang(lang === "th" ? "en" : "th")}
                                                    >
                                                        <div
                                                            className={cn(
                                                                "absolute top-1 left-2 w-6 h-6 rounded-full bg-white dark:bg-[#2a303f] shadow-sm transition-transform duration-300 ease-out",
                                                                lang === "en" ? "translate-x-8" : "translate-x-0"
                                                            )}
                                                        />
                                                        <div className="relative z-10 flex-1 flex items-center justify-center h-full">
                                                            <span className={cn("text-[9px] font-black transition-colors duration-300", lang === "th" ? "text-zinc-950 dark:text-white" : "text-zinc-400")}>TH</span>
                                                        </div>
                                                        <div className="relative z-10 flex-1 flex items-center justify-center h-full">
                                                            <span className={cn("text-[9px] font-black transition-colors duration-300", lang === "en" ? "text-zinc-950 dark:text-white" : "text-zinc-400")}>EN</span>
                                                        </div>
                                                    </button>
                                                </div>
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator className="my-1" />

                                            {/* ธีม (Theme Toggle) */}
                                            <DropdownMenuItem asChild>
                                                <div className="flex items-center justify-between w-[calc(100%-8px)] px-3 py-2 rounded-lg mx-1 select-none">
                                                    <span className="text-xs text-foreground font-semibold">ธีม</span>
                                                    <button
                                                        type="button"
                                                        className="relative flex items-center w-[72px] h-8 bg-[#eef2f6] dark:bg-[#090a0f] border border-transparent dark:border-zinc-800/80 rounded-full p-1 cursor-pointer select-none transition-colors duration-300"
                                                        onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                                                    >
                                                        <div
                                                            className={cn(
                                                                "absolute top-1 left-2 w-6 h-6 rounded-full bg-white dark:bg-[#2a303f] shadow-sm transition-transform duration-300 ease-out",
                                                                currentTheme === "dark" ? "translate-x-8" : "translate-x-0"
                                                            )}
                                                        />
                                                        <div className="relative z-10 flex-1 flex items-center justify-center h-full">
                                                            <Sun className={cn("w-3.5 h-3.5 transition-colors duration-300", currentTheme === "light" ? "text-zinc-950" : "text-zinc-500")} />
                                                        </div>
                                                        <div className="relative z-10 flex-1 flex items-center justify-center h-full">
                                                            <Moon className={cn("w-3 h-3 transition-colors duration-300", currentTheme === "dark" ? "text-white" : "text-zinc-400")} />
                                                        </div>
                                                    </button>
                                                </div>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <Link href="/login">
                                        <Button
                                            size="sm"
                                            className="bg-foreground text-background border-0 hover:bg-foreground/90 hover:text-background text-xs h-8 px-4 font-semibold shadow-sm transition-all"
                                        >
                                            <LogIn className="w-3.5 h-3.5 mr-1.5" />
                                            เข้าสู่ระบบ
                                        </Button>
                                    </Link>
                                </div>
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
                            {showSuggestions && (suggestions.length > 0 || (searchQuery.trim() === "" && !!user && searchHistory.length > 0)) && (
                                <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in duration-200">
                                    <div className="py-1">
                                        {suggestions.length > 0 ? (
                                            suggestions.map((game) => (
                                                <button
                                                    key={game.slug}
                                                    type="button"
                                                    onClick={() => {
                                                        saveSearchQuery(game.name);
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
                                            ))
                                        ) : (
                                            <div className="p-2">
                                                <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    <span>ประวัติการค้นหาล่าสุด</span>
                                                    <button
                                                        onMouseDown={clearHistory}
                                                        className="hover:text-primary transition-colors cursor-pointer normal-case"
                                                    >
                                                        ล้างทั้งหมด
                                                    </button>
                                                </div>
                                                <div className="mt-1 space-y-0.5">
                                                    {searchHistory.map((query) => (
                                                        <button
                                                            key={query}
                                                            type="button"
                                                            className="group w-full px-3 py-2 text-left text-xs hover:bg-muted/50 text-foreground font-medium flex items-center justify-between rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                                                            onClick={() => {
                                                                setSearchQuery(query);
                                                                saveSearchQuery(query);
                                                                setShowSuggestions(false);
                                                                setSearchOpen(false);
                                                                router.push(`/search?q=${encodeURIComponent(query)}`);
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <History className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                                <span>{query}</span>
                                                            </div>
                                                            <button
                                                                onMouseDown={(e) => removeHistoryItem(e, query)}
                                                                className="p-1 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                                                title="ลบ"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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

            {/* Gacha Wheel & Spin History Modals */}
            <GachaModal
                open={showGachaModal}
                onClose={() => setShowGachaModal(false)}
                user={user}
                t={t}
                onSpinCompleted={fetchBalance}
            />
        </>
    );
}
