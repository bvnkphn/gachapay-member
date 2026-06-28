"use client";

import { useMemo, useState } from "react";
import { Copy, Share2, Users, ChevronLeft, CheckCircle2, Clock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

// Mock Referrals List with pending and completed statuses
const MOCK_REFERRALS = [
    { id: 1, email: "m***y@gmail.com", joinedAt: "28/06/2026", status: "pending", reward: 10 },
    { id: 2, email: "som***.k@hotmail.com", joinedAt: "27/06/2026", status: "completed", reward: 10 },
    { id: 3, email: "ch***.dev@gmail.com", joinedAt: "25/06/2026", status: "pending", reward: 10 },
];

export default function AccountInvitePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [copied, setCopied] = useState(false);

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
        const total = MOCK_REFERRALS.length;
        const completed = MOCK_REFERRALS.filter(r => r.status === "completed").length;
        const pending = total - completed;
        const totalReward = MOCK_REFERRALS.filter(r => r.status === "completed").reduce((sum, r) => sum + r.reward, 0);
        return { total, completed, pending, totalReward };
    }, []);

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
                    <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-foreground">เชิญเพื่อนเพื่อรับโบนัส</h1>
                </div>

                {/* Main Card */}
                <div className="space-y-6">
                    <div className="glass-card rounded-3xl border border-border/50 p-6 md:p-8">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0">
                                <Users className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">แนะนำและรับโบนัส</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    แนะนำเพื่อนมาใช้งาน เมื่อเพื่อนซื้อสินค้าสำเร็จ รับทันที 10 COIN ต่อคน (สูงสุด 10 คน)
                                </p>
                            </div>
                        </div>

                        {/* Referral Link & Actions */}
                        <div className="mt-8 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    ลิงก์เชิญเพื่อนของคุณ
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        readOnly
                                        value={referralLink}
                                        className="bg-muted/30 border-border/50 text-xs h-11 focus-visible:ring-cyan-500"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-11 border-border/60 hover:bg-muted text-foreground transition-colors"
                                    onClick={handleCopy}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    {copied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}
                                </Button>
                                <Button
                                    className="flex-1 h-11 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-500 font-bold transition-all"
                                    onClick={handleShare}
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    แชร์ให้เพื่อน
                                </Button>
                            </div>
                        </div>

                        {/* Progress Bar for maximum 10 friends */}
                        <div className="mt-6 pt-6 border-t border-border/50 space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-muted-foreground">สิทธิ์รับโบนัสจากการเชิญเพื่อน</span>
                                <span className="text-amber-500">{stats.completed} / 10 คน</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-muted overflow-hidden border border-border/10">
                                <div 
                                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((stats.completed / 10) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground/80">
                                * ได้รับเหรียญโบนัสจากเพื่อนที่ช้อปปิ้งสำเร็จสูงสุดไม่เกิน 10 คนแรก
                            </p>
                        </div>
                    </div>

                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="glass-card rounded-2xl p-4 border border-border/40 text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">เชิญทั้งหมด</p>
                            <p className="text-xl font-black mt-1 text-foreground">{stats.total} คน</p>
                        </div>
                        <div className="glass-card rounded-2xl p-4 border border-border/40 text-center">
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">สำเร็จ</p>
                            <p className="text-xl font-black mt-1 text-emerald-500">{stats.completed} คน</p>
                        </div>
                        <div className="glass-card rounded-2xl p-4 border border-border/40 text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">รอดำเนินการ</p>
                            <p className="text-xl font-black mt-1 text-muted-foreground">{stats.pending} คน</p>
                        </div>
                        <div className="glass-card rounded-2xl p-4 border border-border/40 text-center">
                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">โบนัสที่ได้รับ</p>
                            <p className="text-xl font-black mt-1 text-amber-500">+{stats.totalReward} COIN</p>
                        </div>
                    </div>

                    {/* Referrals List Table */}
                    <div className="glass-card rounded-3xl border border-border/50 p-6">
                        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                            <Gift className="w-4 h-4 text-cyan-500" />
                            สถานะการช้อปของเพื่อน
                        </h2>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-border/50 pb-2 text-muted-foreground font-semibold">
                                        <th className="pb-3 font-semibold whitespace-nowrap">อีเมลเพื่อน</th>
                                        <th className="pb-3 font-semibold whitespace-nowrap">วันที่เข้าร่วม</th>
                                        <th className="pb-3 font-semibold whitespace-nowrap">สถานะ</th>
                                        <th className="pb-3 font-semibold text-right whitespace-nowrap">โบนัสที่จะได้รับ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {MOCK_REFERRALS.map((ref) => (
                                        <tr key={ref.id} className="hover:bg-muted/10 transition-colors">
                                            <td className="py-3.5 font-medium text-foreground whitespace-nowrap">{ref.email}</td>
                                            <td className="py-3.5 text-muted-foreground whitespace-nowrap">{ref.joinedAt}</td>
                                            <td className="py-3.5 whitespace-nowrap">
                                                {ref.status === "completed" ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 whitespace-nowrap">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        สำเร็จ
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border whitespace-nowrap">
                                                        <Clock className="w-3 h-3" />
                                                        รอดำเนินการ
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
