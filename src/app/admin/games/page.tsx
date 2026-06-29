'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { toast } from 'sonner';
import {
  Search, Plus, X, Pencil, Upload, Package,
  Download, ChevronLeft, ChevronRight, CloudUpload, Info,
} from 'lucide-react';

type Game = {
  id: string; name: string; slug: string; image?: string; banner?: string;
  isActive: boolean; label: string; categoryId?: string;
  category?: { id: string; name: string };
  inputFields?: { id: string; key: string; label: string; type: string; regex?: string }[];
  topupGuide?: string; uidGuide?: string;
};
type Category = { id: string; name: string; slug: string };
type ApiStatus = { online: boolean } | null;

const CAT_COLOR: Record<string, { color: string; bg: string }> = {
  MOBA:            { color: '#818cf8', bg: 'rgba(129,140,248,0.18)' },
  FPS:             { color: '#f87171', bg: 'rgba(248,113,113,0.18)' },
  RPG:             { color: '#34d399', bg: 'rgba(52,211,153,0.18)'  },
  'Battle Royale': { color: '#f59e0b', bg: 'rgba(245,158,11,0.18)'  },
  BATT:            { color: '#f59e0b', bg: 'rgba(245,158,11,0.18)'  },
  default:         { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};
function catStyle(name?: string) { return CAT_COLOR[name ?? ''] ?? CAT_COLOR.default; }

function uidSummary(fields?: Game['inputFields']) {
  if (!fields || fields.length === 0) return <span style={{ color: '#3a4a6a' }}>—</span>;
  const uid = fields.find(f => ['uid','user_id','userid','id'].includes(f.key.toLowerCase()));
  const target = uid ?? fields[0];
  if (target.regex) {
    const isNumeric = /\\d/.test(target.regex);
    const match = target.regex.match(/\{(\d+),?(\d+)?\}/);
    const digits = match ? (match[2] ? `${match[1]}-${match[2]}` : match[1]) : '';
    return (
      <code className="text-xs px-2 py-0.5 rounded-md font-mono"
        style={{ background:'rgba(56,189,248,0.08)', color:'#38bdf8', border:'1px solid rgba(56,189,248,0.15)' }}>
        {isNumeric ? `Number Only${digits ? ` (${digits} digits)` : ''}` : target.regex.slice(0,24)}
      </code>
    );
  }
  if (fields.length > 1) {
    return (
      <code className="text-xs px-2 py-0.5 rounded-md font-mono"
        style={{ background:'rgba(129,140,248,0.08)', color:'#818cf8', border:'1px solid rgba(129,140,248,0.15)' }}>
        {fields.map(f => f.label).join(' + ')}
      </code>
    );
  }
  return <span className="text-xs" style={{ color:'#94a3b8' }}>{target.type==='select'?'Dropdown':'Text'}</span>;
}

function Toggle({ on, loading, onToggle }: { on: boolean; loading: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} disabled={loading}
      style={{ position:'relative', width:44, height:24, borderRadius:12,
        background:on?'#22c55e':'#334155', border:'none',
        cursor:loading?'not-allowed':'pointer', opacity:loading?0.5:1,
        flexShrink:0, transition:'background 0.2s' }}>
      <span style={{ position:'absolute', top:2, left:on?22:2,
        width:20, height:20, borderRadius:'50%', background:'white',
        boxShadow:'0 1px 3px rgba(0,0,0,0.3)', transition:'left 0.2s', display:'block' }} />
    </button>
  );
}

function UploadZone({ value, onChange, token, endpoint, aspect, label }: {
  value: string; onChange: (url: string) => void; token: string;
  endpoint: string; aspect: string; label: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, fd,
        { headers: { Authorization:`Bearer ${token}`, 'Content-Type':'multipart/form-data' } });
      const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').origin;
      onChange(`${apiOrigin}${res.data.url}`);
    } catch { toast.error('อัปโหลดไม่สำเร็จ'); } finally { setUploading(false); }
  };
  return (
    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
      className="w-full rounded-2xl flex flex-col items-center justify-center gap-2 transition hover:opacity-90 animate-fade-in"
      style={{ height:130, border:'2px dashed #2a3a5a', background:'#0d1a2e', cursor:uploading?'wait':'pointer' }}>
      {value
        ? <img src={value} alt={label} className="w-full h-full object-cover rounded-2xl" />
        : <>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background:'rgba(56,189,248,0.1)' }}>
              <CloudUpload size={18} style={{ color:'#38bdf8' }} />
            </div>
            <p className="text-xs font-medium text-white">{uploading?'กำลังอัปโหลด...':label}</p>
            <p className="text-[10px]" style={{ color:'#475569' }}>{aspect}</p>
          </>}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </button>
  );
}

// ── Edit Modal — responsive single column on mobile ───────────────
function EditGameModal({ game, categories, onClose, onSuccess, token }: {
  game: Game; categories: Category[]; onClose: () => void; onSuccess: () => void; token: string;
}) {
  const [form, setForm] = useState({
    name:game.name, image:game.image??'', banner:game.banner??'',
    label:game.label, categoryId:game.categoryId??'',
    topupGuide:game.topupGuide??'', uidGuide:game.uidGuide??'',
  });
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games/${game.slug}/api-status`,
      { headers: { Authorization:`Bearer ${token}` } })
      .then(r => setApiOnline(r.data?.online ?? false))
      .catch(() => setApiOnline(false));
  }, [game.slug, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/games/${game.id}`,
        { ...form, categoryId:form.categoryId||null },
        { headers: { Authorization:`Bearer ${token}` } });
      onSuccess(); onClose();
    } catch { setError('เกิดข้อผิดพลาด'); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ background:'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background:'#111827', border:'1px solid #1e293b', maxHeight:'92vh' }}>
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom:'1px solid #1e293b' }}>
          <p className="text-sm font-bold text-white">จัดการข้อมูลเกม — {game.name}</p>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color:'#64748b' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* ชื่อเกม & ป้ายกำกับ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block font-semibold">ชื่อเกม *</label>
              <input
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
                placeholder="เช่น Garena Free Fire"
                className="w-full bg-[#1e2d45] text-white px-3 py-2.5 rounded-xl border border-[#2a3a5a] text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block font-semibold">ป้ายกำกับ (Label)</label>
              <div className="relative">
                <select
                  value={form.label}
                  onChange={e => setForm({...form, label: e.target.value})}
                  className="w-full appearance-none px-3 py-2.5 rounded-xl text-sm font-semibold text-white focus:outline-none"
                  style={{ background:'#1e2d45', border:'1px solid #2a3a5a' }}
                >
                  <option value="NONE">ไม่มีป้ายกำกับ</option>
                  <option value="HOT">HOT</option>
                  <option value="NEW">NEW</option>
                  <option value="SALE">SALE</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▾</span>
              </div>
            </div>
          </div>

          {/* 2 col บน sm ขึ้นไป, 1 col บน mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">หมวดหมู่เกม</label>
                <div className="relative">
                  <select value={form.categoryId} onChange={e => setForm({...form,categoryId:e.target.value})}
                    className="w-full appearance-none px-3 py-2.5 rounded-xl text-sm font-semibold text-white focus:outline-none"
                    style={{ background:'#1e2d45', border:'1px solid #2a3a5a' }}>
                    <option value="">ไม่ระบุ</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▾</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">รูปภาพ Banner</label>
                <UploadZone value={form.banner} onChange={url => setForm({...form,banner:url})} token={token}
                  endpoint="/upload/game-image" aspect="1200 x 630 px" label="อัปโหลด Banner" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Picture Guide</label>
                <UploadZone value={form.image} onChange={url => setForm({...form,image:url})} token={token}
                  endpoint="/upload/game-image" aspect="PNG, JPG (16:9)" label="อัปโหลด Picture Guide" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">สถานะ API</label>
                <div className="flex gap-2">
                  {[{key:true,label:'Online',color:'#22c55e'},{key:false,label:'Offline',color:'#f87171'}].map(opt => (
                    <div key={String(opt.key)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
                      style={{
                        background:apiOnline===opt.key?`${opt.color}15`:'rgba(255,255,255,0.03)',
                        border:`1.5px solid ${apiOnline===opt.key?opt.color:'#2a3a5a'}`,
                        color:apiOnline===opt.key?opt.color:'#475569',
                      }}>
                      <span className="w-2 h-2 rounded-full" style={{ background:apiOnline===opt.key?opt.color:'#475569' }} />
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                style={{ background:'rgba(56,189,248,0.06)', border:'1px solid rgba(56,189,248,0.15)' }}>
                <Info size={13} className="flex-shrink-0 mt-0.5" style={{ color:'#38bdf8' }} />
                <p className="text-[11px] leading-relaxed" style={{ color:'#94a3b8' }}>
                  การเปลี่ยนแปลงจะมีผลทันทีหลังกดบันทึก
                </p>
              </div>
            </div>
          </div>

          {/* คู่มือ */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background:'#1a2540', border:'1px solid #2a3a5a' }}>
            <p className="text-xs font-bold text-white">จัดการคู่มือเติมเงิน</p>
            <div>
              <label className="text-xs mb-1 block" style={{ color:'#94a3b8' }}>วิธีเติมเงิน</label>
              <textarea value={form.topupGuide} onChange={e => setForm({...form,topupGuide:e.target.value})} rows={3}
                placeholder="เช่น: 1. เลือกจำนวนเพชร..."
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white resize-none focus:outline-none"
                style={{ background:'#0d1526', border:'1px solid #2a3a5a' }} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color:'#94a3b8' }}>วิธีค้นหา UID</label>
              <textarea value={form.uidGuide} onChange={e => setForm({...form,uidGuide:e.target.value})} rows={3}
                placeholder="เช่น: เข้าโปรไฟล์และคัดลอกรหัส..."
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white resize-none focus:outline-none"
                style={{ background:'#0d1526', border:'1px solid #2a3a5a' }} />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-400"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid #2a3a5a' }}>ยกเลิก</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background:'linear-gradient(135deg,#38bdf8,#818cf8)' }}>
              {loading?'กำลังบันทึก...':'บันทึกข้อมูลเกม'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddGameModal({ categories, onClose, onSuccess, token }: {
  categories: Category[]; onClose: () => void; onSuccess: () => void; token: string;
}) {
  const [form, setForm] = useState({ name:'', slug:'', label:'NONE', categoryId:'', image:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/games/admin`,
        { ...form, categoryId:form.categoryId||null },
        { headers: { Authorization:`Bearer ${token}` } });
      onSuccess(); onClose();
    } catch { setError('เกิดข้อผิดพลาด'); } finally { setLoading(false); }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload/game-image`, fd,
        { headers: { Authorization:`Bearer ${token}`, 'Content-Type':'multipart/form-data' } });
      const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').origin;
      setForm(f => ({ ...f, image:`${apiOrigin}${res.data.url}` }));
    } catch { toast.error('อัปโหลดไม่สำเร็จ'); } finally { setUploading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ background:'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background:'#111827', border:'1px solid #1e293b' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:'1px solid #1e293b' }}>
          <p className="text-sm font-bold text-white">เพิ่มเกมใหม่</p>
          <button onClick={onClose} style={{ color:'#64748b' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div><label className="text-xs text-gray-400 mb-1 block">ชื่อเกม *</label>
            <input value={form.name} onChange={e => setForm({...form,name:e.target.value,slug:e.target.value.toLowerCase().replace(/\s+/g,'-')})} required
              placeholder="Mobile Legends"
              className="w-full bg-[#0a0f1e] text-white px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:border-cyan-500" /></div>
          <div><label className="text-xs text-gray-400 mb-1 block">Slug *</label>
            <input value={form.slug} onChange={e => setForm({...form,slug:e.target.value})} required placeholder="mobile-legends"
              className="w-full bg-[#0a0f1e] text-white px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:border-cyan-500" /></div>
          <div><label className="text-xs text-gray-400 mb-1 block">หมวดหมู่</label>
            <select value={form.categoryId} onChange={e => setForm({...form,categoryId:e.target.value})}
              className="w-full bg-[#0a0f1e] text-white px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:border-cyan-500">
              <option value="">ไม่ระบุ</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">โลโก้เกม</label>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-full h-20 rounded-xl flex flex-col items-center justify-center gap-1.5"
              style={{ border:'2px dashed #2a3a5a', background:'#0d1526' }}>
              {form.image ? <img src={form.image} alt="" className="h-full object-contain rounded-xl" />
                : <><Upload size={14} style={{ color:'#38bdf8' }} />
                   <span className="text-xs" style={{ color:'#64748b' }}>{uploading?'กำลังอัปโหลด...':'คลิกเพื่ออัปโหลด'}</span></>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-400"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid #1e293b' }}>ยกเลิก</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background:'linear-gradient(135deg,#38bdf8,#818cf8)' }}>
              {loading?'กำลังบันทึก...':'เพิ่มเกม'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Game Card (mobile) ────────────────────────────────────────────
function GameCard({ g, onEdit, onPackage, onToggle, toggling }: {
  g: Game; onEdit: () => void; onPackage: () => void;
  onToggle: () => void; toggling: boolean;
}) {
  const cs = catStyle(g.category?.name);
  return (
    <div className="rounded-2xl p-4" style={{ background:'#0d1526', border:'1px solid #1e293b' }}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
          style={{ background:'#162032', border:'1px solid #1e293b' }}>
          {g.image ? <img src={g.image} alt={g.name} className="w-full h-full object-cover" /> : <span className="text-xl">🎮</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-white truncate">{g.name}</p>
            {!g.isActive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                style={{ background:'rgba(251,191,36,0.12)', color:'#fbbf24' }}>ปิด</span>
            )}
            {g.category?.name && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                style={{ background:cs.bg, color:cs.color }}>{g.category.name.slice(0,4).toUpperCase()}</span>
            )}
          </div>
          <p className="text-[11px] mt-0.5" style={{ color:'#475569' }}>ID: {g.slug.toUpperCase().slice(0,8)}</p>
        </div>
        <Toggle on={g.isActive} loading={toggling} onToggle={onToggle} />
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={onPackage}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
          style={{ background:'rgba(129,140,248,0.1)', color:'#818cf8', border:'1px solid rgba(129,140,248,0.2)' }}>
          <Package size={12} /> แพ็กเกจ
        </button>
        <button onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
          style={{ background:'rgba(255,255,255,0.05)', color:'#94a3b8', border:'1px solid #1e293b' }}>
          <Pencil size={12} /> แก้ไข
        </button>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function GamesAdminPage() {
  const { token, _hydrated } = useAdminAuth();
  const router = useRouter();
  const [games, setGames]           = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [catFilter, setCatFilter]   = useState('ทั้งหมด');
  const [page, setPage]             = useState(1);
  const [showAdd, setShowAdd]       = useState(false);
  const [editGame, setEditGame]     = useState<Game | null>(null);
  const [apiStatus, setApiStatus]   = useState<Record<string, ApiStatus>>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const checkedRef = useRef<Set<string>>(new Set());

  const fetchGames = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [gRes, cRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games/admin/all`, { headers: { Authorization:`Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`, { headers: { Authorization:`Bearer ${token}` } }),
      ]);
      setGames(gRes.data?.data ?? []);
      const cData = cRes.data;
      setCategories(Array.isArray(cData) ? cData : (cData?.data ?? []));
    } catch { console.error('fetch error'); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (_hydrated && token) fetchGames(); }, [_hydrated, token]);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/games/${id}/toggle`, {},
        { headers: { Authorization:`Bearer ${token}` } });
      setGames(prev => prev.map(g => g.id===id ? {...g,isActive:!g.isActive} : g));
    } catch {} finally { setTogglingId(null); }
  };

  const checkApiStatus = useCallback(async (slug: string) => {
    if (checkedRef.current.has(slug)) return;
    checkedRef.current.add(slug);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games/${slug}/api-status`,
        { headers: { Authorization:`Bearer ${token}` } });
      setApiStatus(prev => ({ ...prev, [slug]:{ online:res.data?.online??false } }));
    } catch { setApiStatus(prev => ({ ...prev, [slug]:{ online:false } })); }
  }, [token]);

  const filtered = games.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.slug.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter==='ทั้งหมด' || g.category?.name===catFilter;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, catFilter]);
  useEffect(() => { paginated.forEach(g => checkApiStatus(g.slug)); }, [paginated.map(g=>g.slug).join(',')]);

  const activeCount   = games.filter(g => g.isActive).length;
  const inactiveCount = games.filter(g => !g.isActive).length;
  const apiErrCount   = Object.values(apiStatus).filter(s => s && !s.online).length;

  const handleExport = () => {
    const rows = [['ชื่อเกม','Slug','หมวดหมู่','สถานะ','Label']];
    filtered.forEach(g => rows.push([g.name,g.slug,g.category?.name??'',g.isActive?'เปิด':'ปิด',g.label]));
    const csv = '\ufeff' + rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8' }));
    a.download = `games_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const catOptions = ['ทั้งหมด', ...Array.from(new Set(games.map(g=>g.category?.name).filter(Boolean) as string[]))];

  if (!_hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background:'#080c18' }}>
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5 space-y-4" style={{ fontFamily:"'Noto Sans Thai',sans-serif", background:'#080c18', minHeight:'100vh' }}>

      {showAdd && <AddGameModal categories={categories} onClose={() => setShowAdd(false)} onSuccess={fetchGames} token={token!} />}
      {editGame && <EditGameModal game={editGame} categories={categories} onClose={() => setEditGame(null)} onSuccess={fetchGames} token={token!} />}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-lg font-bold text-white">จัดการรายการเกม</h1>
          <p className="text-[10px] mt-0.5" style={{ color:'#64748b' }}>จัดการเกม, API และการแสดงผลหน้าบ้าน</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background:'linear-gradient(135deg,#38bdf8,#818cf8)' }}>
          <Plus size={14} /> เพิ่มเกม
        </button>
      </div>

      {/* Summary Cards — 2 col mobile, 4 col sm */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:'เกมทั้งหมด', value:games.length,  sub:'รายการ', border:'#1e293b',               accent:'#94a3b8', bg: 'from-slate-500/5 to-slate-500/10' },
          { label:'เปิดบริการ', value:activeCount,   sub:'เกม',    border:'rgba(34,197,94,0.4)',    accent:'#22c55e', bg: 'from-emerald-500/5 to-emerald-500/10' },
          { label:'ปิดปรับปรุง',value:inactiveCount, sub:'เกม',    border:'rgba(251,191,36,0.4)',   accent:'#fbbf24', bg: 'from-amber-500/5 to-amber-500/10' },
          { label:'API Error',  value:apiErrCount,   sub:'จุด',    border:'rgba(248,113,113,0.4)',  accent:'#f87171', bg: 'from-red-500/5 to-red-500/10' },
        ].map(c => (
          <div key={c.label} className={`rounded-2xl p-4.5 border border-border/40 bg-gradient-to-br ${c.bg} transition-all hover:scale-[1.02] duration-300 shadow-md`}>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{c.label}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tracking-tight" style={{ color:(c.label!=='เกมทั้งหมด'&&c.value>0)?c.accent:'white' }}>{c.value}</span>
              <span className="text-xs text-muted-foreground font-semibold">{c.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20 p-3 rounded-2xl border border-border/50">
        <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 bg-muted/40 border border-border/50 focus-within:border-cyan-500/60 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all duration-300">
          <Search size={14} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาเกม..."
            className="bg-transparent outline-none text-xs text-white placeholder-muted-foreground/60 flex-1 min-w-0" />
          {search && <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-white transition-colors"><X size={13} /></button>}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl text-xs font-semibold text-white focus:outline-none bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors"
              style={{ minWidth: 120 }}>
              {catOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">▾</span>
          </div>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-muted/40 text-muted-foreground hover:text-white border border-border/50 hover:bg-muted/60 transition-all cursor-pointer">
            <Download size={13} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Mobile: Cards / Desktop: Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({length:5}).map((_,i) => (
            <div key={i} className="rounded-2xl p-4 animate-pulse" style={{ background:'#0d1526', border:'1px solid #1e293b' }}>
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{ background:'#1e293b' }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 rounded" style={{ background:'#1e293b' }} />
                  <div className="h-2 w-20 rounded" style={{ background:'#1e293b' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color:'#475569' }}>ไม่พบเกม</div>
      ) : (
        <>
          {/* Mobile: Cards */}
          <div className="sm:hidden space-y-2">
            {paginated.map(g => (
              <GameCard key={g.id} g={g}
                onEdit={() => setEditGame(g)}
                onPackage={() => router.push(`/admin/games/${g.id}/packages`)}
                onToggle={() => handleToggle(g.id)}
                toggling={togglingId===g.id} />
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden sm:block rounded-2xl overflow-hidden shadow-xl" style={{ background:'#0d1526', border:'1px solid #1e293b' }}>
            <div className="grid text-[10px] font-bold uppercase tracking-wider px-6 py-4.5 gap-4"
              style={{ gridTemplateColumns:'2.5fr 0.8fr 1.6fr 0.8fr 0.7fr 80px', color:'#64748b', borderBottom:'1px solid #1e293b' }}>
              <span>ชื่อเกม</span><span>หมวดหมู่</span><span>รูปแบบ UID</span>
              <span>API</span><span>เปิด</span><span className="text-right">จัดการ</span>
            </div>
            {paginated.map((g,i) => {
              const cs  = catStyle(g.category?.name);
              const st  = apiStatus[g.slug];
              return (
                <div key={g.id} className="grid items-center px-6 py-4 gap-4 hover:bg-white/[0.02] transition duration-200"
                  style={{ gridTemplateColumns:'2.5fr 0.8fr 1.6fr 0.8fr 0.7fr 80px', borderBottom:i<paginated.length-1?'1px solid #1e293b':'none' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center bg-muted/40 border border-border/50 shadow-inner">
                      {g.image ? <img src={g.image} alt={g.name} className="w-full h-full object-cover" /> : <span className="text-sm">🎮</span>}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-white truncate">{g.name}</p>
                        {!g.isActive && <span className="text-[9px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 bg-amber-500/10 text-amber-500 border border-amber-500/20">ปิด</span>}
                        {g.label !== 'NONE' && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black flex-shrink-0 text-white uppercase tracking-wider ${
                            g.label === 'HOT' ? 'bg-red-600' : g.label === 'NEW' ? 'bg-blue-600' : 'bg-orange-600'
                          }`}>
                            {g.label}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-mono truncate">{g.slug}</p>
                    </div>
                  </div>
                  {g.category?.name
                    ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold w-fit"
                        style={{ background:cs.bg, color:cs.color, border: `1px solid ${cs.color}25` }}>{g.category.name.toUpperCase()}</span>
                    : <span className="text-muted-foreground/45">—</span>}
                  <div>{uidSummary(g.inputFields)}</div>
                  <div className="flex items-center gap-1.5">
                    {st==null
                      ? <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
                      : <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          st.online 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.online ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                          {st.online ? 'Online' : 'Offline'}
                        </span>
                    }
                  </div>
                  <Toggle on={g.isActive} loading={togglingId===g.id} onToggle={() => handleToggle(g.id)} />
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => router.push(`/admin/games/${g.id}/packages`)} title="แพ็กเกจ"
                      className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all cursor-pointer">
                      <Package size={13} />
                    </button>
                    <button onClick={() => setEditGame(g)} title="แก้ไข"
                      className="w-8 h-8 rounded-xl flex items-center justify-center bg-muted/60 text-muted-foreground border border-border hover:bg-muted hover:text-white transition-all cursor-pointer">
                      <Pencil size={13} />
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
          <p className="text-xs" style={{ color:'#475569' }}>
            {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)} / {filtered.length} เกม
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
              style={{ border:'1px solid #1e293b', color:'#94a3b8' }}><ChevronLeft size={14} /></button>
            {Array.from({length:Math.min(5,totalPages)},(_,i) => {
              const p = Math.max(1,Math.min(page-2,totalPages-4))+i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg text-xs font-semibold"
                  style={p===page
                    ? { background:'rgba(56,189,248,0.15)', color:'#38bdf8', border:'1px solid rgba(56,189,248,0.3)' }
                    : { color:'#64748b', border:'1px solid #1e293b' }}>{p}</button>
              );
            })}
            <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
              style={{ border:'1px solid #1e293b', color:'#94a3b8' }}><ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
