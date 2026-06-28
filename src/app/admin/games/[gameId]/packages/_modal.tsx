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
    flashSaleEnd:   toDatetimeLocal(pkg?.flashSale.end ?? null),
    quota:          pkg?.quota.limit ?? '',
    isActive:       pkg?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  // เมื่อเปลี่ยน promo dropdown → reset flash sale fields
  const handlePromoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setForm(f => ({
      ...f,
      promo: val,
      flashSalePrice: val === 'none' ? '' : f.flashSalePrice,
      flashSaleStart: val === 'none' ? '' : f.flashSaleStart,
      flashSaleEnd:   val === 'none' ? '' : f.flashSaleEnd,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const body: Record<string, any> = {
      price:    Number(form.price),
      isActive: form.isActive,
      quota:    form.quota !== '' ? Number(form.quota) : null,
    };
    if (form.promo !== 'none' && form.flashSalePrice !== '' && form.flashSaleStart && form.flashSaleEnd) {
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
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'เกิดข้อผิดพลาด');
    } finally { setLoading(false); }
  };

  // countdown จากช่วง flash sale
  const endDate   = form.flashSaleEnd   ? new Date(form.flashSaleEnd)   : null;
  const startDate = form.flashSaleStart ? new Date(form.flashSaleStart) : null;
  const diffMs    = endDate && startDate ? endDate.getTime() - startDate.getTime() : 0;
  const hh = Math.floor(diffMs / 3600000);
  const mm = Math.floor((diffMs % 3600000) / 60000);
  const ss = Math.floor((diffMs % 60000) / 1000);
  const countdown = diffMs > 0
    ? `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
    : '';

  const showFlash = form.promo === 'flash_sale' || form.promo === 'happy_hour';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#111827', border: '1px solid #1e293b' }}>

        {/* Header */}
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
              <div className="px-3 py-2.5 text-sm font-semibold bg-transparent" style={{ color: '#64748b' }}>
                {isEdit ? pkg!.cost : '—'}
              </div>
            </Field>
          </div>

          {/* แต้มสะสม + โปรโมชั่น */}
          <div className="grid grid-cols-2 gap-3">
            {/* แต้มสะสม — แก้ได้ (UI only) */}
            <Field label="แต้มสะสม (EXP)" prefix="◆">
              <TextInput noBg type="number" min="0" value={form.diamond}
                onChange={e => setForm(f => ({ ...f, diamond: Number(e.target.value) }))} placeholder="0" />
            </Field>
            {/* โปรโมชั่น — dropdown */}
            <Field label="โปรโมชั่น">
              <div className="relative">
                <select value={form.promo} onChange={handlePromoChange}
                  className="w-full px-3 py-2.5 text-sm text-white rounded-xl appearance-none focus:outline-none pr-8"
                  style={{ background: '#0d1526', border: '1px solid #1e293b' }}>
                  <option value="none">ไม่มีโปรโมชั่น</option>
                  <option value="flash_sale">Flash Sale</option>
                  <option value="happy_hour">Happy Hour</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▾</span>
              </div>
            </Field>
          </div>

          {/* Flash Sale fields — แสดงเฉพาะเมื่อเลือก flash/happy */}
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
                  <TextInput noBg type="number" min="0" step="0.01" value={form.flashSalePrice}
                    onChange={set('flashSalePrice')} placeholder="0.00" />
                </Field>
                <div />
                <Field label="เริ่มต้น">
                  <TextInput type="datetime-local" value={form.flashSaleStart} onChange={set('flashSaleStart')} />
                </Field>
                <Field label="สิ้นสุด">
                  <TextInput type="datetime-local" value={form.flashSaleEnd} onChange={set('flashSaleEnd')} />
                </Field>
              </div>
              {/* Countdown */}
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