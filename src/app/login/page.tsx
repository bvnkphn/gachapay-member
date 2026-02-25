"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Gamepad2, Loader2, Facebook } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("กรุณากรอก Email และ Password");
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.login({ email, password });
            setAuth(response.user, response.token);
            toast.success("เข้าสู่ระบบสำเร็จ");
            router.push("/");
        } catch (error: any) {
            toast.error(error.message || "Email หรือรหัสผ่านไม่ถูกต้อง");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    };

    const handleFacebookSignIn = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 pb-24">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8 pt-20">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-cyber flex items-center justify-center glow-primary">
                            <Gamepad2 className="w-7 h-7 text-background" />
                        </div>
                        <span className="text-3xl font-bold text-glow">CYBERPAY</span>
                    </div>
                    <p className="text-muted-foreground">เข้าสู่ระบบเพื่อเติมเกมได้ทันที</p>
                </div>

                <Card className="glass-card border-border/50">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-2xl font-bold text-center">เข้าสู่ระบบ</CardTitle>
                        <CardDescription className="text-center">
                            กรอก Email และ Password เพื่อเข้าสู่ระบบ
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Input */}
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

                            {/* Password Input */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
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
                                    ลืมรหัสผ่าน?
                                </Link>
                            </div>

                            {/* Login Button */}
                            <Button
                                type="submit"
                                className="w-full bg-gradient-cyber hover:opacity-90 text-background font-semibold h-11 pulse-glow"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "เข้าสู่ระบบ"
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/50" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">OR</span>
                            </div>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="space-y-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full bg-background hover:bg-muted/50"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                            >
                                <FcGoogle className="mr-2 h-5 w-5" />
                                Google
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full bg-[#1877F2]/10 border-[#1877F2]/30 text-[#1877F2] hover:bg-[#1877F2]/20"
                                onClick={handleFacebookSignIn}
                                disabled={isLoading}
                            >
                                <Facebook className="mr-2 h-5 w-5 fill-current" />
                                Facebook
                            </Button>
                        </div>

                        {/* Register Link */}
                        <p className="text-center text-sm text-muted-foreground mt-6">
                            ยังไม่มีบัญชี?{" "}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                สมัครสมาชิก
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
