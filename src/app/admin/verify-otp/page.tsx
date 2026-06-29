'use client';

import { useState, useEffect, Suspense } from 'react';
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

  // Auto-fill dev OTP
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDevOtp = sessionStorage.getItem("dev_otp");
      if (savedDevOtp && savedDevOtp.length === 6) {
        setCode(savedDevOtp);
        sessionStorage.removeItem("dev_otp");
      }
    }
  }, []);

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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-foreground">GameTopUp </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Admin</span>
          </h1>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl p-8 shadow-xl border border-border/80">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground text-center mb-1">ยืนยัน OTP</h2>
          <p className="text-muted-foreground text-sm text-center mb-6">
            กรุณาตรวจสอบ OTP ที่ส่งไปยัง Email ของคุณ
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="text-muted-foreground text-sm mb-1.5 block">รหัส OTP</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-muted/20 text-foreground px-4 py-3 rounded-xl border border-border/80 focus:outline-none focus:border-cyan-500 transition text-center text-2xl tracking-widest placeholder:text-muted-foreground/30"
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
              onClick={() => router.push('/login')}
              className="w-full text-muted-foreground hover:text-foreground text-sm text-center transition"
            >
              กลับหน้า Login
            </button>
          </form>

          {/* Dev OTP Simulator Controller */}
          <div className="w-full mt-6 pt-4 border-t border-border/80">
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  const res = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-admin-otp`,
                    { userId, otp: '999999' }
                  );
                  setAuth(res.data.user, res.data.token);
                  router.push('/admin');
                } catch (err) {
                  setError('OTP Bypass ล้มเหลว');
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full py-2.5 rounded-xl border border-dashed border-yellow-500/30 hover:border-yellow-500/60 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
            >
              🛠️ เข้าสู่ระบบแอดมินทันที (Dev Bypass: 999999)
            </button>
          </div>
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

