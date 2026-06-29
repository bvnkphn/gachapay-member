"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Gamepad2, Loader2, ArrowLeft, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/language-context";

function VerifyOtpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const { setTheme, resolvedTheme } = useTheme();
    const { translateError } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(600); // 10 minutes
    const [canResend, setCanResend] = useState(false);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => { setMounted(true); }, []);
    const currentTheme = mounted ? (resolvedTheme ?? "dark") : "dark";

    useEffect(() => {
        if (!email) {
            router.push("/forgot-password");
        }
    }, [email, router]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedDevOtp = sessionStorage.getItem("dev_otp");
            if (savedDevOtp && savedDevOtp.length === 6) {
                setOtp(savedDevOtp.split(""));
                toast.warning(`[โหมดพัฒนา] ตรวจพบรหัส OTP ในระบบจำลอง: ${savedDevOtp} (กรอกอัตโนมัติให้แล้ว)`, { duration: 8000 });
                sessionStorage.removeItem("dev_otp");
            }
        }
    }, [email]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split("");
        setOtp([...newOtp, ...Array(6 - newOtp.length).fill("")]);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    const otpComplete = otp.every((digit) => digit !== "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !otpComplete) {
            toast.error("กรุณากรอกรหัส OTP ให้ครบถ้วน");
            return;
        }

        // Store OTP in sessionStorage and redirect to reset-password
        sessionStorage.setItem("otp_data", JSON.stringify({
            email,
            otp: otp.join(""),
            timestamp: Date.now()
        }));

        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    };

    const handleResendOtp = async () => {
        if (!canResend || !email) return;

        try {
            await api.sendOtp({ email });
            toast.success("ส่งรหัส OTP ใหม่แล้ว");
            setCountdown(600);
            setCanResend(false);
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            toast.error(translateError(error.message));
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (!email) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
            {/* Theme Toggle Button */}
            <div className="fixed top-4 right-4 z-50">
                <button
                    type="button"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-foreground text-background hover:opacity-90 transition-all duration-300 shadow-lg"
                    onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                >
                    {currentTheme === "dark" ? <Sun className="w-4 h-4 text-background" /> : <Moon className="w-4 h-4 text-background" />}
                </button>
            </div>
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <Link href="/" className="inline-flex items-center gap-3 mb-4 select-none hover:opacity-90 transition-opacity">
                        {/* Glowing Icon Badge */}
                        <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 border border-primary/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                            <Gamepad2 className="w-7 h-7 text-primary drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]" />
                        </div>
                        {/* Text Logo */}
                        <span className="text-3xl font-black tracking-widest text-primary drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                            GACHA<span className="text-foreground dark:text-white drop-shadow-none">PAY</span>
                        </span>
                    </Link>
                    <p className="text-muted-foreground">ยืนยันรหัส OTP</p>
                </div>

                <Card className="glass-card border-border/50">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-2xl font-bold text-center">กรอกรหัส OTP</CardTitle>
                        <CardDescription className="text-center">
                            เราได้ส่งรหัส 6 หลักไปที่
                            <br />
                            <span className="text-primary font-medium">{email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* OTP Input */}
                            <div className="space-y-2">
                                <Label className="text-center block">รหัส OTP</Label>
                                <div className="flex gap-2 justify-center">
                                    {otp.map((digit, index) => (
                                        <Input
                                            key={index}
                                            ref={(el) => {
                                                inputRefs.current[index] = el;
                                            }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={handlePaste}
                                            className="w-12 h-14 text-center text-2xl font-bold bg-muted/50 border-border/50 focus:border-primary"
                                            disabled={isLoading}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Countdown */}
                            <div className="text-center">
                                {countdown > 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        รหัส OTP จะหมดอายุใน{" "}
                                        <span className="text-primary font-medium">{formatTime(countdown)}</span>
                                    </p>
                                ) : (
                                    <p className="text-sm text-destructive">รหัส OTP หมดอายุแล้ว</p>
                                )}
                            </div>

                            {/* Resend Button */}
                            <div className="text-center">
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={handleResendOtp}
                                    disabled={!canResend}
                                    className="text-sm"
                                >
                                    ส่งรหัส OTP ใหม่
                                </Button>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-foreground hover:bg-foreground/90 text-background font-semibold h-11 transition-all"
                                disabled={isLoading || !otpComplete || countdown === 0}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ยืนยัน OTP"}
                            </Button>
                        </form>

                        <Link href="/forgot-password">
                            <Button variant="ghost" className="w-full">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                กลับไปหน้าลืมรหัสผ่าน
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <VerifyOtpContent />
        </Suspense>
    );
}

