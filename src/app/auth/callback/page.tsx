"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuth } = useAuth();

    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            // Decode JWT to get user info (simple decode, not verification)
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));

                // Set auth with token
                setAuth(
                    {
                        id: payload.sub,
                        email: payload.email,
                        name: payload.name,
                        avatar: payload.avatar,
                    },
                    token
                );

                toast.success("เข้าสู่ระบบสำเร็จ");
                router.push("/");
            } catch (error) {
                toast.error("เข้าสู่ระบบไม่สำเร็จ");
                router.push("/login");
            }
        } else {
            toast.error("ไม่พบ token");
            router.push("/login");
        }
    }, [searchParams, setAuth, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">กำลังเข้าสู่ระบบ...</p>
            </div>
        </div>
    );
}
