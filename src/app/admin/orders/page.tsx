'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import {
    Search, RefreshCw, Download, X, ChevronLeft, ChevronRight,
    RotateCcw, Pencil, CheckCircle, XCircle, Clock, AlertTriangle,
    Package, Banknote, Filter,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

type AdminOrder = {
    order_id: string; uid: string; email: string;
    game: string; pkg: string; amount: number; discount: number;
    method: string; status: OrderStatus; coupon: string | null;
    created_at: string;
};

type Pagination = { page: number; limit: number; total: number; totalPages: number };

// ─── Config ───────────────────────────────────────────────────────────────────
const cardBg = { background: 'rgba(11,15,32,0.85)', border: '1px solid #1c2540' };

const STATUS_CFG: Record<OrderStatus, { color: string; bg: string; border: string; label: string; icon: any }> = {
    pending:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  label: 'Pending',    icon: Clock         },
    processing: { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.3)',  label: 'Processing', icon: RefreshCw      },
    completed:  { color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)',  label: 'Success',    icon: CheckCircle   },
    failed:     { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', label: 'Failed',     icon: XCircle       },
    refunded:   { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)', label: 'Refunded',   icon: Banknote      },
    cancelled:  { color: '#64748b', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.3)', label: 'Cancelled',  icon: XCircle       },
};

// สถานะที่ admin สามารถเปลี่ยนได้
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending:    ['completed', 'failed', 'cancelled'],
    processing: ['completed', 'failed'],
    failed:     ['completed', 'refunded'],
    completed:  ['refunded'],
    refunded:   [],
    cancelled:  [],
};

const STATUS_TABS: { key: string; label: string }[] = [
    { key: 'all',        label: 'ทั้งหมด' },
    { key: 'pending',    label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'completed',  label: 'Success' },
    { key: 'failed',     label: 'Failed' },
    { key: 'refunded',   label: 'Refunded' },
    { key: 'cancelled',  label: 'Cancelled' },
];

function fmt(n: number) { return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtDate(iso: string) {
    return new Date(iso).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: OrderStatus }) {
    const cfg = STATUS_CFG[status] ?? STATUS_CFG.cancelled;
    const Icon = cfg.icon;
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
            <Icon size={10} />
            {cfg.label}
        </span>
    );
}

// ─── Edit Status Modal ────────────────────────────────────────────────────────
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
            onSuccess(); onClose();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'เกิดข้อผิดพลาด');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: '#0d1420', border: '1px solid #1c2540' }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1c2540' }}>
                    <p className="text-sm font-bold text-white">เปลี่ยนสถานะออเดอร์</p>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition" style={{ color: '#64748b' }}>
                        <X size={16} />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1c2540' }}>
                        <p className="text-xs text-gray-400 mb-0.5">Order #{order.order_id}</p>
                        <p className="text-sm font-semibold text-white">{order.game} — {order.pkg}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>UID: {order.uid}</p>
                        <div className="mt-2">
                            <StatusBadge status={order.status} />
                        </div>
                    </div>

                    {allowed.length === 0 ? (
                        <p className="text-xs text-center py-3" style={{ color: '#64748b' }}>
                            สถานะนี้ไม่สามารถเปลี่ยนได้แล้ว
                        </p>
                    ) : (
                        <div>
                            <p className="text-xs text-gray-400 mb-2">เปลี่ยนเป็น</p>
                            <div className="space-y-2">
                                {allowed.map(s => {
                                    const cfg = STATUS_CFG[s];
                                    return (
                                        <button key={s} onClick={() => setSelected(s)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left"
                                            style={{
                                                background: selected === s ? cfg.bg : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${selected === s ? cfg.border : '#1c2540'}`,
                                            }}>
                                            <cfg.icon size={14} style={{ color: cfg.color }} />
                                            <span className="text-sm font-semibold" style={{ color: selected === s ? cfg.color : '#94a3b8' }}>
                                                {cfg.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {error && <p className="text-red-400 text-xs bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}

                    {allowed.length > 0 && (
                        <div className="flex gap-2">
                            <button onClick={onClose}
                                className="flex-1 py-2 rounded-xl text-sm font-semibold text-gray-400 transition"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1c2540' }}>
                                ยกเลิก
                            </button>
                            <button onClick={handleSubmit} disabled={!selected || loading}
                                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition disabled:opacity-40"
                                style={{ background: 'linear-gradient(135deg,#38bdf8,#818cf8)' }}>
                                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderDetailModal({ order, token, onClose, onEdit, onRetry }: {
    order: AdminOrder; token: string; onClose: () => void;
    onEdit: () => void; onRetry: () => void;
}) {
    const canRetry = ['failed', 'cancelled'].includes(order.status);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: '#0d1420', border: '1px solid #1c2540' }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1c2540' }}>
                    <p className="text-sm font-bold text-white">รายละเอียดออเดอร์</p>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition" style={{ color: '#64748b' }}>
                        <X size={16} />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    {/* Header info */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400">Order ID</p>
                            <p className="text-sm font-bold text-white font-mono">#{order.order_id}</p>
                        </div>
                        <StatusBadge status={order.status} />
                    </div>

                    {/* Details */}
                    {[
                        { label: 'เกม', value: order.game },
                        { label: 'แพ็กเกจ', value: order.pkg },
                        { label: 'UID', value: order.uid },
                        { label: 'อีเมล', value: order.email },
                        { label: 'วิธีชำระ', value: order.method },
                        { label: 'ยอดชำระ', value: `฿${fmt(order.amount)}` },
                        { label: 'ส่วนลด', value: order.discount > 0 ? `-฿${fmt(order.discount)}` : '-' },
                        { label: 'คูปอง', value: order.coupon ?? '-' },
                        { label: 'วันที่', value: fmtDate(order.created_at) },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between py-1.5"
                            style={{ borderBottom: '1px solid #0d1525' }}>
                            <span className="text-xs" style={{ color: '#64748b' }}>{label}</span>
                            <span className="text-sm font-medium text-white text-right max-w-[60%] truncate">{value}</span>
                        </div>
                    ))}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        {canRetry && (
                            <button onClick={onRetry}
                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition"
                                style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}>
                                <RotateCcw size={13} /> Retry
                            </button>
                        )}
                        <button onClick={onEdit}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition"
                            style={{ background: 'rgba(129,140,248,0.1)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.3)' }}>
                            <Pencil size={13} /> เปลี่ยนสถานะ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrdersAdminPage() {
    const { token } = useAdminAuth();

    const [orders, setOrders]       = useState<AdminOrder[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
    const [loading, setLoading]     = useState(true);
    const [exporting, setExporting] = useState(false);

    const [statusTab, setStatusTab] = useState('all');
    const [search, setSearch]       = useState('');
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
                page: String(page),
                limit: '20',
                ...(statusTab !== 'all' && { status: statusTab }),
                ...(search && { search }),
            });
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/admin/all?${params}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setOrders(res.data?.data ?? []);
            setPagination(res.data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 });
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [token, statusTab, search]);

    useEffect(() => { fetchOrders(1); }, [fetchOrders]);

    // Debounce search
    const handleSearchChange = (v: string) => {
        setSearchInput(v);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => setSearch(v), 400);
    };

    const handleRetry = async (order: AdminOrder) => {
        if (!token) return;
        setRetrying(order.order_id);
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/admin/${order.order_id}/retry`,
                {},
                { headers: { Authorization: `Bearer ${token}` } },
            );
            await fetchOrders(pagination.page);
            setSelectedOrder(null);
        } catch (e: any) {
            alert(e?.response?.data?.message ?? 'Retry ไม่สำเร็จ');
        } finally { setRetrying(null); }
    };

    const handleExport = async () => {
        if (!token) return;
        setExporting(true);
        try {
            const params = new URLSearchParams({
                ...(statusTab !== 'all' && { status: statusTab }),
            });
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/admin/export?${params}`,
                { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' },
            );
            const url  = URL.createObjectURL(res.data);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch { alert('Export ไม่สำเร็จ'); }
        finally { setExporting(false); }
    };

    // Summary counts by status
    const counts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="p-5 space-y-5" style={{ fontFamily: "'Noto Sans Thai',sans-serif", background: '#080a16', minHeight: '100vh' }}>

            {/* Modals */}
            {selectedOrder && !editOrder && (
                <OrderDetailModal
                    order={selectedOrder} token={token!}
                    onClose={() => setSelectedOrder(null)}
                    onEdit={() => setEditOrder(selectedOrder)}
                    onRetry={() => handleRetry(selectedOrder)}
                />
            )}
            {editOrder && (
                <EditStatusModal
                    order={editOrder} token={token!}
                    onClose={() => setEditOrder(null)}
                    onSuccess={() => { setEditOrder(null); setSelectedOrder(null); fetchOrders(pagination.page); }}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-white">ระบบคำสั่งซื้อ</h1>
                    <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                        ทั้งหมด {pagination.total.toLocaleString()} ออเดอร์
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => fetchOrders(pagination.page)} disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid #1c2540' }}>
                        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> รีเฟรช
                    </button>
                    <button onClick={handleExport} disabled={exporting}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                        style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                        <Download size={13} /> {exporting ? 'กำลัง Export...' : 'Export CSV'}
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'] as OrderStatus[]).map(s => {
                    const cfg = STATUS_CFG[s];
                    const Icon = cfg.icon;
                    return (
                        <button key={s} onClick={() => setStatusTab(s)}
                            className="rounded-2xl p-3 text-left transition"
                            style={{
                                ...cardBg,
                                border: statusTab === s ? `1px solid ${cfg.border}` : '1px solid #1c2540',
                                background: statusTab === s ? cfg.bg : 'rgba(11,15,32,0.85)',
                            }}>
                            <div className="flex items-center gap-1.5 mb-1">
                                <Icon size={11} style={{ color: cfg.color }} />
                                <p className="text-[10px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
                            </div>
                            <p className="text-xl font-bold text-white">{counts[s] ?? 0}</p>
                        </button>
                    );
                })}
            </div>

            {/* Search + Filter tabs */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="flex items-center gap-2 flex-1 max-w-sm rounded-xl px-3 py-2"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1e293b' }}>
                    <Search size={13} style={{ color: '#64748b' }} />
                    <input value={searchInput} onChange={e => handleSearchChange(e.target.value)}
                        placeholder="ค้นหา UID / อีเมล / Order ID..."
                        className="bg-transparent outline-none text-xs text-white placeholder-[#3a4a6a] w-full" />
                    {searchInput && (
                        <button onClick={() => { setSearchInput(''); setSearch(''); }} style={{ color: '#64748b' }}>
                            <X size={12} />
                        </button>
                    )}
                </div>

                {/* Status Tabs */}
                <div className="flex gap-1.5 flex-wrap">
                    {STATUS_TABS.map(tab => (
                        <button key={tab.key} onClick={() => setStatusTab(tab.key)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                            style={statusTab === tab.key
                                ? { background: 'rgba(56,189,248,0.18)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.35)' }
                                : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid #1c2540' }}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={cardBg}>
                {/* Header */}
                <div className="grid text-[11px] font-bold px-5 py-3 gap-4"
                    style={{ gridTemplateColumns: '80px 2fr 1.5fr 1fr 0.8fr 0.8fr 100px', color: '#64748b', borderBottom: '1px solid #1c2540' }}>
                    <span>Order ID</span>
                    <span>เกม / แพ็กเกจ</span>
                    <span>UID / อีเมล</span>
                    <span>ยอด</span>
                    <span>วิธีชำระ</span>
                    <span>สถานะ</span>
                    <span className="text-right">จัดการ</span>
                </div>

                {/* Rows */}
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="grid items-center px-5 py-4 gap-4"
                            style={{ gridTemplateColumns: '80px 2fr 1.5fr 1fr 0.8fr 0.8fr 100px', borderBottom: '1px solid #0d1525' }}>
                            {Array.from({ length: 7 }).map((_, j) => (
                                <div key={j} className="h-4 rounded-lg animate-pulse" style={{ background: '#1c2540' }} />
                            ))}
                        </div>
                    ))
                ) : orders.length === 0 ? (
                    <div className="text-center py-16 space-y-2">
                        <Package size={32} className="mx-auto" style={{ color: '#1c2540' }} />
                        <p className="text-sm" style={{ color: '#64748b' }}>ไม่พบออเดอร์</p>
                    </div>
                ) : (
                    orders.map((o, i) => (
                        <div key={o.order_id}
                            onClick={() => setSelectedOrder(o)}
                            className="grid items-center px-5 py-4 gap-4 hover:bg-white/[0.02] transition cursor-pointer"
                            style={{ gridTemplateColumns: '80px 2fr 1.5fr 1fr 0.8fr 0.8fr 100px', borderBottom: i < orders.length - 1 ? '1px solid #0d1525' : 'none' }}>

                            {/* Order ID */}
                            <span className="text-xs font-mono font-bold" style={{ color: '#38bdf8' }}>#{o.order_id}</span>

                            {/* Game / Package */}
                            <div>
                                <p className="text-sm font-semibold text-white truncate">{o.game}</p>
                                <p className="text-[11px] truncate" style={{ color: '#64748b' }}>{o.pkg}</p>
                            </div>

                            {/* UID / Email */}
                            <div>
                                <p className="text-xs font-mono text-white">{o.uid}</p>
                                <p className="text-[10px] truncate" style={{ color: '#64748b' }}>{o.email}</p>
                            </div>

                            {/* Amount */}
                            <div>
                                <p className="text-sm font-bold text-white">฿{fmt(o.amount)}</p>
                                {o.discount > 0 && (
                                    <p className="text-[10px]" style={{ color: '#a78bfa' }}>-฿{fmt(o.discount)}</p>
                                )}
                            </div>

                            {/* Method */}
                            <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{o.method}</p>

                            {/* Status */}
                            <StatusBadge status={o.status} />

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                                {['failed', 'cancelled'].includes(o.status) && (
                                    <button onClick={() => handleRetry(o)} disabled={retrying === o.order_id}
                                        title="Retry"
                                        className="p-1.5 rounded-lg transition disabled:opacity-50"
                                        style={{ color: '#38bdf8', background: 'rgba(56,189,248,0.08)' }}>
                                        <RotateCcw size={13} className={retrying === o.order_id ? 'animate-spin' : ''} />
                                    </button>
                                )}
                                <button onClick={() => setEditOrder(o)} title="เปลี่ยนสถานะ"
                                    className="p-1.5 rounded-lg hover:bg-white/10 transition" style={{ color: '#64748b' }}>
                                    <Pencil size={13} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs" style={{ color: '#64748b' }}>
                        หน้า {pagination.page} / {pagination.totalPages} · {pagination.total.toLocaleString()} รายการ
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => fetchOrders(pagination.page - 1)} disabled={pagination.page <= 1 || loading}
                            className="p-2 rounded-lg transition disabled:opacity-30"
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid #1c2540' }}>
                            <ChevronLeft size={14} />
                        </button>
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const p = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4)) + i;
                            return (
                                <button key={p} onClick={() => fetchOrders(p)} disabled={loading}
                                    className="w-8 h-8 rounded-lg text-xs font-semibold transition"
                                    style={p === pagination.page
                                        ? { background: 'rgba(56,189,248,0.18)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.35)' }
                                        : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid #1c2540' }}>
                                    {p}
                                </button>
                            );
                        })}
                        <button onClick={() => fetchOrders(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages || loading}
                            className="p-2 rounded-lg transition disabled:opacity-30"
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid #1c2540' }}>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
