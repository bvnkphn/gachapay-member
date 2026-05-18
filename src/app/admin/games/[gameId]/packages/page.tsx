'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import {
  ArrowLeft, Plus, Pencil, Trash2, Zap, X,
  TrendingUp, Package, AlertCircle, CheckCircle,
} from 'lucide-react';

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

const cardBg = { background: 'rgba(11,15,32,0.85)', border: '1px solid #1c2540' };

function formatPrice(n: number) {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function toDatetimeLocal(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 16);
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, prefix, children }: { label: string; prefix?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#94a3b8' }}>{label}</label>
      {prefix ? (
        <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid #1e293b', background: '#0d1526' }}>
          <span className="px-3 py-2.5 text-sm font-bold flex-shrink-0" style={{ color: '#64748b', borderRight: '1px solid #1e293b' }}>{prefix}</span>
          {children}
        </div>
      ) : children}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { noBg?: boolean }) {
  const { noBg, className, ...rest } = props;
  return (
    <input {...rest}
      className={`w-full px-3 py-2.5 text-sm text-white focus:outline-none bg-transparent placeholder-[#3a4a6a] ${className ?? ''}`}
      style={noBg ? {} : { background: '#0d1526', border: '1px solid #1e293b', borderRadius: 12 }}
    />
  );
}

// ─── Package Form Modal ───────────────────────────────────────────────────────
function PackageFormModal({ gameId, token, pkg, onClose, onSuccess }: {
  gameId: string; token: string; pkg?: GamePackage | null; onClose: () => void; onSuccess: () => void;
}) {
  const isEdit = !!pkg;
  const [form, setForm] = useState({
    sku:            pkg?.sku ?? '',
    price:          pkg?.price ?? 0,
    diamond:        0,
    promo:          pkg?.flashSale.isActive ? 'flash_sale' : 'none',
    flashSalePrice: pkg?.flashSale.price ?? '',
    flashSaleStart: toDatetimeLocal(pkg?.flashSale.start ?? null),
    flashSaleEnd:   toDatetimeLocal(pkg?.flashSale.end   ?? null),
    quota:          pkg?.quota.limit ?? '',
    isActive:       pkg?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handlePromoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setForm(f => ({
      ...f, promo: val,
      flashSalePrice: val === 'none' ? '' : f.flashSalePrice,
      flashSaleStart: val === 'none' ? '' : f.flashSaleStart,
      flashSaleEnd:   val === 'none' ? '' : f.flashSaleEnd,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const body: Record<string, any> = {
      price: Number(form.price), isActive: form.isActive,
      quota: form.quota !== '' ? Number(form.quota) : null,
    };
    const showFlash = form.promo !== 'none';
    if (showFlash && form.flashSalePrice !== '' && form.flashSaleStart && form.flashSaleEnd) {
      body.flashSalePrice = Number(form.flashSalePrice);
      body.flashSaleStart = new Date(form.flashSaleStart).toISOString();
      body.flashSaleEnd   = new Date(form.flashSaleEnd).toISOString();
    } else {
      body.flashSalePrice = null; body.flashSaleStart = null; body.flashSaleEnd = null;
    }
    if (!isEdit) { body.sku = form.sku; body.name = form.sku; }
    try {
      if (isEdit) {
        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/admin/games/${gameId}/packages/${pkg!.id}`,
          body, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/games/${gameId}/packages`,
          body, { headers: { Authorization: `Bearer ${token}` } });
      }
      onSuccess(); onClose();
    } catch (err: any) { setError(err?.response?.data?.message ?? 'เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  };

  // countdown
  const end   = form.flashSaleEnd   ? new Date(form.flashSaleEnd)   : null;
  const start = form.flashSaleStart ? new Date(form.flashSaleStart) : null;
  const diff  = end && start ? end.getTime() - start.getTime() : 0;
  const countdown = diff > 0
    ? `${String(Math.floor(diff/3600000)).padStart(2,'0')}:${String(Math.floor((diff%3600000)/60000)).padStart(2,'0')}:${String(Math.floor((diff%60000)/1000)).padStart(2,'0')}`
    : '';

  const showFlash = form.promo !== 'none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#111827', border: '1px solid #1e293b' }}>

        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #1e293b' }}>
          <p className="text-base font-bold text-white">{isEdit ? 'แก้ไขข้อมูลแพ็กเกจ' : 'เพิ่มแพ็กเกจใหม่'}</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition" style={{ color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* ชื่อแพ็กเกจ — readonly เมื่อแก้ไข */}
          <Field label="ชื่อแพ็กเกจ">
            {isEdit
              ? <div className="w-full px-3 py-2.5 text-sm rounded-xl" style={{ background: '#0d1526', border: '1px solid #1e293b', color: '#64748b' }}>
                  {pkg!.name}
                </div>
              : <TextInput value={form.sku} onChange={set('sku')} required placeholder="ชื่อแพ็กเกจ" />}
          </Field>

          {/* ราคา + ต้นทุน */}
          <div className="grid grid-cols-2 gap-3">
            {/* ราคา — แก้ได้ */}
            <Field label="ราคา (PRICE)" prefix="฿">
              <TextInput noBg type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required />
            </Field>
            {/* ต้นทุน — readonly */}
            <Field label="ต้นทุน (COST)" prefix="฿">
              <div className="px-3 py-2.5 text-sm font-semibold" style={{ color: '#64748b' }}>
                {isEdit ? formatPrice(Number(pkg!.cost)) : '—'}
              </div>
            </Field>
          </div>

          {/* แต้มสะสม + โปรโมชั่น */}
          <div className="grid grid-cols-2 gap-3">
            {/* แต้มสะสม — แก้ได้ (UI only) */}
            <Field label="แต้มสะสม (DIAMOND)" prefix="◆">
              <TextInput noBg type="number" min="0" value={form.diamond}
                onChange={e => setForm(f => ({ ...f, diamond: Number(e.target.value) }))} placeholder="0" />
            </Field>
            {/* โปรโมชั่น — dropdown */}
            <Field label="โปรโมชั่น">
              <div className="relative">
                <select value={form.promo} onChange={handlePromoChange}
                  className="w-full px-3 py-2.5 text-sm text-white rounded-xl appearance-none focus:outline-none"
                  style={{ background: '#0d1526', border: '1px solid #1e293b' }}>
                  <option value="none">ไม่มีโปรโมชั่น</option>
                  <option value="flash_sale">Flash Sale</option>
                  <option value="happy_hour">Happy Hour</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▾</span>
              </div>
            </Field>
          </div>

          {/* Flash Sale / Happy Hour fields */}
          {showFlash && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <div className="flex items-center gap-2">
                <Zap size={13} style={{ color: '#f59e0b' }} />
                <p className="text-xs font-bold" style={{ color: '#f59e0b' }}>
                  {form.promo === 'happy_hour' ? 'Happy Hour' : 'Flash Sale'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="ราคาพิเศษ (฿)" prefix="฿">
                  <TextInput noBg type="number" min="0" step="0.01"
                    value={form.flashSalePrice} onChange={set('flashSalePrice')} placeholder="0.00" />
                </Field>
                <div />
                <Field label="เริ่มต้น">
                  <TextInput type="datetime-local" value={form.flashSaleStart} onChange={set('flashSaleStart')} />
                </Field>
                <Field label="สิ้นสุด">
                  <TextInput type="datetime-local" value={form.flashSaleEnd} onChange={set('flashSaleEnd')} />
                </Field>
              </div>
              {countdown && (
                <Field label="เวลาจำกัดในการขาย" prefix="⏱">
                  <div className="px-3 py-2.5 text-sm font-mono font-bold text-white bg-transparent">{countdown}</div>
                </Field>
              )}
            </div>
          )}

          {/* Quota */}
          <Field label="จำกัดจำนวนการขาย (เว้นว่าง = ไม่จำกัด)">
            <TextInput type="number" min="1" value={form.quota} onChange={set('quota')} placeholder="เช่น 100" />
          </Field>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)' }}>
              <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid #1e293b' }}>
              ยกเลิก
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ pkg, gameId, token, onClose, onSuccess }: {
  pkg: GamePackage; gameId: string; token: string; onClose: () => void; onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const handleDelete = async () => {
    setLoading(true); setError('');
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/games/${gameId}/packages/${pkg.id}`,
        { headers: { Authorization: `Bearer ${token}` } });
      onSuccess(); onClose();
    } catch (err: any) { setError(err?.response?.data?.message ?? 'ลบไม่สำเร็จ'); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: '#111827', border: '1px solid rgba(248,113,113,0.3)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.15)' }}>
            <Trash2 size={16} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">ยืนยันการลบ</p>
            <p className="text-xs" style={{ color: '#64748b' }}>{pkg.name}</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
          แพ็กเกจนี้จะถูก <strong className="text-red-400">ปิดใช้งาน</strong> และไม่แสดงในหน้าบ้าน
        </p>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm font-semibold text-gray-400"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1e293b' }}>ยกเลิก</button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'rgba(248,113,113,0.2)', border: '1px solid rgba(248,113,113,0.4)' }}>
            {loading ? 'กำลังลบ...' : 'ลบแพ็กเกจ'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Package Row ──────────────────────────────────────────────────────────────
function PackageRow({ pkg, onEdit, onDelete }: { pkg: GamePackage; onEdit: (p: GamePackage) => void; onDelete: (p: GamePackage) => void }) {
  const flashActive = pkg.flashSale.isActive;
  const isSoldOut   = pkg.quota.isSoldOut;
  return (
    <div className="grid items-center px-5 py-4 hover:bg-white/[0.02] transition gap-4"
      style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 80px', borderBottom: '1px solid #0d1525' }}>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-white">{pkg.name}</p>
          {flashActive && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}><Zap size={9} /> FLASH</span>}
          {isSoldOut && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>หมดแล้ว</span>}
          {!pkg.isActive && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: 'rgba(100,116,139,0.15)', color: '#64748b' }}>ปิด</span>}
        </div>
        <p className="text-[10px] mt-0.5 font-mono" style={{ color: '#3a4a6a' }}>{pkg.sku}</p>
      </div>
      <div>
        <p className="text-sm font-bold text-white">฿{formatPrice(pkg.effectivePrice)}</p>
        {flashActive && <p className="text-[10px] line-through" style={{ color: '#64748b' }}>฿{formatPrice(pkg.price)}</p>}
      </div>
      <p className="text-sm" style={{ color: '#94a3b8' }}>฿{formatPrice(pkg.cost)}</p>
      <div>
        <p className="text-sm font-semibold" style={{ color: pkg.profit >= 0 ? '#34d399' : '#f87171' }}>฿{formatPrice(pkg.profit)}</p>
        {pkg.profitPercent !== null && <p className="text-[10px]" style={{ color: pkg.profit >= 0 ? '#34d39966' : '#f8717166' }}>{pkg.profitPercent}%</p>}
      </div>
      <div>
        {pkg.quota.limit !== null ? (
          <>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-semibold text-white">{pkg.quota.sold}</span>
              <span className="text-[10px]" style={{ color: '#64748b' }}>/ {pkg.quota.limit}</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1c2540', width: 60 }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(100,(pkg.quota.sold/pkg.quota.limit!)*100)}%`, background: isSoldOut ? '#f87171' : '#38bdf8' }} />
            </div>
          </>
        ) : <span className="text-[11px]" style={{ color: '#3a4a6a' }}>ไม่จำกัด</span>}
      </div>
      <div className="flex items-center justify-end gap-1.5">
        <button onClick={() => onEdit(pkg)} className="p-1.5 rounded-lg hover:bg-white/10 transition" style={{ color: '#64748b' }}><Pencil size={13} /></button>
        <button onClick={() => onDelete(pkg)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition" style={{ color: '#64748b' }}><Trash2 size={13} /></button>
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

  const [game, setGame]           = useState<Game | null>(null);
  const [packages, setPackages]   = useState<GamePackage[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [editPkg, setEditPkg]     = useState<GamePackage | null>(null);
  const [deletePkg, setDeletePkg] = useState<GamePackage | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [pkgRes, gameRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/games/${gameId}/packages`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games/${gameId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setPackages(pkgRes.data?.data ?? []);
      setGame(gameRes.data?.data ?? null);
    } catch { console.error('fetch error'); } finally { setLoading(false); }
  }, [token, gameId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeCount  = packages.filter(p => p.isActive).length;
  const flashCount   = packages.filter(p => p.flashSale.isActive).length;
  const soldOutCount = packages.filter(p => p.quota.isSoldOut).length;
  const avgProfit    = packages.length > 0 ? packages.reduce((s, p) => s + p.profit, 0) / packages.length : 0;

  return (
    <div className="p-5 space-y-5" style={{ fontFamily: "'Noto Sans Thai',sans-serif", background: '#080a16', minHeight: '100vh' }}>

      {showAdd   && <PackageFormModal gameId={gameId} token={token!} onClose={() => setShowAdd(false)} onSuccess={fetchData} />}
      {editPkg   && <PackageFormModal gameId={gameId} token={token!} pkg={editPkg} onClose={() => setEditPkg(null)} onSuccess={fetchData} />}
      {deletePkg && <DeleteModal pkg={deletePkg} gameId={gameId} token={token!} onClose={() => setDeletePkg(null)} onSuccess={fetchData} />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/games')} className="p-2 rounded-xl hover:bg-white/10 transition" style={{ color: '#64748b' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              {game?.image && <img src={game.image} alt={game.name} className="w-8 h-8 rounded-lg object-cover" />}
              <h1 className="text-xl font-bold text-white">{game?.name ?? 'เกม'}</h1>
            </div>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>จัดการแพ็กเกจเติมเงิน</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#38bdf8,#818cf8)' }}>
          <Plus size={15} /> เพิ่มแพ็กเกจ
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'แพ็กเกจทั้งหมด', value: packages.length,              color: '#38bdf8', icon: Package     },
          { label: 'เปิดใช้งาน',     value: activeCount,                  color: '#34d399', icon: CheckCircle },
          { label: 'Flash Sale',      value: flashCount,                   color: '#f59e0b', icon: Zap          },
          { label: 'กำไรเฉลี่ย',     value: `฿${formatPrice(avgProfit)}`, color: '#818cf8', icon: TrendingUp  },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-2xl p-4" style={cardBg}>
            <div className="flex items-center gap-2 mb-1"><Icon size={13} style={{ color }} /><p className="text-[11px]" style={{ color: '#64748b' }}>{label}</p></div>
            <p className="text-xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={cardBg}>
        <div className="grid text-[11px] font-bold px-5 py-3 gap-4"
          style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 80px', color: '#64748b', borderBottom: '1px solid #1c2540' }}>
          <span>แพ็กเกจ / SKU</span><span>ราคาขาย</span><span>ต้นทุน</span><span>กำไร</span><span>Quota</span><span className="text-right">จัดการ</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <Package size={32} className="mx-auto" style={{ color: '#1c2540' }} />
            <p className="text-gray-500 text-sm">ยังไม่มีแพ็กเกจ</p>
          </div>
        ) : packages.map(pkg => (
          <PackageRow key={pkg.id} pkg={pkg} onEdit={setEditPkg} onDelete={setDeletePkg} />
        ))}
      </div>

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
