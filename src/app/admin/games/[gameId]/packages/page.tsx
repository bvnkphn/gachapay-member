'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import {
  ArrowLeft, Plus, Pencil, Trash2, Zap, X,
  TrendingUp, Package, AlertCircle, CheckCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type FlashSale = { isActive: boolean; price: number | null; start: string | null; end: string | null };
type Quota     = { limit: number | null; sold: number; remaining: number | null; isSoldOut: boolean };

type GamePackage = {
  id: string; gameId: string; sku: string; name: string; description: string | null;
  price: number; originalPrice: number; cost: number; discount: number;
  effectivePrice: number; profit: number; profitPercent: number | null;
  flashSale: FlashSale; quota: Quota;
  isActive: boolean; createdAt: string; updatedAt: string;
};

type Game = { id: string; name: string; slug: string; image?: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const cardBg = { background: 'rgba(11,15,32,0.85)', border: '1px solid #1c2540' };

function formatPrice(n: number) {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toDatetimeLocal(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 16);
}

// ─── Package Form Modal ───────────────────────────────────────────────────────
type PackageFormProps = {
  gameId: string; token: string;
  pkg?: GamePackage | null;
  onClose: () => void; onSuccess: () => void;
};

function PackageFormModal({ gameId, token, pkg, onClose, onSuccess }: PackageFormProps) {
  const isEdit = !!pkg;

  const [form, setForm] = useState({
    sku:            pkg?.sku            ?? '',
    name:           pkg?.name           ?? '',
    description:    pkg?.description    ?? '',
    price:          pkg?.price          ?? 0,
    originalPrice:  pkg?.originalPrice  ?? 0,
    cost:           pkg?.cost           ?? 0,
    discount:       pkg?.discount       ?? 0,
    // Flash Sale
    flashSalePrice: pkg?.flashSale.price  ?? '',
    flashSaleStart: toDatetimeLocal(pkg?.flashSale.start ?? null),
    flashSaleEnd:   toDatetimeLocal(pkg?.flashSale.end   ?? null),
    // Quota
    quota:          pkg?.quota.limit ?? '',
    isActive:       pkg?.isActive ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // คำนวณกำไร real-time
  const price     = Number(form.price)  || 0;
  const cost      = Number(form.cost)   || 0;
  const profit    = price - cost;
  const profitPct = price > 0 ? ((profit / price) * 100).toFixed(1) : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');

    const body: Record<string, any> = {
      name:          form.name,
      description:   form.description || null,
      price:         Number(form.price),
      originalPrice: Number(form.originalPrice) || Number(form.price),
      cost:          Number(form.cost) || 0,
      discount:      Number(form.discount) || 0,
      isActive:      form.isActive,
      quota:         form.quota !== '' ? Number(form.quota) : null,
    };

    // Flash Sale — ส่งทั้ง 3 หรือ null ทั้ง 3
    if (form.flashSalePrice !== '' && form.flashSaleStart && form.flashSaleEnd) {
      body.flashSalePrice = Number(form.flashSalePrice);
      body.flashSaleStart = new Date(form.flashSaleStart).toISOString();
      body.flashSaleEnd   = new Date(form.flashSaleEnd).toISOString();
    } else {
      body.flashSalePrice = null;
      body.flashSaleStart = null;
      body.flashSaleEnd   = null;
    }

    if (!isEdit) body.sku = form.sku;

    try {
      if (isEdit) {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/games/${gameId}/packages/${pkg!.id}`,
          body, { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/games/${gameId}/packages`,
          body, { headers: { Authorization: `Bearer ${token}` } },
        );
      }
      onSuccess(); onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally { setLoading(false); }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden" style={{ background: '#0d1420', border: '1px solid #1c2540' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1c2540' }}>
          <div className="flex items-center gap-2">
            <Package size={15} style={{ color: '#38bdf8' }} />
            <p className="text-sm font-bold text-white">{isEdit ? `แก้ไข — ${pkg!.name}` : 'เพิ่มแพ็กเกจใหม่'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition" style={{ color: '#64748b' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* ── ข้อมูลพื้นฐาน ─────────────────────────────────────── */}
          <section className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#38bdf8' }}>ข้อมูลพื้นฐาน</p>
            {!isEdit && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">SKU *</label>
                <input value={form.sku} onChange={set('sku')} required
                  placeholder="เช่น freefire-100-diamond"
                  className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm" />
              </div>
            )}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">ชื่อแพ็กเกจ *</label>
              <input value={form.name} onChange={set('name')} required
                placeholder="เช่น 100 เพชร"
                className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">คำอธิบาย</label>
              <textarea value={form.description} onChange={set('description')} rows={2}
                placeholder="รายละเอียดเพิ่มเติม..."
                className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm resize-none" />
            </div>
          </section>

          {/* ── ราคา & ต้นทุน ─────────────────────────────────────── */}
          <section className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#f59e0b' }}>ราคา & ต้นทุน</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">ราคาขาย (฿) *</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required
                  className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">ราคาเดิม (฿)</label>
                <input type="number" min="0" step="0.01" value={form.originalPrice} onChange={set('originalPrice')}
                  className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">ต้นทุน (฿)</label>
                <input type="number" min="0" step="0.01" value={form.cost} onChange={set('cost')}
                  className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">ส่วนลด (%)</label>
                <input type="number" min="0" max="100" value={form.discount} onChange={set('discount')}
                  className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm" />
              </div>
            </div>

            {/* กำไร real-time */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl"
              style={{ background: profit >= 0 ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${profit >= 0 ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
              <div className="flex items-center gap-2">
                <TrendingUp size={13} style={{ color: profit >= 0 ? '#34d399' : '#f87171' }} />
                <span className="text-xs font-semibold" style={{ color: profit >= 0 ? '#34d399' : '#f87171' }}>กำไรโดยประมาณ</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold" style={{ color: profit >= 0 ? '#34d399' : '#f87171' }}>
                  ฿{formatPrice(profit)}
                </span>
                <span className="text-[11px] ml-1.5" style={{ color: profit >= 0 ? '#34d39999' : '#f8717199' }}>({profitPct}%)</span>
              </div>
            </div>
          </section>

          {/* ── Flash Sale ────────────────────────────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap size={13} style={{ color: '#f59e0b' }} />
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#f59e0b' }}>Flash Sale / Happy Hour</p>
            </div>
            <p className="text-[10px]" style={{ color: '#3a4a6a' }}>เว้นว่างทั้งหมดเพื่อปิด Flash Sale</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">ราคา Flash (฿)</label>
                <input type="number" min="0" step="0.01" value={form.flashSalePrice} onChange={set('flashSalePrice')}
                  placeholder="0.00"
                  className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-amber-500 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">เริ่มต้น</label>
                <input type="datetime-local" value={form.flashSaleStart} onChange={set('flashSaleStart')}
                  className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-amber-500 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">สิ้นสุด</label>
                <input type="datetime-local" value={form.flashSaleEnd} onChange={set('flashSaleEnd')}
                  className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-amber-500 text-sm" />
              </div>
            </div>
          </section>

          {/* ── Quota ─────────────────────────────────────────────── */}
          <section className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#818cf8' }}>จำกัดจำนวนการขาย</p>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">จำนวนสูงสุด (เว้นว่าง = ไม่จำกัด)</label>
              <input type="number" min="1" value={form.quota} onChange={set('quota')}
                placeholder="เช่น 100"
                className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-indigo-500 text-sm" />
            </div>
          </section>

          {/* ── สถานะ ─────────────────────────────────────────────── */}
          <section>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className={`relative w-10 h-5 rounded-full transition ${form.isActive ? 'bg-cyan-500' : 'bg-gray-700'}`}
                onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm font-medium text-white">{form.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span>
            </label>
          </section>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
              <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1c2540' }}>
              ยกเลิก
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#38bdf8,#818cf8)' }}>
              {loading ? 'กำลังบันทึก...' : isEdit ? 'บันทึก' : 'สร้างแพ็กเกจ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ pkg, gameId, token, onClose, onSuccess }: {
  pkg: GamePackage; gameId: string; token: string; onClose: () => void; onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleDelete = async () => {
    setLoading(true); setError('');
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/games/${gameId}/packages/${pkg.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess(); onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'ลบไม่สำเร็จ');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: '#0d1420', border: '1px solid rgba(248,113,113,0.3)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(248,113,113,0.15)' }}>
            <Trash2 size={16} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">ยืนยันการลบ</p>
            <p className="text-xs" style={{ color: '#64748b' }}>{pkg.name}</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
          แพ็กเกจนี้จะถูก <strong className="text-red-400">ปิดใช้งาน</strong> และไม่แสดงในหน้าบ้าน
          ออเดอร์ที่มีอยู่จะไม่ได้รับผลกระทบ
        </p>
        {error && <p className="text-red-400 text-xs bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1c2540' }}>ยกเลิก</button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
            style={{ background: 'rgba(248,113,113,0.2)', border: '1px solid rgba(248,113,113,0.4)' }}>
            {loading ? 'กำลังลบ...' : 'ลบแพ็กเกจ'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Package Row ──────────────────────────────────────────────────────────────
function PackageRow({ pkg, onEdit, onDelete }: {
  pkg: GamePackage;
  onEdit: (p: GamePackage) => void;
  onDelete: (p: GamePackage) => void;
}) {
  const now         = new Date();
  const flashActive = pkg.flashSale.isActive;
  const isSoldOut   = pkg.quota.isSoldOut;

  return (
    <div className="grid items-center px-5 py-4 hover:bg-white/[0.02] transition gap-4"
      style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 80px', borderBottom: '1px solid #0d1525' }}>

      {/* ชื่อ + SKU */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-white">{pkg.name}</p>
          {flashActive && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
              <Zap size={9} /> FLASH
            </span>
          )}
          {isSoldOut && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
              หมดแล้ว
            </span>
          )}
          {!pkg.isActive && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(100,116,139,0.15)', color: '#64748b' }}>
              ปิด
            </span>
          )}
        </div>
        <p className="text-[10px] mt-0.5 font-mono" style={{ color: '#3a4a6a' }}>{pkg.sku}</p>
      </div>

      {/* ราคาขาย */}
      <div>
        <p className="text-sm font-bold text-white">฿{formatPrice(pkg.effectivePrice)}</p>
        {flashActive && (
          <p className="text-[10px] line-through" style={{ color: '#64748b' }}>฿{formatPrice(pkg.price)}</p>
        )}
        {pkg.originalPrice > pkg.price && !flashActive && (
          <p className="text-[10px] line-through" style={{ color: '#64748b' }}>฿{formatPrice(pkg.originalPrice)}</p>
        )}
      </div>

      {/* ต้นทุน */}
      <p className="text-sm" style={{ color: '#94a3b8' }}>฿{formatPrice(pkg.cost)}</p>

      {/* กำไร */}
      <div>
        <p className="text-sm font-semibold" style={{ color: pkg.profit >= 0 ? '#34d399' : '#f87171' }}>
          ฿{formatPrice(pkg.profit)}
        </p>
        {pkg.profitPercent !== null && (
          <p className="text-[10px]" style={{ color: pkg.profit >= 0 ? '#34d39966' : '#f8717166' }}>
            {pkg.profitPercent}%
          </p>
        )}
      </div>

      {/* Quota */}
      <div>
        {pkg.quota.limit !== null ? (
          <>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-semibold text-white">{pkg.quota.sold}</span>
              <span className="text-[10px]" style={{ color: '#64748b' }}>/ {pkg.quota.limit}</span>
            </div>
            {/* Progress bar */}
            <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1c2540', width: 60 }}>
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (pkg.quota.sold / pkg.quota.limit!) * 100)}%`,
                  background: isSoldOut ? '#f87171' : '#38bdf8',
                }} />
            </div>
          </>
        ) : (
          <span className="text-[11px]" style={{ color: '#3a4a6a' }}>ไม่จำกัด</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1.5">
        <button onClick={() => onEdit(pkg)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition" style={{ color: '#64748b' }}>
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(pkg)}
          className="p-1.5 rounded-lg hover:bg-red-500/10 transition" style={{ color: '#64748b' }}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PackagesAdminPage() {
  const { token }  = useAdminAuth();
  const params     = useParams();
  const router     = useRouter();
  const gameId     = params.gameId as string;

  const [game, setGame]         = useState<Game | null>(null);
  const [packages, setPackages] = useState<GamePackage[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [editPkg, setEditPkg]   = useState<GamePackage | null>(null);
  const [deletePkg, setDeletePkg] = useState<GamePackage | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [pkgRes, gameRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/games/${gameId}/packages`,
          { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games/${gameId}`,
          { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setPackages(pkgRes.data?.data ?? []);
      setGame(gameRes.data?.data ?? null);
    } catch { console.error('fetch error'); }
    finally { setLoading(false); }
  }, [token, gameId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Summary stats ──────────────────────────────────────────────
  const activeCount    = packages.filter(p => p.isActive).length;
  const flashCount     = packages.filter(p => p.flashSale.isActive).length;
  const soldOutCount   = packages.filter(p => p.quota.isSoldOut).length;
  const avgProfit      = packages.length > 0
    ? packages.reduce((sum, p) => sum + p.profit, 0) / packages.length
    : 0;

  return (
    <div className="p-5 space-y-5" style={{ fontFamily: "'Noto Sans Thai',sans-serif", background: '#080a16', minHeight: '100vh' }}>

      {/* Modals */}
      {showAdd && (
        <PackageFormModal gameId={gameId} token={token!} onClose={() => setShowAdd(false)} onSuccess={fetchData} />
      )}
      {editPkg && (
        <PackageFormModal gameId={gameId} token={token!} pkg={editPkg} onClose={() => setEditPkg(null)} onSuccess={fetchData} />
      )}
      {deletePkg && (
        <DeleteModal pkg={deletePkg} gameId={gameId} token={token!} onClose={() => setDeletePkg(null)} onSuccess={fetchData} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/games')}
            className="p-2 rounded-xl hover:bg-white/10 transition" style={{ color: '#64748b' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              {game?.image && (
                <img src={game.image} alt={game.name} className="w-8 h-8 rounded-lg object-cover" />
              )}
              <h1 className="text-xl font-bold text-white">{game?.name ?? 'เกม'}</h1>
            </div>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>จัดการแพ็กเกจเติมเงิน</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition"
          style={{ background: 'linear-gradient(135deg,#38bdf8,#818cf8)' }}>
          <Plus size={15} /> เพิ่มแพ็กเกจ
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'แพ็กเกจทั้งหมด', value: packages.length,  color: '#38bdf8', icon: Package },
          { label: 'เปิดใช้งาน',     value: activeCount,      color: '#34d399', icon: CheckCircle },
          { label: 'Flash Sale',      value: flashCount,       color: '#f59e0b', icon: Zap },
          { label: 'กำไรเฉลี่ย',     value: `฿${formatPrice(avgProfit)}`, color: '#818cf8', icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-2xl p-4" style={cardBg}>
            <div className="flex items-center gap-2 mb-1">
              <Icon size={13} style={{ color }} />
              <p className="text-[11px]" style={{ color: '#64748b' }}>{label}</p>
            </div>
            <p className="text-xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={cardBg}>
        <div className="grid text-[11px] font-bold px-5 py-3 gap-4"
          style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 80px', color: '#64748b', borderBottom: '1px solid #1c2540' }}>
          <span>แพ็กเกจ / SKU</span>
          <span>ราคาขาย</span>
          <span>ต้นทุน</span>
          <span>กำไร</span>
          <span>Quota</span>
          <span className="text-right">จัดการ</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <Package size={32} className="mx-auto" style={{ color: '#1c2540' }} />
            <p className="text-gray-500 text-sm">ยังไม่มีแพ็กเกจ</p>
            <p className="text-xs" style={{ color: '#3a4a6a' }}>กด "เพิ่มแพ็กเกจ" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          packages.map(pkg => (
            <PackageRow key={pkg.id} pkg={pkg} onEdit={setEditPkg} onDelete={setDeletePkg} />
          ))
        )}
      </div>

      {/* Sold out warning */}
      {soldOutCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-400">มี {soldOutCount} แพ็กเกจที่ขายหมดแล้ว กรุณาอัปเดต Quota หรือปิดแพ็กเกจ</p>
        </div>
      )}
    </div>
  );
}
