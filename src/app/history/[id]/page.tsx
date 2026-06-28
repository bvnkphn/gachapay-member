"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/components/language-context";
import { useSidebar } from "@/components/sidebar-context";
import { api } from "@/lib/api";
import { ChevronLeft, CheckCircle, XCircle, AlertTriangle, CreditCard, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    COMPLETED: { label: "จัดการคำสั่งซื้อแล้ว", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 dark:bg-emerald-400/10", icon: CheckCircle },
    PARTIAL_PAYMENT: { label: "ชำระเงินไม่ครบ", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10 dark:bg-rose-400/10", icon: XCircle },
    PENDING: { label: "รอดำเนินการ", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 dark:bg-amber-400/10", icon: Clock },
    CANCELLED: { label: "ยกเลิกรายการ", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-500/10 dark:bg-slate-400/10", icon: XCircle },
};

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const { t } = useLanguage();
    const { open } = useSidebar();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!user || !params?.id) return;
        api.getOrder(params.id as string)
            .then(setOrder)
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [user, params?.id]);

    if (loading) return (
        <div className="min-h-screen pt-16 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    if (notFound || !order) return (
        <div className="min-h-screen pt-16 flex items-center justify-center">
            <p className="text-muted-foreground">{t.orderNotFound}</p>
        </div>
    );

    const statusCfg = STATUS_CONFIG[order.status_label] ?? STATUS_CONFIG.PENDING;
    const StatusIcon = statusCfg.icon;
    const isCompleted = order.is_completed;
    const isFailed = order.status_label === "PARTIAL_PAYMENT" || order.status_label === "CANCELLED";

    const handleCreateTicket = () => {
        router.push(`/support/create-ticket?orderId=${order.order_id}`);
    };

    return (
        <div className="min-h-screen pt-16 pb-24">
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
                            <h1 className="text-xl font-bold">{t.orderTitle} #{order.order_id}</h1>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t.orderCreatedAt} {new Date(order.created_at).toLocaleDateString('th-TH')} | {new Date(order.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                            </p>
                        </div>
                        <span className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
                            statusCfg.bg, statusCfg.color
                        )}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusCfg.label}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

                        {/* Left — Order Info */}
                        <div className="lg:col-span-2 space-y-4">

                            {/* Product Info */}
                            <div className="glass-card rounded-2xl p-5">
                                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center text-sm">📦</span>
                                    {t.orderProductInfo}
                                </h3>
                                <div className="space-y-3 text-sm bg-muted/20 rounded-xl p-4">
                                    {[
                                        [t.orderProduct, order.product.package_name],
                                        ["เกม", order.product.game_name],
                                        [t.orderUserId, order.product.game_uid],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex justify-between">
                                            <span className="text-muted-foreground">{k}</span>
                                            <span className={cn("font-semibold", k === t.orderUserId && isCompleted && "text-primary")}>
                                                {v ?? '-'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {isCompleted && (
                                    <p className="text-[11px] text-muted-foreground mt-3 px-1">
                                        🔒 ข้อมูลนี้ถูกล็อกแล้ว ไม่สามารถแก้ไขได้
                                    </p>
                                )}
                            </div>

                            {/* Payment Info */}
                            <div className="glass-card rounded-2xl p-5">
                                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center text-sm">💳</span>
                                    {t.orderPaymentChannel}
                                </h3>
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-border/30">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 bg-primary">
                                        {order.payment.method === 'promptpay' ? 'PP' :
                                            order.payment.method === 'truemoney' ? 'TW' :
                                                order.payment.method?.slice(0, 2).toUpperCase() ?? '?'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold capitalize">{order.payment.method ?? '-'}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {order.payment.status === 'paid'
                                                ? <span className="text-green-400">{t.orderVerified}</span>
                                                : <span className="text-red-400">{t.orderPaymentFailed}</span>
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right — Action Panel */}
                        <div className="lg:col-span-1">
                            <div className={cn(
                                "rounded-2xl p-5 border-2 h-full flex flex-col justify-center",
                                isFailed ? "glass-card border-dashed border-red-500/40" : "glass-card border-border/30"
                            )}>
                                {isFailed ? (
                                    <>
                                        <div className="flex flex-col items-center text-center mb-4">
                                            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-3">
                                                <AlertTriangle className="w-7 h-7 text-red-400" />
                                            </div>
                                            <p className="text-sm font-bold text-red-400 mb-2">{t.orderPendingTitle}</p>
                                            <p className="text-xs text-muted-foreground leading-relaxed">{t.orderPendingDesc}</p>
                                        </div>
                                        <button
                                            onClick={handleCreateTicket}
                                            className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors"
                                        >
                                            {t.orderCreateTicketBtn}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex flex-col items-center text-center mb-4">
                                            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                                                <CreditCard className="w-7 h-7 text-primary" />
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold mb-4 text-center">{t.orderCheckTitle}</p>
                                        <button
                                            onClick={handleCreateTicket}
                                            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors mb-3"
                                        >
                                            {t.orderCreateTicket}
                                        </button>
                                        <p className="text-[11px] text-muted-foreground text-center">
                                            {t.orderCreateTicketNote}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="glass-card rounded-2xl p-5">
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                            <span>{t.orderProductPrice}</span>
                            <span>฿{parseFloat(order.product.total_price).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base border-t border-border/30 pt-3">
                            <span className={isCompleted ? "text-green-400" : isFailed ? "text-red-400" : "text-yellow-400"}>
                                {isCompleted ? t.orderNetTotalSuccess : t.orderNetTotal}
                            </span>
                            <span className={isCompleted ? "text-green-400" : "text-foreground"}>
                                ฿{parseFloat(order.product.total_price).toFixed(2)}
                            </span>
                        </div>
                    </div>

                </div>
        </div>
    );
}
