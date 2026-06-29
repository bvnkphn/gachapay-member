"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/components/language-context";
import { useSidebar } from "@/components/sidebar-context";
import { api } from "@/lib/api";
import { ChevronLeft, Search, Loader2, Download, SlidersHorizontal, History } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
    COMPLETED: { label: "จัดการคำสั่งซื้อแล้ว", color: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400" },
    PARTIAL_PAYMENT: { label: "ชำระเงินไม่ครบ", color: "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400" },
    PENDING: { label: "รอดำเนินการ", color: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400" },
    CANCELLED: { label: "ยกเลิกรายการ", color: "bg-slate-500/10 text-slate-600 dark:bg-slate-400/10 dark:text-slate-400" },
};

export default function HistoryPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useLanguage();
    const { open } = useSidebar();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [paymentFilter, setPaymentFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");
    const [minAmount, setMinAmount] = useState<string>("");
    const [maxAmount, setMaxAmount] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const ITEMS_PER_PAGE = 10;

    const fetchOrders = () => {
        if (!user) return;
        setLoading(true);
        api.getOrders()
            .then((ordersData) => {
                const ordersList: any[] = Array.isArray(ordersData) ? ordersData : (ordersData?.items ?? []);
                // sort by date desc
                ordersList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setOrders(ordersList);
            })
            .catch((err) => {
                console.error("Failed to fetch orders:", err);
                setOrders([]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchOrders();
        window.addEventListener("balance-changed", fetchOrders);
        return () => {
            window.removeEventListener("balance-changed", fetchOrders);
        };
    }, [user]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, paymentFilter, dateFilter, minAmount, maxAmount]);

    const filtered = orders.filter(o => {
        const matchesSearch =
            o.package_name?.toLowerCase().includes(search.toLowerCase()) ||
            o.order_id?.toLowerCase().includes(search.toLowerCase()) ||
            o.game_name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || o.status_label === statusFilter;
        const matchesPayment = paymentFilter === "all" || o.payment_method === paymentFilter;
        const matchesDate = dateFilter === "all" || (() => {
            const orderDate = new Date(o.created_at);
            const today = new Date();
            const days = parseInt(dateFilter);
            if (days) {
                const daysAgo = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
                return orderDate >= daysAgo;
            }
            return true;
        })();
        const orderAmount = parseFloat(o.total_price);
        const matchesAmount = 
            (minAmount === "" || orderAmount >= parseFloat(minAmount)) &&
            (maxAmount === "" || orderAmount <= parseFloat(maxAmount));
        return matchesSearch && matchesStatus && matchesPayment && matchesDate && matchesAmount;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedOrders = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="min-h-screen pt-16 pb-24">
            <div className="container mx-auto px-6 max-w-5xl pt-8">

                {/* Back Button & Page Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button 
                        onClick={() => router.push("/account")}
                        className="flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-sm"
                        aria-label="Back"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-black text-foreground">ประวัติการสั่งซื้อ</h1>
                </div>

                {/* Main Content Container Card */}
                <div className="glass-card rounded-2xl p-6">
                    
                    {/* Header inside Container: Icon, Title, Search and Filter Button */}
                    <div className="flex flex-col gap-4 mb-5 border-b border-border/30 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <History className="w-4 h-4 text-primary shrink-0" />
                                รายการสั่งซื้อของฉัน
                            </h3>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="ค้นหาเลขที่สั่งซื้อ..."
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
                                { id: "COMPLETED", label: "สำเร็จ" },
                                { id: "PENDING", label: "รอดำเนินการ" },
                                { id: "PARTIAL_PAYMENT", label: "ไม่สำเร็จ" },
                                { id: "CANCELLED", label: "ยกเลิก" }
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

                    {/* Collapsible Filters Panel */}
                    {showFilters && (
                        <div className="glass-card rounded-2xl p-4 mb-6 border border-border/40 bg-muted/5 animate-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-2">
                                {/* Date Filter */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground">วันที่ทำรายการ</label>
                                    <select
                                        value={dateFilter}
                                        onChange={e => setDateFilter(e.target.value)}
                                        className="w-full bg-muted/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer h-[34px]"
                                    >
                                        <option value="all">ทั้งหมด</option>
                                        <option value="7">7 วันล่าสุด</option>
                                        <option value="15">15 วันล่าสุด</option>
                                        <option value="30">30 วันล่าสุด</option>
                                    </select>
                                </div>

                                {/* Status Filter */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground">สถานะ</label>
                                    <select
                                        value={statusFilter}
                                        onChange={e => setStatusFilter(e.target.value)}
                                        className="w-full bg-muted/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer h-[34px]"
                                    >
                                        <option value="all">ทั้งหมด</option>
                                        <option value="COMPLETED">สำเร็จ</option>
                                        <option value="PENDING">รอดำเนินการ</option>
                                        <option value="PARTIAL_PAYMENT">ไม่สำเร็จ</option>
                                        <option value="CANCELLED">ยกเลิก</option>
                                    </select>
                                </div>

                                {/* Payment Method Filter */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground">วิธีชำระเงิน</label>
                                    <select
                                        value={paymentFilter}
                                        onChange={e => setPaymentFilter(e.target.value)}
                                        className="w-full bg-muted/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer h-[34px]"
                                    >
                                        <option value="all">ทั้งหมด</option>
                                        <option value="PromptPay">QR</option>
                                        <option value="Wallet">True Wallet</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                    </select>
                                </div>

                                {/* Amount Range Filter */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground">ช่วงยอดชำระ (บาท)</label>
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

                    {/* Unified Responsive Table */}
                    <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                        <table className="w-full text-sm min-w-[850px]">
                            <thead>
                                <tr className="border-b border-border/30 text-xs text-muted-foreground">
                                    <th className="text-left pb-3 font-medium whitespace-nowrap">{t.orderDate}</th>
                                    <th className="text-left pb-3 font-medium whitespace-nowrap">{t.statusLabel}</th>
                                    <th className="text-left pb-3 font-medium whitespace-nowrap">{t.orderName}</th>
                                    <th className="text-left pb-3 font-medium whitespace-nowrap">{t.orderId}</th>
                                    <th className="text-left pb-3 font-medium whitespace-nowrap">{t.paymentMethodLabel}</th>
                                    <th className="text-right pb-3 font-medium whitespace-nowrap">ยอดชำระ</th>
                                    <th className="pb-3 whitespace-nowrap"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center whitespace-nowrap">
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm whitespace-nowrap">
                                            ไม่พบรายการ
                                        </td>
                                    </tr>
                                ) : paginatedOrders.map(order => {
                                    const statusStyle = STATUS_STYLE[order.status_label] ?? { label: order.status_label, color: "bg-gray-500/20 text-gray-400" };
                                    return (
                                        <tr key={order.order_id} className="hover:bg-muted/10 transition-colors">
                                            <td className="py-4 whitespace-nowrap">
                                                <p className="font-semibold text-foreground text-xs">{new Date(order.created_at).toLocaleDateString('th-TH')}</p>
                                                <p className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</p>
                                            </td>
                                            <td className="py-4 whitespace-nowrap">
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-block whitespace-nowrap",
                                                    statusStyle.color
                                                )}>
                                                    {statusStyle.label}
                                                </span>
                                            </td>
                                            <td className="py-4 max-w-[200px] whitespace-nowrap">
                                                <p className="font-medium text-foreground text-xs truncate">{order.game_name}</p>
                                                <p className="text-[10px] text-muted-foreground truncate">{order.package_name}</p>
                                            </td>
                                            <td className="py-4 text-muted-foreground font-mono text-xs whitespace-nowrap">
                                                #{order.order_id}
                                            </td>
                                            <td className="py-4 text-muted-foreground text-xs whitespace-nowrap">
                                                {order.payment_method ?? '-'}
                                            </td>
                                            <td className="py-4 text-right font-semibold text-foreground whitespace-nowrap">
                                                ฿{parseFloat(order.total_price).toFixed(2)}
                                            </td>
                                            <td className="py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-3">
                                                    {order.status_label === "COMPLETED" && (
                                                        <button
                                                            onClick={() => {
                                                                console.log("Request receipt for order:", order.order_id);
                                                            }}
                                                            className="text-xs text-primary hover:text-primary/80 flex items-center gap-2 cursor-pointer font-semibold"
                                                            title="ขอใบเสร็จ"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                            <span className="inline">ขอใบเสร็จ</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/20 px-1">
                            <p className="text-xs text-muted-foreground">
                                แสดง {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} จากทั้งหมด {filtered.length} รายการ
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs font-semibold text-foreground px-2">
                                    หน้า {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
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
