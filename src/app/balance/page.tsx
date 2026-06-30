"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/components/language-context";
import { useSidebar } from "@/components/sidebar-context";
import { api } from "@/lib/api";
import { ChevronRight, Wallet, Info, X, Search, FileText, ChevronLeft, Download, Copy, Check, AlertTriangle, RefreshCw, Gamepad2, SlidersHorizontal, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";
import { toast } from "sonner";

const PRESET_AMOUNTS = [50, 100, 300, 500, 1000, 3000];

const PAYMENT_METHODS = [
    { id: "promptpay", name: "PromptPay QR", desc: "สแกน QR Code จ่ายเงิน", icon: "QR", color: "#1a56db", disabled: false },
    { id: "bank_transfer", name: "Bank Transfer", desc: "โอนเงินตรงเข้าบัญชีธนาคาร", icon: "B", color: "#0d9488", disabled: false },
    { id: "truemoney", name: "TrueMoney Wallet", desc: "ชำระผ่านเบอร์วอลเล็ท", icon: "TW", color: "#f97316", disabled: false },
];

const BANKS = [
    { code: "kbank", name: "ธนาคารกสิกรไทย", number: "123-4-56789-0", accName: "บจก. กาชาเพย์ (GachaPay Co., Ltd.)", color: "#138f2d" },
    { code: "scb", name: "ธนาคารไทยพาณิชย์", number: "987-6-54321-0", accName: "บจก. กาชาเพย์ (GachaPay Co., Ltd.)", color: "#4e2a84" },
    { code: "bbl", name: "ธนาคารกรุงเทพ", number: "111-2-33333-4", accName: "บจก. กาชาเพย์ (GachaPay Co., Ltd.)", color: "#1e3a8a" },
    { code: "ktb", name: "ธนาคารกรุงไทย", number: "222-3-44444-5", accName: "บจก. กาชาเพย์ (GachaPay Co., Ltd.)", color: "#00a2e8" },
    { code: "bay", name: "ธนาคารกรุงศรีอยุธยา", number: "555-6-77777-8", accName: "บจก. กาชาเพย์ (GachaPay Co., Ltd.)", color: "#fbb03b" }
];

const PAGE_SIZE = 4;

type PayStep = "qr" | "processing" | "success" | "failed" | "awaiting_review";

function PaymentFlowModal({
    method, amount, referenceId, expiredAt, onClose, onRetry, onSuccess, router, t, bankDetails,
}: {
    method: typeof PAYMENT_METHODS[0] & { desc: string };
    amount: number;
    referenceId?: string;
    expiredAt?: string;
    onClose: () => void;
    onRetry: () => void;
    onSuccess?: () => void;
    router: ReturnType<typeof useRouter>;
    t: ReturnType<typeof useLanguage>["t"];
    bankDetails?: { code: string; name: string; number: string; accName: string };
}) {
    const [step, setStep] = useState<PayStep>("qr");
    const [countdown, setCountdown] = useState(180);
    const [copied, setCopied] = useState(false);
    const txId = referenceId ?? "1159351574";
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [uploading, setUploading] = useState(false);
    const dateStr = new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
    const timeStr = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("ขนาดไฟล์เกิน 5MB");
                return;
            }
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setFilePreviewUrl(url);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (file.type.startsWith("image/")) {
                if (file.size > 5 * 1024 * 1024) {
                    toast.error("ขนาดไฟล์เกิน 5MB");
                    return;
                }
                setSelectedFile(file);
                const url = URL.createObjectURL(file);
                setFilePreviewUrl(url);
            } else {
                toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
            }
        }
    };

    const triggerFileSelect = () => {
        document.getElementById("slip-file-input")?.click();
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl(null);
        }
    };

    const handleSubmitSlip = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setVerificationMessage(null);
        try {
            // Step 1: Upload the slip image
            const uploadResult = await api.uploadSlip(selectedFile);
            // Step 2: Submit slip URL to link with the transaction
            const submitResult: any = await api.submitSlip(txId, uploadResult.url, bankDetails?.code);
            if (submitResult?.status === 'completed') {
                setStep("success");
                return;
            }
            if (submitResult?.status === 'verification_failed') {
                setVerificationMessage(submitResult?.reason || 'Slip verification did not pass.');
            }
            setStep("awaiting_review");
        } catch (err: any) {
            toast.error(err.message || "อัพโหลดสลิปล้มเหลว กรุณาลองใหม่");
        } finally {
            setUploading(false);
        }
    };

    const handleForceComplete = async () => {
        setUploading(true);
        try {
            const result: any = await api.simulateTopupComplete(txId);
            if (result?.status === 'completed') {
                setStep("success");
                toast.success("ทำรายการสำเร็จแล้ว");
            } else {
                toast.error("ไม่สามารถทำรายการให้เสร็จสมบูรณ์ได้");
            }
        } catch (err: any) {
            toast.error(err.message || "ไม่สามารถทำรายการให้เสร็จสมบูรณ์ได้");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (filePreviewUrl) {
                URL.revokeObjectURL(filePreviewUrl);
            }
        };
    }, [filePreviewUrl]);

    const calculateTimeLeft = useCallback(() => {
        if (!expiredAt) return 180;
        const diffMs = new Date(expiredAt).getTime() - Date.now();
        const seconds = Math.floor(diffMs / 1000);
        return seconds > 0 ? seconds : 0;
    }, [expiredAt]);

    useEffect(() => {
        setCountdown(calculateTimeLeft());
    }, [expiredAt, calculateTimeLeft]);

    useEffect(() => {
        if (step !== "qr") return;
        if (countdown <= 0) {
            api.simulateTopupCancel(txId).catch(() => {});
            setStep("failed");
            return;
        }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown, step, txId]);

    useEffect(() => {
        if (step !== "processing") return;
        const t = setTimeout(async () => {
            try {
                await api.simulateTopupComplete(txId);
                setStep("success");
                onSuccess?.();
            } catch {
                setStep("failed");
            }
        }, 3000);
        return () => clearTimeout(t);
    }, [step]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(txId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, []);

    const mm = String(Math.floor(countdown / 60)).padStart(2, "0");
    const ss = String(countdown % 60).padStart(2, "0");

    const overlay = "fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200";
    const card = "bg-card border border-border/80 rounded-3xl w-full max-w-md p-4 sm:p-5 relative shadow-2xl text-foreground max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col";

    const DevNav = () => (
        <div className="w-full mt-4">
            <button
                type="button"
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="w-full py-2 rounded-xl border border-dashed border-yellow-500/30 hover:border-yellow-500/60 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
            >
                {showAdminPanel ? "🔒 ปิดแผงควบคุมจำลอง (Close Panel)" : "🛠️ เปิดแผงควบคุมจำลอง (Admin Panel)"}
            </button>
            
            {showAdminPanel && (
                <div className="bg-muted/40 border border-border/45 rounded-2xl p-3.5 mt-3 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-[9px] font-extrabold text-yellow-600 dark:text-yellow-400 uppercase tracking-widest text-center mb-2 flex items-center justify-center gap-1.5 select-none">
                        ⚙️ Admin Simulator Controller
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                        <button
                            type="button"
                            onClick={() => setStep("qr")}
                            className={cn(
                                "text-[10px] py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center",
                                step === "qr" 
                                    ? "bg-primary text-white shadow-[0_0_10px_rgba(108,99,255,0.4)]" 
                                    : "bg-muted/60 dark:bg-white/5 text-muted-foreground hover:bg-muted/80 dark:hover:bg-white/10"
                            )}
                        >
                            QR Code
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep("processing")}
                            className={cn(
                                "text-[10px] py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center",
                                step === "processing" 
                                    ? "bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.4)]" 
                                    : "bg-muted/60 dark:bg-white/5 text-muted-foreground hover:bg-muted/80 dark:hover:bg-white/10"
                            )}
                        >
                            ตรวจเงิน
                        </button>
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    await api.simulateTopupComplete(txId);
                                    setStep("success");
                                    onSuccess?.();
                                } catch {
                                    setStep("failed");
                                }
                            }}
                            className={cn(
                                "text-[10px] py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center",
                                step === "success" 
                                    ? "bg-green-600 text-white shadow-[0_0_10px_rgba(22,163,74,0.4)]" 
                                    : "bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/20 dark:hover:bg-green-500/30"
                            )}
                        >
                            สำเร็จ
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep("failed")}
                            className={cn(
                                "text-[10px] py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center",
                                step === "failed" 
                                    ? "bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]" 
                                    : "bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30"
                            )}
                        >
                            ล้มเหลว
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    if (step === "qr" && method.id === "bank_transfer") {
        return (
            <div className={overlay}>
                <div className={card}>
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-all cursor-pointer z-30"
                        aria-label="Close"
                    >
                        <X className="w-4.5 h-4.5" />
                    </button>
                    
                    <p className="text-center text-xs text-muted-foreground pb-1 pr-6 pt-1">
                        กรุณาโอนเงินผ่านทางธนาคารและแนบหลักฐานการโอนเงิน (สลิป)
                    </p>
                    <div className="pb-2">
                        <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-muted/40 border border-border/30 mt-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                    <Wallet className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-extrabold text-foreground leading-none">CYBERPAY</p>
                                    <p className="text-[10px] text-muted-foreground">Game Top-up Platform</p>
                                </div>
                            </div>
                            <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm" style={{ background: method.color }}>
                                {method.name}
                            </div>
                        </div>

                        <div className="space-y-2 mb-4 text-xs bg-muted/40 border border-border/30 rounded-xl p-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">ยอดเงินโอน (ยอดรวม)</span>
                                <span className="font-bold text-yellow-600 dark:text-yellow-400">฿{amount.toFixed(2)} THB</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">ธนาคารปลายทาง</span>
                                <span className="text-foreground font-semibold">{bankDetails?.name ?? "ธนาคารกสิกรไทย (KBANK)"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">ชื่อบัญชี</span>
                                <span className="text-foreground font-semibold">{bankDetails?.accName ?? "บจก. กาชาเพย์ (GachaPay Co., Ltd.)"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">เลขบัญชี</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-foreground font-mono text-[11px]">{bankDetails?.number ?? "123-4-56789-0"}</span>
                                    <button 
                                        onClick={() => { 
                                            navigator.clipboard.writeText((bankDetails?.number ?? "1234567890").replace(/-/g, "")); 
                                            toast.success("คัดลอกเลขบัญชีแล้ว"); 
                                        }} 
                                        className="px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                                    >
                                        คัดลอก
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-t border-border/20 pt-2">
                                <span className="text-muted-foreground">เลขที่อ้างอิง</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-foreground font-mono text-[11px]">{txId}</span>
                                    <button 
                                        onClick={handleCopy} 
                                        className="px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                                    >
                                        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* File Upload Section */}
                        {!selectedFile ? (
                            <div 
                                onClick={triggerFileSelect}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className="border border-dashed border-border hover:border-primary/50 rounded-2xl p-6 text-center text-foreground mb-4 cursor-pointer bg-muted/20 hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center gap-2 group"
                            >
                                <input 
                                    id="slip-file-input"
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                />
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-foreground">อัปโหลดสลิปการโอนเงิน (สลิปโอนเงิน)</p>
                                    <p className="text-[10px] text-muted-foreground">ลากและวางรูปภาพสลิปที่นี่ หรือคลิกเพื่ออัปโหลด</p>
                                </div>
                                <p className="text-[9px] text-muted-foreground/60">รองรับไฟล์ PNG, JPG, JPEG (ขนาดไม่เกิน 5MB)</p>
                            </div>
                        ) : (
                            <div className="border border-border/50 rounded-2xl p-4 bg-muted/20 mb-4 space-y-3">
                                <div className="relative aspect-[3/4] w-full max-w-[160px] mx-auto rounded-xl overflow-hidden border border-border bg-black/5 flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={filePreviewUrl || ""} 
                                        alt="Slip Preview" 
                                        className="object-contain w-full h-full"
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-3 text-xs bg-muted/40 p-2.5 rounded-xl border border-border/30">
                                    <div className="min-w-0 flex-1 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary shrink-0" />
                                        <span className="truncate text-foreground font-medium text-[11px]">{selectedFile.name}</span>
                                    </div>
                                    <button 
                                        onClick={removeSelectedFile}
                                        className="text-red-500 hover:text-red-400 font-bold shrink-0 text-[11px] cursor-pointer hover:underline"
                                    >
                                        ลบรูปภาพ
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Confirmation Button */}
                        <button 
                            onClick={handleSubmitSlip}
                            disabled={!selectedFile || uploading}
                            className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center justify-center gap-2 mb-3 transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    กำลังอัปโหลดสลิป...
                                </>
                            ) : (
                                "ยืนยันการโอนเงิน และอัปโหลดสลิป"
                            )}
                        </button>
                    </div>

                    <div className="border-t border-border/50 pt-4 text-center flex flex-col items-center gap-1.5">
                        <p className="text-[11px] text-muted-foreground">
                            มีปัญหาในการชำระเงิน?{" "}
                            <button 
                                onClick={() => router.push("/support/create-ticket")} 
                                className="text-primary hover:underline font-bold"
                            >
                                ติดต่อศูนย์บริการลูกค้า
                            </button>
                        </p>
                        <DevNav />
                    </div>
                </div>
            </div>
        );
    }

    if (step === "awaiting_review") return (
        <div className={overlay}>
            <div className={card}>
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-all cursor-pointer z-30"
                    aria-label="Close"
                >
                    <X className="w-4.5 h-4.5" />
                </button>
                
                <div className="flex flex-col items-center text-center py-6">
                    {/* Animated Review Icon */}
                    <div className="relative w-20 h-20 mb-5">
                        <div className="absolute inset-0 rounded-full bg-yellow-500/10 animate-ping" style={{ animationDuration: "2s" }} />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                                <FileText className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-extrabold text-foreground mb-1">
                        ส่งสลิปเรียบร้อยแล้ว!
                    </h3>
                    <p className="text-xs text-muted-foreground mb-5 max-w-[280px]">
                        สลิปของท่านได้รับการส่งเรียบร้อยแล้ว กรุณารอทีมงานตรวจสอบ<br />
                        ระบบจะเติม Coin ให้อัตโนมัติหลังอนุมัติ
                    </p>

                    {/* Transaction Details */}
                    <div className="w-full space-y-2 text-xs bg-muted/40 border border-border/30 rounded-xl p-3 mb-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">สถานะ</span>
                            <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-bold text-[10px]">
                                ⏳ รอตรวจสอบ
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">ยอดเงินโอน</span>
                            <span className="font-bold text-foreground">฿{amount.toFixed(2)} THB</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">ธนาคาร</span>
                            <span className="text-foreground font-semibold">{bankDetails?.name ?? "Bank Transfer"}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-border/20 pt-2">
                            <span className="text-muted-foreground">เลขที่อ้างอิง</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-foreground font-mono text-[11px]">{txId}</span>
                                <button onClick={handleCopy} className="px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">วันที่ส่ง</span>
                            <span className="text-foreground">{dateStr} {timeStr}</span>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="w-full flex items-start gap-2.5 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 mb-4">
                        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-left">
                            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-0.5">ขั้นตอนถัดไป</p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                ทีมงานจะตรวจสอบสลิปภายใน 5-15 นาที หากข้อมูลถูกต้อง ระบบจะเติม Coin ให้อัตโนมัติ คุณสามารถตรวจสอบสถานะได้ที่หน้าประวัติการเติมเงิน
                            </p>
                        </div>
                    </div>

                    {verificationMessage && (
                        <div className="w-full rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 mb-4">
                            <p className="font-bold mb-2">Slip2Go ไม่ผ่าน</p>
                            <p>{verificationMessage}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            disabled={uploading}
                            onClick={handleForceComplete}
                            className="w-full py-3 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition"
                        >
                            ขอให้ระบบทำรายการสำเร็จอีกครั้ง
                        </button>
                        <button 
                            onClick={() => {
                                onSuccess?.();
                                onClose();
                            }}
                            className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                        >
                            <History className="w-4 h-4" />
                            ดูประวัติการเติมเงิน
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full py-2.5 rounded-xl border border-border/50 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (step === "qr") return (
        <div className={overlay}>
            <div className={card}>
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-all cursor-pointer z-30"
                    aria-label="Close"
                >
                    <X className="w-4.5 h-4.5" />
                </button>
                
                <p className="text-center text-xs text-muted-foreground pb-1 pr-6 pt-1">
                    {t.qrScanInstruction(method.name)}
                </p>
                <div className="pb-2">
                    <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-muted/40 border border-border/30 mt-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <Wallet className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-extrabold text-foreground leading-none">CYBERPAY</p>
                                <p className="text-[10px] text-muted-foreground">Game Top-up Platform</p>
                            </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm" style={{ background: method.color }}>
                            {method.name}
                        </div>
                    </div>
                    <div className="space-y-2 mb-4 text-xs bg-muted/40 border border-border/30 rounded-xl p-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t.qrAmount}</span>
                            <span className="font-bold text-yellow-600 dark:text-yellow-400">฿{amount.toFixed(2)} THB</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t.qrExpiry}</span>
                            <span className="text-foreground">{dateStr}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{t.qrRef}</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-foreground font-mono text-[11px]">{txId}</span>
                                <button onClick={handleCopy} className="px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-[11px] text-muted-foreground mb-3">{t.qrScanHint}</p>
                    <div className="bg-white rounded-2xl p-4 mx-auto w-fit mb-3 flex items-center justify-center border border-border/20 shadow-sm">
                        <QRCode
                            value={`cyberpay://topup?txId=${txId}&amount=${amount}&method=${method.id}`}
                            size={120}
                            bgColor="#ffffff"
                            fgColor="#09090b"
                        />
                    </div>
                    <button className="w-full py-2.5 rounded-xl border border-border/50 text-xs text-muted-foreground hover:bg-muted flex items-center justify-center gap-2 mb-3 transition-colors">
                        <Download className="w-3.5 h-3.5" /> {t.qrSaveBtn}
                    </button>
                    <p className="text-center text-[11px] text-muted-foreground/80 mb-3">{t.qrNote(method.name)}</p>
                    <p className="text-center text-xs text-muted-foreground mb-2">{t.qrTimeLeft?.replace("3", String(Math.ceil(countdown / 60))) || ""}</p>
                    <div className="text-center mb-4">
                        <span className="font-mono font-black text-2xl tracking-widest text-foreground">
                            {mm}:{ss}
                        </span>
                    </div>
                </div>
                <div className="border-t border-border/50 pt-4 text-center flex flex-col items-center gap-1.5">
                    <p className="text-[11px] text-muted-foreground">
                        มีปัญหาในการชำระเงิน?{" "}
                        <button 
                            onClick={() => router.push("/support/create-ticket")} 
                            className="text-primary hover:underline font-bold"
                        >
                            ติดต่อศูนย์บริการลูกค้า
                        </button>
                    </p>
                    <DevNav />
                </div>
            </div>
        </div>
    );

    if (step === "processing") return (
        <div className={overlay}>
            <div className={card}>
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-all cursor-pointer z-30"
                    aria-label="Close"
                >
                    <X className="w-4.5 h-4.5" />
                </button>
                <div className="flex flex-col items-center text-center py-2 pr-6 pt-1">
                    <div className="text-2xl font-extrabold text-white mb-0.5">GACHAPAY</div>
                    <div className="text-xs text-white/40 mb-8">Game Top-up Platform</div>
                    <div className="relative w-16 h-16 mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-l-yellow-400 animate-spin" />
                        <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-purple-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
                    </div>
                    <p className="font-bold text-white mb-2">{t.processingTitle}</p>
                    <p className="text-xs text-white/50 mb-6">{t.processingDesc}</p>
                    <div className="w-full py-2.5 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center gap-2 text-xs text-yellow-400 mb-4">
                        <AlertTriangle className="w-3.5 h-3.5" /> {t.processingWarning}
                    </div>
                    <p className="text-xs text-white/30">{t.processingRefId}: {txId}</p>
                    <DevNav />
                </div>
            </div>
        </div>
    );

    if (step === "success") return (
        <div className={overlay}>
            <div className={card}>
                <div className="absolute top-0 inset-x-0 h-1.5 rounded-t-3xl bg-green-400" />
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-all cursor-pointer z-30"
                    aria-label="Close"
                >
                    <X className="w-4.5 h-4.5" />
                </button>
                <div className="flex flex-col items-center text-center pt-2">
                    <div className="w-14 h-14 rounded-full border-2 border-green-400 flex items-center justify-center mb-4">
                        <Check className="w-7 h-7 text-green-400" />
                    </div>
                    <p className="font-bold text-green-400 text-lg mb-2">{t.paymentSuccessTitle}</p>
                    <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                        {t.paymentSuccessDesc}<br />
                        <span className="text-foreground font-medium">{t.successEmailNote}</span> {t.successEmailNote2}
                    </p>
                    <div className="w-full space-y-2 text-xs mb-5 text-left bg-muted/40 border border-border/30 rounded-xl p-4">
                        {[[t.txItem, "Top-up Balance"], [t.txChannel, method.name], [t.txTime, `${dateStr}, ${timeStr}`]].map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                                <span className="text-muted-foreground">{k}</span>
                                <span className="text-foreground font-semibold">{v}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{t.txRefId}</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-foreground font-mono text-[11px]">{txId}</span>
                                <button onClick={handleCopy} className="px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />} Copy
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between border-t border-border/50 pt-2">
                            <span className="text-muted-foreground">{t.txTotalPaid}</span>
                            <span className="font-bold text-foreground">฿{amount.toFixed(2)} THB</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm mb-3 transition-colors">
                        {t.backToHome}
                    </button>
                </div>
                <DevNav />
            </div>
        </div>
    );

    return (
        <div className={overlay}>
            <div className={card}>
                <div className="absolute top-0 inset-x-0 h-1.5 rounded-t-3xl bg-red-500" />
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-all cursor-pointer z-30"
                    aria-label="Close"
                >
                    <X className="w-4.5 h-4.5" />
                </button>
                <div className="flex flex-col items-center text-center pt-2">
                    <div className="w-14 h-14 rounded-full border-2 border-red-500 flex items-center justify-center mb-4">
                        <X className="w-7 h-7 text-red-500" />
                    </div>
                    <p className="font-bold text-red-400 text-lg mb-2">{t.failedTitle}</p>
                    <p className="text-xs text-muted-foreground mb-5 leading-relaxed">{t.failedDesc}</p>
                    <div className="w-full space-y-2 text-xs mb-5 text-left bg-muted/40 border border-border/30 rounded-xl p-4">
                        {[[t.txItem, "Top-up Balance"], [t.txTime, `${dateStr}, ${timeStr}`]].map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                                <span className="text-muted-foreground">{k}</span>
                                <span className="text-foreground font-semibold">{v}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{t.txRefId}</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-foreground font-mono text-[11px]">{txId}</span>
                                <button onClick={handleCopy} className="px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />} Copy
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between border-t border-border/50 pt-2">
                            <span className="text-muted-foreground">{t.txTotalDue}</span>
                            <span className="font-bold text-foreground">฿{amount.toFixed(2)} THB</span>
                        </div>
                    </div>
                    <button onClick={onRetry} className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm mb-2 transition-colors flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4" /> {t.retryPayment}
                    </button>

                </div>
                <p className="text-center text-[11px] text-muted-foreground mt-4 mb-1">
                    {t.haveIssue}{" "}
                    <button 
                        onClick={() => router.push("/support/create-ticket")} 
                        className="text-primary hover:underline font-bold"
                    >
                        {t.createTicket}
                    </button>
                </p>
                <DevNav />
            </div>
        </div>
    );
}


function ReceiptModal({ tx, onClose }: { tx: any; onClose: () => void }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(tx.reference_id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const statusColor = tx.status === "completed" ? "text-emerald-600 dark:text-emerald-400" :
        tx.status === "pending" ? "text-amber-600 dark:text-amber-400" :
            tx.status === "expired" ? "text-slate-500 dark:text-slate-400" : "text-rose-600 dark:text-rose-400";
    const statusLabel = tx.status === "completed" ? "สำเร็จ" :
        tx.status === "pending" ? "รอดำเนินการ" :
            tx.status === "expired" ? "หมดอายุ" : "ยกเลิก";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-background rounded-2xl w-full max-w-sm shadow-2xl border border-border/40 overflow-hidden">
                {/* Status bar */}
                <div className={`h-1 w-full ${tx.status === "completed" ? "bg-emerald-500" : tx.status === "pending" ? "bg-amber-500" : "bg-rose-500"}`} />

                <div className="p-6">
                    {/* Icon + title */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${tx.status === "completed" ? "bg-emerald-500/10 dark:bg-emerald-500/20" :
                            tx.status === "pending" ? "bg-amber-500/10 dark:bg-amber-500/20" : "bg-rose-500/10 dark:bg-rose-500/20"
                            }`}>
                            {tx.status === "completed"
                                ? <Check className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                                : tx.status === "pending"
                                    ? <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                                    : <X className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                            }
                        </div>
                        <p className={`font-bold text-base ${statusColor}`}>
                            {tx.status === "completed" ? "ชำระเงินสำเร็จ" :
                                tx.status === "pending" ? "รอดำเนินการ" : "รายการไม่สำเร็จ"}
                        </p>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 text-sm bg-muted/20 rounded-xl p-4 mb-5">
                        {[
                            ["เลขที่อ้างอิง", tx.reference_id],
                            ["ช่องทาง", tx.method?.name ?? "-"],
                            ["จำนวนเงิน", `฿${parseFloat(tx.amount).toFixed(2)}`],
                            ["วันที่", new Date(tx.created_at).toLocaleDateString("th-TH")],
                            ["เวลา", `${new Date(tx.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.`],
                            ["สถานะ", statusLabel],
                        ].map(([k, v]) => (
                            <div key={k} className="flex justify-between items-center">
                                <span className="text-muted-foreground text-xs">{k}</span>
                                <span className={`font-semibold text-xs ${k === "สถานะ" ? statusColor : ""}`}>{v}</span>
                            </div>
                        ))}
                    </div>

                    {/* Copy button */}
                    <button
                        onClick={handleCopy}
                        className="w-full py-2.5 rounded-xl border border-border/50 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-muted transition-colors mb-2"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "คัดลอกแล้ว" : "คัดลอกเลขที่อ้างอิง"}
                    </button>

                    <button
                        onClick={() => {
                            toast.success("ดาวน์โหลดสลิปเติมเงินสำเร็จ!");
                        }}
                        className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors mb-3"
                    >
                        <Download className="w-3.5 h-3.5" />
                        ดาวน์โหลดสลิป
                    </button>

                    <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-colors">
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
}

function HistoryModal({ onClose, t }: { onClose: () => void; t: ReturnType<typeof useLanguage>["t"] }) {
    const [filter, setFilter] = useState<"all" | "completed" | "pending" | "failed">("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [data, setData] = useState<{ items: any[]; total: number }>({ items: [], total: 0 });
    const [loading, setLoading] = useState(false);
    const [selectedTx, setSelectedTx] = useState<any>(null);

    useEffect(() => {
        setLoading(true);
        const status = filter === "all" ? undefined : filter;
        api.getTopupTransactions({ status, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE })
            .then((d) => setData({ items: d?.items ?? [], total: d?.total ?? 0 }))
            .finally(() => setLoading(false));
    }, [filter, page]);

    const filtered = useMemo(() => {
        if (!search) return data.items;
        return data.items.filter(tx =>
            tx.reference_id?.toLowerCase().includes(search.toLowerCase()) ||
            tx.method?.name?.toLowerCase().includes(search.toLowerCase())
        );
    }, [data.items, search]);

    const totalPages = Math.ceil(data.total / PAGE_SIZE);

    const tabs = [
        { key: "all", label: "ทั้งหมด" },
        { key: "completed", label: "สำเร็จ" },
        { key: "pending", label: "รอดำเนินการ" },
        { key: "failed", label: "ยกเลิก" },
    ] as const;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            {selectedTx && <ReceiptModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
            <div className="bg-background rounded-2xl w-full max-w-2xl shadow-2xl border border-border/40 overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-border/30">
                    <div>
                        <h2 className="font-bold text-base">{t.topupHistory}ทั้งหมด</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">ตรวจสอบรายการย้อนหลังของคุณ</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Filters + Search */}
                <div className="flex items-center gap-3 px-6 pt-4 pb-3 flex-wrap">
                    <div className="flex gap-1.5 flex-wrap">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => { setFilter(tab.key); setPage(1); }}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                                    filter === tab.key
                                        ? "bg-primary text-white"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="relative ml-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="ค้นหารายการ..."
                            className="pl-8 pr-3 py-1.5 rounded-lg border border-border/50 bg-muted/30 text-xs focus:outline-none focus:border-primary w-40"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="px-6 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-muted-foreground border-b border-border/30">
                                <th className="text-left pb-2 font-medium">{t.dateTime}</th>
                                <th className="text-left pb-2 font-medium">เลขที่อ้างอิง</th>
                                <th className="text-left pb-2 font-medium">ช่องทาง</th>
                                <th className="text-right pb-2 font-medium">จำนวนเงิน</th>
                                <th className="text-right pb-2 font-medium">สถานะ</th>
                                <th className="pb-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {loading ? (
                                <tr><td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">กำลังโหลด...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">ไม่พบรายการ</td></tr>
                            ) : filtered.map((tx, i) => (
                                <tr key={i}>
                                    <td className="py-3">
                                        <p className="font-medium text-xs">{new Date(tx.created_at).toLocaleDateString('th-TH')}</p>
                                        <p className="text-[11px] text-muted-foreground">{new Date(tx.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</p>
                                    </td>
                                    <td className="py-3 text-xs text-muted-foreground">{tx.reference_id}</td>
                                    <td className="py-3">
                                        <span className="flex items-center gap-1.5 text-xs">
                                            <span className="w-4 h-4 rounded text-[9px] font-bold text-white flex items-center justify-center shrink-0"
                                                style={{ background: tx.method?.color ?? '#888' }}>
                                                {tx.method?.icon ?? '?'}
                                            </span>
                                            {tx.method?.name ?? '-'}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right font-semibold text-xs">฿{parseFloat(tx.amount).toFixed(2)}</td>
                                    <td className="py-3 text-right">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[11px] font-semibold",
                                            tx.status === "completed" ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400" :
                                                tx.status === "pending" ? "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400" :
                                                    tx.status === "expired" ? "bg-slate-500/10 text-slate-600 dark:bg-slate-400/10 dark:text-slate-400" :
                                                        "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400"
                                        )}>
                                            {tx.status === "completed" ? "สำเร็จ" :
                                                tx.status === "pending" ? "รอดำเนินการ" :
                                                    tx.status === "expired" ? "หมดอายุ" : "ยกเลิก"}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right">
                                        <button
                                            onClick={() => setSelectedTx(tx)}
                                            className="px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold transition-all"
                                        >
                                            ขอสลิป
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border/30">
                    <p className="text-xs text-muted-foreground">
                        แสดง {data.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} จากทั้งหมด {data.total} รายการ
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={cn(
                                    "w-7 h-7 rounded-lg text-xs font-semibold transition-all",
                                    page === p ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                            className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BalancePage() {
    const router = useRouter();
    const { user, updateUser } = useAuth();
    const { t, lang } = useLanguage();
    const { open } = useSidebar();

    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [methods, setMethods] = useState<any[]>([]);
    const [selectedMethod, setSelectedMethod] = useState("promptpay");
    const [selectedBankCode, setSelectedBankCode] = useState("kbank");
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [pendingTx, setPendingTx] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [txHistory, setTxHistory] = useState<any[]>([]);
    const [selectedTx, setSelectedTx] = useState<any>(null);

    const [depositedBalance, setDepositedBalance] = useState<number>(0);
    const [bonusBalance, setBonusBalance] = useState<number>(0);

    // Pagination & Filter States for history
    const [historyPage, setHistoryPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const [filterDays, setFilterDays] = useState("all");
    const [filterMethod, setFilterMethod] = useState("all");
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const infoText = useMemo(() => {
        switch (selectedMethod) {
            case "promptpay":
                return "ชำระเงินผ่านคิวอาร์โค้ดพร้อมเพย์ ระบบจะประมวลผลและเติม Coin เข้าบัญชีทันทีภายใน 1-5 นาทีหลังทำรายการสำเร็จ";
            case "bank_transfer": {
                const targetBank = BANKS.find(b => b.code === selectedBankCode) ?? BANKS[0];
                return `โอนผ่านบัญชี ${targetBank.name} เลขบัญชี ${targetBank.number} (ชื่อบัญชี: ${targetBank.accName}) กรุณาโอนยอดเงินให้ตรงตามจำนวน และเก็บสลิปอัปโหลดเพื่อยืนยัน`;
            }
            case "truemoney":
                return "ชำระผ่าน TrueMoney Wallet ระบบหักเงินอัตโนมัติและเติม Coin ทันทีหลังยืนยัน OTP";
            default:
                return "ระบบจะประมวลผลและทำการเติม Coin เข้าบัญชีของคุณโดยอัตโนมัติหลังจากการชำระเงินเสร็จสิ้น";
        }
    }, [selectedMethod, selectedBankCode]);

    const refreshData = useCallback(() => {
        if (!user) return;
        api.getWalletBalance().then((d) => {
            const newBalance = parseFloat(d?.amount ?? "0");
            setWalletBalance(newBalance);
            setDepositedBalance(parseFloat(d?.depositedAmount ?? d?.amount ?? "0"));
            setBonusBalance(parseFloat(d?.bonusAmount ?? "0"));
            updateUser({ balance: newBalance });
        });
        api.getTopupTransactions({ limit: 100 }).then((d) => setTxHistory(d?.items ?? []));
        api.getTopupTransactions({ status: "pending", limit: 1 }).then((d) => {
            const pending = d?.items?.[0];
            if (pending) {
                setPendingTx({ reference_id: pending.reference_id, amount: pending.amount, expired_at: pending.expired_at });
            } else {
                setPendingTx(null);
            }
        });
    }, [user?.id]);

    useEffect(() => {
        if (!user) return;
        Promise.all([
            api.getWalletBalance().then((d) => {
                const newBalance = parseFloat(d?.amount ?? "0");
                setWalletBalance(newBalance);
                setDepositedBalance(parseFloat(d?.depositedAmount ?? d?.amount ?? "0"));
                setBonusBalance(parseFloat(d?.bonusAmount ?? "0"));
                updateUser({ balance: newBalance });
                window.dispatchEvent(new Event("balance-changed"));
            }),
            api.getTopupMethods().then((d) => {
                setMethods(d ?? []);
                if (d?.length) setSelectedMethod(d[0].code);
            }),
            api.getTopupTransactions({ limit: 100 }).then((d) => setTxHistory(d?.items ?? [])),
            // restore pending tx if exists
            api.getTopupTransactions({ status: "pending", limit: 1 }).then((d) => {
                const pending = d?.items?.[0];
                if (pending) setPendingTx({ reference_id: pending.reference_id, amount: pending.amount, expired_at: pending.expired_at });
            }),
        ]);
    }, [user?.id]);

    useEffect(() => {
        window.addEventListener("balance-changed", refreshData);
        return () => {
            window.removeEventListener("balance-changed", refreshData);
        };
    }, [refreshData]);

    useEffect(() => {
        if (user && typeof user.balance === "number") {
            setWalletBalance(user.balance);
        }
    }, [user?.balance]);

    // Filtering & Pagination Logic
    const filteredHistory = useMemo(() => {
        return txHistory.filter(tx => {
            // 1. Status Filter
            if (statusFilter !== "all") {
                if (statusFilter === "completed" && tx.status !== "completed") return false;
                if (statusFilter === "pending" && tx.status !== "pending") return false;
                if (statusFilter === "failed" && tx.status !== "failed" && tx.status !== "expired") return false;
            }

            // 2. Search Query (Reference ID)
            if (searchQuery.trim() && !tx.reference_id?.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // 3. Days Filter
            if (filterDays !== "all") {
                const daysLimit = parseInt(filterDays);
                const limitTime = Date.now() - daysLimit * 24 * 3600 * 1000;
                if (new Date(tx.created_at).getTime() < limitTime) return false;
            }

            // 4. Payment Method Filter
            if (filterMethod !== "all") {
                const methodCode = tx.method?.name ?? "";
                if (filterMethod === "PromptPay" && !methodCode.includes("PromptPay")) return false;
                if (filterMethod === "Wallet" && !methodCode.toLowerCase().includes("wallet")) return false;
                if (filterMethod === "Bank" && !methodCode.includes("Bank")) return false;
            }

            // 5. Amount Range
            const amt = parseFloat(tx.amount) || 0;
            if (minAmount && amt < parseFloat(minAmount)) return false;
            if (maxAmount && amt > parseFloat(maxAmount)) return false;

            return true;
        });
    }, [txHistory, statusFilter, searchQuery, filterDays, filterMethod, minAmount, maxAmount]);

    const ITEMS_PER_PAGE_HISTORY = 10;
    const totalPagesHistory = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE_HISTORY) || 1;

    useEffect(() => {
        setHistoryPage(1);
    }, [statusFilter, searchQuery, filterDays, filterMethod, minAmount, maxAmount]);

    const paginatedHistory = useMemo(() => {
        const start = (historyPage - 1) * ITEMS_PER_PAGE_HISTORY;
        return filteredHistory.slice(start, start + ITEMS_PER_PAGE_HISTORY);
    }, [filteredHistory, historyPage]);

    const topupAmount = selectedAmount ?? (customAmount ? parseFloat(customAmount) || 0 : 0);
    const fee = selectedMethod === "truemoney" ? Math.round(topupAmount * 0.015 * 100) / 100 : 0.0;
    const total = topupAmount + fee;

    const handleConfirmTopup = async () => {
        if (topupAmount < 20) return;
        setSubmitting(true);
        try {
            const tx = await api.createTopupIntent({ amount: total, methodCode: selectedMethod });
            setPendingTx(tx);
            setShowPayment(true);
        } catch (e: any) {
            alert(e.message ?? 'เกิดข้อผิดพลาด');
        } finally {
            setSubmitting(false);
        }
    };

    const activeMethod = methods.find(m => m.code === selectedMethod) ?? PAYMENT_METHODS.find(m => m.id === selectedMethod);

    return (
        <div className="min-h-screen pt-16 pb-24">
            {showHistory && <HistoryModal onClose={() => setShowHistory(false)} t={t} />}
            {selectedTx && <ReceiptModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
            {showPayment && activeMethod && (
                <PaymentFlowModal
                    method={{ ...activeMethod, id: activeMethod.code ?? activeMethod.id, desc: activeMethod.code === "promptpay" ? t.promptpayDesc : t.truemoneyDesc }}
                    amount={total}
                    referenceId={pendingTx?.reference_id}
                    expiredAt={pendingTx?.expired_at}
                    onClose={() => setShowPayment(false)}
                    onRetry={handleConfirmTopup}
                    onSuccess={refreshData}
                    router={router}
                    t={t}
                    bankDetails={BANKS.find(b => b.code === selectedBankCode) ?? BANKS[0]}
                />
            )}
            <div className="container mx-auto px-6 max-w-5xl pt-8">

                    {/* Back Button & Title */}
                    <div className="flex items-center gap-3 mb-6">
                        <button 
                            onClick={() => router.push("/account")}
                            className="flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-sm"
                            aria-label="Back"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-black text-foreground">{t.sidebarBalance || "ยอดคงเหลือ"}</h1>
                    </div>

                    {/* Balance Banner - Premium GachaPay Wallet Style */}
                    <div className="rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden bg-card border border-border/50 shadow-md transition-all duration-300 dark:shadow-[0_20px_50px_rgba(108,99,255,0.08)]">
                        {/* Decorative glow (only prominent in dark theme) */}
                        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-primary/10 opacity-30 dark:opacity-40 blur-3xl pointer-events-none" />
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            {/* Left Side: Wallet Icon and Balance */}
                            <div className="flex items-center gap-4 sm:gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 flex items-center justify-center shadow-[0_0_20px_rgba(108,99,255,0.1)] dark:shadow-[0_0_20px_rgba(108,99,255,0.15)] shrink-0">
                                    <Wallet className="w-8 h-8 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold tracking-widest uppercase text-muted-foreground">GACHAPAY WALLET</p>
                                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600">
                                        {(walletBalance).toFixed(2)} <span className="text-sm font-bold text-foreground/70 select-none">COIN</span>
                                    </h2>
                                </div>
                            </div>

                            {/* Right Side: Wallet details grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-border/50 pl-0 md:pl-8 flex-1 max-w-xl">
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">ยอดเงินที่เติม</p>
                                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{(depositedBalance).toFixed(2)} COIN</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">โบนัสสะสม</p>
                                    <p className="text-sm font-bold text-amber-600 dark:text-yellow-400">{(bonusBalance).toFixed(2)} COIN</p>
                                </div>
                                <div className="space-y-1 col-span-2 sm:col-span-1">
                                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">เจ้าของกระเป๋า</p>
                                    <p className="text-sm font-bold text-foreground/90 truncate max-w-[180px]">{user?.email?.split('@')[0] || "MEMBER"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending transaction resume banner */}
                    {pendingTx && !showPayment && (
                        <div className="mb-6 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-yellow-400">มีรายการรอชำระเงินอยู่</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {pendingTx.reference_id} · ฿{parseFloat(pendingTx.amount).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button
                                    onClick={() => setShowPayment(true)}
                                    className="px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold transition-colors"
                                >
                                    ดำเนินการต่อ
                                </button>
                                <button
                                    onClick={async () => {
                                        try { await api.simulateTopupCancel(pendingTx.reference_id); } catch { }
                                        setPendingTx(null);
                                        refreshData();
                                    }}
                                    className="px-4 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors"
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Top-up Form + Summary */}
                    <h2 className="text-base font-bold mb-4">{t.topupProcess}</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                        {/* Left — Form */}
                        <div className="lg:col-span-2 space-y-4">

                            {/* Step 1 — Payment Method */}
                            <div className="glass-card rounded-2xl p-6 space-y-4">
                                <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">1</span>
                                    {t.selectPaymentMethod}
                                </p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {PAYMENT_METHODS.map(m => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => !m.disabled && setSelectedMethod(m.id)}
                                            disabled={m.disabled}
                                            className={cn(
                                                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left relative",
                                                m.disabled 
                                                    ? "opacity-50 cursor-not-allowed border-border/20 bg-muted/20"
                                                    : selectedMethod === m.id
                                                        ? "border-primary bg-primary/10 cursor-pointer"
                                                        : "border-border/40 hover:border-border cursor-pointer"
                                            )}
                                        >
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0 font-mono"
                                                style={{ background: m.disabled ? '#71717a' : m.color }}>
                                                {m.icon}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-sm font-semibold truncate text-foreground">{m.name}</p>
                                                    {m.disabled && (
                                                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-red-500/20 text-red-500 shrink-0">
                                                            ปิดปรับปรุง
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    {m.disabled ? "ระบบปิดปรับปรุงชั่วคราว" : m.desc}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Step 2 — Select Target Bank (If Bank Transfer is active) */}
                            {selectedMethod === "bank_transfer" && (
                                <div className="glass-card rounded-2xl p-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">2</span>
                                        เลือกธนาคารปลายทาง (Select Target Bank)
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {BANKS.map(b => (
                                            <button
                                                key={b.code}
                                                type="button"
                                                onClick={() => setSelectedBankCode(b.code)}
                                                className={cn(
                                                    "p-3 rounded-xl border-2 transition-all text-left cursor-pointer",
                                                    selectedBankCode === b.code
                                                        ? "border-primary bg-primary/10"
                                                        : "border-border/40 hover:border-border"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-10 rounded-lg text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-inner select-none font-mono"
                                                        style={{ background: b.color }}>
                                                        {b.code.toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-black text-foreground truncate">{b.name}</p>
                                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">{b.code}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2 or 3 — Amount */}
                            <div className="glass-card rounded-2xl p-6">
                                <p className="text-xs font-bold text-muted-foreground mb-4 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                                        {selectedMethod === "bank_transfer" ? 3 : 2}
                                    </span>
                                    {t.selectTopupAmount}
                                </p>
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {PRESET_AMOUNTS.map(amount => (
                                        <button
                                            key={amount}
                                            onClick={() => { setSelectedAmount(amount); setCustomAmount(""); }}
                                            className={cn(
                                                "py-3 rounded-xl border-2 text-sm font-semibold transition-all",
                                                selectedAmount === amount
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border/40 hover:border-border text-foreground"
                                            )}
                                        >
                                            ฿{amount.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">฿</span>
                                    <input
                                        type="number"
                                        placeholder={t.customAmountPlaceholder}
                                        value={customAmount}
                                        onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-border/50 bg-muted/30 text-sm focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right — Summary */}
                        <div className="lg:col-span-1">
                            <div className="glass-card rounded-2xl p-6 sticky top-24">
                                <h3 className="font-bold text-sm mb-5">{t.orderSummary}</h3>
                                <div className="space-y-3 text-sm mb-5">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t.paymentMethodLabel}</span>
                                        <span className="font-medium">
                                            {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t.topupAmountLabel}</span>
                                        <span className="font-medium">฿{topupAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">
                                            {t.feeLabel} {selectedMethod === "truemoney" && "(1.5%)"}
                                        </span>
                                        <span className={cn(
                                            "font-medium text-xs px-2.5 py-0.5 rounded-full select-none",
                                            fee === 0
                                                ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/15 dark:text-emerald-400 font-bold"
                                                : "bg-red-500/10 text-red-500 dark:bg-red-400/15 dark:text-red-400 font-bold"
                                        )}>
                                            {fee === 0 ? (lang === "th" ? "ฟรี" : "Free") : `฿${fee.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="border-t border-border/40 pt-3 flex justify-between font-bold text-base">
                                        <span>{t.totalLabel}</span>
                                        <span className="text-primary">฿{total.toFixed(2)}</span>
                                    </div>
                                </div>
                                <Button
                                    className="w-full font-bold"
                                    disabled={topupAmount < 20 || submitting}
                                    onClick={handleConfirmTopup}
                                >
                                    {submitting ? "กำลังสร้างรายการ..." : t.confirmTopup}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="glass-card rounded-2xl p-6 mt-6">
                        <div className="flex flex-col gap-4 mb-5 border-b border-border/30 pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h3 className="font-bold text-sm flex items-center gap-2">
                                    <History className="w-4 h-4 text-primary shrink-0" />
                                    {t.topupHistory}
                                </h3>
                                
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:flex-none">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                        <input
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="ค้นหาเลขอ้างอิง..."
                                            className="w-full sm:w-48 pl-8 pr-3 py-1.5 rounded-lg border border-border/50 bg-muted/20 text-xs focus:outline-none focus:border-primary text-foreground h-[34px] outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1.5 text-xs font-semibold h-[34px] shrink-0",
                                            showFilters && "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                                        )}
                                    >
                                        <SlidersHorizontal className="w-3.5 h-3.5" />
                                        ตัวกรอง
                                    </button>
                                </div>
                            </div>

                            {/* Status Filter Tabs */}
                            <div className="flex flex-wrap gap-1.5 bg-muted/20 p-1 rounded-xl self-start sm:self-auto">
                                {[
                                    { id: "all", label: "ทั้งหมด" },
                                    { id: "completed", label: "สำเร็จ" },
                                    { id: "pending", label: "รอชำระ" },
                                    { id: "failed", label: "ล้มเหลว" }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setStatusFilter(tab.id)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                                            statusFilter === tab.id
                                                ? "bg-primary text-white shadow-sm"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filters panel */}
                        {showFilters && (
                            <div className="glass-card rounded-2xl p-4 mb-6 border border-border/40 bg-muted/5 animate-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-2">
                                    {/* Date Filter */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground">วันที่ทำรายการ</label>
                                        <select
                                            value={filterDays}
                                            onChange={e => setFilterDays(e.target.value)}
                                            className="w-full bg-muted/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer h-[34px]"
                                        >
                                            <option value="all">ทั้งหมด</option>
                                            <option value="7">7 วันล่าสุด</option>
                                            <option value="15">15 วันล่าสุด</option>
                                            <option value="30">30 วันล่าสุด</option>
                                        </select>
                                    </div>

                                    {/* Payment Method Filter */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground">วิธีชำระเงิน</label>
                                        <select
                                            value={filterMethod}
                                            onChange={e => setFilterMethod(e.target.value)}
                                            className="w-full bg-muted/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer h-[34px]"
                                        >
                                            <option value="all">ทั้งหมด</option>
                                            <option value="PromptPay">PromptPay (พร้อมเพย์)</option>
                                            <option value="Wallet">TrueMoney Wallet</option>
                                            <option value="Bank">Bank Transfer</option>
                                        </select>
                                    </div>

                                    {/* Min/Max Amount Range Filters */}
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <label className="text-xs font-semibold text-muted-foreground">ช่วงยอดเติมเงิน (บาท)</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={minAmount}
                                                onChange={e => setMinAmount(e.target.value)}
                                                placeholder="ต่ำสุด"
                                                className="w-full px-3 py-1.5 rounded-lg border border-border/50 bg-muted/40 text-xs focus:outline-none focus:border-primary text-foreground h-[34px] outline-none"
                                            />
                                            <span className="text-muted-foreground text-xs font-medium shrink-0">ถึง</span>
                                            <input
                                                type="number"
                                                value={maxAmount}
                                                onChange={e => setMaxAmount(e.target.value)}
                                                placeholder="สูงสุด"
                                                className="w-full px-3 py-1.5 rounded-lg border border-border/50 bg-muted/40 text-xs focus:outline-none focus:border-primary text-foreground h-[34px] outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                            <table className="w-full text-sm min-w-[700px]">
                                <thead>
                                    <tr className="text-xs text-muted-foreground border-b border-border/30">
                                        <th className="text-left pb-3 font-medium whitespace-nowrap">{t.dateTime}</th>
                                        <th className="text-left pb-3 font-medium whitespace-nowrap">เลขที่อ้างอิง</th>
                                        <th className="text-left pb-3 font-medium whitespace-nowrap">{t.paymentMethodLabel}</th>
                                        <th className="text-right pb-3 font-medium whitespace-nowrap">{t.topupAmountLabel}</th>
                                        <th className="text-right pb-3 font-medium whitespace-nowrap">{t.statusLabel}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                    {paginatedHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-xs text-muted-foreground whitespace-nowrap">
                                                ยังไม่มีประวัติการเติมเงินในหมวดหมู่นี้
                                            </td>
                                        </tr>
                                    ) : paginatedHistory.map((tx, i) => (
                                        <tr key={i} className="hover:bg-muted/10 transition-colors">
                                            <td className="py-3.5 whitespace-nowrap">
                                                <p className="text-xs text-foreground font-medium">{new Date(tx.created_at).toLocaleDateString('th-TH')}</p>
                                                <p className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</p>
                                            </td>
                                            <td className="py-3.5 whitespace-nowrap">
                                                <p className="font-mono text-xs text-muted-foreground">{tx.reference_id}</p>
                                            </td>
                                            <td className="py-3.5 whitespace-nowrap">
                                                <span className="flex items-center gap-1.5 text-xs">
                                                    <span className="w-5 h-5 rounded text-[9px] font-bold text-white flex items-center justify-center shrink-0"
                                                        style={{ background: tx.method?.color ?? '#888' }}>
                                                        {tx.method?.icon ?? '?'}
                                                    </span>
                                                    <span className="text-foreground">{tx.method?.name ?? '-'}</span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 text-right font-semibold text-foreground whitespace-nowrap">฿{parseFloat(tx.amount).toFixed(2)}</td>
                                            <td className="py-3.5 text-right whitespace-nowrap">
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block",
                                                    tx.status === "completed" ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400" :
                                                        tx.status === "pending" ? "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400" :
                                                            tx.status === "expired" ? "bg-slate-500/10 text-slate-600 dark:bg-slate-400/10 dark:text-slate-400" :
                                                                "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400"
                                                )}>
                                                    {tx.status === "completed" ? t.statusSuccess :
                                                        tx.status === "pending" ? "รอชำระ" :
                                                            tx.status === "expired" ? "หมดอายุ" : t.statusFailed}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination controls */}
                        {totalPagesHistory > 1 && (
                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/20 px-1">
                                <p className="text-xs text-muted-foreground">
                                    แสดง {(historyPage - 1) * ITEMS_PER_PAGE_HISTORY + 1}–{Math.min(historyPage * ITEMS_PER_PAGE_HISTORY, filteredHistory.length)} จากทั้งหมด {filteredHistory.length} รายการ
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                                        disabled={historyPage === 1}
                                        className="p-1.5 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-xs font-semibold text-foreground px-2">
                                        หน้า {historyPage} / {totalPagesHistory}
                                    </span>
                                    <button
                                        onClick={() => setHistoryPage(p => Math.min(totalPagesHistory, p + 1))}
                                        disabled={historyPage === totalPagesHistory}
                                        className="p-1.5 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    >
                                        <ChevronLeft className="w-4 h-4 rotate-180" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
        </div>
    );
}