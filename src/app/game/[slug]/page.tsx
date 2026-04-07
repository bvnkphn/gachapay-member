"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/language-context";
import { ArrowLeft, Zap, Shield, Clock, AlertCircle, CheckCircle2, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

interface GamePackage {
    id: string;
    name: string;
    description?: string;
    count: string;
    price: number;
}

interface InputField {
    name: string;
    label: string;
    placeholder: string;
    type?: string;
    required?: boolean;
    options?: { label: string; value: string }[];
}

interface Game {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    label: string;
    packages: GamePackage[];
    fields: InputField[];
}

export default function GameTopupPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const { user } = useAuth();

    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<GamePackage | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(!!user);
    const [formData, setFormData] = useState<Record<string, string>>({ email: "" });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [hydrated, setHydrated] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

    // Check if auth store has hydrated from localStorage
    useEffect(() => {
        // Give zustand time to hydrate from localStorage
        const timer = setTimeout(() => {
            setHydrated(true);
            // Set login status after hydration
            if (user) {
                setIsLoggedIn(true);
                setFormData(prev => ({ ...prev, email: user.email || "" }));
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [user]);

    useEffect(() => {
        // Mock data for frontend development
        const mockGames: Record<string, Game> = {
            "valorant": {
                id: 1,
                name: "Valorant",
                slug: "valorant",
                description: "A free-to-play first-person tactical shooter developed by Riot Games.",
                image: "https://images.unsplash.com/photo-1614294148104-fceaa55299c3?w=500&h=300&fit=crop",
                label: "HOT",
                fields: [
                    { name: "riotId", label: "Riot ID (TagName)", placeholder: "ป้อน Riot ID#TAG", required: true },
                ],
                packages: [
                    { id: "1", name: "Week Pass", description: "Weekly benefits", count: "Weekly Pass", price: 99 },
                    { id: "2", name: "475 VP", description: "", count: "475 VP", price: 100 },
                    { id: "3", name: "1000 VP", description: "", count: "1000 VP", price: 210 },
                    { id: "4", name: "2000 VP", description: "", count: "2000 VP", price: 420 },
                    { id: "5", name: "2500 VP", description: "", count: "2500 VP", price: 525 },
                    { id: "6", name: "5000 VP", description: "", count: "5000 VP", price: 1050 },
                    { id: "7", name: "10000 VP", description: "", count: "10000 VP", price: 2100 },
                    { id: "8", name: "15000 VP", description: "", count: "15000 VP", price: 3150 },
                ],
            },
            "dota2": {
                id: 2,
                name: "Dota 2",
                slug: "dota2",
                description: "Free-to-play multiplayer online battle arena game by Valve.",
                image: "https://images.unsplash.com/photo-1549887534-7ebf0d309eca?w=500&h=300&fit=crop",
                label: "NEW",
                fields: [
                    { name: "userId", label: "User ID", placeholder: "ป้อน User ID", required: true },
                    { 
                        name: "server", 
                        label: "Server", 
                        placeholder: "เลือก Server", 
                        required: true,
                        options: [
                            { label: "US East", value: "us-east" },
                            { label: "US West", value: "us-west" },
                            { label: "Europe", value: "europe" },
                            { label: "Southeast Asia", value: "sea" },
                            { label: "China", value: "china" },
                        ]
                    },
                ],
                packages: [
                    { id: "1", name: "Weekly Pass", description: "Weekly benefits", count: "Weekly Pass", price: 99 },
                    { id: "2", name: "5 Diamonds", description: "", count: "5 Diamonds", price: 27.5 },
                    { id: "3", name: "11 Diamonds + 1 Bonus", description: "", count: "11 Diamonds + 1 Bonus", price: 54.5 },
                    { id: "4", name: "25 Diamonds + 3 Bonus", description: "", count: "25 Diamonds + 3 Bonus", price: 137.5 },
                    { id: "5", name: "27 Diamonds + 4 Bonus", description: "", count: "27 Diamonds + 4 Bonus", price: 165 },
                    { id: "6", name: "387 Diamonds + 43 Bonus", description: "", count: "387 Diamonds + 43 Bonus", price: 2200 },
                    { id: "7", name: "1124 Diamonds + 282 Bonus", description: "", count: "1124 Diamonds + 282 Bonus", price: 6500 },
                    { id: "8", name: "4203 Diamonds + 937 Bonus", description: "", count: "4203 Diamonds + 937 Bonus", price: 27500 },
                ],
            },
            "pubg": {
                id: 3,
                name: "PUBG Mobile",
                slug: "pubg",
                description: "PlayerUnknown's Battlegrounds - Battle royale game.",
                image: "https://images.unsplash.com/photo-1556725783-b5d8732ef5d1?w=500&h=300&fit=crop",
                label: "NONE",
                fields: [
                    { name: "uid", label: "UID", placeholder: "ป้อน UID", required: true },
                    { name: "sid", label: "SID", placeholder: "ป้อน SID", required: true },
                ],
                packages: [
                    { id: "1", name: "325 UC", description: "", count: "325 UC", price: 100 },
                    { id: "2", name: "1000 UC", description: "", count: "1000 UC", price: 300 },
                    { id: "3", name: "2000 UC", description: "", count: "2000 UC", price: 600 },
                    { id: "4", name: "5000 UC", description: "", count: "5000 UC", price: 1500 },
                ],
            },
        };

        const loadGame = async () => {
            try {
                setLoading(true);
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const slug = params.slug as string;
                const gameData = mockGames[slug];
                
                if (gameData) {
                    setGame(gameData);
                } else {
                    setError("Game not found");
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load game");
                console.error("Error loading game:", err);
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) {
            loadGame();
        }
    }, [params.slug]);

    const handleSubmit = async () => {
        // Validation
        if (!game) return;

        // Check all required fields
        for (const field of game.fields) {
            if (field.required && !formData[field.name]?.trim()) {
                setError(`${field.label} is required`);
                return;
            }
        }

        if (!selectedPackage) {
            setError("Please select a package");
            return;
        }

        // Check email for guest checkout
        if (!isLoggedIn && !formData.email.trim()) {
            setError("Email is required for e-receipt");
            return;
        }

        // Basic email validation
        if (!isLoggedIn && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            // Simulate order creation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setSuccess(true);
            setOrderId(`ORD-${Date.now()}`);

            setTimeout(() => {
                if (isLoggedIn) {
                    router.push(`/account/balance?order=${orderId}`);
                } else {
                    router.push(`/?order=${orderId}`);
                }
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create order");
        } finally {
            setSubmitting(false);
        }
    };

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) {
            setError("Please enter a coupon code");
            return;
        }

        // Simple mock coupon validation
        const mockCoupons: Record<string, number> = {
            "SAVE10": 10,
            "SAVE20": 20,
            "WELCOME": 15,
        };

        const discount = mockCoupons[couponCode.toUpperCase()];

        if (discount) {
            setAppliedCoupon({ code: couponCode.toUpperCase(), discount });
            setCouponCode("");
            setError(null);
        } else {
            setError("Invalid coupon code");
            setAppliedCoupon(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading game...</p>
                </div>
            </div>
        );
    }

    if (error || !game) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || "Game not found"}</p>
                    <Button asChild>
                        <Link href="/">{t.backToHome || "Back to Home"}</Link>
                    </Button>
                </div>
            </div>
        );
    }

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
                            <p className="text-muted-foreground">คำสั่งซื้อของคุณได้รับการสร้างแล้ว</p>
                        </div>

                        <div className="bg-primary/10 rounded-lg p-4 mb-6 text-left">
                            <p className="text-sm text-muted-foreground mb-2">Order ID:</p>
                            <p className="font-mono font-bold">{orderId}</p>
                        </div>

                        <Button asChild className="w-full">
                            <Link href="/account/balance">ไปยังบัญชี</Link>
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 bg-gradient-to-b from-card via-background to-background">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-4 py-4 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="hover:bg-primary/10"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-lg font-semibold">{game.name}</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 pt-6">
                {/* Error Message */}
                {error && (
                    <Card className="glass-card p-4 mb-6 border border-red-500/30 bg-red-500/5">
                        <div className="flex gap-3 items-start">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Left Column - Game Info */}
                    <div className="lg:col-span-2">
                        {/* Game Header */}
                        <Card className="glass-card p-6 mb-6">
                            <div className="relative h-48 mb-6 rounded-lg overflow-hidden bg-muted">
                                {game.image ? (
                                    <Image
                                        src={game.image}
                                        alt={game.name}
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                                {game.label !== "NONE" && (
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                                            {game.label}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            <h1 className="text-3xl font-bold mb-2">{game.name}</h1>
                            <p className="text-muted-foreground mb-6">{game.description}</p>

                            {/* Features */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-primary/10 rounded-lg p-3 text-center">
                                    <Zap className="w-5 h-5 mx-auto text-primary mb-1" />
                                    <p className="text-xs text-muted-foreground">Quick</p>
                                </div>
                                <div className="bg-primary/10 rounded-lg p-3 text-center">
                                    <Shield className="w-5 h-5 mx-auto text-primary mb-1" />
                                    <p className="text-xs text-muted-foreground">Safe</p>
                                </div>
                                <div className="bg-primary/10 rounded-lg p-3 text-center">
                                    <Clock className="w-5 h-5 mx-auto text-primary mb-1" />
                                    <p className="text-xs text-muted-foreground">24/7</p>
                                </div>
                            </div>
                        </Card>

                        {/* User Inputs Section */}
                        <Card className="glass-card p-6 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                                    1
                                </div>
                                <h2 className="text-lg font-bold">ข้อมูลการเติม</h2>
                            </div>
                            <div className={`grid gap-4 ${game.fields.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {game.fields.map((field) => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-medium mb-2">
                                            {field.label}
                                            {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        {field.options ? (
                                            <select
                                                value={formData[field.name] || ""}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, [field.name]: e.target.value });
                                                    if (error) setError(null);
                                                }}
                                                disabled={submitting}
                                                className="glass-input w-full px-3 py-2 rounded-md border border-input bg-background/50 backdrop-blur-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                            >
                                                <option value="">{field.placeholder}</option>
                                                {field.options.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Input
                                                type={field.type || "text"}
                                                placeholder={field.placeholder}
                                                value={formData[field.name] || ""}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, [field.name]: e.target.value });
                                                    if (error) setError(null);
                                                }}
                                                className="glass-input"
                                                disabled={submitting}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Packages Grid */}
                        <Card className="glass-card p-6 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                                    2
                                </div>
                                <h2 className="text-lg font-bold">เลือกแพคเกจ</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {game.packages.map((pkg) => (
                                    <div
                                        key={pkg.id}
                                        className="cursor-pointer group"
                                        onClick={() => {
                                            setSelectedPackage(pkg);
                                            if (error) setError(null);
                                        }}
                                    >
                                        <Card
                                            className="p-3 h-full transition-all duration-300 hover:glow-primary border-2 rounded-lg"
                                            style={{
                                                background: "rgba(100, 50, 255, 0.1)",
                                                borderColor:
                                                    selectedPackage?.id === pkg.id
                                                        ? "hsl(var(--primary))"
                                                        : "rgba(100, 50, 255, 0.3)",
                                                backgroundColor:
                                                    selectedPackage?.id === pkg.id
                                                        ? "rgba(100, 50, 255, 0.2)"
                                                        : "rgba(100, 50, 255, 0.1)",
                                            }}
                                        >
                                            <div className="mb-2">
                                                <p className="text-xs text-muted-foreground font-medium">{pkg.name}</p>
                                                <p className="text-sm font-bold text-foreground line-clamp-2">
                                                    {pkg.count}
                                                </p>
                                            </div>
                                            <div className="pt-2 border-t border-border/50">
                                                <p className="text-lg font-bold text-primary">
                                                    ฿ {pkg.price.toFixed(2)}
                                                </p>
                                            </div>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Order Form (Sticky) */}
                    <div className="lg:col-span-1">
                        <Card className="glass-card p-6 sticky top-24">
                            <div className="mb-4 pb-4 border-b border-border/50">
                                <p className="text-xs text-muted-foreground">ประเภทการสั่ง</p>
                                <p className="text-sm font-semibold">
                                    {isLoggedIn ? (
                                        <span className="text-green-500">✓ เข้าสู่ระบบแล้ว</span>
                                    ) : (
                                        <span className="text-amber-500">ซื้อโดยไม่เข้าสู่ระบบ</span>
                                    )}
                                </p>
                                {!isLoggedIn && user && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setIsLoggedIn(true);
                                            setFormData(prev => ({ ...prev, email: user.email || "" }));
                                        }}
                                        className="w-full mt-2 text-xs"
                                    >
                                        เปลี่ยนไปรูปแบบสมาชิก
                                    </Button>
                                )}
                            </div>

                            {/* Coupon Section */}
                            <div className="mb-6 pb-6 border-b border-border/50">
                                <p className="text-sm font-semibold mb-3">คูปองส่วนลด</p>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="ป้อนรหัสคูปอง"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="glass-input text-sm"
                                        disabled={submitting}
                                    />
                                    <Button
                                        onClick={handleApplyCoupon}
                                        disabled={submitting || !couponCode.trim()}
                                        className="px-4 bg-primary hover:bg-primary/90 text-sm"
                                    >
                                        ใช้
                                    </Button>
                                </div>
                                {appliedCoupon && (
                                    <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded-md">
                                        <p className="text-xs text-green-500">✓ ใช้คูปอง {appliedCoupon.code} ประหยัด {appliedCoupon.discount}%</p>
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">ลองใช้: SAVE10, SAVE20, WELCOME</p>
                            </div>

                            <h2 className="text-lg font-bold mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                                        3
                                    </div>
                                    สรุปการสั่ง
                                </div>
                            </h2>
                            <div className="bg-primary/10 rounded-lg p-4 mb-6">
                                <p className="text-xs text-muted-foreground mb-1">แพคเกจที่เลือก</p>
                                <p className="font-bold text-foreground">
                                    {selectedPackage ? selectedPackage.count : "ยังไม่มีการเลือก"}
                                </p>
                                <div className="space-y-2 mt-4 pt-4 border-t border-primary/20">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">ราคา:</span>
                                        <span className="font-semibold">฿ {selectedPackage ? selectedPackage.price.toFixed(2) : "0.00"}</span>
                                    </div>
                                    {appliedCoupon && selectedPackage && (
                                        <div className="flex justify-between text-sm text-green-500">
                                            <span>ส่วนลด ({appliedCoupon.discount}%):</span>
                                            <span>-฿ {(selectedPackage.price * appliedCoupon.discount / 100).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-primary/20">
                                        <span>รวม:</span>
                                        <span className="text-primary">
                                            ฿ {selectedPackage ? (selectedPackage.price * (1 - (appliedCoupon?.discount ?? 0) / 100)).toFixed(2) : "0.00"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* User Inputs */}
                            <div className="space-y-4 mb-6">
                                {/* Email field for guest checkout */}
                                {!isLoggedIn && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            อีเมลสำหรับใบเสร็จ <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="email"
                                            placeholder="example@email.com"
                                            value={formData.email}
                                            onChange={(e) => {
                                                setFormData({ ...formData, email: e.target.value });
                                                if (error) setError(null);
                                            }}
                                            className="glass-input"
                                            disabled={submitting}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            ใบเสร็จจะถูกส่งไปที่อีเมลนี้
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting || !selectedPackage}
                                className="w-full bg-gradient-cyber hover:opacity-90 h-12 font-bold"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        กำลังประมวลผล...
                                    </>
                                ) : (
                                    <>
                                        สั่ง
                                        <ShoppingCart className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground mt-4">
                                คลิกเลือกแพคเกจเพื่อเริ่มสั่ง
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
