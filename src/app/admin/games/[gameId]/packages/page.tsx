'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { toast } from 'sonner';
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

function fp(n: number) { return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function toDatetimeLocal(iso: string | null) { if (!iso) return ''; return new Date(iso).toISOString().slice(0, 16); }

/* ── Form Field ──────────────────────────────────────────────── */
function Field({ label, prefix, children }: { label: string; prefix?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">{label}</label>
      {prefix ? (
        <div className="flex items-center rounded-xl overflow-hidden border border-border bg-muted/30">
          <span className="px-3 py-2.5 text-sm font-bold flex-shrink-0 text-muted-foreground border-r border-border">{prefix}</span>
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
      className={`w-full px-3 py-2.5 text-sm text-foreground focus:outline-none bg-transparent placeholder-muted-foreground/50 ${className ?? ''}`}
      style={noBg ? {} : { borderRadius: 12 }} />
  );
}

/* ── Package Form Modal ──────────────────────────────────────── */
function PackageFormModal({ gameId, token, pkg, onClose, onSuccess }: {
  gameId: string; token: string; pkg?: GamePackage | null; onClose: () => void; onSuccess: () => void;
}) {
  const isEdit = !!pkg;
  const initialPrice = pkg?.price ?? 0;
  const initialFlashPrice = pkg?.flashSale.price ?? 0;
  const initialPercent = initialPrice > 0 && initialFlashPrice > 0
    ? Math.round((1 - initialFlashPrice / initialPrice) * 100)
    : 10; // Default to 10%

  const [form, setForm] = useState({
    sku: pkg?.sku ?? '',
    name: pkg?.name ?? '',
    price: pkg?.price ?? 0,
    cost: pkg?.cost ?? 0,
    diamond: 0,
    promo: pkg?.flashSale.isActive ? 'flash_sale' : 'none',
    flashSalePercent: initialPercent,
    flashSaleStart: toDatetimeLocal(pkg?.flashSale.start ?? null),
    flashSaleEnd: toDatetimeLocal(pkg?.flashSale.end ?? null),
    quota: pkg?.quota.limit ?? '',
    isActive: pkg?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handlePromoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setForm(f => ({
      ...f, promo: val,
      flashSaleStart: val === 'none' ? '' : f.flashSaleStart,
      flashSaleEnd: val === 'none' ? '' : f.flashSaleEnd,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const body: Record<string, any> = {
      name: form.name,
      price: Number(form.price),
      cost: Number(form.cost),
      isActive: form.isActive,
      quota: form.quota !== '' ? Number(form.quota) : null
    };
    if (form.promo === 'flash_sale' && form.flashSaleStart && form.flashSaleEnd) {
      body.flashSalePrice = Math.round(Number(form.price) * (1 - Number(form.flashSalePercent) / 100) * 100) / 100;
      body.flashSaleStart = new Date(form.flashSaleStart).toISOString();
      body.flashSaleEnd = new Date(form.flashSaleEnd).toISOString();
    } else {
      body.flashSalePrice = null;
      body.flashSaleStart = null;
      body.flashSaleEnd = null;
    }
    if (!isEdit) { body.sku = form.sku; }
    try {
      if (isEdit) {
        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/admin/games/${gameId}/packages/${pkg!.id}`,
          body, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/games/${gameId}/packages`,
          body, { headers: { Authorization: `Bearer ${token}` } });
      }
      toast.success(isEdit ? 'บันทึกสำเร็จ' : 'เพิ่มแพ็กเกจสำเร็จ');
      onSuccess(); onClose();
    } catch (err: any) { setError(err?.response?.data?.message ?? 'เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  };

  const end = form.flashSaleEnd ? new Date(form.flashSaleEnd) : null;
  const start = form.flashSaleStart ? new Date(form.flashSaleStart) : null;
  const diff = end && start ? end.getTime() - start.getTime() : 0;
  const countdown = diff > 0
    ? `${String(Math.floor(diff / 3600000)).padStart(2, '0')}:${String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')}:${String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl bg-card text-card-foreground border border-border"
        style={{ maxHeight: '92vh' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-sm font-bold text-foreground">{isEdit ? 'แก้ไขแพ็กเกจ' : 'เพิ่มแพ็กเกจใหม่'}</p>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 pb-6 pt-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(92vh - 64px)' }}>

          <Field label="ชื่อแพ็กเกจ">
            {isEdit
              ? <div className="space-y-1.5">
                  <input value={form.name} onChange={set('name')} required placeholder="ชื่อแพ็กเกจ"
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
                  {pkg?.name && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 select-none px-1">
                      <span>ค่าเริ่มต้น (Default):</span>
                      <button type="button" onClick={() => setForm(f => ({ ...f, name: pkg.name }))} className="text-primary hover:underline font-semibold cursor-pointer">
                        {pkg.name}
                      </button>
                    </p>
                  )}
                </div>
              : <div className="grid grid-cols-2 gap-3">
                  <input value={form.sku} onChange={set('sku')} required placeholder="SKU (เช่น diamond-10)"
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
                  <input value={form.name} onChange={set('name')} required placeholder="ชื่อแพ็กเกจ"
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
                </div>
            }
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="ราคา (PRICE)" prefix="฿">
              <div className="flex flex-col w-full">
                <TextInput noBg type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required />
                {isEdit && pkg?.originalPrice !== undefined && (
                  <div className="px-3 pb-1.5 -mt-1 select-none">
                    <p className="text-[9px] text-muted-foreground">
                      ค่าเริ่มต้น:{" "}
                      <button type="button" onClick={() => setForm(f => ({ ...f, price: pkg.originalPrice }))} className="text-primary hover:underline font-bold cursor-pointer">
                        ฿{pkg.originalPrice}
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </Field>
            <Field label="ต้นทุน (COST)" prefix="฿">
              <TextInput noBg type="number" min="0" step="0.01" value={form.cost} onChange={set('cost')} required />
            </Field>
          </div>

          <div className="flex items-center gap-3 bg-muted/20 border border-border/80 p-3.5 rounded-xl">
            <input 
              type="checkbox" 
              id="promo-flash-sale"
              checked={form.promo === 'flash_sale'} 
              onChange={e => {
                const checked = e.target.checked;
                setForm(f => ({ 
                  ...f, 
                  promo: checked ? 'flash_sale' : 'none',
                  flashSaleStart: checked ? f.flashSaleStart || toDatetimeLocal(new Date().toISOString()) : f.flashSaleStart,
                  flashSaleEnd: checked ? f.flashSaleEnd || toDatetimeLocal(new Date(Date.now() + 24 * 3600 * 1000).toISOString()) : f.flashSaleEnd
                }));
              }}
              className="w-4 h-4 rounded text-black border-border/80 focus:ring-0 focus:outline-none accent-black cursor-pointer" 
            />
            <label htmlFor="promo-flash-sale" className="text-sm font-semibold cursor-pointer text-foreground select-none">
              เปิดใช้งานโปรโมชั่น Flash sale
            </label>
          </div>

          {form.promo === 'flash_sale' && (
            <div className="rounded-xl p-4 space-y-3 bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-amber-500" />
                <p className="text-xs font-bold text-amber-500">Flash Sale</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="ส่วนลด (%)">
                  <div className="relative">
                    <select value={form.flashSalePercent} onChange={e => setForm(f => ({ ...f, flashSalePercent: Number(e.target.value) }))}
                      className="w-full px-3 py-2.5 text-sm rounded-xl appearance-none focus:outline-none bg-muted/30 border border-border text-foreground focus:ring-2 focus:ring-primary/30 transition">
                      {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80].map(p => (
                        <option key={p} value={p}>{p}% OFF</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">▾</span>
                  </div>
                </Field>
                <Field label="ราคาพิเศษ" prefix="฿">
                  <div className="px-3 py-2.5 text-sm font-bold text-amber-500">
                    {fp(Math.round(Number(form.price) * (1 - Number(form.flashSalePercent) / 100) * 100) / 100)}
                  </div>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="เริ่มต้น">
                  <input type="datetime-local" value={form.flashSaleStart} onChange={set('flashSaleStart')}
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted/30 border border-border text-foreground focus:outline-none" />
                </Field>
                <Field label="สิ้นสุด">
                  <input type="datetime-local" value={form.flashSaleEnd} onChange={set('flashSaleEnd')}
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted/30 border border-border text-foreground focus:outline-none" />
                </Field>
              </div>
              {countdown && (
                <Field label="ระยะเวลา" prefix="⏱">
                  <div className="px-3 py-2.5 text-sm font-mono font-bold text-foreground bg-transparent">{countdown}</div>
                </Field>
              )}
            </div>
          )}

          <Field label="จำกัดจำนวน (เว้นว่าง = ไม่จำกัด)">
            <input type="number" min="1" value={form.quota} onChange={set('quota')} placeholder="เช่น 100"
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
          </Field>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-500">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-muted-foreground bg-muted/40 border border-border/80 hover:bg-muted transition cursor-pointer">
              ยกเลิก
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-bold bg-black text-white hover:bg-neutral-900 border border-black dark:bg-white dark:text-black dark:hover:bg-neutral-100 dark:border-white disabled:opacity-50 transition shadow-sm cursor-pointer">
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Delete Modal ────────────────────────────────────────────── */
function DeleteModal({ pkg, gameId, token, onClose, onSuccess }: {
  pkg: GamePackage; gameId: string; token: string; onClose: () => void; onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleDelete = async () => {
    setLoading(true); setError('');
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/games/${gameId}/packages/${pkg.id}`,
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('ลบแพ็กเกจสำเร็จ');
      onSuccess(); onClose();
    } catch (err: any) { setError(err?.response?.data?.message ?? 'ลบไม่สำเร็จ'); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl p-5 space-y-4 bg-card border border-red-500/30 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10">
            <Trash2 size={15} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">ยืนยันการลบ</p>
            <p className="text-xs text-muted-foreground">{pkg.name}</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          แพ็กเกจนี้จะถูก <strong className="text-red-500">ปิดใช้งาน</strong>
        </p>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground bg-muted/40 border border-border hover:bg-muted transition">
            ยกเลิก
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 transition">
            {loading ? 'กำลังลบ...' : 'ลบแพ็กเกจ'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Package Card (mobile) ───────────────────────────────────── */
function PackageCard({ pkg, onEdit, onDelete }: { pkg: GamePackage; onEdit: () => void; onDelete: () => void }) {
  const flash = pkg.flashSale.isActive;
  const sold = pkg.quota.isSoldOut;
  return (
    <div className="rounded-xl p-4 bg-card border border-border/80 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-foreground truncate">{pkg.name}</p>
            {flash && <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Zap size={8} />FLASH</span>}
            {sold && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500/10 text-red-500">หมด</span>}
            {!pkg.isActive && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-muted text-muted-foreground">ปิด</span>}
          </div>
          <p className="text-[10px] font-mono mt-0.5 text-muted-foreground">{pkg.sku}</p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"><Pencil size={13} /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition"><Trash2 size={13} /></button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl px-3 py-2 bg-muted/30 border border-border/60">
          <p className="text-[9px] mb-0.5 text-muted-foreground">ราคาขาย</p>
          <p className="text-sm font-bold text-foreground">฿{fp(pkg.effectivePrice)}</p>
          {flash && <p className="text-[9px] line-through text-muted-foreground">฿{fp(pkg.price)}</p>}
        </div>
        <div className="rounded-xl px-3 py-2 bg-muted/30 border border-border/60">
          <p className="text-[9px] mb-0.5 text-muted-foreground">ต้นทุน</p>
          <p className="text-sm font-semibold text-muted-foreground">฿{fp(pkg.cost)}</p>
        </div>
        <div className="rounded-xl px-3 py-2 bg-muted/30 border border-border/60">
          <p className="text-[9px] mb-0.5 text-muted-foreground">กำไร</p>
          <p className={`text-sm font-semibold ${pkg.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>฿{fp(pkg.profit)}</p>
        </div>
      </div>
      {pkg.quota.limit !== null && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-muted-foreground">Quota</span>
            <span className="text-[9px] text-muted-foreground">{pkg.quota.sold}/{pkg.quota.limit}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden bg-muted">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (pkg.quota.sold / pkg.quota.limit!) * 100)}%`, background: sold ? '#ef4444' : '#3b82f6' }} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Package Row (desktop) ───────────────────────────────────── */
function PackageRow({ pkg, onEdit, onDelete }: { pkg: GamePackage; onEdit: () => void; onDelete: () => void }) {
  const flash = pkg.flashSale.isActive;
  const sold = pkg.quota.isSoldOut;
  return (
    <div className="grid items-center px-5 py-3.5 hover:bg-muted/30 transition gap-4 border-b border-border/60 last:border-b-0"
      style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 80px' }}>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground">{pkg.name}</p>
          {flash && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Zap size={9} />FLASH</span>}
          {sold && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500">หมด</span>}
          {!pkg.isActive && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">ปิด</span>}
        </div>
        <p className="text-[10px] mt-0.5 font-mono text-muted-foreground">{pkg.sku}</p>
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">฿{fp(pkg.effectivePrice)}</p>
        {flash && <p className="text-[10px] line-through text-muted-foreground">฿{fp(pkg.price)}</p>}
      </div>
      <p className="text-sm text-muted-foreground">฿{fp(pkg.cost)}</p>
      <div>
        <p className={`text-sm font-semibold ${pkg.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>฿{fp(pkg.profit)}</p>
        {pkg.profitPercent !== null && <p className={`text-[10px] ${pkg.profit >= 0 ? 'text-emerald-500/50' : 'text-red-500/50'}`}>{pkg.profitPercent}%</p>}
      </div>
      <div>
        {pkg.quota.limit !== null ? (
          <>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-semibold text-foreground">{pkg.quota.sold}</span>
              <span className="text-[10px] text-muted-foreground">/ {pkg.quota.limit}</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden bg-muted" style={{ width: 60 }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (pkg.quota.sold / pkg.quota.limit!) * 100)}%`, background: sold ? '#ef4444' : '#3b82f6' }} />
            </div>
          </>
        ) : <span className="text-[11px] text-muted-foreground/50">ไม่จำกัด</span>}
      </div>
      <div className="flex items-center justify-end gap-1.5">
        <button onClick={onEdit} className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/60 text-muted-foreground border border-border hover:bg-muted hover:text-foreground transition cursor-pointer">
          <Pencil size={13} />
        </button>
        <button onClick={onDelete} className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/5 text-muted-foreground border border-border hover:bg-red-500/10 hover:text-red-500 transition cursor-pointer">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function PackagesAdminPage() {
  const { token } = useAdminAuth();
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const [game, setGame] = useState<Game | null>(null);
  const [packages, setPackages] = useState<GamePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editPkg, setEditPkg] = useState<GamePackage | null>(null);
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

  const activeCount = packages.filter(p => p.isActive).length;
  const flashCount = packages.filter(p => p.flashSale.isActive).length;
  const soldOutCount = packages.filter(p => p.quota.isSoldOut).length;
  const avgProfit = packages.length > 0 ? packages.reduce((s, p) => s + p.profit, 0) / packages.length : 0;

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Noto Sans Thai',sans-serif" }}>

      {showAdd && <PackageFormModal gameId={gameId} token={token!} onClose={() => setShowAdd(false)} onSuccess={fetchData} />}
      {editPkg && <PackageFormModal gameId={gameId} token={token!} pkg={editPkg} onClose={() => setEditPkg(null)} onSuccess={fetchData} />}
      {deletePkg && <DeleteModal pkg={deletePkg} gameId={gameId} token={token!} onClose={() => setDeletePkg(null)} onSuccess={fetchData} />}

      <div className="p-3 sm:p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => router.push('/admin/games')}
              className="p-2 rounded-xl hover:bg-muted transition flex-shrink-0 text-muted-foreground hover:text-foreground">
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {game?.image && <img src={game.image} alt={game.name} className="w-7 h-7 rounded-lg object-cover flex-shrink-0 border border-border" />}
                <h1 className="text-base font-bold text-foreground truncate">{game?.name ?? 'เกม'}</h1>
              </div>
              <p className="text-[10px] text-muted-foreground">จัดการแพ็กเกจเติมเงิน</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="bg-black text-white hover:bg-neutral-900 border border-black dark:bg-white dark:text-black dark:hover:bg-neutral-100 dark:border-white transition-all duration-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer flex-shrink-0">
            <Plus size={13} />
            <span className="hidden sm:inline">เพิ่มแพ็กเกจ</span>
            <span className="sm:hidden">เพิ่ม</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'แพ็กเกจทั้งหมด', value: packages.length, color: '#3b82f6', icon: Package },
            { label: 'เปิดใช้งาน', value: activeCount, color: '#22c55e', icon: CheckCircle },
            { label: 'Flash Sale', value: flashCount, color: '#f59e0b', icon: Zap },
            { label: 'กำไรเฉลี่ย', value: `฿${fp(avgProfit)}`, color: '#818cf8', icon: TrendingUp },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-card border border-border/80 rounded-2xl p-3 sm:p-4 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(circle at 85% 15%, ${color}10, transparent 65%)` }} />
              <div className="relative">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[10px] font-semibold text-muted-foreground">{label}</p>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `linear-gradient(135deg,${color}cc,${color}66)` }}>
                    <Icon size={14} color="#fff" />
                  </div>
                </div>
                <p className="text-xl font-bold text-foreground leading-none">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl p-4 animate-pulse bg-card border border-border/60">
                <div className="h-4 w-32 rounded mb-2 bg-muted/60" />
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(j => <div key={j} className="h-10 rounded-xl bg-muted/60" />)}
                </div>
              </div>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <Package size={32} className="mx-auto text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">ยังไม่มีแพ็กเกจ</p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="sm:hidden space-y-2">
              {packages.map(pkg => (
                <PackageCard key={pkg.id} pkg={pkg}
                  onEdit={() => setEditPkg(pkg)}
                  onDelete={() => setDeletePkg(pkg)} />
              ))}
            </div>
            {/* Desktop */}
            <div className="hidden sm:block rounded-2xl overflow-hidden bg-card border border-border/80 shadow-sm">
              <div className="grid text-[10px] font-bold uppercase tracking-wider px-5 py-3 gap-4 text-muted-foreground border-b border-border/60"
                style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 80px' }}>
                <span>แพ็กเกจ / SKU</span><span>ราคาขาย</span><span>ต้นทุน</span><span>กำไร</span><span>Quota</span><span className="text-right">จัดการ</span>
              </div>
              {packages.map(pkg => (
                <PackageRow key={pkg.id} pkg={pkg} onEdit={() => setEditPkg(pkg)} onDelete={() => setDeletePkg(pkg)} />
              ))}
            </div>
          </>
        )}

        {soldOutCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/20">
            <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-500">มี {soldOutCount} แพ็กเกจที่ขายหมดแล้ว</p>
          </div>
        )}
      </div>
    </div>
  );
}
