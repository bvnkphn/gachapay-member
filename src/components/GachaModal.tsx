"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { X, Clock, Coins, History, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface GachaModalProps {
    open: boolean;
    onClose: () => void;
    user: any;
    t: any;
    onSpinCompleted?: () => void;
}

function secureRandom(): number {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / (0xFFFFFFFF + 1);
}

export default function GachaModal({ open, onClose, user, t, onSpinCompleted }: GachaModalProps) {
    const [gachaSegments, setGachaSegments] = useState<any[]>([
        { value: 5, label: "5 COINS", probability: 17.5 },
        { value: 0, label: "เกลือ (ไม่ได้)", probability: 10 },
        { value: 10, label: "10 COINS", probability: 20 },
        { value: 50, label: "50 COINS", probability: 5 },
        { value: 0, label: "เกลือ (ไม่ได้)", probability: 10 },
        { value: 20, label: "20 COINS", probability: 10 },
        { value: 5, label: "5 COINS", probability: 17.5 },
        { value: 0, label: "เกลือ (ไม่ได้)", probability: 10 }
    ]);
    const [txHistory, setTxHistory] = useState<any[]>([]);
    const [usedSpins, setUsedSpins] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [winningSegmentIndex, setWinningSegmentIndex] = useState(0);
    const [showPrizeClaimed, setShowPrizeClaimed] = useState(false);
    const [claimedPrizeText, setClaimedPrizeText] = useState("");
    const [showSpinHistory, setShowSpinHistory] = useState(false);
    const [spinHistoryData, setSpinHistoryData] = useState<{ items: any[]; total: number }>({ items: [], total: 0 });

    useEffect(() => {
        api.getGachaSettings()
            .then((data: any) => {
                if (data && data.segments && data.segments.length === 8) {
                    setGachaSegments(data.segments);
                }
            })
            .catch((err) => console.error("Failed to load gacha settings:", err));
    }, []);

    const fetchTopupsAndSpins = () => {
        if (user) {
            api.getTopupTransactions({ limit: 100 })
                .then((d) => setTxHistory(d?.items ?? []))
                .catch(() => setTxHistory([]));

            const stored = localStorage.getItem(`gachapay_used_spins_${user.id}`);
            setUsedSpins(stored ? Number.parseInt(stored, 10) : 0);
        }
    };

    const fetchSpinHistory = () => {
        if (user) {
            api.getGachaSpins({ limit: 50 })
                .then((d) => {
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
        if (open) {
            fetchTopupsAndSpins();
        }
    }, [open, user?.id]);

    useEffect(() => {
        if (showPrizeClaimed && gachaSegments[winningSegmentIndex]?.value > 0) {
            import("canvas-confetti").then((module) => {
                const confetti = module.default;
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.45 }
                });

                const duration = 2.5 * 1000;
                const end = Date.now() + duration;

                const frame = () => {
                    confetti({
                        particleCount: 5,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0, y: 0.8 }
                    });
                    confetti({
                        particleCount: 5,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1, y: 0.8 }
                    });

                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                };
                frame();
            }).catch((err) => {
                console.error("Confetti launch failed:", err);
            });
        }
    }, [showPrizeClaimed, winningSegmentIndex, gachaSegments]);

    const totalTopup = useMemo(() => {
        return txHistory
            .filter((tx) => tx.status === "completed")
            .reduce((sum, tx) => sum + (Number.parseFloat(tx.amount) || 0), 0);
    }, [txHistory]);

    const totalSpins = useMemo(() => Math.floor(totalTopup / 1000), [totalTopup]);
    const availableSpins = useMemo(() => Math.max(0, totalSpins - usedSpins), [totalSpins, usedSpins]);
    const progressToNextSpin = useMemo(() => totalTopup % 1000, [totalTopup]);

    const spinGacha = () => {
        const rand = secureRandom() * 100;
        let cumulative = 0;
        for (let i = 0; i < gachaSegments.length; i++) {
            cumulative += Number(gachaSegments[i].probability || 0);
            if (rand <= cumulative) {
                return i;
            }
        }
        return gachaSegments.length - 1;
    };

    const startSpin = () => {
        if (isSpinning || availableSpins <= 0) return;

        setRotation(prev => prev % 360);

        setTimeout(() => {
            setIsSpinning(true);
            const winningIndex = spinGacha();
            setWinningSegmentIndex(winningIndex);

            const extraSpins = 6;
            const jitter = (secureRandom() - 0.5) * 20;
            const targetRotation = (extraSpins * 360) + (360 - (winningIndex * 45) - 22.5) + jitter;
            setRotation(targetRotation);
        }, 50);
    };

    const handleTransitionEnd = async () => {
        setIsSpinning(false);
        const prize = gachaSegments[winningSegmentIndex];

        const newUsed = usedSpins + 1;
        setUsedSpins(newUsed);
        localStorage.setItem(`gachapay_used_spins_${user?.id}`, newUsed.toString());

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
                const result = await api.claimGachaReward(prize.value);
                if (result && result.success) {
                    if (user) {
                        const currentBonus = Number.parseFloat(localStorage.getItem(`gachapay_bonus_coins_${user.id}`) || "0");
                        localStorage.setItem(`gachapay_bonus_coins_${user.id}`, String(currentBonus + prize.value));
                    }
                    window.dispatchEvent(new Event("balance-changed"));
                    if (onSpinCompleted) {
                        onSpinCompleted();
                    }
                }
            } catch (err) {
                console.error("Gacha payout fail:", err);
            }
        } else {
            setClaimedPrizeText("ไม่ได้รางวัล (เกลือ)");
            setShowPrizeClaimed(true);
        }

        if (onSpinCompleted) {
            onSpinCompleted();
        }
    };

    let spinButtonClassName = "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-300 dark:border-zinc-700 cursor-not-allowed w-16 h-16 rounded-full flex flex-col items-center justify-center border-4 shadow-md transition-all select-none";
    if (isSpinning) {
        spinButtonClassName = "bg-muted text-muted-foreground scale-95 w-16 h-16 rounded-full flex flex-col items-center justify-center border-4 shadow-md transition-all select-none";
    } else if (availableSpins > 0) {
        spinButtonClassName = "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white font-black cursor-pointer scale-100 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.5)] w-16 h-16 rounded-full flex flex-col items-center justify-center border-4 border-amber-300 select-none";
    }

    const renderSpinButtonContent = () => {
        if (isSpinning) {
            return <span className="text-[9px] font-black tracking-tighter">SPINNING</span>;
        }
        if (availableSpins > 0) {
            return (
                <>
                    <span className="text-[11px] font-black tracking-wider drop-shadow-sm leading-none">SPIN</span>
                    <span className="text-[7px] font-bold text-amber-100 mt-0.5">หมุนเลย!</span>
                </>
            );
        }
        return (
            <>
                <span className="text-[10px] font-bold leading-none">LOCK</span>
                <span className="text-[6px] text-zinc-500 mt-0.5">สะสมยอด</span>
            </>
        );
    };

    if (!open) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-background rounded-2xl w-full max-w-md shadow-2xl border border-border/40 overflow-hidden relative p-6 flex flex-col items-center">
                    <button
                        disabled={isSpinning}
                        onClick={() => {
                            if (!isSpinning) {
                                onClose();
                                setShowPrizeClaimed(false);
                            }
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
                        aria-label="Close modal"
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
                            <div className="relative p-4 bg-muted/30 rounded-full shadow-inner border border-border/20">
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 z-30 select-none">
                                    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-red-500 drop-shadow-md animate-bounce" />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!isSpinning && availableSpins > 0) {
                                            startSpin();
                                        }
                                    }}
                                    className={cn(
                                        "relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-foreground/10 shadow-2xl overflow-hidden select-none transition-all duration-300 p-0 bg-transparent block border-none outline-none",
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
                                        {gachaSegments.map((seg, i) => {
                                            const angle = i * 45 + 22.5;
                                            return (
                                                <div
                                                    key={`segment-${i}-${seg.value}`}
                                                    className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-start origin-center pt-8 text-[11px] font-black text-white select-none pointer-events-none drop-shadow-md"
                                                    style={{ transform: `rotate(${angle}deg)` }}
                                                >
                                                    <div className="text-[12px] uppercase font-black tracking-wider">{seg.value > 0 ? `${seg.value}` : "0"}</div>
                                                    <div className="text-[7px] opacity-80 uppercase tracking-widest max-w-[50px] text-center truncate">{seg.label || (seg.value > 0 ? "Coins" : "เกลือ")}</div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <button
                                            type="button"
                                            disabled={isSpinning || availableSpins <= 0}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startSpin();
                                            }}
                                            className={spinButtonClassName}
                                        >
                                            {renderSpinButtonContent()}
                                        </button>
                                    </div>
                                </button>
                            </div>

                            <div className="text-center w-full mt-2">
                                <div className="flex justify-between text-xs font-semibold text-muted-foreground px-4 mb-2">
                                    <span>ยอดเติมเงินสะสม: ฿{totalTopup.toLocaleString()}</span>
                                    <span>สิทธิ์คงเหลือ: <span className="text-primary font-bold">{availableSpins} ครั้ง</span></span>
                                </div>
                                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-primary h-full transition-all duration-500"
                                        style={{ width: `${(progressToNextSpin / 1000) * 100}%` }}
                                    />
                                </div>
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
                        <div className="flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-95 duration-300 w-full">
                            {gachaSegments[winningSegmentIndex]?.value > 0 ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-full bg-yellow-500/10 border-4 border-yellow-500 flex items-center justify-center mb-4 animate-bounce shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                                        <Coins className="w-12 h-12 text-yellow-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-primary mb-2">ยินดีด้วย!</h3>
                                    <p className="text-sm font-semibold text-foreground mb-1">คุณได้รับรางวัลฟรีคอยน์</p>
                                    <p className="text-3xl font-black text-amber-500 mb-6 font-mono">+{gachaSegments[winningSegmentIndex].value} COINS</p>
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

            {showSpinHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-background rounded-2xl w-full max-w-lg shadow-2xl border border-border/40 overflow-hidden relative p-6 flex flex-col max-h-[80vh]">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">ประวัติการสุ่ม</h3>
                                <p className="text-xs text-muted-foreground">ประวัติการหมุนวงล้อ Gacha Lucky Wheel</p>
                            </div>
                            <button
                                onClick={() => setShowSpinHistory(false)}
                                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                aria-label="Close history"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

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
                                    {spinHistoryData.items.reduce((sum, s) => sum + (s.won ? Number.parseFloat(s.prizeAmount) : 0), 0).toFixed(0)}
                                </p>
                            </div>
                        </div>

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
                                                        {spin.won ? `+${Number.parseFloat(spin.prizeAmount).toFixed(0)} COINS` : "เกลือ"}
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

                        <button
                            onClick={() => setShowSpinHistory(false)}
                            className="mt-4 w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-sm transition-all cursor-pointer"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
