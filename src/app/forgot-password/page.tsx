"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Gamepad2, Loader2, ArrowLeft, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useTheme } from "next-themes";

export default function ForgotPasswordPage() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    const currentTheme = mounted ? (resolvedTheme ?? "dark") : "dark";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error("กรุณากรอก Email");
            return;
        }

        setIsLoading(true);
        try {
            await api.sendOtp({ email });
            setSent(true);
            toast.success("ส่งรหัส OTP ไปยังอีเมลแล้ว");
        } catch (error: any) {
            toast.error(error.message || "เกิดข้อผิดพลาด");
        } finally {
            setIsLoading(false);
        }
    };

    if (sent) {
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
                    </div>

                    <Card className="glass-card border-border/50">
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-2xl font-bold text-center">ตรวจสอบอีเมล</CardTitle>
                            <CardDescription className="text-center">
                                เราได้ส่งรหัส OTP ไปยัง
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/30">
                                <Mail className="w-12 h-12 mx-auto mb-3 text-primary" />
                                <p className="font-medium text-foreground">{email}</p>
                            </div>

                            <p className="text-sm text-muted-foreground text-center">
                                กรุณาตรวจสอบอีเมลและกรอกรหัส OTP 6 หลัก
                                <br />
                                รหัส OTP จะหมดอายุใน 10 นาที
                            </p>

                            <Link href={`/verify-otp?email=${encodeURIComponent(email)}`}>
                                <Button className="w-full bg-foreground hover:bg-foreground/90 text-background font-semibold transition-all">
                                    ไปกรอกรหัส OTP
                                </Button>
                            </Link>

                            <Link href="/forgot-password">
                                <Button variant="ghost" className="w-full">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    ส่งรหัส OTP ใหม่
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
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
                    <p className="text-muted-foreground">รีเซ็ตรหัสผ่านของคุณ</p>
                </div>

                <Card className="glass-card border-border/50">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-2xl font-bold text-center">ลืมรหัสผ่าน</CardTitle>
                        <CardDescription className="text-center">
                            กรอกอีเมลของคุณเพื่อรับรหัส OTP
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-muted/50 border-border/50 focus:border-primary"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-foreground hover:bg-foreground/90 text-background font-semibold h-11 transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "ส่งรหัส OTP"
                                )}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-muted-foreground mt-6">
                            จำรหัสผ่านได้แล้ว?{" "}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                เข้าสู่ระบบ
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
