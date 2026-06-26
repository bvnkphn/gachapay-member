"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/components/language-context";
import { useSidebar } from "@/components/sidebar-context";
import { api } from "@/lib/api";
import { ChevronRight, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
    COMPLETED: { label: "จัดการคำสั่งซื้อแล้ว", color: "text-green-400" },
    PARTIAL_PAYMENT: { label: "ชำระเงินไม่ครบ", color: "text-red-400" },
    PENDING: { label: "รอดำเนินการ", color: "text-yellow-400" },
    CANCELLED: { label: "ยกเลิกรายการ", color: "text-gray-400" },
};

export default function HistoryPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useLanguage();
    const { open } = useSidebar();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!user) return;
        api.getOrders()
            .then(setOrders)
            .finally(() => setLoading(false));
    }, [user]);

    const filtered = orders.filter(o =>
        o.package_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.order_id?.toLowerCase().includes(search.toLowerCase()) ||
        o.game_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen pt-16 pb-24">
            <div className="container mx-auto px-6 max-w-5xl pt-8">

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
                        <span className="hover:text-foreground cursor-pointer" onClick={() => router.push("/account")}>{t.myAccount}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground">{t.sidebarOrders}</span>
                    </div>

                    <h1 className="text-2xl font-bold mb-6">{t.sidebarOrders}</h1>

                    {/* Search */}
                    <div className="relative mb-6 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={t.searchOrders}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/50 bg-muted/30 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    {/* Table */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/30 text-xs text-muted-foreground">
                                        <th className="text-left px-5 py-3 font-medium">{t.orderDate}</th>
                                        <th className="text-left px-5 py-3 font-medium">{t.statusLabel}</th>
                                        <th className="text-left px-5 py-3 font-medium">{t.orderName}</th>
                                        <th className="text-left px-5 py-3 font-medium">{t.orderId}</th>
                                        <th className="text-left px-5 py-3 font-medium">{t.paymentMethodLabel}</th>
                                        <th className="text-right px-5 py-3 font-medium">{t.topupAmountLabel}</th>
                                        <th className="px-5 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center">
                                                <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
                                            </td>
                                        </tr>
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                                                ไม่พบรายการ
                                            </td>
                                        </tr>
                                    ) : filtered.map(order => {
                                        const statusStyle = STATUS_STYLE[order.status_label] ?? { label: order.status_label, color: "text-muted-foreground" };
                                        return (
                                            <tr key={order.order_id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <p className="font-medium">{new Date(order.created_at).toLocaleDateString('th-TH')}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={cn("text-xs font-semibold", statusStyle.color)}>
                                                        {statusStyle.label}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 max-w-[200px]">
                                                    <p className="truncate">{order.package_name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{order.game_name}</p>
                                                </td>
                                                <td className="px-5 py-4 text-muted-foreground font-mono text-xs">
                                                    #{order.order_id}
                                                </td>
                                                <td className="px-5 py-4 text-muted-foreground">
                                                    {order.payment_method ?? '-'}
                                                </td>
                                                <td className="px-5 py-4 text-right font-semibold">
                                                    ฿{parseFloat(order.total_price).toFixed(2)}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        onClick={() => router.push(`/history/${order.order_id}`)}
                                                        className="text-xs text-primary hover:underline whitespace-nowrap"
                                                    >
                                                        {t.viewDetail}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
        </div>
    );
}
