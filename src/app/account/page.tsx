"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/components/language-context";
import { useSidebar } from "@/components/sidebar-context";
import {
    Crown, Gem, Wallet, ChevronRight, History,
    ArrowRight, Zap, User
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_USER = {
    name: "User_69b29a7f2ba6d",
    email: "example@email.com",
    userId: "10910",
    balance: 0.0,
    diamonds: 5000,
    vipLevel: 1,
};

const VIP_TIERS = [
    { level: 1, name: "VIP 1", minDiamonds: 0, nextGoal: 10000, color: "#7c3aed" },
    { level: 2, name: "VIP 2", minDiamonds: 10000, nextGoal: 50000, color: "#f59e0b" },
    { level: 3, name: "VIP 3", minDiamonds: 50000, nextGoal: 50000, color: "#0ea5e9" },
];

const RECENT_ORDERS = [
    { id: 1, name: "Mystery Box Premium", game: "Free Fire", price: 299 },
    { id: 2, name: "Skin Pack V.2", game: "PUBG Mobile", price: 199 },
];

export default function AccountPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const { open } = useSidebar();

    const displayUser = {
        name: user?.name ?? MOCK_USER.name,
        email: user?.email ?? MOCK_USER.email,
        userId: MOCK_USER.userId,
        balance: user?.balance ?? MOCK_USER.balance,
        diamonds: MOCK_USER.diamonds,
        vipLevel: user?.vipLevel ?? MOCK_USER.vipLevel,
    };

    const currentTier = VIP_TIERS.find(tier => tier.level === displayUser.vipLevel) ?? VIP_TIERS[0];
    const nextTier = VIP_TIERS.find(tier => tier.level === displayUser.vipLevel + 1);
    const progress = nextTier
        ? Math.min((displayUser.diamonds / nextTier.minDiamonds) * 100, 100)
        : 100;

    const quickLinks = [
        { icon: History, label: t.orderHistory, path: "/history" },
    ];

    return (
        <div className="min-h-screen pt-16 pb-24">

            {/* MAIN CONTENT — offset by sidebar width on desktop */}
            <div className={open ? "lg:ml-48 transition-all duration-300" : "lg:ml-14 transition-all duration-300"}>
                <div className="container mx-auto px-4 max-w-3xl pt-8">

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
                        <span className="hover:text-foreground cursor-pointer" onClick={() => router.push("/")}>
                            {t.home}
                        </span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground">{t.myAccount}</span>
                    </div>

                    <h1 className="text-2xl font-bold mb-6">{t.accountOverview}</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                        {/* Profile — shows on top on mobile, right col on desktop */}
                        <div className="lg:col-span-1 lg:order-2 space-y-4">
                            <div className="glass-card rounded-2xl p-5">
                                <h3 className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">
                                    {t.personalInfo}
                                </h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-bold text-white">
                                        {displayUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">{displayUser.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{displayUser.email}</p>
                                        <p className="text-xs text-muted-foreground">{displayUser.userId}</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full text-xs border-border/50">
                                    <User className="w-3.5 h-3.5 mr-1.5" />
                                    {t.editProfile}
                                </Button>
                            </div>
                        </div>

                        {/* Main cards — left 2 cols on desktop */}
                        <div className="lg:col-span-2 lg:order-1 space-y-4">

                            {/* VIP Status Card */}
                            <button
                                onClick={() => router.push("/account/vip-tier")}
                                className="w-full text-left glass-card rounded-2xl p-5 border border-border/50 hover:border-primary/40 transition-all group"
                            >
                                <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">
                                    STATUS OVERVIEW
                                </p>
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h2 className="text-3xl font-extrabold text-foreground">{currentTier.name}</h2>
                                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                            style={{ background: `${currentTier.color}22`, color: currentTier.color }}>
                                            <Gem className="w-3 h-3" />
                                            {t.currentLevel}
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                        style={{ background: `${currentTier.color}22` }}>
                                        <Crown className="w-5 h-5" style={{ color: currentTier.color }} />
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                                        <span>{t.progressLabel}</span>
                                        <span style={{ color: currentTier.color }}>
                                            {nextTier ? `NEXT: ${nextTier.name}` : t.highestRank}
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${progress}%`, background: currentTier.color }} />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                        <span>{displayUser.diamonds.toLocaleString()} Diamond</span>
                                        {nextTier && <span>{nextTier.minDiamonds.toLocaleString()} Diamond</span>}
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-1 text-xs mt-2"
                                    style={{ color: currentTier.color }}>
                                    <span>{t.viewVipDetail}</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>

                            {/* Balance Card */}
                            <div className="rounded-2xl p-5 text-white"
                                style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" }}>
                                <p className="text-xs font-semibold opacity-80 mb-1">{t.availableBalance}</p>
                                <p className="text-4xl font-extrabold mb-3">฿{displayUser.balance.toFixed(2)}</p>
                                <div className="flex gap-2">
                                    <Button size="sm" className="bg-white text-green-700 hover:bg-white/90 font-semibold text-xs px-4">
                                        <Wallet className="w-3.5 h-3.5 mr-1.5" />
                                        {t.topUp}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-xs">
                                        <Zap className="w-3.5 h-3.5 mr-1.5" />
                                        {t.transfer}
                                    </Button>
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div className="glass-card rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-sm flex items-center gap-2">
                                        <History className="w-4 h-4 text-primary" />
                                        {t.recentOrders}
                                    </h3>
                                    <button className="text-xs text-primary hover:underline flex items-center gap-1"
                                        onClick={() => router.push("/history")}>
                                        {t.viewAll} <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {RECENT_ORDERS.map(order => (
                                        <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium">{order.name}</p>
                                                <p className="text-xs text-muted-foreground">{order.game}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-primary">฿{order.price}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-3 text-xs border-border/50">
                                    {t.viewAllHistory}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
