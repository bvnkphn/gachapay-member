'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { ShieldCheck, Gamepad2 } from 'lucide-react';
import { useAdminAuth } from '@/hooks/use-admin-auth';

function VerifyAdminOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const { setAuth } = useAdminAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-admin-otp`,
        { userId, otp: code }
      );

      setAuth(res.data.user, res.data.token);
      router.push('/admin');
    } catch (err) {
      setError('OTP ไม่ถูกต้องหรือหมดอายุแล้ว');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-white">GameTopUp </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Admin</span>
          </h1>
        </div>

        {/* Card */}
        <div className="bg-[#1a1a2e] rounded-2xl p-8 shadow-xl border border-white/5">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white text-center mb-1">ยืนยัน OTP</h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            กรุณาตรวจสอบ OTP ที่ส่งไปยัง Email ของคุณ
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-1.5 block">รหัส OTP</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-[#0f0f1a] text-white px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 transition text-center text-2xl tracking-widest placeholder:text-gray-600"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
            >
              {loading ? 'กำลังตรวจสอบ...' : 'ยืนยัน OTP'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/admin/login-admin')}
              className="w-full text-gray-400 hover:text-white text-sm text-center transition"
            >
              กลับหน้า Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VerifyAdminOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <p className="text-white text-lg">กำลังโหลด...</p>
      </div>
    }>
      <VerifyAdminOtpContent />
    </Suspense>
  );
}

