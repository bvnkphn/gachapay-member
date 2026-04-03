"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/components/language-context";
import { useSidebar } from "@/components/sidebar-context";
import {
    Crown, Gem, ChevronRight, History,
    User
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
    { id: 1, name: "Mystery Box Premium", game: "Free Fire", price: 450, date: "12 ธ.ค." },
    { id: 2, name: "Skin Pack V.2", game: "PUBG Mobile", price: 199, date: "10 ธ.ค." },
];

export default function AccountPage() {
    const router = useRouter();
    const { user } = useAuth();
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

    return (
        <div className="min-h-screen pt-16 pb-24">

            {/* MAIN CONTENT — offset by sidebar width on desktop */}
            <div className={open ? "lg:ml-48 transition-all duration-300" : "lg:ml-14 transition-all duration-300"}>
                <div className="container mx-auto px-6 max-w-5xl pt-8">

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
                        <span className="hover:text-foreground cursor-pointer" onClick={() => router.push("/")}>
                            {t.home}
                        </span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground">{t.myAccount}</span>
                    </div>

                    <h1 className="text-2xl font-bold mb-6">{t.accountOverview}</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left col — VIP + Balance */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* VIP Status Card */}
                            <button
                                onClick={() => router.push("/account/vip-tier")}
                                className="w-full text-left glass-card rounded-2xl p-8 border border-border/50 hover:border-primary/40 transition-all group"
                            >
                                <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-3">
                                    STATUS OVERVIEW
                                </p>
                                <div className="flex items-start justify-between mb-5">
                                    <div>
                                        <h2 className="text-4xl font-extrabold text-foreground">{currentTier.name}</h2>
                                        <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                                            style={{ background: `${currentTier.color}22`, color: currentTier.color }}>
                                            <Gem className="w-3 h-3" />
                                            {t.currentLevel}
                                        </span>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                        style={{ background: `${currentTier.color}22` }}>
                                        <Crown className="w-6 h-6" style={{ color: currentTier.color }} />
                                    </div>
                                </div>
                                <div className="mb-1">
                                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                        <span>{t.progressLabel}</span>
                                        <span style={{ color: currentTier.color }}>
                                            {nextTier ? `NEXT: ${nextTier.name}` : t.highestRank}
                                        </span>
                                    </div>
                                    <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${progress}%`, background: currentTier.color }} />
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                        <span>{displayUser.diamonds.toLocaleString()} Diamond</span>
                                        {nextTier && <span>{nextTier.minDiamonds.toLocaleString()} Diamond</span>}
                                    </div>
                                </div>
                            </button>

                            {/* Balance Card */}
                            <div className="rounded-2xl p-8 text-white flex items-end justify-between gap-4"
                                style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" }}>
                                <div>
                                    <p className="text-xs font-semibold opacity-80 mb-2 tracking-widest uppercase">{t.availableBalance}</p>
                                    <p className="text-5xl font-extrabold mb-2">฿{displayUser.balance.toFixed(2)}</p>
                                    <p className="text-xs opacity-60">{t.lastUpdated}</p>
                                </div>
                                <div className="flex flex-col items-end gap-3 shrink-0">
                                    <Button size="default" onClick={() => router.push("/account/balance")} className="bg-white text-green-700 hover:bg-white/90 font-bold text-sm px-8 rounded-full">
                                        {t.topUp}
                                    </Button>
                                    <button className="text-xs text-white/70 hover:text-white flex items-center gap-1"
                                        onClick={() => router.push("/account/balance")}>
                                        <History className="w-3.5 h-3.5" />
                                        {t.transactionHistory}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right col — Profile + Recent Orders */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Profile Card */}
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-5">
                                    {t.personalInfo}
                                </h3>
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <User className="w-7 h-7 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-base truncate">{displayUser.name}</p>
                                        <p className="text-xs text-primary truncate">{displayUser.email}</p>
                                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-green-500/20 text-green-400">{t.verified}</span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full text-xs border-border/50">
                                    <User className="w-3.5 h-3.5 mr-1.5" />
                                    {t.editProfile}
                                </Button>
                            </div>

                            {/* Recent Orders */}
                            <div className="glass-card rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="font-semibold text-sm">{t.recentOrders}</h3>
                                    <button className="text-xs text-primary hover:underline flex items-center gap-1"
                                        onClick={() => router.push("/history")}>
                                        {t.viewAll} <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {RECENT_ORDERS.map(order => (
                                        <div key={order.id} className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                                                <History className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate">{order.name}</p>
                                                <p className="text-xs text-muted-foreground">{order.date} • ฿{order.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-5 text-xs border-border/50" onClick={() => router.push("/history")}>
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
