"use client";

import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/components/language-context";
import { useSidebar } from "@/components/sidebar-context";
import { ChevronLeft, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_ORDERS = [
    {
        id: "o-y5uxpey", date: "12/3/2569", time: "17:49", name: "Top Up Garena ROV 11 coupons Thailand",
        product: "Top Up ROV 11 Coupons", userId: "28491058223910", server: "Thailand",
        method: "TrueMoney Wallet", methodIcon: "TW", methodColor: "#f97316",
        txId: "ATRY-0839583", amount: 10.72, status: "failed",
    },
    {
        id: "o-y5uxrf6o", date: "12/3/2569", time: "17:27", name: "Top Up Garena ROV 11 coupons Thailand",
        product: "Top Up ROV 11 Coupons", userId: "28491058223910", server: "Thailand (Garena)",
        method: "PromptPay (พร้อมเพย์)", methodIcon: "PP", methodColor: "#1a56db",
        txId: "ATRY-0839582", amount: 10.72, status: "success",
    },
    {
        id: "o-y5tzuey", date: "11/3/2569", time: "13:27", name: "Top Up Garena ROV 11 coupons Thailand",
        product: "Top Up ROV 11 Coupons", userId: "28491058223910", server: "Thailand",
        method: "TrueMoney Wallet", methodIcon: "TW", methodColor: "#f97316",
        txId: "ATRY-0839580", amount: 10.72, status: "failed",
    },
    {
        id: "o-y5tzjjy", date: "11/3/2569", time: "13:23", name: "Top Up Garena ROV 11 coupons Thailand",
        product: "Top Up ROV 11 Coupons", userId: "28491058223910", server: "Thailand",
        method: "PromptPay (พร้อมเพย์)", methodIcon: "PP", methodColor: "#1a56db",
        txId: "ATRY-0839579", amount: 10.72, status: "failed",
    },
    {
        id: "o-y4abcde", date: "5/3/2569", time: "10:15", name: "Top Up PUBG Mobile 60 UC",
        product: "PUBG Mobile 60 UC", userId: "28491058223910", server: "Global",
        method: "TrueMoney Wallet", methodIcon: "TW", methodColor: "#f97316",
        txId: "ATRY-0839570", amount: 29.00, status: "success",
    },
    {
        id: "o-y4xyzab", date: "1/3/2569", time: "09:00", name: "Top Up Free Fire 100 Diamonds",
        product: "Free Fire 100 Diamonds", userId: "28491058223910", server: "Thailand",
        method: "PromptPay (พร้อมเพย์)", methodIcon: "PP", methodColor: "#1a56db",
        txId: "ATRY-0839560", amount: 15.00, status: "success",
    },
];

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { t } = useLanguage();
    const { open } = useSidebar();

    const order = MOCK_ORDERS.find(o => o.id === params?.id);

    if (!order) return (
        <div className="min-h-screen pt-16 flex items-center justify-center">
            <p className="text-muted-foreground">{t.orderNotFound}</p>
        </div>
    );

    const isSuccess = order.status === "success";

    return (
        <div className="min-h-screen pt-16 pb-24">
            <div className={open ? "lg:ml-48 transition-all duration-300" : "lg:ml-14 transition-all duration-300"}>
                <div className="container mx-auto px-6 max-w-4xl pt-8">

                    {/* Back */}
                    <button
                        onClick={() => router.push("/history")}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        {t.backToOrders}
                    </button>

                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-bold">{t.orderTitle} {order.id}</h1>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t.orderCreatedAt} {order.date} | {order.time} น.
                            </p>
                        </div>
                        <span className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
                            isSuccess ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                        )}>
                            {isSuccess
                                ? <><CheckCircle className="w-3.5 h-3.5" /> {t.orderStatusSuccess}</>
                                : <><XCircle className="w-3.5 h-3.5" /> {t.orderStatusFailed}</>
                            }
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

                        {/* Left — Order Info */}
                        <div className="lg:col-span-2 space-y-4">

                            {/* Product Info */}
                            <div className="glass-card rounded-2xl p-5">
                                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-md bg-red-500/20 flex items-center justify-center text-sm">📦</span>
                                    {isSuccess ? t.orderProductInfo : t.orderTopupDetail}
                                </h3>
                                <div className="space-y-3 text-sm bg-muted/20 rounded-xl p-4">
                                    {[
                                        [t.orderProduct, order.product],
                                        [t.orderUserId, order.userId],
                                        [t.orderServer, order.server],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex justify-between">
                                            <span className="text-muted-foreground">{k}</span>
                                            <span className={cn("font-semibold", k === t.orderUserId && isSuccess && "text-primary")}>
                                                {v}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="glass-card rounded-2xl p-5">
                                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-md bg-red-500/20 flex items-center justify-center text-sm">💳</span>
                                    {t.orderPaymentChannel}
                                </h3>
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-border/30">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                                        style={{ background: order.methodColor }}>
                                        {order.methodIcon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{order.method}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {isSuccess
                                                ? `Transaction: ${order.txId}`
                                                : <span className="text-red-400">{t.orderPaymentFailed}</span>
                                            }
                                        </p>
                                    </div>
                                </div>
                                {isSuccess && (
                                    <div className="mt-3 px-3 py-2 rounded-xl bg-green-500/10 text-xs text-green-400">
                                        {t.orderVerified}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right — Action Panel */}
                        <div className="lg:col-span-1">
                            <div className={cn(
                                "rounded-2xl p-5 border-2 h-full flex flex-col justify-center",
                                isSuccess ? "glass-card border-border/30" : "glass-card border-dashed border-red-500/40"
                            )}>
                                {isSuccess ? (
                                    <>
                                        <p className="text-sm font-semibold mb-4 text-center">{t.orderCheckTitle}</p>
                                        <button
                                            onClick={() => router.push("/support/create-ticket")}
                                            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors mb-3"
                                        >
                                            {t.orderCreateTicket}
                                        </button>
                                        <p className="text-[11px] text-muted-foreground text-center">
                                            {t.orderCreateTicketNote}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex flex-col items-center text-center mb-4">
                                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-3">
                                                <AlertTriangle className="w-6 h-6 text-red-400" />
                                            </div>
                                            <p className="text-sm font-bold text-red-400 mb-2">{t.orderPendingTitle}</p>
                                            <p className="text-xs text-muted-foreground leading-relaxed">{t.orderPendingDesc}</p>
                                        </div>
                                        <button
                                            onClick={() => router.push("/support/create-ticket")}
                                            className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors"
                                        >
                                            {t.orderCreateTicketBtn}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="glass-card rounded-2xl p-5">
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                            <span>{t.orderProductPrice}</span>
                            <span>฿{order.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base border-t border-border/30 pt-3">
                            <span className={isSuccess ? "text-green-400" : "text-red-400"}>
                                {isSuccess ? t.orderNetTotalSuccess : t.orderNetTotal}
                            </span>
                            <span className={isSuccess ? "text-green-400" : "text-foreground"}>
                                ฿{order.amount.toFixed(2)}
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
