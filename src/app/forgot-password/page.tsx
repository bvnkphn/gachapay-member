"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Gamepad2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error("กรุณากรอก Email");
            return;
        }

        setIsLoading(true);
        try {
            await api.forgotPassword({ email });
            setSent(true);
            toast.success("ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลแล้ว");
        } catch (error: any) {
            toast.error(error.message || "เกิดข้อผิดพลาด");
        } finally {
            setIsLoading(false);
        }
    };

    if (sent) {
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
                            <CardTitle className="text-2xl font-bold text-center">ตรวจสอบอีเมล</CardTitle>
                            <CardDescription className="text-center">
                                เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยัง
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/30">
                                <Mail className="w-12 h-12 mx-auto mb-3 text-primary" />
                                <p className="font-medium text-foreground">{email}</p>
                            </div>

                            <p className="text-sm text-muted-foreground text-center">
                                กรุณาตรวจสอบอีเมลและคลิกลิงก์เพื่อรีเซ็ตรหัสผ่าน
                                <br />
                                ลิงก์จะหมดอายุใน 1 ชั่วโมง
                            </p>

                            <Link href="/login">
                                <Button className="w-full bg-gradient-cyber hover:opacity-90 text-background font-semibold">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    กลับไปหน้าเข้าสู่ระบบ
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
                    <p className="text-muted-foreground">รีเซ็ตรหัสผ่านของคุณ</p>
                </div>

                <Card className="glass-card border-border/50">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-2xl font-bold text-center">ลืมรหัสผ่าน</CardTitle>
                        <CardDescription className="text-center">
                            กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
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
                                className="w-full bg-gradient-cyber hover:opacity-90 text-background font-semibold h-11 pulse-glow"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "ส่งลิงก์รีเซ็ตรหัสผ่าน"
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
