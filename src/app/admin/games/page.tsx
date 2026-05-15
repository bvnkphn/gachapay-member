'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Search, Plus, Power, RefreshCw, X, CheckCircle, XCircle, Pencil, Upload, Package } from 'lucide-react';

const cardBg = { background: 'rgba(11,15,32,0.85)', border: '1px solid #1c2540' };

type Game = {
  id: string; name: string; slug: string; image?: string;
  isActive: boolean; label: string; categoryId?: string;
  category?: { id: string; name: string };
  inputFields?: { id: string; key: string; title: string; type: string; validationRegex?: string }[];
};
type Category = { id: string; name: string; slug: string };
type ApiStatus = { online: boolean; checkedAt: string } | null;

const LABEL_STYLE: Record<string, { color: string; bg: string }> = {
  HOT:  { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  NEW:  { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  SALE: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  NONE: { color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
};

// ── Image Upload Component ────────────────────────────────────────
function ImageUpload({ value, onChange, token }: { value: string; onChange: (url: string) => void; token: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload/game-image`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      onChange(`http://localhost:3001${res.data.url}`);
    } catch { alert('อัปโหลดไม่สำเร็จ'); }
    finally { setUploading(false); }
  };

  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">โลโก้เกม</label>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
          style={{ background: '#0f0f1a', border: '1px solid #1c2540' }}>
          {value
            ? <img src={value} alt="logo" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
            : <span className="text-2xl">🎮</span>}
        </div>
        <div className="flex-1 space-y-1.5">
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-50 w-full justify-center"
            style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>
            <Upload size={12} />
            {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพ'}
          </button>
          <p className="text-[10px] text-center" style={{ color: '#3a4a6a' }}>JPG, PNG, WebP ขนาดไม่เกิน 5MB</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

function EditGameModal({ game, categories, onClose, onSuccess, token }: {
  game: Game; categories: Category[]; onClose: () => void; onSuccess: () => void; token: string;
}) {
  const [form, setForm] = useState({ name: game.name, image: game.image ?? '', label: game.label, categoryId: game.categoryId ?? '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/games/${game.id}`,
        { ...form, categoryId: form.categoryId || null },
        { headers: { Authorization: `Bearer ${token}` } });
      onSuccess(); onClose();
    } catch { setError('เกิดข้อผิดพลาด กรุณาลองใหม่'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: '#0d1420', border: '1px solid #1c2540' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1c2540' }}>
          <p className="text-sm font-bold text-white">แก้ไขเกม — {game.name}</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition" style={{ color: '#64748b' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">ชื่อเกม *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">หมวดหมู่เกม</label>
            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
              className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm">
              <option value="">ไม่ระบุ</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Label</label>
            <select value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
              className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm">
              <option value="NONE">None</option>
              <option value="HOT">🔥 Hot</option>
              <option value="NEW">✨ New</option>
              <option value="SALE">🏷️ Sale</option>
            </select>
          </div>
          <ImageUpload value={form.image} onChange={url => setForm({ ...form, image: url })} token={token} />
          {game.inputFields && game.inputFields.length > 0 && (
            <div>
              <label className="text-xs text-gray-400 mb-2 block">UID Format (Input Fields)</label>
              <div className="space-y-2">
                {game.inputFields.map(field => (
                  <div key={field.id} className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1c2540' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">{field.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>{field.type}</span>
                    </div>
                    <label className="text-[10px] text-gray-500 mb-0.5 block">Validation Regex</label>
                    <input defaultValue={field.validationRegex ?? ''}
                      className="w-full bg-[#0f0f1a] text-white px-2 py-1 rounded text-xs border border-white/10 focus:outline-none focus:border-cyan-500"
                      placeholder="เช่น ^\d{8,12}$ สำหรับตัวเลข 8-12 หลัก"
                      onBlur={async (e) => {
                        try { await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/games/input-fields/${field.id}`,
                          { validationRegex: e.target.value }, { headers: { Authorization: `Bearer ${token}` } }); } catch {}
                      }} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {error && <p className="text-red-400 text-xs bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white transition"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1c2540' }}>ยกเลิก</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#38bdf8,#818cf8)' }}>{loading ? 'กำลังบันทึก...' : 'บันทึก'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddGameModal({ categories, onClose, onSuccess, token }: {
  categories: Category[]; onClose: () => void; onSuccess: () => void; token: string;
}) {
  const [form, setForm] = useState({ name: '', slug: '', label: 'NONE', categoryId: '', image: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/games/admin`,
        { ...form, categoryId: form.categoryId || null },
        { headers: { Authorization: `Bearer ${token}` } });
      onSuccess(); onClose();
    } catch { setError('เกิดข้อผิดพลาด กรุณาลองใหม่'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: '#0d1420', border: '1px solid #1c2540' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1c2540' }}>
          <p className="text-sm font-bold text-white">เพิ่มเกมใหม่</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition" style={{ color: '#64748b' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">ชื่อเกม *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm"
              placeholder="Mobile Legends" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Slug *</label>
            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
              className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm"
              placeholder="mobile-legends" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">หมวดหมู่</label>
            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
              className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm">
              <option value="">ไม่ระบุ</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <ImageUpload value={form.image} onChange={url => setForm({ ...form, image: url })} token={token} />
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Label</label>
            <select value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
              className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm">
              <option value="NONE">None</option>
              <option value="HOT">🔥 Hot</option>
              <option value="NEW">✨ New</option>
              <option value="SALE">🏷️ Sale</option>
            </select>
          </div>
          {error && <p className="text-red-400 text-xs bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white transition"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1c2540' }}>ยกเลิก</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#38bdf8,#818cf8)' }}>{loading ? 'กำลังบันทึก...' : 'บันทึก'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GamesAdminPage() {
  const { token } = useAdminAuth();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [apiStatus, setApiStatus] = useState<Record<string, ApiStatus>>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [checkingSlug, setCheckingSlug] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    if (!token) return;
    try {
      const [gamesRes, catsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setGames(gamesRes.data?.data ?? []);
      const catsData = catsRes.data;
      setCategories(Array.isArray(catsData) ? catsData : (catsData?.data ?? []));
    } catch { console.error('Failed to fetch'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchGames(); }, [fetchGames]);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/games/${id}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await fetchGames();
    } catch { } finally { setTogglingId(null); }
  };

  const handleCheckApi = async (slug: string) => {
    setCheckingSlug(slug);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games/${slug}/api-status`, { headers: { Authorization: `Bearer ${token}` } });
      setApiStatus(prev => ({ ...prev, [slug]: res.data }));
    } catch {
      setApiStatus(prev => ({ ...prev, [slug]: { online: false, checkedAt: new Date().toISOString() } }));
    } finally { setCheckingSlug(null); }
  };

  const filtered = games.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.slug.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-5 space-y-5" style={{ fontFamily: "'Noto Sans Thai',sans-serif", background: '#080a16', minHeight: '100vh' }}>
      {showAdd && <AddGameModal categories={categories} onClose={() => setShowAdd(false)} onSuccess={fetchGames} token={token!} />}
      {editGame && <EditGameModal game={editGame} categories={categories} onClose={() => setEditGame(null)} onSuccess={fetchGames} token={token!} />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">จัดการเกม</h1>
          <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>ทั้งหมด {games.length} เกม · เปิดอยู่ {games.filter(g => g.isActive).length} เกม</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition"
          style={{ background: 'linear-gradient(135deg,#38bdf8,#818cf8)' }}>
          <Plus size={15} /> เพิ่มเกมใหม่
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-xl px-3 py-2 max-w-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1e293b' }}>
        <Search size={13} style={{ color: '#64748b' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาเกม..."
          className="bg-transparent outline-none text-xs text-white placeholder-[#3a4a6a] w-full" />
      </div>

      <div className="rounded-2xl overflow-hidden" style={cardBg}>
        {/* header เพิ่ม column แพ็กเกจ */}
        <div className="grid text-[11px] font-bold px-5 py-3"
          style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr', color: '#64748b', borderBottom: '1px solid #1c2540' }}>
          <span>เกม</span><span>หมวดหมู่</span><span>Label</span><span>สถานะ API</span><span className="text-right">การจัดการ</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">ไม่พบเกม</div>
        ) : (
          filtered.map((g, i) => {
            const ls = LABEL_STYLE[g.label] ?? LABEL_STYLE.NONE;
            const status = apiStatus[g.slug];
            return (
              <div key={g.id} className="grid items-center px-5 py-4 hover:bg-white/[0.02] transition"
                style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr', borderBottom: i < filtered.length - 1 ? '1px solid #0d1525' : 'none' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden" style={{ background: '#1a1a2e' }}>
                    {g.image ? <img src={g.image} alt={g.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">🎮</div>}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{g.name}</p>
                    <p className="text-[11px]" style={{ color: '#64748b' }}>{g.slug}</p>
                  </div>
                </div>
                <span className="text-xs" style={{ color: '#94a3b8' }}>{g.category?.name ?? 'ไม่ระบุ'}</span>
                <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: ls.bg, color: ls.color }}>
                  {g.label === 'NONE' ? '-' : g.label}
                </span>
                <div className="flex items-center gap-1.5">
                  {status == null ? <span className="text-[11px]" style={{ color: '#3a4a6a' }}>-</span>
                    : status.online ? <><CheckCircle size={13} className="text-green-400" /><span className="text-[11px] text-green-400">Online</span></>
                    : <><XCircle size={13} className="text-red-400" /><span className="text-[11px] text-red-400">Offline</span></>}
                  <button onClick={() => handleCheckApi(g.slug)} disabled={checkingSlug === g.slug}
                    className="p-1 rounded hover:bg-white/10 transition" style={{ color: '#64748b' }}>
                    <RefreshCw size={11} className={checkingSlug === g.slug ? 'animate-spin' : ''} />
                  </button>
                </div>
                {/* ── Actions ── */}
                <div className="flex items-center justify-end gap-1.5">
                  {/* ปุ่มแพ็กเกจ — ไปหน้า packages */}
                  <button
                    onClick={() => router.push(`/admin/games/${g.id}/packages`)}
                    title="จัดการแพ็กเกจ"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition"
                    style={{ background: 'rgba(129,140,248,0.1)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.25)' }}>
                    <Package size={11} /> แพ็กเกจ
                  </button>
                  <button onClick={() => setEditGame(g)} className="p-1.5 rounded-lg hover:bg-white/10 transition" style={{ color: '#64748b' }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleToggle(g.id)} disabled={togglingId === g.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition disabled:opacity-50"
                    style={g.isActive
                      ? { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }
                      : { background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
                    <Power size={11} />
                    {togglingId === g.id ? '...' : g.isActive ? 'เปิด' : 'ปิด'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
