"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-context";
import { useSidebar } from "@/components/sidebar-context";
import { ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_ORDERS = [
    { id: "o-y5uxpey", date: "12/3/2569", time: "17:49", name: "Top Up Garena ROV 11 coupons Thailand", method: "พร้อมเพย์ QR", amount: 10.72, status: "failed" },
    { id: "o-y5uxrf6o", date: "12/3/2569", time: "17:27", name: "Top Up Garena ROV 11 coupons Thailand", method: "พร้อมเพย์ QR", amount: 10.72, status: "success" },
    { id: "o-y5tzuey", date: "11/3/2569", time: "13:27", name: "Top Up Garena ROV 11 coupons Thailand", method: "TrueMoney Wallet", amount: 10.72, status: "failed" },
    { id: "o-y5tzjjy", date: "11/3/2569", time: "13:23", name: "Top Up Garena ROV 11 coupons Thailand", method: "พร้อมเพย์ QR", amount: 10.72, status: "failed" },
    { id: "o-y4abcde", date: "5/3/2569", time: "10:15", name: "Top Up PUBG Mobile 60 UC", method: "TrueMoney Wallet", amount: 29.00, status: "success" },
    { id: "o-y4xyzab", date: "1/3/2569", time: "09:00", name: "Top Up Free Fire 100 Diamonds", method: "พร้อมเพย์ QR", amount: 15.00, status: "success" },
];

const STATUS_MAP = {
    success: { label: "จัดการคำสั่งซื้อแล้ว", color: "text-green-400" },
    failed: { label: "ชำระเงินไม่ครบ", color: "text-red-400" },
    pending: { label: "รอดำเนินการ", color: "text-yellow-400" },
};

export default function HistoryPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const { open } = useSidebar();
    const [search, setSearch] = useState("");

    const filtered = useMemo(() =>
        MOCK_ORDERS.filter(o =>
            o.name.toLowerCase().includes(search.toLowerCase()) ||
            o.id.toLowerCase().includes(search.toLowerCase()) ||
            o.method.toLowerCase().includes(search.toLowerCase())
        ), [search]);

    return (
        <div className="min-h-screen pt-16 pb-24">
            <div className={open ? "lg:ml-48 transition-all duration-300" : "lg:ml-14 transition-all duration-300"}>
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
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                                                ไม่พบรายการ
                                            </td>
                                        </tr>
                                    ) : filtered.map(order => {
                                        const status = STATUS_MAP[order.status as keyof typeof STATUS_MAP];
                                        return (
                                            <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <p className="font-medium">{order.date}</p>
                                                    <p className="text-xs text-muted-foreground">{order.time}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={cn("text-xs font-semibold", status.color)}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 max-w-[200px]">
                                                    <p className="truncate">{order.name}</p>
                                                </td>
                                                <td className="px-5 py-4 text-muted-foreground font-mono text-xs">
                                                    {order.id}
                                                </td>
                                                <td className="px-5 py-4 text-muted-foreground">
                                                    {order.method}
                                                </td>
                                                <td className="px-5 py-4 text-right font-semibold">
                                                    ฿{order.amount.toFixed(2)}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        onClick={() => router.push(`/history/${order.id}`)}
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
        </div>
    );
}
