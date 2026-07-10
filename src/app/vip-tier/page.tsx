"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/components/language-context";
import { useSidebar } from "@/components/sidebar-context";
import { api } from "@/lib/api";
import { Crown, Gem, Check, ChevronLeft, ChevronDown, Trophy, Loader2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Tier mapping: backend tier string → TIERS index (level)
const TIER_LEVEL_MAP: Record<string, number> = {
    MEMBER: 1, BRONZE: 2, SILVER: 3, GOLD: 3, PLATINUM: 3, EMERALD: 4,
};

interface TierConfig {
    level: number;
    name: string;
    color: string;
    gradientFrom: string;
    gradientTo: string;
    borderColor: string;
    minExp: number;
    nextGoal: number | null;
}

const TIERS: TierConfig[] = [
    {
        level: 1,
        name: "General Member",
        color: "#94a3b8",
        gradientFrom: "#cbd5e1",
        gradientTo: "#94a3b8",
        borderColor: "#94a3b855",
        minExp: 0,
        nextGoal: 100000,
    },
    {
        level: 2,
        name: "Bronze",
        color: "#b45309",
        gradientFrom: "#d97706",
        gradientTo: "#b45309",
        borderColor: "#b4530955",
        minExp: 100000,
        nextGoal: 500000,
    },
    {
        level: 3,
        name: "Platinum",
        color: "#38bdf8",
        gradientFrom: "#38bdf8",
        gradientTo: "#0284c7",
        borderColor: "#38bdf855",
        minExp: 500000,
        nextGoal: 1000000,
    },
    {
        level: 4,
        name: "Emerald",
        color: "#10b981",
        gradientFrom: "#34d399",
        gradientTo: "#059669",
        borderColor: "#10b98155",
        minExp: 1000000,
        nextGoal: null,
    },
];

export default function VipTierPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useLanguage();


    const [loyalty, setLoyalty] = useState<{ tier: string; current_points: number; next_tier_threshold: number | null } | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(true);

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

    
    // Calculate progress towards selected tier requirement
    const progress = selectedLevel < userVipLevel
        ? 100
        : selectedLevel === userVipLevel
            ? (selectedLevel === 4 ? 100 : Math.min((userPoints / selectedTier.nextGoal!) * 100, 100))
            : Math.min((userPoints / selectedTier.minExp) * 100, 100);



    const benefitsMap: Record<number, string[]> = {
        1: ["สะสมยอดเติมเงินครบ 100,000 บาท เพื่อเลื่อนเป็นระดับ Bronze", "เข้าถึงบริการเติมเงินรวดเร็วตลอด 24 ชั่วโมง"],
        2: t.vipBenefits.vip1,
        3: t.vipBenefits.vip2,
        4: t.vipBenefits.vip3,
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
            <div className="container mx-auto px-6 max-w-5xl space-y-6">

                {/* Top bar with Breadcrumbs & Current Level Badge */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                    <button
                        type="button"
                        onClick={() => router.push("/account")}
                        className="hover:text-foreground transition-colors"
                    >
                        {t.myAccount}
                    </button>
                    <ChevronLeft className="w-3 h-3 rotate-180" />
                    <span className="text-foreground">{t.vipPrivileges}</span>
                </div>

                {/* Page Header Title */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-black text-foreground">{t.vipTierDetails}</h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm max-w-max"
                        style={{
                            background: `${currentTierData.color}10`,
                            color: currentTierData.color,
                            border: `1px solid ${currentTierData.color}20`,
                        }}>
                        <Crown className="w-3 h-3" />
                        <span className="truncate">{t.yourCurrentLevel}: {currentTierData.name}</span>
                    </span>
                </div>

                {/* STATUS OVERVIEW — Wide horizontal layout */}
                <div className="glass-card rounded-3xl p-6 border-2 transition-all duration-500 overflow-hidden relative shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6"
                    style={{ borderColor: `${selectedTier.color}40`, boxShadow: `0 10px 30px ${selectedTier.color}0a` }}>
                    
                    {/* Decorative tier matching corner glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 blur-3xl pointer-events-none"
                        style={{ background: selectedTier.color }} />

                    {/* Left Info: Name & Icon */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md border shrink-0"
                            style={{ 
                                background: `${selectedTier.color}15`, 
                                borderColor: `${selectedTier.color}30` 
                            }}>
                            <Crown className="w-7 h-7 animate-pulse" style={{ color: selectedTier.color }} />
                        </div>
                        <div>
                            <p className="text-[10px] font-extrabold tracking-widest uppercase text-muted-foreground mb-0.5">
                                {t.statusOverview}
                            </p>
                            <h2 className="text-3xl font-black tracking-tight" style={{ color: selectedTier.color }}>
                                {selectedTier.name}
                            </h2>
                        </div>
                    </div>

                    {/* Right Info: Progress Bar & EXP */}
                    <div className="flex-1 max-w-xl space-y-2.5">
                        <div className="flex justify-between text-xs font-semibold">
                            <span className="text-muted-foreground">{t.progressLabel}</span>
                            <span className="font-bold animate-pulse" style={{ color: selectedTier.color }}>
                                {isHighest ? t.highestRank : `ระดับถัดไป: ${TIERS[selectedLevel].name}`}
                            </span>
                        </div>
                        
                        <div className="h-3 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden p-0.5 border border-border/40 shadow-inner">
                            <div className="h-full rounded-full transition-all duration-1000 shadow-md"
                                style={{
                                    width: `${progress}%`,
                                    background: `linear-gradient(90deg, ${selectedTier.gradientFrom}, ${selectedTier.gradientTo})`,
                                }} />
                        </div>
                        
                        <div className="flex justify-between text-xs font-bold text-muted-foreground font-mono">
                            <span>{userPoints.toLocaleString()} EXP</span>
                            {!isHighest && (
                                <span>{selectedTier.nextGoal!.toLocaleString()} EXP</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* TIER SELECTOR & TOGGLE — Centered horizontal stack */}
                <div className="flex flex-col items-center gap-4 pt-4">
                    <div className="w-full max-w-lg glass-card rounded-3xl p-5 border border-border/50 shadow-md">
                        <h3 className="text-xs font-extrabold tracking-widest uppercase text-muted-foreground mb-3 text-center">{t.allTierDetails}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {TIERS.map(tier => {
                                const isSelected = selectedLevel === tier.level;
                                return (
                                    <button
                                        key={tier.level}
                                        onClick={() => setSelectedLevel(tier.level)}
                                        className={cn(
                                            "relative py-3 rounded-2xl text-xs font-black tracking-wider transition-all duration-300 border shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer",
                                            isSelected
                                                ? "text-white"
                                                : "text-muted-foreground hover:text-foreground bg-muted/30 border-border/30 hover:border-border/60"
                                        )}
                                        style={isSelected ? {
                                            background: `linear-gradient(135deg, ${tier.gradientFrom}, ${tier.gradientTo})`,
                                            borderColor: tier.color,
                                            boxShadow: `0 4px 15px ${tier.color}25`
                                        } : {}}
                                    >
                                        {tier.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Expand/Collapse Toggle Button */}
                    {false && (
                    <button 
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border hover:bg-muted text-xs font-bold text-foreground transition-all shadow-sm cursor-pointer hover:shadow"
                    >
                        <Trophy className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                        {showDetails ? "ซ่อนสิทธิพิเศษและเงื่อนไข" : "แสดงสิทธิพิเศษและเงื่อนไข"}
                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", showDetails && "rotate-180")} />
                    </button>
                    )}
                </div>

                {/* Collapsible Details: Requirements & Benefits */}
                {showDetails && (
                    <div className="w-full max-w-lg mx-auto pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                        
                        {/* Requirement Condition summary */}
                        <div className="glass-card rounded-3xl p-6 border border-border/50 shadow-md space-y-4">
                            <h3 className="text-xs font-extrabold tracking-widest uppercase text-muted-foreground flex items-center gap-2 border-b border-border/30 pb-3">
                                <HelpCircle className="w-4 h-4" style={{ color: selectedTier.color }} />
                                {t.tierCondition}
                            </h3>
                            
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground flex items-center justify-between">
                                    <span>สะสม EXP ขั้นต่ำเพื่อเลื่อนระดับ:</span>
                                    <span className="font-extrabold text-sm" style={{ color: selectedTier.color }}>
                                        {selectedTier.minExp.toLocaleString()} EXP {selectedTier.level === 4 ? "ขึ้นไป" : ""}
                                    </span>
                                </p>
                                {!isHighest ? (
                                    <p className="text-sm text-muted-foreground flex items-center justify-between">
                                        <span>เป้าหมายขั้นถัดไป:</span>
                                        <span className="font-extrabold text-sm" style={{ color: selectedTier.color }}>
                                            {selectedTier.nextGoal!.toLocaleString()} EXP
                                        </span>
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground flex items-center justify-between">
                                        <span>สถานะระดับสมาชิก:</span>
                                        <span className="font-extrabold text-sm text-emerald-500">
                                            {t.highestRank}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Benefits list */}
                        {false && (
                        <div className="glass-card rounded-3xl p-6 border border-border/50 shadow-md">
                            <h3 className="text-xs font-extrabold tracking-widest uppercase text-muted-foreground flex items-center gap-2 border-b border-border/30 pb-3 mb-4">
                                <Trophy className="w-4 h-4" style={{ color: selectedTier.color }} />
                                {t.tierBenefits}
                            </h3>
                            <ul className="space-y-3.5">
                                {benefits.map((benefit, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                        <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border"
                                            style={{ 
                                                background: `${selectedTier.color}15`,
                                                borderColor: `${selectedTier.color}30`
                                            }}>
                                            <Check className="w-3 h-3" style={{ color: selectedTier.color }} />
                                        </span>
                                        <span className="text-muted-foreground font-semibold leading-normal">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        )}

                    </div>
                )}

            </div>
        </div>
    );
}
