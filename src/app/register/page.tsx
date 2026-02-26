"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Gamepad2, Loader2, Check, X, Facebook } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export default function RegisterPage() {
    const router = useRouter();
    const { setAuth } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    // Password validation
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

        if (!email || !password || !confirmPassword) {
            toast.error("กรุณากรอกข้อมูลให้ครบทุกช่อง");
            return;
        }

        if (!acceptedTerms) {
            toast.error("กรุณายอมรับข้อกำหนดในการให้บริการ");
            return;
        }

        if (!isPasswordValid) {
            toast.error("กรุณาตั้งรหัสผ่านตามเงื่อนไขที่กำหนด");
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.register({ email, password });
            setAuth(response.user, response.token);
            toast.success("สมัครสมาชิกสำเร็จ!");
            router.push("/");
        } catch (error: any) {
            toast.error(error.message || "สมัครสมาชิกไม่สำเร็จ");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    };

    const handleFacebookSignUp = () => {
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
                    <p className="text-muted-foreground">สมัครสมาชิกเพื่อเริ่มเติมเกม</p>
                </div>

                <Card className="glass-card border-border/50">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-2xl font-bold text-center">สมัครสมาชิก</CardTitle>
                        <CardDescription className="text-center">
                            สร้างบัญชีใหม่เพื่อเริ่มใช้งาน
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

                            {/* Confirm Password Input */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">ยืนยัน Password</Label>
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

                            {/* Password Requirements */}
                            {password && (
                                <div className="space-y-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">รหัสผ่านต้องมี:</p>
                                    <div className="space-y-1">
                                        <PasswordCheck checked={passwordChecks.length} text="อย่างน้อย 8 ตัวอักษร" />
                                        <PasswordCheck checked={passwordChecks.uppercase && passwordChecks.lowercase} text="ตัวอักษรพิมพ์ใหญ่ (A-Z) และ ตัวอักษรพิมพ์เล็ก (a-z)" />
                                        <PasswordCheck checked={passwordChecks.number} text="ตัวเลข (0-9) อย่างน้อย 1 ตัว" />
                                        <PasswordCheck checked={passwordChecks.special} text="อักขระพิเศษ (!@#$%^&*) อย่างน้อย 1 ตัว" />
                                        <PasswordCheck checked={passwordChecks.match} text="รหัสผ่านตรงกัน" />
                                    </div>
                                </div>
                            )}

                            {/* Terms Checkbox */}
                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="terms"
                                    checked={acceptedTerms}
                                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                                    className="mt-1"
                                />
                                <label
                                    htmlFor="terms"
                                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                                >
                                    ฉันยอมรับ{" "}
                                    <Link href="/terms-privacy/terms" className="text-primary hover:underline">
                                        ข้อกำหนดในการให้บริการ
                                    </Link>{" "}
                                    และ{" "}
                                    <Link href="/terms-privacy/privacy" className="text-primary hover:underline">
                                        นโยบายความเป็นส่วนตัว
                                    </Link>
                                </label>
                            </div>

                            {/* Register Button */}
                            <Button
                                type="submit"
                                className="w-full bg-gradient-cyber hover:opacity-90 text-background font-semibold h-11 pulse-glow"
                                disabled={isLoading || !isPasswordValid || !acceptedTerms}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "สมัครสมาชิก"
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
                                onClick={handleGoogleSignUp}
                                disabled={isLoading}
                            >
                                <FcGoogle className="mr-2 h-5 w-5" />
                                Google
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full bg-[#1877F2]/10 border-[#1877F2]/30 text-[#1877F2] hover:bg-[#1877F2]/20"
                                onClick={handleFacebookSignUp}
                                disabled={isLoading}
                            >
                                <Facebook className="mr-2 h-5 w-5 fill-current" />
                                Facebook
                            </Button>
                        </div>

                        {/* Login Link */}
                        <p className="text-center text-sm text-muted-foreground mt-6">
                            มีบัญชีอยู่แล้ว?{" "}
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
