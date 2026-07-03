"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Gamepad2, Loader2, Sun, Moon } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useLanguage } from "@/components/language-context";
import { useTheme } from "next-themes";

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuth();
    const { setAuth: setAdminAuth } = useAdminAuth();
    const { lang, t, translateError } = useLanguage();
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    const currentTheme = mounted ? (resolvedTheme ?? "dark") : "dark";

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("expired") === "true") {
                const err = params.get("err");
                const endpoint = params.get("endpoint");
                const detailMsg = err && endpoint ? ` (${endpoint} -> ${err})` : "";
                // Wait briefly for component mount toast support
                setTimeout(() => {
                    toast.error(`เซสชันการใช้งานหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง${detailMsg}`);
                }, 100);
                router.replace("/login");
            }
        }
    }, [router]);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error(t.errorEmpty);
            return;
        }
        if (!validateEmail(email)) {
            toast.error(t.errorEmail);
            return;
        }
        if (password.length < 8) {
            toast.error(t.errorPassword);
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.login({ email, password });
            
            if (response.requireOtp) {
                if (response._dev_otp) {
                    sessionStorage.setItem("dev_otp", response._dev_otp);
                    toast.warning(`[โหมดพัฒนา] รหัส OTP ของคุณคือ: ${response._dev_otp}`, { duration: 10000 });
                } else {
                    toast.success("กรุณากรอกรหัส OTP ที่ส่งไปยัง Email");
                }
                router.push(`/admin/verify-otp?userId=${response.userId}`);
                return;
            }

            if (response.user && response.user.role === "ADMIN") {
                setAdminAuth(response.user, response.token);
                toast.success("เข้าสู่ระบบผู้ดูแลระบบสำเร็จ");
                router.push("/admin");
            } else {
                setAuth(response.user, response.token);
                toast.success(t.success);
                const searchParams = new URLSearchParams(window.location.search);
                const redirectPath = searchParams.get("redirect");
                if (redirectPath) {
                    router.push(redirectPath);
                } else {
                    router.push("/");
                }
            }
        } catch (error: any) {
            toast.error(translateError(error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-5">
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

                <Card className="glass-card border-border/50 relative overflow-visible">
                    {/* Theme Toggle Button */}
                    <div className="absolute top-4 right-4 z-10">
                        <button
                            type="button"
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 text-foreground transition-all duration-300 shadow-sm"
                            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                        >
                            {currentTheme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                    <CardHeader className="pt-5 pb-2 px-6 space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">{t.login}</CardTitle>
                        <CardDescription className="text-center text-xs">
                            {t.desc}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <Label htmlFor="email">{t.email}</Label>
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

                            {/* Password Input */}
                            <div className="space-y-2">
                                <Label htmlFor="password">{t.password}</Label>
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

                            {/* Forgot Password Link */}
                            <div className="flex justify-end">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-primary hover:underline"
                                >
                                    {t.forgot}
                                </Link>
                            </div>

                            {/* Login Button */}
                            <Button
                                type="submit"
                                className="w-full bg-foreground hover:bg-foreground/90 text-background font-semibold h-11 transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    t.login
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/50" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">{t.divider}</span>
                            </div>
                        </div>
                        {/* Social Login Buttons */}
                        <div className="space-y-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full bg-background/40 hover:bg-muted/50 border-border/50 text-foreground transition-all h-11"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                            >
                                <FcGoogle className="mr-2 h-5 w-5 shrink-0" />
                                <span className="truncate">{t.google}</span>
                            </Button>
                        </div>

                        {/* Register Link */}
                        <p className="text-center text-sm text-muted-foreground mt-6">
                            {t.noAccount} {" "}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                {t.register}
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
