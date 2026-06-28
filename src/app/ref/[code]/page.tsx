"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ReferralRedirectPage() {
    const router = useRouter();
    const params = useParams();
    const code = params.code as string;

    useEffect(() => {
        if (code) {
            localStorage.setItem("referredBy", code);
        }
        router.replace("/register");
    }, [code, router]);

    return (
        <div className="min-h-screen bg-[#080c18] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-xs font-semibold">กำลังเชื่อมโยงลิงก์เชิญเพื่อน...</p>
            </div>
        </div>
    );
}
