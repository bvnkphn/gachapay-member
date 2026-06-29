'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { toast } from 'sonner';
import {
  Search, X, Package,
  Download, ChevronLeft, ChevronRight, Gamepad2, Eye,
  Plus, Pencil, Globe, Power
} from 'lucide-react';

type Game = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  categoryId: string | null;
  category: { id: string; name: string; slug: string } | null;
  label: 'NONE' | 'HOT' | 'NEW' | 'SALE';
  isActive: boolean;
};

const CAT_COLOR: Record<string, { color: string; bg: string }> = {
  'Action / Shooter':            { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  'MOBA / Strategy':             { color: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
  'RPG / Open World / MMO':      { color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  'Sports / Racing':             { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  'Social / Casual / Simulation':{ color: '#ec4899', bg: 'rgba(236,72,153,0.12)'  },
  'Other':                       { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
  default:                       { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
};

const getGameImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const base = apiBase.replace(/\/api\/?$/, '');
  return `${base}${url}`;
};

function catStyle(name?: string) { return CAT_COLOR[name ?? ''] ?? CAT_COLOR.default; }

function getCategoryName(g: Game) {
  if (!g.category) return 'Other';
  if (typeof g.category === 'string') return g.category;
  return g.category.name;
}

/* ── Status Toggle Component ─────────────────────────────────── */
function StatusToggle({ isActive, onToggle }: { isActive: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="focus:outline-none text-left cursor-pointer">
      {isActive ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
          <span className="w-1 h-1 rounded-full bg-emerald-500" />
          เปิดใช้งาน
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
          <span className="w-1 h-1 rounded-full bg-muted-foreground/60" />
          ปิดใช้งาน
        </span>
      )}
    </button>
  );
}

/* ── Game Card (mobile) ──────────────────────────────────────── */
function GameCard({ g, onPackage, onView, onEdit, onToggle }: {
  g: Game; onPackage: () => void; onView: () => void; onEdit: () => void; onToggle: () => void;
}) {
  const cs = catStyle(getCategoryName(g));
  return (
    <div className="rounded-xl p-4 bg-card border border-border/80 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center bg-muted/40 border border-border/60">
          {g.image ? <img src={getGameImageUrl(g.image)} alt={g.name} className="w-full h-full object-cover" /> : <span className="text-lg">🎮</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground truncate">{g.name}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
              style={{ background: cs.bg, color: cs.color }}>{getCategoryName(g)}</span>
            <StatusToggle isActive={g.isActive} onToggle={onToggle} />
          </div>
        </div>
        <button onClick={onEdit} className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition">
          <Pencil size={14} />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={onPackage}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition cursor-pointer">
          <Package size={12} /> แพ็กเกจ
        </button>
        <button onClick={onView}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-muted/40 text-muted-foreground border border-border hover:bg-muted transition cursor-pointer">
          <Eye size={12} /> ดูหน้าเว็บ
        </button>
      </div>
    </div>
  );
}

/* ── Game Form Modal ────────────────────────────────────────── */
type GameFormModalProps = {
  token: string;
  game?: Game | null;
  categories: any[];
  onClose: () => void;
  onSuccess: () => void;
};

function GameFormModal({ token, game, categories, onClose, onSuccess }: GameFormModalProps) {
  const isEdit = !!game;
  const [form, setForm] = useState({
    name: game?.name ?? '',
    slug: game?.slug ?? '',
    description: game?.description ?? '',
    image: game?.image ?? '',
    categoryId: game?.categoryId ?? '',
    label: game?.label ?? 'NONE',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingImg(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload/game-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data?.url) {
        setForm(f => ({ ...f, image: res.data.url }));
        toast.success('อัปโหลดรูปภาพสำเร็จ');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
    } finally {
      setUploadingImg(false);
    }
  };

  useEffect(() => {
    if (!isEdit) {
      const generatedSlug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setForm(f => ({ ...f, slug: generatedSlug }));
    }
  }, [form.name, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const body = {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description || null,
      image: form.image || null,
      categoryId: form.categoryId ? form.categoryId : null,
      label: form.label,
    };

    try {
      if (isEdit) {
        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/games/${game.id}`, body, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('แก้ไขข้อมูลเกมสำเร็จ');
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/games/admin`, body, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('เพิ่มเกมสำเร็จ');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl bg-card text-card-foreground border border-border"
        style={{ maxHeight: '92vh' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-sm font-bold text-foreground">{isEdit ? 'แก้ไขข้อมูลเกม' : 'เพิ่มเกมใหม่'}</p>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 pb-6 pt-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(92vh - 64px)' }}>
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">ชื่อเกม</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="เช่น Genshin Impact"
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">Slug (ลิงก์ URL)</label>
            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required placeholder="เช่น genshin-impact"
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">คำอธิบาย (ย่อ)</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="รายละเอียดเกมสั้นๆ"
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">รูปภาพเกม (Image URL หรืออัปโหลดไฟล์)</label>
            <div className="flex gap-2">
              <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://cdn.example.com/image.png"
                className="flex-1 px-3 py-2.5 text-sm rounded-xl bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
              <div className="relative">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="modal-image-file" disabled={uploadingImg} />
                <label htmlFor="modal-image-file" className="px-3 py-2.5 rounded-xl text-xs font-bold border border-primary text-primary hover:bg-primary/5 transition cursor-pointer flex items-center justify-center h-full min-w-[80px]">
                  {uploadingImg ? "กำลังอัปโหลด..." : "อัปโหลด"}
                </label>
              </div>
            </div>
            {form.image && (
              <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center relative group">
                <img src={getGameImageUrl(form.image)} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setForm(f => ({ ...f, image: '' }))} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] transition-opacity">
                  ลบ
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">หมวดหมู่</label>
            <div className="relative">
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm rounded-xl appearance-none focus:outline-none bg-muted/30 border border-border text-foreground focus:ring-2 focus:ring-primary/30 transition">
                <option value="">ไม่มีหมวดหมู่</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">▾</span>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-muted-foreground bg-muted/40 border border-border hover:bg-muted transition">
              ยกเลิก
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 bg-emerald-600 hover:bg-emerald-700 transition shadow-sm">
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
const PAGE_SIZE = 15;

export default function GamesAdminPage() {
  const { token, _hydrated } = useAdminAuth();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ทั้งหมด');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchGames = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGames(res.data?.data ?? []);
    } catch { console.error('fetch error'); } finally { setLoading(false); }
  }, [token]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games/categories`);
      setCategories(res.data?.data ?? []);
    } catch { console.error('fetch categories error'); }
  }, []);

  useEffect(() => {
    if (_hydrated && token) {
      fetchGames();
      fetchCategories();
    }
  }, [_hydrated, token, fetchGames, fetchCategories]);

  const handleToggleActive = async (id: string) => {
    if (!token) return;
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/games/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('เปลี่ยนสถานะการใช้งานของเกมสำเร็จ');
      fetchGames();
    } catch {
      toast.error('ไม่สามารถเปลี่ยนสถานะเกมได้');
    }
  };

  const handleSyncGames = async () => {
    if (!token) return;
    setSyncing(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/games/import-external`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`ซิงค์ข้อมูลเกมสำเร็จ! นำเข้าทั้งหมด ${res.data?.count ?? 0} เกม`);
      fetchGames();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'เกิดข้อผิดพลาดในการซิงค์ข้อมูล');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const handleRefresh = () => {
      fetchGames();
      fetchCategories();
    };
    window.addEventListener('admin-refresh', handleRefresh);
    return () => window.removeEventListener('admin-refresh', handleRefresh);
  }, [fetchGames, fetchCategories]);

  const filtered = games.filter(g => {
    const queryClean = search.trim().toLowerCase();
    const matchSearch = !queryClean || g.name.toLowerCase().startsWith(queryClean) || g.slug.toLowerCase().startsWith(queryClean);
    const matchCat = catFilter === 'ทั้งหมด' || getCategoryName(g) === catFilter;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, catFilter]);

  // Compute category counts for filter badges
  const catCounts: Record<string, number> = {};
  games.forEach(g => {
    const catName = getCategoryName(g);
    catCounts[catName] = (catCounts[catName] || 0) + 1;
  });

  const catOptions = ['ทั้งหมด', ...Object.keys(catCounts).sort()];

  const handleExport = () => {
    const rows = [['ชื่อเกม', 'Slug', 'หมวดหมู่', 'สถานะ']];
    filtered.forEach(g => rows.push([g.name, g.slug, getCategoryName(g), g.isActive ? 'เปิด' : 'ปิด']));
    const csv = '\ufeff' + rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `games_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (!_hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in" style={{ fontFamily: "'Noto Sans Thai',sans-serif" }}>
      {showAddModal && (
        <GameFormModal
          token={token!}
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchGames}
        />
      )}
      {editGame && (
        <GameFormModal
          token={token!}
          game={editGame}
          categories={categories}
          onClose={() => setEditGame(null)}
          onSuccess={fetchGames}
        />
      )}

      <div className="p-3 sm:p-5 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'เกมทั้งหมด', value: games.length, accent: '#3b82f6', icon: Gamepad2, sub: 'เกม' },
            ...Object.entries(catCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([cat, count]) => ({
              label: cat.length > 15 ? cat.split(' / ')[0] : cat,
              value: count,
              accent: catStyle(cat).color,
              icon: Gamepad2,
              sub: 'เกม',
            })),
          ].map(c => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="bg-card border border-border/80 rounded-2xl p-3 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div className="absolute inset-0 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(circle at 85% 15%, ${c.accent}10, transparent 65%)` }} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-[9px] font-semibold text-muted-foreground leading-tight">{c.label}</p>
                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: `linear-gradient(135deg,${c.accent}cc,${c.accent}66)` }}>
                      <Icon size={10} color="#fff" />
                    </div>
                  </div>
                  <p className="text-base font-bold text-foreground leading-none">{c.value}</p>
                  <p className="text-[8px] text-muted-foreground/60 mt-0.5">{c.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-[200px] bg-muted/40 border border-border/60 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all">
            <Search size={13} className="text-muted-foreground flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาเกมด้วยชื่อ..."
              className="bg-transparent outline-none text-xs text-foreground placeholder-muted-foreground/60 flex-1 min-w-0" />
            {search && <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground transition cursor-pointer"><X size={12} /></button>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                className="appearance-none pl-3 pr-7 py-2 rounded-xl text-xs font-semibold text-foreground bg-muted/40 border border-border/60 focus:outline-none cursor-pointer">
                {catOptions.map(c => (
                  <option key={c} value={c}>
                    {c === 'ทั้งหมด' ? `ทั้งหมด (${games.length})` : `${c} (${catCounts[c] ?? 0})`}
                  </option>
                ))}
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">▾</span>
            </div>

            <button onClick={handleSyncGames} disabled={syncing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition cursor-pointer disabled:opacity-50">
              <Globe size={13} className={syncing ? "animate-spin" : ""} />
              <span>{syncing ? "กำลังซิงค์..." : "ซิงค์จาก API หลัก"}</span>
            </button>

            <button onClick={() => setShowAddModal(true)}
              className="bg-black text-white hover:bg-neutral-900 border border-black dark:bg-white dark:text-black dark:hover:bg-neutral-100 dark:border-white transition-all duration-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer">
              <Plus size={13} /> เพิ่มเกมใหม่
            </button>
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-muted/40 text-muted-foreground border border-border/60 hover:bg-muted transition cursor-pointer">
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-xl p-4 animate-pulse bg-card border border-border/60">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted/60" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 rounded bg-muted/60" />
                    <div className="h-2 w-20 rounded bg-muted/60" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground border border-dashed border-border rounded-2xl">ไม่พบรายการเกมในระบบ</div>
        ) : (
          <>
            {/* Mobile: Cards */}
            <div className="sm:hidden space-y-2">
              {paginated.map(g => (
                <GameCard
                  key={g.id}
                  g={g}
                  onPackage={() => router.push(`/admin/games/${g.id}/packages`)}
                  onView={() => window.open(`/game/${g.slug}`, '_blank')}
                  onEdit={() => setEditGame(g)}
                  onToggle={() => handleToggleActive(g.id)}
                />
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden sm:block rounded-2xl overflow-hidden bg-card border border-border/80 shadow-sm">
              <div className="grid text-[10px] font-bold uppercase tracking-wider px-5 py-3 gap-4 text-muted-foreground border-b border-border/60"
                style={{ gridTemplateColumns: '2.5fr 1.5fr 1fr 120px' }}>
                <span>ชื่อเกม</span><span>หมวดหมู่</span><span>สถานะ</span><span className="text-right">จัดการ</span>
              </div>
              {paginated.map((g, i) => {
                const cs = catStyle(getCategoryName(g));
                return (
                  <div key={g.id} className="grid items-center px-5 py-3 gap-4 hover:bg-muted/30 transition duration-150"
                    style={{ gridTemplateColumns: '2.5fr 1.5fr 1fr 120px',
                      borderBottom: i < paginated.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    {/* Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center bg-muted/40 border border-border/60">
                        {g.image ? <img src={getGameImageUrl(g.image)} alt={g.name} className="w-full h-full object-cover" /> : <span className="text-sm">🎮</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{g.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono truncate">{g.slug}</p>
                      </div>
                    </div>
                    {/* Category */}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold w-fit"
                      style={{ background: cs.bg, color: cs.color }}>{getCategoryName(g)}</span>
                    {/* Status */}
                    <StatusToggle isActive={g.isActive} onToggle={() => handleToggleActive(g.id)} />
                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => window.open(`/game/${g.slug}`, '_blank')} title="ดูหน้าเว็บซื้อเกม"
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition cursor-pointer">
                        <Globe size={13} />
                      </button>
                      <button onClick={() => setEditGame(g)} title="แก้ไขข้อมูลเกม"
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/45 hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition cursor-pointer">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => router.push(`/admin/games/${g.id}/packages`)} title="จัดการแพ็กเกจ"
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition cursor-pointer">
                        <Package size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} เกม
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 border border-border text-muted-foreground hover:bg-muted transition cursor-pointer">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      p === page
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'text-muted-foreground border-border hover:bg-muted'
                    }`}>{p}</button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 border border-border text-muted-foreground hover:bg-muted transition cursor-pointer">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
