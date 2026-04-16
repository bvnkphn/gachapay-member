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
import { api } from "@/lib/api";

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
        const loadGame = async () => {
            try {
                setLoading(true);
                const slug = params.slug as string;
                
                // Fetch game data from backend API
                const response = await api.getGame(slug);
                
                let gameData = response && response.data ? response.data : response;
                
                if (gameData) {
                    // Ensure fields and packages are defined with defaults
                    gameData = {
                        ...gameData,
                        fields: gameData.fields || [],
                        packages: gameData.packages || gameData.items || [],
                    };
                    setGame(gameData);
                } else {
                    setError(t.gameNotFound || "Game not found");
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : t.failedLoadGame || "Failed to load game");
                console.error("Error loading game:", err);
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) {
            loadGame();
        }
    }, [params.slug, t]);

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
            setError(t.pleaseSelectPackage);
            return;
        }

        // Check email for guest checkout
        if (!isLoggedIn && !formData.email.trim()) {
            setError(t.emailRequired);
            return;
        }

        // Basic email validation
        if (!isLoggedIn && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError(t.invalidEmail);
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            // Create order via backend API
            // Use slug for gameId and sku/id for packageId
            const orderData = {
                gameId: game.slug || String(game.id),
                packageId: selectedPackage.id,
                userInput: formData,
                email: isLoggedIn ? user?.email : formData.email,
                couponCode: appliedCoupon?.code,
            };

            const response = await api.createOrder(orderData);
            
            // Response is the order object directly, not wrapped in { data: ... }
            if (response && response.id) {
                setSuccess(true);
                setOrderId(String(response.id));

                setTimeout(() => {
                    if (isLoggedIn) {
                        router.push(`/account/balance?order=${response.id}`);
                    } else {
                        router.push(`/?order=${response.id}`);
                    }
                }, 2000);
            } else {
                console.error("Unexpected response structure:", response);
                throw new Error("Invalid response from server");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t.failedCreateOrder || "Failed to create order");
            console.error("Order creation error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) {
            setError(t.enterCouponError);
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
            setError(t.invalidCouponError);
            setAppliedCoupon(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t.loadingGame}</p>
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
                            <h2 className="text-2xl font-bold mb-2">{t.Success}</h2>
                            <p className="text-muted-foreground">{t.orderCreatedSuccess}</p>
                        </div>

                        <div className="bg-primary/10 rounded-lg p-4 mb-6 text-left">
                            <p className="text-sm text-muted-foreground mb-2">Order ID:</p>
                            <p className="font-mono font-bold">{orderId}</p>
                        </div>

                        <Button asChild className="w-full">
                            <Link href="/account/balance">{t.goToAccount}</Link>
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
                                <h2 className="text-lg font-bold">{t.Topupinfo}</h2>
                            </div>
                            {game.fields && game.fields.length > 0 ? (
                                <div className={`grid gap-4 ${game.fields.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    {game.fields.map((field) => (
                                        <div key={field.name}>
                                            <label className="block text-sm font-medium mb-2">
                                                {field.label}
                                                {field.required && <span className="text-red-500">*</span>}
                                            </label>
                                            <div className="relative">
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
                                                    list={field.options && field.options.length > 0 ? `options-${field.name}` : undefined}
                                                />
                                                {field.options && field.options.length > 0 && (
                                                    <datalist id={`options-${field.name}`}>
                                                        {field.options.map((opt) => (
                                                            <option key={opt.value} value={opt.value} label={opt.label} />
                                                        ))}
                                                    </datalist>
                                                )}
                                            </div>
                                        </div>
                                        
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">{t.noFieldsRequired || "No additional information required"}</p>
                            )}
                        </Card>

                        {/* Packages Grid */}
                        <Card className="glass-card p-6 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                                    2
                                </div>
                                <h2 className="text-lg font-bold">{t.Choosepackage}</h2>
                            </div>
                            {game.packages && game.packages.length > 0 ? (
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
                            ) : (
                                <p className="text-muted-foreground text-sm">{t.noPackages || "No packages available"}</p>
                            )}
                        </Card>
                    </div>

                    {/* Right Column - Order Form (Sticky) */}
                    <div className="lg:col-span-1">
                        <Card className="glass-card p-6 sticky top-24">
                            <div className="mb-4 pb-4 border-b border-border/50">
                                <p className="text-xs text-muted-foreground">{t.orderType}</p>
                                <p className="text-sm font-semibold">
                                    {isLoggedIn ? (
                                        <span className="text-green-500">{t.alreadyLoggedIn}</span>
                                    ) : (
                                        <span className="text-amber-500">{t.buyWithoutLogin}</span>
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
                                        {t.switchToMember}
                                    </Button>
                                )}
                            </div>

                            {/* Coupon Section */}
                            <div className="mb-6 pb-6 border-b border-border/50">
                                <p className="text-sm font-semibold mb-3">{t.discountCoupon}</p>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder={t.enterCouponCode}
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
                                        {t.useCoupon}
                                    </Button>
                                </div>
                                {appliedCoupon && (
                                    <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded-md">
                                        <p className="text-xs text-green-500">{`✓ ใช้คูปอง ${appliedCoupon.code} ประหยัด ${appliedCoupon.discount}%`}</p>
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">{t.tryCoupons}</p>
                            </div>

                            <h2 className="text-lg font-bold mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                                        3
                                    </div>
                                    {t.orderSummary}
                                </div>
                            </h2>
                            <div className="bg-primary/10 rounded-lg p-4 mb-6">
                                <p className="text-xs text-muted-foreground mb-1">{t.selectedPackage}</p>
                                <p className="font-bold text-foreground">
                                    {selectedPackage ? selectedPackage.count : t.noSelection}
                                </p>
                                <div className="space-y-2 mt-4 pt-4 border-t border-primary/20">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t.priceLabel}</span>
                                        <span className="font-semibold">฿ {selectedPackage ? selectedPackage.price.toFixed(2) : "0.00"}</span>
                                    </div>
                                    {appliedCoupon && selectedPackage && (
                                        <div className="flex justify-between text-sm text-green-500">
                                            <span>{`ส่วนลด (${appliedCoupon.discount}%):`}</span>
                                            <span>-฿ {(selectedPackage.price * appliedCoupon.discount / 100).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-primary/20">
                                        <span>{t.totalLabel}</span>
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
                                            {t.emailForReceipt} <span className="text-red-500">*</span>
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
                                            {t.receiptNote}
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
                                        {t.processing}
                                    </>
                                ) : (
                                    <>
                                        {t.orderButton}
                                        <ShoppingCart className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground mt-4">
                                {t.selectPackageHint}
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
