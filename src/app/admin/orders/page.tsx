'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import {
    Search, Download, X, ChevronLeft, ChevronRight,
    RotateCcw, Pencil, CheckCircle, XCircle, Clock, AlertTriangle,
    Package, Banknote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
type AdminOrder = {
    order_id: string; uid: string; email: string;
    game: string; pkg: string; amount: number; discount: number;
    method: string; status: OrderStatus; coupon: string | null;
    created_at: string;
};
type Pagination = { page: number; limit: number; total: number; totalPages: number };

const STATUS_CFG: Record<OrderStatus, { color: string; bg: string; border: string; label: string; icon: any }> = {
    pending:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  label: 'Pending',    icon: Clock         },
    processing: { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.3)',  label: 'Processing', icon: RotateCcw     },
    completed:  { color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)',  label: 'Success',    icon: CheckCircle   },
    failed:     { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', label: 'Failed',     icon: XCircle       },
    refunded:   { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)', label: 'Refunded',   icon: Banknote      },
    cancelled:  { color: '#64748b', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.3)', label: 'Cancelled',  icon: XCircle       },
};

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending:    ['completed', 'failed', 'cancelled'],
    processing: ['completed', 'failed'],
    failed:     ['completed', 'refunded'],
    completed:  ['refunded'],
    refunded:   [],
    cancelled:  [],
};

const STATUS_TABS = [
    { key: 'all',        label: 'ทั้งหมด' },
    { key: 'pending',    label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'completed',  label: 'Success' },
    { key: 'failed',     label: 'Failed' },
    { key: 'refunded',   label: 'Refunded' },
    { key: 'cancelled',  label: 'Cancelled' },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    coin: 'Coin', wallet: 'Coin', gacha_wallet: 'Coin',
    truemoney: 'TrueWallet', truewallet: 'TrueWallet', true_wallet: 'TrueWallet',
    qr: 'QR', promptpay: 'QR',
    bank_transfer: 'BankTransfer', banktransfer: 'BankTransfer',
    free: 'Free',
};
function fmtMethod(raw: string | null | undefined): string {
    if (!raw || raw === '-' || raw === 'unknown') return '-';
    return PAYMENT_METHOD_LABELS[raw.toLowerCase()] ?? raw;
}

function fmt(n: number) { return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtDate(iso: string) {
    return new Date(iso).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }: { status: OrderStatus }) {
    const cfg = STATUS_CFG[status] ?? STATUS_CFG.cancelled;
    const Icon = cfg.icon;
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border"
            style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
            <Icon size={10} className="shrink-0" />
            {cfg.label}
        </span>
    );
}

function EditStatusModal({ order, token, onClose, onSuccess }: {
    order: AdminOrder; token: string; onClose: () => void; onSuccess: () => void;
}) {
    const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
    const [selected, setSelected] = useState<OrderStatus | ''>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!selected) return;
        setLoading(true); setError('');
        try {
            await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/admin/${order.order_id}/status`,
                { status: selected },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            toast.success('อัปเดตสถานะออเดอร์สำเร็จ');
            onSuccess(); onClose();
        } catch (e: any) { setError(e?.response?.data?.message ?? 'เกิดข้อผิดพลาด'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-card text-card-foreground border border-border">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <p className="text-sm font-bold text-foreground">เปลี่ยนสถานะออเดอร์</p>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition">
                        <X size={16} />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="px-3.5 py-3 rounded-xl bg-muted/40 border border-border/60">
                        <p className="text-xs text-muted-foreground mb-0.5">Order #{order.order_id}</p>
                        <p className="text-sm font-bold text-foreground">{order.game} — {order.pkg}</p>
                        <p className="text-xs mt-0.5 text-muted-foreground font-mono">UID: {order.uid}</p>
                        <div className="mt-2"><StatusBadge status={order.status} /></div>
                    </div>
                    {allowed.length === 0 ? (
                        <p className="text-xs text-center py-3 text-muted-foreground">สถานะนี้ไม่สามารถเปลี่ยนได้แล้ว</p>
                    ) : (
                        <div>
                            <p className="text-xs text-muted-foreground mb-2 font-bold">เปลี่ยนเป็น</p>
                            <div className="space-y-2">
                                {allowed.map(s => {
                                    const cfg = STATUS_CFG[s];
                                    return (
                                        <button key={s} onClick={() => setSelected(s)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left border",
                                                selected === s
                                                    ? "bg-primary/10 border-primary/30 text-primary"
                                                    : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                                            )}>
                                            <cfg.icon size={14} className="shrink-0" style={{ color: selected === s ? cfg.color : undefined }} />
                                            <span className="text-sm font-bold">
                                                {cfg.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {error && <p className="text-red-500 text-xs bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
                    {allowed.length > 0 && (
                        <div className="flex gap-2">
                            <button onClick={onClose}
                                className="flex-1 py-2 rounded-xl text-sm font-semibold bg-muted text-muted-foreground border border-border hover:bg-muted/80 transition">ยกเลิก</button>
                            <button onClick={handleSubmit} disabled={!selected || loading}
                                className="flex-1 py-2 rounded-xl text-sm font-semibold bg-foreground text-background hover:opacity-90 transition disabled:opacity-40">
                                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function OrderDetailModal({ order, token, onClose, onEdit, onRetry }: {
    order: AdminOrder; token: string; onClose: () => void; onEdit: () => void; onRetry: () => void;
}) {
    const canRetry = ['failed', 'cancelled'].includes(order.status);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-card text-card-foreground border border-border">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <p className="text-sm font-bold text-foreground">รายละเอียดออเดอร์</p>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition">
                        <X size={16} />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Order ID</p>
                            <p className="text-sm font-bold text-foreground font-mono">#{order.order_id}</p>
                        </div>
                        <StatusBadge status={order.status} />
                    </div>
                    {[
                        { label: 'เกม', value: order.game },
                        { label: 'แพ็กเกจ', value: order.pkg },
                        { label: 'UID', value: order.uid },
                        { label: 'อีเมล', value: order.email },
                        { label: 'วิธีชำระ', value: fmtMethod(order.method) },
                        { label: 'ยอดชำระ', value: `฿${fmt(order.amount)}` },
                        { label: 'ส่วนลด', value: order.discount > 0 ? `-฿${fmt(order.discount)}` : '-' },
                        { label: 'คูปอง', value: order.coupon ?? '-' },
                        { label: 'วันที่', value: fmtDate(order.created_at) },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between py-1.5 border-b border-border/40">
                            <span className="text-xs text-muted-foreground">{label}</span>
                            <span className="text-sm font-bold text-foreground text-right max-w-[60%] truncate">{value}</span>
                        </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                        {canRetry && (
                            <button onClick={onRetry}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition"
                            >
                                <RotateCcw size={13} /> Retry
                            </button>
                        )}
                        <button onClick={onEdit}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-muted text-muted-foreground border border-border hover:bg-muted/80 transition"
                        >
                            <Pencil size={13} /> เปลี่ยนสถานะ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OrderCard({ o, onSelect }: { o: AdminOrder; onSelect: () => void }) {
    return (
        <div onClick={onSelect} className="rounded-2xl p-4 cursor-pointer active:scale-[0.99] transition bg-card border border-border/80 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{o.game}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{o.pkg}</p>
                </div>
                <StatusBadge status={o.status} />
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-mono text-muted-foreground">#{o.order_id}</p>
                    <p className="text-[10px] text-muted-foreground">UID: {o.uid}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-foreground">฿{fmt(o.amount)}</p>
                    <p className="text-[10px] text-muted-foreground">{fmtDate(o.created_at)}</p>
                </div>
            </div>
        </div>
    );
}

export default function OrdersAdminPage() {
    const { token } = useAdminAuth();
    const [orders, setOrders]           = useState<AdminOrder[]>([]);
    const [pagination, setPagination]   = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
    const [loading, setLoading]         = useState(true);
    const [exporting, setExporting]     = useState(false);
    const [statusTab, setStatusTab]     = useState('all');
    const [search, setSearch]           = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
    const [editOrder, setEditOrder]         = useState<AdminOrder | null>(null);
    const [retrying, setRetrying]           = useState<string | null>(null);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchOrders = useCallback(async (page = 1) => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page), limit: '20',
                ...(statusTab !== 'all' && { status: statusTab }),
                ...(search && { search }),
            });
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/admin/all?${params}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setOrders(res.data?.data ?? []);
            setPagination(res.data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 });
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [token, statusTab, search]);

    useEffect(() => { fetchOrders(1); }, [fetchOrders]);

    // Handle global navbar admin refresh event
    useEffect(() => {
        const handleRefresh = () => {
            fetchOrders(1);
        };
        window.addEventListener('admin-refresh', handleRefresh);
        return () => window.removeEventListener('admin-refresh', handleRefresh);
    }, [fetchOrders]);

    const handleSearchChange = (v: string) => {
        setSearchInput(v);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => setSearch(v), 400);
    };

    const handleRetry = async (order: AdminOrder) => {
        if (!token) return;
        setRetrying(order.order_id);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin/${order.order_id}/retry`, {},
                { headers: { Authorization: `Bearer ${token}` } });
            toast.success('ทำรายการซ้ำ (Retry) สำเร็จ');
            await fetchOrders(pagination.page);
            setSelectedOrder(null);
        } catch (e: any) { 
            toast.error(e?.response?.data?.message ?? 'Retry ไม่สำเร็จ'); 
        } finally { setRetrying(null); }
    };

    const handleExport = async () => {
        if (!token) return;
        setExporting(true);
        try {
            const params = new URLSearchParams({ ...(statusTab !== 'all' && { status: statusTab }) });
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/admin/export?${params}`,
                { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' },
            );
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a'); a.href = url;
            a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
            a.click(); URL.revokeObjectURL(url);
            toast.success('ส่งออกไฟล์ CSV สำเร็จ');
        } catch { 
            toast.error('Export ไม่สำเร็จ'); 
        } finally { setExporting(false); }
    };

    const counts = useMemo(() => {
        return orders.reduce((acc, o) => { acc[o.status] = (acc[o.status]??0)+1; return acc; }, {} as Record<string,number>);
    }, [orders]);

    return (
        <div className="p-3 sm:p-5 space-y-4">

            {selectedOrder && !editOrder && (
                <OrderDetailModal order={selectedOrder} token={token!}
                    onClose={() => setSelectedOrder(null)}
                    onEdit={() => setEditOrder(selectedOrder)}
                    onRetry={() => handleRetry(selectedOrder)} />
            )}
            {editOrder && (
                <EditStatusModal order={editOrder} token={token!}
                    onClose={() => setEditOrder(null)}
                    onSuccess={() => { setEditOrder(null); setSelectedOrder(null); fetchOrders(pagination.page); }} />
            )}

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <p className="text-[10px] tracking-widest uppercase font-mono mb-1 text-muted-foreground">
                        Super Admin · Orders
                    </p>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                        ระบบ <span className="text-primary">จัดการคำสั่งซื้อทั้งหมด</span>
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExport} disabled={exporting}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:bg-foreground/90 transition disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                        <Download size={12} />
                        <span className="hidden sm:inline">{exporting ? 'กำลัง Export...' : 'Export CSV'}</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(['pending','processing','completed','failed','refunded','cancelled'] as OrderStatus[]).map(s => {
                    const cfg = STATUS_CFG[s]; const Icon = cfg.icon;
                    const isActive = statusTab === s;
                    return (
                        <button key={s} onClick={() => setStatusTab(s)}
                            className={cn(
                                "rounded-xl p-2.5 text-left transition border shadow-sm",
                                isActive 
                                    ? "bg-card text-card-foreground border-primary" 
                                    : "bg-card text-card-foreground border-border/80 hover:border-border"
                            )}>
                            <div className="flex items-center gap-1.5 mb-1 min-w-0">
                                <Icon size={11} style={{ color:cfg.color }} className="shrink-0" />
                                <p className="text-[10px] font-bold truncate" style={{ color:cfg.color }}>{cfg.label}</p>
                            </div>
                            <p className="text-lg font-extrabold text-foreground">{counts[s]??0}</p>
                        </button>
                    );
                })}
            </div>

            {/* Search + Filter */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 bg-card border border-border/80 shadow-sm">
                    <Search size={14} className="text-muted-foreground" />
                    <input value={searchInput} onChange={e => handleSearchChange(e.target.value)}
                        placeholder="ค้นหา UID / อีเมล / Order ID..."
                        className="bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground/50 flex-1" />
                    {searchInput && <button onClick={() => { setSearchInput(''); setSearch(''); }} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>}
                </div>
                {/* Status tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {STATUS_TABS.map(tab => {
                        const isActive = statusTab === tab.key;
                        return (
                            <button key={tab.key} onClick={() => setStatusTab(tab.key)}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex-shrink-0 border",
                                    isActive
                                        ? "bg-primary/10 text-primary border-primary/30"
                                        : "bg-card text-muted-foreground border-border/80 hover:text-foreground hover:border-border"
                                )}>
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Table (desktop) / Cards (mobile) */}
            {loading ? (
                <div className="space-y-2">
                    {Array.from({length:5}).map((_,i) => (
                        <div key={i} className="rounded-2xl p-4 animate-pulse bg-card border border-border/60">
                            <div className="flex justify-between mb-2">
                                <div className="h-3 w-32 rounded bg-muted/60" />
                                <div className="h-5 w-16 rounded-full bg-muted/60" />
                            </div>
                            <div className="h-2 w-24 rounded bg-muted/60" />
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-16 space-y-2 bg-card border border-border/80 rounded-2xl shadow-sm">
                    <Package size={32} className="mx-auto text-muted-foreground/60" />
                    <p className="text-sm text-muted-foreground">ไม่พบออเดอร์</p>
                </div>
            ) : (
                <>
                    {/* Mobile: Cards */}
                    <div className="sm:hidden space-y-2">
                        {orders.map(o => (
                            <OrderCard key={o.order_id} o={o} onSelect={() => setSelectedOrder(o)} />
                        ))}
                    </div>

                    {/* Desktop: Table */}
                    <div className="hidden sm:block rounded-2xl overflow-hidden bg-card border border-border/80 shadow-sm">
                        <div className="grid text-[11px] font-bold px-5 py-3 gap-3 border-b border-border/60 text-muted-foreground select-none"
                            style={{ gridTemplateColumns:'80px 2fr 1.5fr 0.8fr 0.7fr 0.9fr 90px' }}>
                            <span>Order ID</span><span>เกม / แพ็กเกจ</span><span>UID / อีเมล</span>
                            <span>ยอด</span><span>วิธีชำระ</span><span>สถานะ</span><span className="text-right">จัดการ</span>
                        </div>
                        {orders.map((o, i) => (
                            <div key={o.order_id} onClick={() => setSelectedOrder(o)}
                                className={cn(
                                    "grid items-center px-5 py-3.5 gap-3 hover:bg-muted/30 transition cursor-pointer border-b border-border/40",
                                    i === orders.length - 1 && "border-b-0"
                                )}
                                style={{ gridTemplateColumns:'80px 2fr 1.5fr 0.8fr 0.7fr 0.9fr 90px' }}>
                                <span className="text-xs font-mono font-bold text-primary">#{o.order_id}</span>
                                <div>
                                    <p className="text-xs font-bold text-foreground truncate">{o.game}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{o.pkg}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-mono text-foreground font-semibold">{o.uid}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{o.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-foreground">฿{fmt(o.amount)}</p>
                                    {o.discount>0 && <p className="text-[10px] text-purple-500 font-bold">-฿{fmt(o.discount)}</p>}
                                </div>
                                <p className="text-xs truncate text-foreground/80 font-medium">{fmtMethod(o.method)}</p>
                                <div>
                                    <StatusBadge status={o.status} />
                                </div>
                                <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                                    {['failed','cancelled'].includes(o.status) && (
                                        <button onClick={() => handleRetry(o)} disabled={retrying===o.order_id} title="Retry"
                                            className="p-1.5 rounded-lg disabled:opacity-50 text-primary bg-primary/10 hover:bg-primary/20 transition"
                                        >
                                            <RotateCcw size={12} className={retrying===o.order_id?'animate-spin':''} />
                                        </button>
                                    )}
                                    <button onClick={() => setEditOrder(o)} title="เปลี่ยนสถานะ"
                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
                                    >
                                        <Pencil size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-muted-foreground font-medium">
                        {pagination.page}/{pagination.totalPages} · {pagination.total.toLocaleString()} รายการ
                    </p>
                    <div className="flex items-center gap-1.5 font-bold">
                        <button onClick={() => fetchOrders(pagination.page-1)} disabled={pagination.page<=1||loading}
                            className="p-2 rounded-lg bg-card text-muted-foreground hover:text-foreground border border-border/80 disabled:opacity-30 transition"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        {Array.from({length:Math.min(5,pagination.totalPages)},(_,i) => {
                            const p = Math.max(1,Math.min(pagination.page-2,pagination.totalPages-4))+i;
                            const isActive = p === pagination.page;
                            return (
                                <button key={p} onClick={() => fetchOrders(p)} disabled={loading}
                                    className={cn(
                                        "w-8 h-8 rounded-lg text-xs font-bold border transition",
                                        isActive
                                            ? "bg-primary/10 text-primary border-primary/30"
                                            : "bg-card text-muted-foreground border-border/80 hover:text-foreground hover:border-border"
                                    )}>
                                    {p}
                                </button>
                            );
                        })}
                        <button onClick={() => fetchOrders(pagination.page+1)} disabled={pagination.page>=pagination.totalPages||loading}
                            className="p-2 rounded-lg bg-card text-muted-foreground hover:text-foreground border border-border/80 disabled:opacity-30 transition"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
