'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminId = searchParams.get('adminId');

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:3000/auth/verify-otp', {
        adminId,
        code,
      });

      Cookies.set('access_token', res.data.access_token);
      router.push('/dashboard');
    } catch (err) {
      setError('OTP ไม่ถูกต้องหรือหมดอายุแล้ว');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          ยืนยัน OTP
        </h1>
        <p className="text-gray-400 text-center mb-6 text-sm">
          กรุณาตรวจสอบ OTP ที่ส่งไปยัง Email ของคุณ
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">รหัส OTP</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'กำลังตรวจสอบ...' : 'ยืนยัน OTP'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full text-gray-400 hover:text-white text-sm text-center"
          >
            กลับหน้า Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-lg">กำลังโหลด...</p>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}