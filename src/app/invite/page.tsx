"use client";

import { useMemo, useState, useEffect } from "react";
import { Copy, Share2, Users, ChevronLeft, CheckCircle2, Clock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-context";

export default function AccountInvitePage() {
    const { user } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);
    const [referrals, setReferrals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [referredBy, setReferredBy] = useState<any>(null);
    const [referrerInput, setReferrerInput] = useState("");
    const [submittingReferrer, setSubmittingReferrer] = useState(false);
    const [settings, setSettings] = useState({ rewardAmount: 10, minSpend: 100 });

    useEffect(() => {
        api.getReferrals()
            .then((data) => {
                setReferrals(data.referrals || []);
                setHasPurchased(data.hasPurchased || false);
                setReferredBy(data.referredBy || null);
                if (data.settings) {
                    setSettings(data.settings);
                }
            })
            .catch((err) => {
                console.error("Failed to load referrals:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleSaveReferrer = async () => {
        let code = referrerInput.trim();
        if (!code) {
            toast.error("กรุณากรอกรหัสแนะนำเพื่อน");
            return;
        }

        // Clean up full URLs to get the UUID or numeric ID only
        if (code.includes("/ref/")) {
            const parts = code.split("/ref/");
            code = parts[parts.length - 1] || code;
        }
        code = code.split("?")[0].split("#")[0];
        while (code.endsWith("/")) {
            code = code.slice(0, -1);
        }

        setSubmittingReferrer(true);
        try {
            await api.setReferrer(code);
            toast.success("บันทึกผู้แนะนำสำเร็จ!");
            const updated = await api.getReferrals();
            setReferrals(updated.referrals || []);
            setHasPurchased(updated.hasPurchased || false);
            setReferredBy(updated.referredBy || null);
            if (updated.settings) {
                setSettings(updated.settings);
            }
            setReferrerInput("");
        } catch (error: any) {
            toast.error(error.message || "เกิดข้อผิดพลาดในการบันทึกรหัสผู้แนะนำ");
        } finally {
            setSubmittingReferrer(false);
        }
    };

    const referralLink = useMemo(() => {
        if (!user?.id) return "";
        if (typeof window === "undefined") return "";
        return `${window.location.origin}/ref/${user.id}`;
    }, [user]);

    const handleCopy = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        if (!referralLink) return;
        if (navigator.share) {
            navigator.share({
                title: "GachaPay",
                text: "สมัครใช้งาน GachaPay และรับสิทธิพิเศษมากมาย!",
                url: referralLink,
            });
        } else {
            handleCopy();
        }
    };

    const stats = useMemo(() => {
        const total = referrals.length;
        const completed = referrals.filter(r => r.status === "completed").length;
        const pending = total - completed;
        const totalReward = referrals.filter(r => r.status === "completed").reduce((sum, r) => sum + r.reward, 0);
        return { total, completed, pending, totalReward };
    }, [referrals]);

    return (
        <div className="min-h-screen pt-20 pb-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="container mx-auto px-6 max-w-5xl">
                {/* Header with Back Button and Title */}
                <div className="flex items-center gap-3 mb-6">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.back()}
                        className="w-9 h-9 rounded-xl border border-border/50 hover:bg-muted flex items-center justify-center cursor-pointer transition-colors shrink-0"
                    >
                        <ChevronLeft className="w-5 h-5 text-foreground" />
                    </Button>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-foreground">{t.inviteTitle}</h1>
                </div>

                {/* Main Card */}
                <div className="space-y-6">
                    {/* Refer and Earn Card */}
                    <div className="glass-card rounded-3xl border border-border/50 p-6 md:p-8 relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0">
                                <Users className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">{t.inviteReferAndEarn}</p>
                                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                    {t.inviteDesc(settings.minSpend.toFixed(2), settings.rewardAmount)}
                                </p>
                            </div>
                        </div>

                        {/* Referral Link & Actions */}
                        <div className="mt-8 space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="referral-link" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    {t.inviteLinkLabel}
                                </label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex items-center bg-muted/40 border border-border/50 rounded-2xl p-1.5 focus-within:border-cyan-500/60 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all duration-300 flex-1">
                                        <Input
                                            id="referral-link"
                                            readOnly
                                            value={referralLink}
                                            className="bg-transparent border-0 text-xs sm:text-sm h-10 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 px-3"
                                        />
                                        <Button
                                            onClick={handleCopy}
                                            className="h-10 px-4 sm:px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                            {copied ? t.inviteCopied : t.inviteCopy}
                                        </Button>
                                    </div>
                                    <Button
                                        className="h-13 sm:h-auto px-6 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-500 font-bold transition-all rounded-2xl cursor-pointer"
                                        onClick={handleShare}
                                    >
                                        <Share2 className="w-4 h-4 mr-2" />
                                        {t.inviteShare}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar for maximum 10 friends */}
                        <div className="mt-6 pt-6 border-t border-border/50 space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-muted-foreground">{t.inviteBonusProgress}</span>
                                <span className="text-amber-500">{stats.completed} / 10 {t.invitePerson}</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden border border-border/10">
                                <div 
                                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((stats.completed / 10) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground/80">
                                {t.inviteBonusNote(settings.minSpend.toFixed(2))}
                            </p>
                        </div>
                    </div>

                    {/* Referrer Input Card (Business Logic Lock) */}
                    <div className="glass-card rounded-3xl border border-border/50 p-6 md:p-8 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                                <Gift className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">{t.inviteReferrerTitle}</p>
                                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                    {t.inviteReferrerDesc}
                                </p>
                            </div>
                        </div>

                        {(() => {
                            if (referredBy) {
                                return (
                                    /* Case 3: Already filled/referred */
                                    <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-[0_4px_20px_rgba(16,185,129,0.08)]">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground font-medium">{t.inviteAlreadyReferred}</p>
                                            <p className="text-sm font-bold text-emerald-500 dark:text-emerald-400 mt-0.5 truncate">
                                                {referredBy.name ? `${referredBy.name} (${referredBy.email})` : referredBy.email}
                                            </p>
                                        </div>
                                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 whitespace-nowrap">
                                            {t.inviteSaved}
                                        </span>
                                    </div>
                                );
                            }
                            if (hasPurchased) {
                                return (
                                    /* Case 2: No referrer, but already purchased -> Locked */
                                    <div className="bg-muted/40 border border-border/40 rounded-2xl p-4">
                                        <p className="text-xs text-muted-foreground/80 leading-relaxed">
                                            {t.inviteLockedMsg}
                                        </p>
                                    </div>
                                );
                            }
                            return (
                                /* Case 1: No purchase yet, no referrer -> Input enabled */
                                <div className="space-y-3">
                                    <div className="relative flex items-center bg-muted/40 border border-border/50 rounded-2xl p-1.5 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
                                        <Input
                                            placeholder={t.inviteReferrerPlaceholder}
                                            value={referrerInput}
                                            onChange={(e) => setReferrerInput(e.target.value)}
                                            className="bg-transparent border-0 text-xs sm:text-sm h-10 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 px-3"
                                            disabled={submittingReferrer}
                                        />
                                        <Button
                                            onClick={handleSaveReferrer}
                                            disabled={submittingReferrer || !referrerInput.trim()}
                                            className="h-10 px-6 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 active:scale-95 transition-all shrink-0 cursor-pointer text-xs"
                                        >
                                            {submittingReferrer ? t.inviteSaving : t.inviteConfirm}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground/75">
                                        {t.inviteReferrerNote}
                                    </p>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass-card rounded-2xl p-4 border border-border/40 hover:border-border/60 transition-all flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t.inviteStatsTotal}</p>
                                <p className="text-lg font-black mt-0.5 text-foreground">{stats.total} {t.invitePerson}</p>
                            </div>
                        </div>
                        <div className="glass-card rounded-2xl p-4 border border-border/40 hover:border-emerald-500/30 transition-all flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{t.inviteStatsSuccess}</p>
                                <p className="text-lg font-black mt-0.5 text-emerald-500">{stats.completed} {t.invitePerson}</p>
                            </div>
                        </div>
                        <div className="glass-card rounded-2xl p-4 border border-border/40 hover:border-border/60 transition-all flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t.inviteStatsPending}</p>
                                <p className="text-lg font-black mt-0.5 text-muted-foreground">{stats.pending} {t.invitePerson}</p>
                            </div>
                        </div>
                        <div className="glass-card rounded-2xl p-4 border border-border/40 hover:border-amber-500/30 transition-all flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                                <Gift className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{t.inviteStatsBonus}</p>
                                <p className="text-lg font-black mt-0.5 text-amber-500">+{stats.totalReward} COIN</p>
                            </div>
                        </div>
                    </div>

                    {/* Referrals List Table */}
                    <div className="glass-card rounded-3xl border border-border/50 p-6 shadow-md">
                        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                            <Gift className="w-4.5 h-4.5 text-cyan-500" />
                            {t.inviteTableTitle}
                        </h2>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-border/50 pb-2 text-muted-foreground font-semibold">
                                        <th className="pb-3 font-semibold whitespace-nowrap">{t.inviteColEmail}</th>
                                        <th className="pb-3 font-semibold whitespace-nowrap">{t.inviteColDate}</th>
                                        <th className="pb-3 font-semibold whitespace-nowrap">{t.inviteColSpent}</th>
                                        <th className="pb-3 font-semibold whitespace-nowrap">{t.inviteColStatus}</th>
                                        <th className="pb-3 font-semibold text-right whitespace-nowrap">{t.inviteColBonus}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {(() => {
                                        if (loading) {
                                            return (
                                                <tr>
                                                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                                                        {t.inviteLoading}
                                                    </td>
                                                </tr>
                                            );
                                        }
                                        if (referrals.length === 0) {
                                            return (
                                                <tr>
                                                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                                                        {t.inviteNoReferrals}
                                                    </td>
                                                </tr>
                                            );
                                        }
                                        return referrals.map((ref) => (
                                            <tr key={ref.id} className="hover:bg-muted/10 transition-colors">
                                                <td className="py-3.5 font-medium text-foreground whitespace-nowrap">{ref.email}</td>
                                                <td className="py-3.5 text-muted-foreground whitespace-nowrap">
                                                    {new Date(ref.joinedAt).toLocaleDateString("th-TH", {
                                                        day: "numeric",
                                                        month: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                                <td className="py-3.5 text-muted-foreground whitespace-nowrap">
                                                    <span className="font-semibold text-foreground">฿{(ref.totalSpent || 0).toFixed(2)}</span>
                                                    <span className="text-[10px] text-muted-foreground"> / ฿{settings.minSpend.toFixed(2)}</span>
                                                </td>
                                                <td className="py-3.5 whitespace-nowrap">
                                                    {ref.status === "completed" ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 whitespace-nowrap">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            {t.inviteStatusCompleted}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border whitespace-nowrap">
                                                            <Clock className="w-3 h-3" />
                                                            {t.inviteStatusPending}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 text-right font-bold whitespace-nowrap">
                                                    {ref.status === "completed" ? (
                                                        <span className="text-amber-500">+{ref.reward} COIN</span>
                                                    ) : (
                                                        <span className="text-muted-foreground/60">+{ref.reward} COIN</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
