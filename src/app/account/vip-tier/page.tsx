"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/components/language-context";
import { useSidebar } from "@/components/sidebar-context";
import { api } from "@/lib/api";
import { Crown, Gem, Check, ChevronLeft, Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Tier mapping: backend tier string → TIERS index (level)
const TIER_LEVEL_MAP: Record<string, number> = {
    BRONZE: 1, SILVER: 2, GOLD: 3, PLATINUM: 3,
};

interface TierConfig {
    level: number;
    name: string;
    color: string;
    gradientFrom: string;
    gradientTo: string;
    borderColor: string;
    minDiamonds: number;
    nextGoal: number | null;
}

const TIERS: TierConfig[] = [
    {
        level: 1,
        name: "VIP 1",
        color: "#7c3aed",
        gradientFrom: "#7c3aed",
        gradientTo: "#6d28d9",
        borderColor: "#7c3aed55",
        minDiamonds: 0,
        nextGoal: 10000,
    },
    {
        level: 2,
        name: "VIP 2",
        color: "#f59e0b",
        gradientFrom: "#f59e0b",
        gradientTo: "#d97706",
        borderColor: "#f59e0b55",
        minDiamonds: 10000,
        nextGoal: 50000,
    },
    {
        level: 3,
        name: "VIP 3",
        color: "#0ea5e9",
        gradientFrom: "#0ea5e9",
        gradientTo: "#0284c7",
        borderColor: "#0ea5e955",
        minDiamonds: 50000,
        nextGoal: null,
    },
];

export default function VipTierPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useLanguage();
    const { open } = useSidebar();

    const [loyalty, setLoyalty] = useState<{ tier: string; current_points: number; next_tier_threshold: number | null } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        api.getLoyalty().then(setLoyalty).finally(() => setLoading(false));
    }, [user]);

    const tierKey = loyalty?.tier?.toUpperCase() ?? "BRONZE";
    const userVipLevel = TIER_LEVEL_MAP[tierKey] ?? 1;
    const userPoints = loyalty?.current_points ?? 0;

    const [selectedLevel, setSelectedLevel] = useState(userVipLevel);

    // Sync selectedLevel when loyalty loads
    useEffect(() => { setSelectedLevel(userVipLevel); }, [userVipLevel]);

    const selectedTier = TIERS.find(tier => tier.level === selectedLevel)!;
    const isHighest = selectedTier.nextGoal === null;
    const isLowerTier = selectedLevel < userVipLevel;
    const progress = isHighest ? 100 : Math.min((userPoints / selectedTier.nextGoal!) * 100, 100);
    const diamondsNeeded = !isHighest && selectedLevel >= userVipLevel
        ? Math.max((selectedTier.nextGoal ?? 0) - userPoints, 0) : 0;

    const benefitsMap: Record<number, string[]> = {
        1: t.vipBenefits.vip1,
        2: t.vipBenefits.vip2,
        3: t.vipBenefits.vip3,
    };
    const benefits = benefitsMap[selectedLevel] ?? [];
    const currentTierData = TIERS[userVipLevel - 1];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen pt-20 pb-24">
            <div className="container mx-auto px-4 max-w-4xl">

                    {/* Top bar */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => router.push("/account")}
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            {t.backToOverview}
                        </button>

                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                            style={{
                                background: `${currentTierData.color}22`,
                                color: currentTierData.color,
                                border: `1px solid ${currentTierData.color}44`,
                            }}>
                            <Crown className="w-3.5 h-3.5" />
                            {t.yourCurrentLevel}: {currentTierData.name}
                        </span>
                    </div>

                    <h1 className="text-2xl font-extrabold mb-6">{t.vipTierDetails}</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                        {/* LEFT — Status Card */}
                        <div className="lg:col-span-3 space-y-4">

                            {/* Status Card */}
                            <div className="glass-card rounded-2xl p-5 border transition-all duration-300"
                                style={{ borderColor: selectedTier.borderColor }}>
                                <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">
                                    {t.statusOverview}
                                </p>
                                <div className="flex items-start justify-between mb-4">
                                    <h2 className="text-3xl font-extrabold" style={{ color: selectedTier.color }}>
                                        {selectedTier.name}
                                    </h2>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ background: `${selectedTier.color}22` }}>
                                        <Gem className="w-5 h-5" style={{ color: selectedTier.color }} />
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="mb-1">
                                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                                        <span>{t.progressLabel}</span>
                                        <span style={{ color: selectedTier.color }}>
                                            {isHighest ? t.highestRank : `NEXT: ${TIERS[selectedLevel].name}`}
                                        </span>
                                    </div>
                                    <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${progress}%`,
                                                background: `linear-gradient(90deg, ${selectedTier.gradientFrom}, ${selectedTier.gradientTo})`,
                                            }} />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                        <span>{userPoints.toLocaleString()} pts</span>
                                        {!isHighest && (
                                            <span>{selectedTier.nextGoal!.toLocaleString()} Diamond</span>
                                        )}
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="mt-4 rounded-xl px-4 py-3 text-xs"
                                    style={{ background: `${selectedTier.color}11`, border: `1px solid ${selectedTier.color}33` }}>
                                    <p className="text-muted-foreground">
                                        {isHighest
                                            ? t.infoHighest
                                            : isLowerTier
                                                ? t.infoLower(selectedTier.name)
                                                : t.infoNeedDiamonds(
                                                    diamondsNeeded.toLocaleString(),
                                                    TIERS[selectedLevel]?.name ?? ""
                                                )}
                                    </p>
                                </div>
                            </div>

                            {/* Tier Selector */}
                            <div className="glass-card rounded-2xl p-5">
                                <h3 className="text-sm font-semibold mb-4">{t.allTierDetails}</h3>
                                <div className="flex gap-2">
                                    {TIERS.map(tier => {
                                        const isSelected = selectedLevel === tier.level;
                                        const isMyTier = userVipLevel === tier.level;
                                        return (
                                            <button
                                                key={tier.level}
                                                onClick={() => setSelectedLevel(tier.level)}
                                                className={cn(
                                                    "relative flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                                                    isSelected
                                                        ? "text-white"
                                                        : "text-muted-foreground hover:text-foreground bg-muted/30"
                                                )}
                                                style={isSelected ? {
                                                    background: `linear-gradient(135deg, ${tier.gradientFrom}, ${tier.gradientTo})`,
                                                    borderColor: tier.color,
                                                } : {
                                                    borderColor: "transparent",
                                                }}
                                            >
                                                {isMyTier && (
                                                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                                                        style={{ background: tier.color }}>
                                                        My Tier
                                                    </span>
                                                )}
                                                {tier.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT — Benefits */}
                        <div className="lg:col-span-2">
                            <div className="glass-card rounded-2xl p-5 h-full">
                                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                    <Trophy className="w-4 h-4" style={{ color: selectedTier.color }} />
                                    {t.tierBenefits}
                                </h3>
                                <ul className="space-y-3">
                                    {benefits.map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-sm">
                                            <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                                                style={{ background: `${selectedTier.color}22` }}>
                                                <Check className="w-2.5 h-2.5" style={{ color: selectedTier.color }} />
                                            </span>
                                            <span className="text-muted-foreground">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Tier requirement summary */}
                                <div className="mt-6 pt-4 border-t border-border/30">
                                    <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">
                                        {t.tierCondition}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {t.minDiamondsText("")
                                            .split(selectedTier.minDiamonds.toLocaleString())[0]}
                                        <span className="font-semibold" style={{ color: selectedTier.color }}>
                                            {selectedTier.minDiamonds.toLocaleString()}
                                        </span>
                                        {t.minDiamondsText("")
                                            .split(selectedTier.minDiamonds.toLocaleString())[1]}
                                    </p>
                                    {!isHighest && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t.nextTierText("").split(selectedTier.nextGoal!.toLocaleString())[0]}
                                            <span className="font-semibold" style={{ color: selectedTier.color }}>
                                                {selectedTier.nextGoal!.toLocaleString()}
                                            </span>
                                            {t.nextTierText("").split(selectedTier.nextGoal!.toLocaleString())[1]}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
        </div>
    );
}
