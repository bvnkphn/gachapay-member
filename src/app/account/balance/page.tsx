"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/components/language-context";
import { useSidebar } from "@/components/sidebar-context";
import { api } from "@/lib/api";
import { ChevronRight, Wallet, Info, X, Search, FileText, ChevronLeft, Download, Copy, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";

const PRESET_AMOUNTS = [50, 100, 300, 500, 1000, 3000];

const PAYMENT_METHODS = [
    { id: "promptpay", name: "PromptPay", descKey: "promptpayDesc", icon: "🔲", color: "#1a56db" },
    { id: "truemoney", name: "TrueMoney Wallet", descKey: "truemoneyDesc", icon: "TW", color: "#f97316" },
];

const PAGE_SIZE = 4;
const FEE = 0.0;

type PayStep = "qr" | "processing" | "success" | "failed";

function PaymentFlowModal({
    method, amount, referenceId, onClose, onRetry, onSuccess, router, t,
}: {
    method: typeof PAYMENT_METHODS[0] & { desc: string };
    amount: number;
    referenceId?: string;
    onClose: () => void;
    onRetry: () => void;
    onSuccess?: () => void;
    router: ReturnType<typeof useRouter>;
    t: ReturnType<typeof useLanguage>["t"];
}) {
    const [step, setStep] = useState<PayStep>("qr");
    const [countdown, setCountdown] = useState(109);
    const [copied, setCopied] = useState(false);
    const txId = referenceId ?? "1159351574";
    const dateStr = new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
    const timeStr = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

    useEffect(() => {
        if (step !== "qr") return;
        if (countdown <= 0) { setStep("processing"); return; }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown, step]);

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

    const overlay = "fixed inset-0 z-50 bg-[#2d2a6e] overflow-y-auto";
    const card = "w-full max-w-lg mx-auto px-6 py-8";

    const DevNav = () => (
        <div className="flex justify-center gap-2 pt-2 pb-1">
            <button onClick={() => setStep("qr")} className={cn("text-[10px] px-2 py-0.5 rounded transition-colors", step === "qr" ? "bg-primary/40 text-white" : "bg-white/10 text-white/40 hover:bg-white/20")}>QR</button>
            <button onClick={() => setStep("processing")} className={cn("text-[10px] px-2 py-0.5 rounded transition-colors", step === "processing" ? "bg-white/30 text-white" : "bg-white/10 text-white/40 hover:bg-white/20")}>Processing</button>
            <button onClick={() => setStep("success")} className={cn("text-[10px] px-2 py-0.5 rounded transition-colors", step === "success" ? "bg-green-500/40 text-green-300" : "bg-green-500/20 text-green-400 hover:bg-green-500/30")}>Success</button>
            <button onClick={() => setStep("failed")} className={cn("text-[10px] px-2 py-0.5 rounded transition-colors", step === "failed" ? "bg-red-500/40 text-red-300" : "bg-red-500/20 text-red-400 hover:bg-red-500/30")}>Failed</button>
        </div>
    );

    if (step === "qr") return (
        <div className={overlay}>
            <div className={card}>
                <p className="text-center text-xs text-white/50 pt-5 px-6 pb-1">
                    {t.qrScanInstruction(method.name)}
                </p>
                <div className="px-5 pb-2">
                    <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-white/5 mt-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <Wallet className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-extrabold text-white leading-none">CYBERPAY</p>
                                <p className="text-[10px] text-white/40">Game Top-up Platform</p>
                            </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: method.color }}>
                            {method.name}
                        </div>
                    </div>
                    <div className="space-y-2 mb-4 text-xs bg-white/5 rounded-xl p-3">
                        <div className="flex justify-between">
                            <span className="text-white/40">{t.qrAmount}</span>
                            <span className="font-bold text-yellow-400">฿{amount.toFixed(2)} THB</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">{t.qrExpiry}</span>
                            <span className="text-white">{dateStr}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white/40">{t.qrRef}</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-white font-mono text-[11px]">{txId}</span>
                                <button onClick={handleCopy} className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-white/70 flex items-center gap-1 transition-colors">
                                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-[11px] text-white/40 mb-3">{t.qrScanHint}</p>
                    <div className="bg-white rounded-2xl p-4 mx-auto w-fit mb-3 flex items-center justify-center">
                        <QRCode
                            value={`cyberpay://topup?txId=${txId}&amount=${amount}&method=${method.id}`}
                            size={152}
                            bgColor="#ffffff"
                            fgColor="#1e1b4b"
                        />
                    </div>
                    <button className="w-full py-2.5 rounded-xl border border-white/20 text-xs text-white/60 hover:bg-white/10 flex items-center justify-center gap-2 mb-3 transition-colors">
                        <Download className="w-3.5 h-3.5" /> {t.qrSaveBtn}
                    </button>
                    <p className="text-center text-[11px] text-white/30 mb-3">{t.qrNote(method.name)}</p>
                    <p className="text-center text-xs text-white/50 mb-2">{t.qrTimeLeft}</p>
                    <div className="text-center mb-4">
                        <span className="px-6 py-2 rounded-xl border border-yellow-400/50 text-yellow-400 font-mono font-bold text-lg tracking-widest">
                            {mm}:{ss}
                        </span>
                    </div>
                </div>
                <div className="border-t border-white/10 px-6 py-3 text-center">
                    <button onClick={onClose} className="text-xs text-primary hover:underline">{t.qrMinimize}</button>
                    <p className="text-[10px] text-white/30 mt-1">
                        {t.qrPaymentProblem}{" "}
                        <button className="text-primary hover:underline">{t.qrContactSupport}</button>
                    </p>
                    <button
                        onClick={async () => {
                            try { await api.simulateTopupCancel(txId); } catch { }
                            setStep("failed");
                        }}
                        className="mt-2 text-[11px] text-red-400/70 hover:text-red-400 transition-colors"
                    >
                        ยกเลิกการชำระเงิน
                    </button>
                    <DevNav />
                </div>
            </div>
        </div>
    );

    if (step === "processing") return (
        <div className={overlay}>
            <div className={card}>
                <div className="px-8 py-10 flex flex-col items-center text-center">
                    <div className="text-2xl font-extrabold text-white mb-0.5">CYBERPAY</div>
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
                <div className="h-1 w-full bg-green-400 -mx-6 mb-6" style={{ width: "calc(100% + 3rem)" }} />
                <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full border-2 border-green-400 flex items-center justify-center mb-4">
                        <Check className="w-7 h-7 text-green-400" />
                    </div>
                    <p className="font-bold text-green-400 text-lg mb-2">{t.paymentSuccessTitle}</p>
                    <p className="text-xs text-white/50 mb-5 leading-relaxed">
                        {t.paymentSuccessDesc}<br />
                        <span className="text-white font-medium">{t.successEmailNote}</span> {t.successEmailNote2}
                    </p>
                    <div className="w-full space-y-2 text-xs mb-5 text-left bg-white/5 rounded-xl p-4">
                        {[[t.txItem, "Top-up Balance"], [t.txChannel, method.name], [t.txTime, `${dateStr}, ${timeStr}`]].map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                                <span className="text-white/40">{k}</span>
                                <span className="text-white">{v}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center">
                            <span className="text-white/40">{t.txRefId}</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-white font-mono text-[11px]">{txId}</span>
                                <button onClick={handleCopy} className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white/60 flex items-center gap-1">
                                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />} Copy
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-2">
                            <span className="text-white/40">{t.txTotalPaid}</span>
                            <span className="font-bold text-white">฿{amount.toFixed(2)} THB</span>
                        </div>
                    </div>
                    <button onClick={() => router.push("/")} className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm mb-2 transition-colors">
                        {t.backToHome}
                    </button>
                    <button onClick={onClose} className="w-full py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 text-sm transition-colors mb-3">
                        {t.viewReceipt}
                    </button>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                    <div className="text-[11px] text-white/50 flex-1">{t.haveIssue}</div>
                    <button onClick={() => router.push("/support/create-ticket")} className="text-[11px] text-primary border border-primary/40 px-2 py-1 rounded-lg hover:bg-primary/10">{t.createTicket}</button>
                </div>
                <div className="px-5 pb-4"><DevNav /></div>
            </div>
        </div>
    );

    return (
        <div className={overlay}>
            <div className={card}>
                <div className="h-1 w-full bg-red-500 -mx-6 mb-6" style={{ width: "calc(100% + 3rem)" }} />
                <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full border-2 border-red-500 flex items-center justify-center mb-4">
                        <X className="w-7 h-7 text-red-500" />
                    </div>
                    <p className="font-bold text-red-400 text-lg mb-2">{t.failedTitle}</p>
                    <p className="text-xs text-white/50 mb-5 leading-relaxed">{t.failedDesc}</p>
                    <div className="w-full space-y-2 text-xs mb-5 text-left bg-white/5 rounded-xl p-4">
                        {[[t.txItem, "Top-up Balance"], [t.txTime, `${dateStr}, ${timeStr}`]].map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                                <span className="text-white/40">{k}</span>
                                <span className="text-white">{v}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center">
                            <span className="text-white/40">{t.txRefId}</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-white font-mono text-[11px]">{txId}</span>
                                <button onClick={handleCopy} className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white/60 flex items-center gap-1">
                                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />} Copy
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-2">
                            <span className="text-white/40">{t.txTotalDue}</span>
                            <span className="font-bold text-white">฿{amount.toFixed(2)} THB</span>
                        </div>
                    </div>
                    <button onClick={onRetry} className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm mb-2 transition-colors flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4" /> {t.retryPayment}
                    </button>
                    <button onClick={() => router.push("/support/create-ticket")} className="w-full py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 text-sm transition-colors mb-3">
                        {t.contactSupport}
                    </button>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                    <div className="text-[11px] text-white/50 flex-1">{t.haveIssue}</div>
                    <button onClick={() => router.push("/support/create-ticket")} className="text-[11px] text-primary border border-primary/40 px-2 py-1 rounded-lg hover:bg-primary/10">{t.createTicket}</button>
                </div>
                <div className="px-5 pb-4"><DevNav /></div>
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

    const statusColor = tx.status === "completed" ? "text-green-400" :
        tx.status === "pending" ? "text-yellow-400" :
            tx.status === "expired" ? "text-gray-400" : "text-red-400";
    const statusLabel = tx.status === "completed" ? "สำเร็จ" :
        tx.status === "pending" ? "รอดำเนินการ" :
            tx.status === "expired" ? "หมดอายุ" : "ยกเลิก";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-background rounded-2xl w-full max-w-sm shadow-2xl border border-border/40 overflow-hidden">
                {/* Status bar */}
                <div className={`h-1 w-full ${tx.status === "completed" ? "bg-green-400" : tx.status === "pending" ? "bg-yellow-400" : "bg-red-500"}`} />

                <div className="p-6">
                    {/* Icon + title */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${tx.status === "completed" ? "bg-green-500/20" :
                            tx.status === "pending" ? "bg-yellow-500/20" : "bg-red-500/20"
                            }`}>
                            {tx.status === "completed"
                                ? <Check className="w-7 h-7 text-green-400" />
                                : tx.status === "pending"
                                    ? <AlertTriangle className="w-7 h-7 text-yellow-400" />
                                    : <X className="w-7 h-7 text-red-400" />
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
                        className="w-full py-2.5 rounded-xl border border-border/50 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-muted transition-colors mb-3"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "คัดลอกแล้ว" : "คัดลอกเลขที่อ้างอิง"}
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
                                            tx.status === "completed" ? "bg-green-500/20 text-green-400" :
                                                tx.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                                                    tx.status === "expired" ? "bg-gray-500/20 text-gray-400" :
                                                        "bg-red-500/20 text-red-400"
                                        )}>
                                            {tx.status === "completed" ? "สำเร็จ" :
                                                tx.status === "pending" ? "รอดำเนินการ" :
                                                    tx.status === "expired" ? "หมดอายุ" : "ยกเลิก"}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right">
                                        <button
                                            onClick={() => setSelectedTx(tx)}
                                            className="p-1 rounded hover:bg-muted transition-colors"
                                        >
                                            <FileText className="w-3.5 h-3.5 text-primary" />
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
    const { user } = useAuth();
    const { t } = useLanguage();
    const { open } = useSidebar();

    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [methods, setMethods] = useState<any[]>([]);
    const [selectedMethod, setSelectedMethod] = useState("promptpay");
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [pendingTx, setPendingTx] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [txHistory, setTxHistory] = useState<any[]>([]);

    const refreshData = useCallback(() => {
        if (!user) return;
        api.getWalletBalance().then((d) => setWalletBalance(parseFloat(d?.amount ?? "0")));
        api.getTopupTransactions({ limit: 5 }).then((d) => setTxHistory(d?.items ?? []));
    }, [user]);

    useEffect(() => {
        if (!user) return;
        Promise.all([
            api.getWalletBalance().then((d) => setWalletBalance(parseFloat(d?.amount ?? "0"))),
            api.getTopupMethods().then((d) => {
                setMethods(d ?? []);
                if (d?.length) setSelectedMethod(d[0].code);
            }),
            api.getTopupTransactions({ limit: 5 }).then((d) => setTxHistory(d?.items ?? [])),
            // restore pending tx if exists
            api.getTopupTransactions({ status: "pending", limit: 1 }).then((d) => {
                const pending = d?.items?.[0];
                if (pending) setPendingTx({ reference_id: pending.reference_id, amount: pending.amount });
            }),
        ]);
    }, [user]);

    const topupAmount = selectedAmount ?? (customAmount ? parseFloat(customAmount) || 0 : 0);
    const total = topupAmount + FEE;

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
            {showPayment && activeMethod && (
                <PaymentFlowModal
                    method={{ ...activeMethod, id: activeMethod.code, desc: activeMethod.code === "promptpay" ? t.promptpayDesc : t.truemoneyDesc }}
                    amount={total}
                    referenceId={pendingTx?.reference_id}
                    onClose={() => setShowPayment(false)}
                    onRetry={handleConfirmTopup}
                    onSuccess={refreshData}
                    router={router}
                    t={t}
                />
            )}
            <div className="container mx-auto px-6 max-w-5xl pt-8">

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
                        <span className="hover:text-foreground cursor-pointer" onClick={() => router.push("/account")}>
                            {t.myAccount}
                        </span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground">{t.sidebarBalance}</span>
                    </div>

                    {/* Balance Banner */}
                    <div className="rounded-2xl p-6 mb-4 flex items-center justify-between text-white"
                        style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" }}>
                        <div>
                            <p className="text-xs font-semibold opacity-80 tracking-widest uppercase mb-1">{t.availableBalance}</p>
                            <p className="text-4xl font-extrabold mb-1">฿{walletBalance.toFixed(2)}</p>
                            <p className="text-xs opacity-60">{t.lastUpdated}</p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Wallet className="w-7 h-7 text-white" />
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
                            <div className="glass-card rounded-2xl p-6">
                                <p className="text-xs font-bold text-muted-foreground mb-4 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">1</span>
                                    {t.selectPaymentMethod}
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {(methods.length ? methods : PAYMENT_METHODS.map(m => ({ ...m, code: m.id }))).map(m => (
                                        <button
                                            key={m.code ?? m.id}
                                            onClick={() => setSelectedMethod(m.code ?? m.id)}
                                            className={cn(
                                                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                                                selectedMethod === (m.code ?? m.id)
                                                    ? "border-primary bg-primary/10"
                                                    : "border-border/40 hover:border-border"
                                            )}
                                        >
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
                                                style={{ background: m.color }}>
                                                {m.icon}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate">{m.name}</p>
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    {m.id === "promptpay" ? t.promptpayDesc : t.truemoneyDesc}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Step 2 — Amount */}
                            <div className="glass-card rounded-2xl p-6">
                                <p className="text-xs font-bold text-muted-foreground mb-4 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">2</span>
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
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t.feeLabel}</span>
                                        <span className="font-medium text-green-400">฿{FEE.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-border/40 pt-3 flex justify-between font-bold text-base">
                                        <span>{t.totalLabel}</span>
                                        <span className="text-primary">฿{total.toFixed(2)}</span>
                                    </div>
                                </div>
                                <Button
                                    className="w-full font-bold mb-4"
                                    disabled={topupAmount < 20 || submitting}
                                    onClick={handleConfirmTopup}
                                >
                                    {submitting ? "กำลังสร้างรายการ..." : t.confirmTopup}
                                </Button>
                                <div className="flex gap-2 p-3 rounded-xl bg-primary/10 text-xs text-muted-foreground">
                                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <span>{t.topupNote}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <span className="text-primary">↺</span>
                                {t.topupHistory}
                            </h3>
                            <button onClick={() => setShowHistory(true)} className="text-xs text-primary hover:underline">{t.viewAll}</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-muted-foreground border-b border-border/30">
                                        <th className="text-left pb-3 font-medium">{t.dateTime}</th>
                                        <th className="text-left pb-3 font-medium">เลขที่อ้างอิง</th>
                                        <th className="text-left pb-3 font-medium">{t.paymentMethodLabel}</th>
                                        <th className="text-right pb-3 font-medium">{t.topupAmountLabel}</th>
                                        <th className="text-right pb-3 font-medium">{t.statusLabel}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                    {txHistory.length === 0 ? (
                                        <tr><td colSpan={5} className="py-6 text-center text-xs text-muted-foreground">ยังไม่มีประวัติการเติมเงิน</td></tr>
                                    ) : txHistory.map((tx, i) => (
                                        <tr key={i}>
                                            <td className="py-3">
                                                <p className="font-medium">{new Date(tx.created_at).toLocaleDateString('th-TH')}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
                                            </td>
                                            <td className="py-3 text-xs text-muted-foreground">{tx.reference_id}</td>
                                            <td className="py-3 text-muted-foreground">{tx.method?.name ?? '-'}</td>
                                            <td className="py-3 text-right font-semibold">฿{parseFloat(tx.amount).toFixed(2)}</td>
                                            <td className="py-3 text-right">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[11px] font-semibold",
                                                    tx.status === "completed" ? "bg-green-500/20 text-green-400" :
                                                        tx.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                                                            tx.status === "expired" ? "bg-gray-500/20 text-gray-400" :
                                                                "bg-red-500/20 text-red-400"
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
                    </div>

                </div>
        </div>
    );
}
