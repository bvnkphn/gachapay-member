"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, LogOut, LogIn, Headphones, Star, Moon, Sun, Coins, Gamepad2, Wallet, ShoppingCart, Ticket, Crown } from "lucide-react";
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

    // Fetch wallet balance dynamically
    useEffect(() => {
        if (user) {
            fetch("/api/wallets/balance")
                .then((res) => res.json())
                .then((resData) => {
                    if (resData.success && resData.data) {
                        setBalance(resData.data.balance ?? 0);
                    } else {
                        setBalance(user.balance ?? 0);
                    }
                })
                .catch(() => {
                    setBalance(user.balance ?? 0);
                });
        }
    }, [user]);

    const [vipTier, setVipTier] = useState<string | null>(null);

    // Fetch VIP tier dynamically
    useEffect(() => {
        if (user) {
            api.getLoyalty()
                .then((data) => {
                    if (data && data.tier) {
                        const tierMap: Record<string, string> = {
                            BRONZE: "VIP 1",
                            SILVER: "VIP 2",
                            GOLD: "VIP 3",
                            PLATINUM: "VIP 3",
                        };
                        const mapped = tierMap[data.tier.toUpperCase()] || data.tier;
                        setVipTier(mapped);
                    }
                })
                .catch(() => {
                    if (user.vipLevel) {
                        setVipTier(`VIP ${user.vipLevel}`);
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

    // ซ่อน Header ของ user เมื่ออยู่ในหน้า admin
    if (pathname.startsWith("/admin")) return null;

    // pages that have the account sidebar
    const hasSidebar = pathname.startsWith("/account") || pathname.startsWith("/support/tickets");

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
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
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
                                <span className="text-[6px] sm:text-[7px] font-bold text-muted-foreground/60 tracking-[0.25em] uppercase -mt-1.5 ml-0.5">
                                    TOP-UP PLATFORM
                                </span>
                            </div>
                        </Link>


                    </div>

                    {/* ── CENTER: Search bar ── */}
                    <div className="flex-1 max-w-md mx-auto hidden sm:block">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`ค้นหาชื่อเกม`}
                                className="w-full bg-muted/60 border border-border/40 rounded-full pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/80 transition-all"
                            />
                        </form>
                    </div>

                    {/* ── RIGHT: Coin + User ── */}
                    <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
                        {/* Mobile search icon */}
                        <Button variant="ghost" size="icon" className="sm:hidden hover:bg-muted w-8 h-8" onClick={() => setSearchOpen(!searchOpen)}>
                            <Search className="w-4 h-4" />
                        </Button>

                        {/* Coin balance — show when logged in */}
                        {user && (
                            <Link href="/account/balance" className="flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/15 border border-yellow-500/30 hover:border-yellow-400/50 rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 cursor-pointer transition-all duration-300 shadow-md shadow-yellow-500/5 hover:shadow-yellow-500/20 hover:scale-105 active:scale-95">
                                <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 animate-pulse drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]" />
                                <div className="flex items-baseline gap-0.5 sm:gap-1">
                                    <span className="text-xs font-bold text-yellow-400 drop-shadow-[0_0_2px_rgba(234,179,8,0.2)]">{balance.toLocaleString()}</span>
                                    <span className="text-[9px] sm:text-[10px] font-bold text-yellow-500/70 tracking-wider uppercase">Coin</span>
                                </div>
                            </Link>
                        )}

                        {/* User Menu */}
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="hover:bg-muted/10 rounded-full w-9 h-9 p-0 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ml-1">
                                        <Avatar className="w-8 h-8 border-2 border-primary/80 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                                            <AvatarFallback className="bg-gradient-to-br from-cyan-500 via-[#0ea5e9] to-fuchsia-500 text-white text-xs font-extrabold select-none">
                                                {getUserInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 glass-card border-border/50 py-2">
                                    {/* Header */}
                                    <div className="px-3 py-2 mb-1 flex flex-col gap-0.5">
                                        <p className="text-sm font-semibold text-foreground">บัญชีผู้ใช้</p>
                                        {user?.email && (
                                            <div className="flex items-center gap-2 mt-0.5 min-w-0">
                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                {vipTier && (
                                                    <span className="shrink-0 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-wider leading-none">
                                                        {vipTier}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <DropdownMenuSeparator className="mb-1" />

                                    {/* บัญชีของฉัน (My Account) */}
                                    <DropdownMenuItem asChild>
                                        <Link href="/account" className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 rounded-lg mx-1">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm">{t.myAccount}</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    {/* เติมเงิน (Top-up) */}
                                    <DropdownMenuItem asChild>
                                        <Link href="/account/balance" className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 rounded-lg mx-1">
                                            <Wallet className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm">{t.headerTopUp}</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    {/* คำสั่งซื้อ (Orders) */}
                                    <DropdownMenuItem asChild>
                                        <Link href="/history" className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 rounded-lg mx-1">
                                            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm">{t.sidebarOrders}</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    {/* VIP & สิทธิพิเศษ (VIP & Privileges) */}
                                    <DropdownMenuItem asChild>
                                        <Link href="/account/vip-tier" className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 rounded-lg mx-1">
                                            <Crown className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm">{t.vipPrivileges}</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    {/* ธีม (Theme Toggle) */}
                                    <DropdownMenuItem asChild>
                                        <div className="flex items-center gap-3 px-3 py-2.5 cursor-default hover:bg-muted/50 rounded-lg mx-1" onClick={(e) => e.stopPropagation()}>
                                            {currentTheme === "dark"
                                                ? <Moon className="w-4 h-4 text-muted-foreground" />
                                                : <Sun className="w-4 h-4 text-muted-foreground" />}
                                            <span className="text-sm flex-1">ธีม</span>
                                            
                                            {/* Capsule Theme Switcher */}
                                            <div 
                                                className="relative flex items-center w-[72px] h-8 bg-[#eef2f6] dark:bg-[#090a0f] border border-transparent dark:border-zinc-800/80 rounded-full p-1 cursor-pointer select-none transition-colors duration-300"
                                                onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                                            >
                                                {/* Sliding active pill indicator */}
                                                <div 
                                                    className={cn(
                                                        "absolute top-1 bottom-1 w-8 rounded-full bg-white dark:bg-[#2a303f] shadow-sm transition-transform duration-300 ease-out",
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
                                            </div>
                                        </div>
                                    </DropdownMenuItem>

                                    {/* ติดต่อหรือขอความช่วยเหลือ (Support) */}
                                    <DropdownMenuItem asChild>
                                        <Link href="/support" className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 rounded-lg mx-1">
                                            <Headphones className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">ติดต่อหรือขอความช่วยเหลือ</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator className="my-1" />

                                    {/* ออกจากระบบ (Logout) */}
                                    <DropdownMenuItem
                                        onClick={logout}
                                        className="flex items-center gap-3 px-3 py-2.5 text-destructive focus:text-destructive cursor-pointer hover:bg-destructive/10 rounded-lg mx-1"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="text-sm">ออกจากระบบ</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/login">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-foreground text-background border-0 hover:bg-foreground/90 text-xs h-8 px-4 font-semibold shadow-sm transition-all"
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
                    <div className="sm:hidden pb-3 w-full">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ค้นหาชื่อเกม"
                                className="w-full bg-muted/60 border border-border/40 rounded-full pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/80 transition-all"
                                autoFocus
                            />
                        </form>
                    </div>
                )}
            </div>
        </header>
    );
}
