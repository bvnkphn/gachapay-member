"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Wrench, ShieldAlert, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

function MaintenanceContent() {
  const searchParams = useSearchParams();
  const rawMsg = searchParams.get("msg") || "";
  const decodedMsg = rawMsg ? decodeURIComponent(rawMsg) : "";
  const message = decodedMsg || "ระบบเติมเงิน GachaPay กำลังปิดปรับปรุงชั่วคราว เพื่อยกระดับความเสถียรและประสิทธิภาพการบริการที่ดีขึ้น";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800 dark:bg-[#0b0f19] dark:text-slate-100 transition-all duration-300">
      {/* Decorative Blur Background circles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-sky-500/5 dark:bg-sky-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-[#141b2d] border border-slate-200 dark:border-slate-800/80 p-8 sm:p-10 rounded-3xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center space-y-6">
        
        {/* Animated icon container */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/20 shadow-md">
          <Wrench className="w-10 h-10 text-sky-500 animate-[spin_6s_linear_infinite]" />
          <ShieldAlert className="absolute -bottom-1 -right-1 w-6 h-6 text-amber-500 bg-white dark:bg-[#141b2d] rounded-full p-0.5" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            ขออภัย ระบบปิดปรับปรุงชั่วคราว
          </h1>
          <p className="text-[10px] tracking-widest uppercase font-mono text-sky-500 font-bold">
            System Maintenance Mode
          </p>
        </div>

        {/* Divider */}
        <div className="w-16 h-1 bg-gradient-to-r from-sky-400 to-indigo-500 mx-auto rounded-full" />

        {/* Message block */}
        <div className="rounded-2xl p-5 bg-slate-50 dark:bg-[#1c2640]/40 border border-slate-100 dark:border-slate-800/60">
          <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
            {message}
          </p>
        </div>

        {/* Notice text */}
        <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
          * ข้อมูลยอดเหรียญ (Coin) และรายการเติมเงินของคุณได้รับการคุ้มครองอย่างปลอดภัย 100% ระบบจะเปิดใช้งานโดยเร็วที่สุดหลังดำเนินการเสร็จสิ้น
        </p>

        {/* Contact/Support Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <a
            href="mailto:support@gachapay.in.th"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141b2d] hover:bg-slate-50 dark:hover:bg-[#1c2640]/55 transition text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            <Mail size={14} />
            ติดต่อฝ่ายบริการลูกค้า
          </a>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white text-xs font-bold transition shadow-md"
          >
            <ArrowLeft size={14} />
            ลองเข้าใช้งานอีกครั้ง
          </Link>
        </div>

      </div>

      {/* Footer brand */}
      <div className="mt-8 text-center text-slate-400 dark:text-slate-600 select-none pointer-events-none">
        <span className="text-xs font-bold tracking-wider">GACHAPAY © 2026</span>
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19]">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MaintenanceContent />
    </Suspense>
  );
}
