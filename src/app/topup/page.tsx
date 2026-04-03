"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/components/language-context";
import { api } from "@/lib/api";
import { ArrowLeft, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function TopupPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useLanguage();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        gameId: searchParams.get("gameId") || "",
        gameName: searchParams.get("gameName") || "",
        packageId: searchParams.get("packageId") || "",
        packageName: searchParams.get("packageName") || "",
        packagePrice: searchParams.get("packagePrice") || "",
        uid: "",
        paymentMethod: "wallet",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    // Validate form
    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.uid.trim()) {
            errors.uid = "Game UID is required";
        } else if (formData.uid.trim().length < 3) {
            errors.uid = "Game UID must be at least 3 characters";
        }

        if (!formData.paymentMethod) {
            errors.paymentMethod = "Payment method is required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const orderData = {
                gameId: BigInt(formData.gameId),
                gameName: formData.gameName,
                packageId: BigInt(formData.packageId),
                packageName: formData.packageName,
                packagePrice: parseFloat(formData.packagePrice),
                uid: formData.uid.trim(),
                paymentMethod: formData.paymentMethod,
            };

            const response = await api.createOrder(orderData);
            
            setSuccess(true);
            setOrderId(response.id || response.data?.id);

            // Redirect to success page after 2 seconds
            setTimeout(() => {
                router.push(`/account/balance?order=${orderId || response.id}`);
            }, 2000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create order";
            setError(errorMessage);
            console.error("Error creating order:", err);
        } finally {
            setLoading(false);
        }
    };

    // Success screen
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center pb-20">
                <div className="container mx-auto px-4">
                    <Card className="glass-card p-8 max-w-md mx-auto text-center">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">สำเร็จ!</h2>
                            <p className="text-muted-foreground">
                                คำสั่งซื้อของคุณได้รับการสร้างแล้ว กำลังประมวลผล...
                            </p>
                        </div>

                        <div className="bg-primary/10 rounded-lg p-4 mb-6 text-left">
                            <p className="text-sm text-muted-foreground mb-2">Order ID:</p>
                            <p className="font-mono font-bold">{orderId}</p>
                        </div>

                        <p className="text-sm text-muted-foreground mb-6">
                            กำลังเปลี่ยนเส้นทางไปยังบัญชีของคุณ...
                        </p>

                        <Button asChild className="w-full">
                            <Link href="/account/balance">ไปยังบัญชี</Link>
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="hover:bg-primary/10"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-lg font-semibold">เติมเกม</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 pt-24">
                {/* Order Summary */}
                <Card className="glass-card p-6 mb-6">
                    <h2 className="font-semibold mb-4">สรุปการสั่งซื้อ</h2>

                    <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                            <span className="text-muted-foreground">เกม:</span>
                            <span className="font-semibold">{formData.gameName}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                            <span className="text-muted-foreground">แพคเกจ:</span>
                            <span className="font-semibold">{formData.packageName}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t-2 border-primary/30">
                            <span className="font-semibold">ราคา:</span>
                            <span className="text-2xl font-bold text-primary">
                                ฿{parseFloat(formData.packagePrice).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Error Message */}
                {error && (
                    <Card className="glass-card p-4 mb-6 border border-red-500/30 bg-red-500/5">
                        <div className="flex gap-3 items-start">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-red-500 mb-1">เกิดข้อผิดพลาด</p>
                                <p className="text-sm text-red-500/80">{error}</p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Form */}
                <Card className="glass-card p-6">
                    <h2 className="font-semibold mb-6">กรอกข้อมูลการเติม</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Game UID Input */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Game UID / Player ID <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-muted-foreground mb-3">
                                ID ของตัวละครหรือบัญชีของคุณในเกม
                            </p>
                            <Input
                                type="text"
                                placeholder="ป้อน UID ของคุณ"
                                value={formData.uid}
                                onChange={(e) => {
                                    setFormData({ ...formData, uid: e.target.value });
                                    if (validationErrors.uid) {
                                        setValidationErrors({
                                            ...validationErrors,
                                            uid: "",
                                        });
                                    }
                                }}
                                className={`glass-input ${
                                    validationErrors.uid ? "border-red-500" : ""
                                }`}
                                disabled={loading}
                            />
                            {validationErrors.uid && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.uid}</p>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div>
                            <label className="block text-sm font-medium mb-3">
                                วิธีการชำระเงิน <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center p-3 border border-border/50 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
                                    style={{
                                        borderColor:
                                            formData.paymentMethod === "wallet"
                                                ? "hsl(var(--primary))"
                                                : undefined,
                                        backgroundColor:
                                            formData.paymentMethod === "wallet"
                                                ? "hsl(var(--primary) / 0.05)"
                                                : undefined,
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="wallet"
                                        checked={formData.paymentMethod === "wallet"}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                paymentMethod: e.target.value,
                                            })
                                        }
                                        disabled={loading}
                                        className="cursor-pointer"
                                    />
                                    <span className="ml-3">
                                        <p className="font-medium">กระเป๋าเงิน</p>
                                        <p className="text-xs text-muted-foreground">
                                            ใช้ยอดคงเหลือกระเป๋าของคุณ
                                        </p>
                                    </span>
                                </label>

                                <label className="flex items-center p-3 border border-border/50 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
                                    style={{
                                        borderColor:
                                            formData.paymentMethod === "card"
                                                ? "hsl(var(--primary))"
                                                : undefined,
                                        backgroundColor:
                                            formData.paymentMethod === "card"
                                                ? "hsl(var(--primary) / 0.05)"
                                                : undefined,
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={formData.paymentMethod === "card"}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                paymentMethod: e.target.value,
                                            })
                                        }
                                        disabled={loading}
                                        className="cursor-pointer"
                                    />
                                    <span className="ml-3">
                                        <p className="font-medium">บัตรเครดิต/เดบิต</p>
                                        <p className="text-xs text-muted-foreground">
                                            ชำระเงินผ่านบัตรของคุณ
                                        </p>
                                    </span>
                                </label>

                                <label className="flex items-center p-3 border border-border/50 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
                                    style={{
                                        borderColor:
                                            formData.paymentMethod === "bank"
                                                ? "hsl(var(--primary))"
                                                : undefined,
                                        backgroundColor:
                                            formData.paymentMethod === "bank"
                                                ? "hsl(var(--primary) / 0.05)"
                                                : undefined,
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="bank"
                                        checked={formData.paymentMethod === "bank"}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                paymentMethod: e.target.value,
                                            })
                                        }
                                        disabled={loading}
                                        className="cursor-pointer"
                                    />
                                    <span className="ml-3">
                                        <p className="font-medium">โอนเงินธนาคาร</p>
                                        <p className="text-xs text-muted-foreground">
                                            โอนเงินจากบัญชีธนาคารของคุณ
                                        </p>
                                    </span>
                                </label>
                            </div>
                            {validationErrors.paymentMethod && (
                                <p className="text-red-500 text-sm mt-2">
                                    {validationErrors.paymentMethod}
                                </p>
                            )}
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-border/50">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mt-1"
                                disabled={loading}
                            />
                            <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer">
                                ฉันยอมรับ{" "}
                                <Link href="/terms-privacy/terms" className="text-primary hover:underline">
                                    terms of service
                                </Link>{" "}
                                และ{" "}
                                <Link href="/terms-privacy/privacy" className="text-primary hover:underline">
                                    privacy policy
                                </Link>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-cyber hover:opacity-90 h-12 font-semibold text-base"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                    กำลังประมวลผล...
                                </>
                            ) : (
                                <>
                                    เติมเกมเลย
                                    <Zap className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            ฉันสามารถยกเลิกได้ในภายใน 30 นาที หากไม่ได้รับสินค้า
                        </p>
                    </form>
                </Card>
            </div>
        </div>
    );
}
