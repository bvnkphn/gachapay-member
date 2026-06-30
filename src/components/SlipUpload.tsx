import React, { useState } from 'react';
import { api } from '@/lib/api';

type Props = {
  referenceId: string;
  bankCode?: string;
  onDone?: (result: any) => void;
};

export default function SlipUpload({ referenceId, bankCode, onDone }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png'];

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setStatus(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return setFile(null);
    if (!ALLOWED.includes(f.type)) return setStatus('ไฟล์ต้องเป็น .jpg/.jpeg/.png เท่านั้น');
    if (f.size > MAX_SIZE) return setStatus('ขนาดไฟล์ต้องไม่เกิน 10MB');
    setFile(f);
  }

  async function upload() {
    if (!file) return setStatus('กรุณาเลือกรูปสลิปก่อน');
    setLoading(true);
    setStatus('กำลังอัปโหลด...');
    try {
      const uploadResult = await api.uploadSlip(file);
      const slipUrl = uploadResult.url || uploadResult.data?.url || uploadResult.slipUrl;
      if (!slipUrl) throw new Error('invalid upload response');

      setStatus('ส่งสลิปไปยังระบบ, กำลังรอผลตรวจสอบ...');
      const submitJson = await api.submitSlip(referenceId, slipUrl, bankCode);
      setStatus('ส่งสำเร็จ — ผลการตรวจสอบ: ' + (submitJson.status || 'รอดำเนินการ'));
      onDone?.(submitJson);
    } catch (err: any) {
      setStatus(err?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="slip-upload">
      <label>
        เลือกไฟล์สลิป (jpg, jpeg, png) — ขนาด ≤ 10MB
        <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={onFileChange} />
      </label>
      <div style={{ marginTop: 8 }}>
        <button type="button" onClick={upload} disabled={loading || !file}>
          {loading ? 'กำลังส่ง...' : 'อัปโหลดสลิป'}
        </button>
      </div>
      {status && <div style={{ marginTop: 8 }}>{status}</div>}
    </div>
  );
}
