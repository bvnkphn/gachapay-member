"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Gamepad2, Loader2, Eye, EyeOff, Check, X, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useTheme } from "next-themes";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get("email");

    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [otpData, setOtpData] = useState<{ email: string; otp: string; timestamp: number } | null>(null);

    useEffect(() => { setMounted(true); }, []);
    const currentTheme = mounted ? (resolvedTheme ?? "dark") : "dark";

    useEffect(() => {
        // Get OTP data from sessionStorage
        const storedData = sessionStorage.getItem("otp_data");
        if (!storedData || !emailParam) {
            router.push("/forgot-password");
            return;
        }

        try {
            const data = JSON.parse(storedData);
            // Check if OTP data is still valid (within 10 minutes)
            const now = Date.now();
            const elapsed = now - data.timestamp;
            if (elapsed > 600000) { // 10 minutes
                toast.error("รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่");
                sessionStorage.removeItem("otp_data");
                router.push("/forgot-password");
                return;
            }

            if (data.email !== emailParam) {
                router.push("/forgot-password");
                return;
            }

            setOtpData(data);
        } catch (error) {
            router.push("/forgot-password");
        }
    }, [emailParam, router]);

    const passwordChecks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>-]/.test(password),
        match: password === confirmPassword && confirmPassword !== "",
    };

    const isPasswordValid = Object.values(passwordChecks).every(Boolean);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otpData || !isPasswordValid) {
            toast.error("กรุณาตั้งรหัสผ่านตามเงื่อนไขที่กำหนด");
            return;
        }

        setIsLoading(true);
        try {
            await api.verifyOtp({
                email: otpData.email,
                otp: otpData.otp,
                newPassword: password,
            });
            toast.success("รีเซ็ตรหัสผ่านสำเร็จ");
            sessionStorage.removeItem("otp_data");
            router.push("/login");
        } catch (error: any) {
            toast.error(error.message || "รีเซ็ตรหัสผ่านไม่สำเร็จ");
            // If OTP is invalid, redirect back to forgot-password
            if (error.message?.includes("OTP") || error.message?.includes("expired")) {
                sessionStorage.removeItem("otp_data");
                setTimeout(() => router.push("/forgot-password"), 2000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!otpData) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative">
            {/* Theme Toggle Button */}
            <div className="fixed top-4 right-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    className="w-9 h-9 rounded-full bg-background/50 backdrop-blur-md border-primary/20 hover:border-primary/40 text-foreground transition-all duration-300 shadow-md shadow-primary/5"
                    onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                >
                    {currentTheme === "dark" ? <Sun className="w-4 h-4 text-primary animate-pulse" /> : <Moon className="w-4 h-4 text-secondary" />}
                </Button>
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
                    <p className="text-muted-foreground">ตั้งรหัสผ่านใหม่</p>
                </div>

                <Card className="glass-card border-border/50">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-2xl font-bold text-center">รีเซ็ตรหัสผ่าน</CardTitle>
                        <CardDescription className="text-center">
                            กรอกรหัสผ่านใหม่ของคุณ
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">รหัสผ่านใหม่</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 bg-muted/50 border-border/50 focus:border-primary"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 pr-10 bg-muted/50 border-border/50 focus:border-primary"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {password && (
                                <div className="space-y-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">รหัสผ่านต้องมี:</p>
                                    <div className="space-y-1">
                                        <PasswordCheck checked={passwordChecks.length} text="อย่างน้อย 8 ตัวอักษร" />
                                        <PasswordCheck checked={passwordChecks.uppercase} text="ตัวพิมพ์ใหญ่ (A-Z)" />
                                        <PasswordCheck checked={passwordChecks.lowercase} text="ตัวพิมพ์เล็ก (a-z)" />
                                        <PasswordCheck checked={passwordChecks.number} text="ตัวเลข (0-9)" />
                                        <PasswordCheck checked={passwordChecks.special} text="อักขระพิเศษ (!@#$%^&*) อย่างน้อย 1 ตัว" />
                                        <PasswordCheck checked={passwordChecks.match} text="รหัสผ่านตรงกัน" />
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-foreground hover:bg-foreground/90 text-background font-semibold h-11 transition-all"
                                disabled={isLoading || !isPasswordValid}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "รีเซ็ตรหัสผ่าน"
                                )}
                            </Button>
                        </form>

                        <Link href="/forgot-password">
                            <Button variant="ghost" className="w-full">
                                ยกเลิก
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}

function PasswordCheck({ checked, text }: { checked: boolean; text: string }) {
    return (
        <div
            className={`flex items-center gap-2 text-xs transition-all duration-300 ${checked ? "opacity-100" : "text-muted-foreground opacity-70"
                }`}
            style={{ color: checked ? "#26FF95" : undefined }}
        >
            {checked ? (
                <Check
                    className="w-3.5 h-3.5"
                    style={{ filter: "drop-shadow(0 0 2px #26FF95)" }}
                />
            ) : (
                <X className="w-3.5 h-3.5 opacity-50" />
            )}
            <span className={checked ? "font-medium" : ""}>
                {text}
            </span>
        </div>
    );
}
