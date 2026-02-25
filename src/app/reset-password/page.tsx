"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Gamepad2, Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

        if (!token) {
            toast.error("ไม่พบ token");
            return;
        }

        if (!isPasswordValid) {
            toast.error("กรุณาตั้งรหัสผ่านตามเงื่อนไขที่กำหนด");
            return;
        }

        setIsLoading(true);
        try {
            await api.resetPassword({ token, password });
            toast.success("รีเซ็ตรหัสผ่านสำเร็จ");
            router.push("/login");
        } catch (error: any) {
            toast.error(error.message || "รีเซ็ตรหัสผ่านไม่สำเร็จ");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12 pb-24">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8 pt-20">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-cyber flex items-center justify-center glow-primary">
                                <Gamepad2 className="w-7 h-7 text-background" />
                            </div>
                            <span className="text-3xl font-bold text-glow">CYBERPAY</span>
                        </div>
                    </div>

                    <Card className="glass-card border-border/50">
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-2xl font-bold text-center">ลิงก์ไม่ถูกต้อง</CardTitle>
                            <CardDescription className="text-center">
                                ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/forgot-password">
                                <Button className="w-full bg-gradient-cyber hover:opacity-90 text-background font-semibold">
                                    ขอลิงก์ใหม่
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 pb-24">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 pt-20">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-cyber flex items-center justify-center glow-primary">
                            <Gamepad2 className="w-7 h-7 text-background" />
                        </div>
                        <span className="text-3xl font-bold text-glow">CYBERPAY</span>
                    </div>
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
                                className="w-full bg-gradient-cyber hover:opacity-90 text-background font-semibold h-11 pulse-glow"
                                disabled={isLoading || !isPasswordValid}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "รีเซ็ตรหัสผ่าน"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
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
