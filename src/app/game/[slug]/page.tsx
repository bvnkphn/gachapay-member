"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/language-context";
import { ArrowLeft, Zap, Shield, Clock, AlertCircle, CheckCircle2, ShoppingCart, ChevronLeft, Coins, QrCode, AlertTriangle, Loader2, X, Bookmark, Lock as LockIcon, Gift, CreditCard, Wallet, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface GamePackage {
    id: string;
    name: string;
    description?: string;
    count: string;
    price: number;
    effectivePrice?: number;
    flashSale?: {
        isActive: boolean;
        price: number | null;
        start: string | null;
        end: string | null;
    };
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

const GATEWAY_TO_METHOD: Record<string, string> = {
    wallet: "coin",
    promptpay: "qr",
};

const METHOD_TO_GATEWAY: Record<string, string> = {
    coin: "wallet",
    qr: "promptpay",
};

export default function GameTopupPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const { user, updateUser } = useAuth();

    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<GamePackage | null>(null);
    const selectedPackagePrice = useMemo(() => {
        if (!selectedPackage) return 0;
        return selectedPackage.effectivePrice !== undefined ? Number(selectedPackage.effectivePrice) : Number(selectedPackage.price);
    }, [selectedPackage]);
    const [isLoggedIn, setIsLoggedIn] = useState(!!user);
    const [formData, setFormData] = useState<Record<string, string>>({ email: "" });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [hydrated, setHydrated] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        const checkBookmarkStatus = async () => {
            if (isLoggedIn && game?.id) {
                try {
                    const list = await api.getBookmarks();
                    const hasBookmark = list.some((b: any) => String(b.id) === String(game.id));
                    setIsBookmarked(hasBookmark);
                } catch (e) {
                    console.error("Error checking bookmark status:", e);
                }
            }
        };
        checkBookmarkStatus();
    }, [game?.id, isLoggedIn]);

    const handleBookmarkToggle = async () => {
        if (!game?.id) return;
        try {
            const res = await api.toggleBookmark(Number(game.id));
            setIsBookmarked(res.bookmarked);
            toast.success(res.message);
            window.dispatchEvent(new Event("gachapay_bookmarks_changed"));
        } catch (e: any) {
            console.error("Error toggling bookmark:", e);
            toast.error(e.message || "ไม่สามารถปักหมุดเกมได้ในขณะนี้");
        }
    };

    const [paymentMethod, setPaymentMethod] = useState<string>("coin");
    const [activeMethods, setActiveMethods] = useState<any[]>([]);

    useEffect(() => {
        const loadMethods = async () => {
            try {
                const data = await api.getActivePaymentMethods();
                if (Array.isArray(data)) {
                    const filtered = data.filter(m => m.id === "promptpay" || m.id === "wallet");
                    setActiveMethods(filtered);
                    const enabled = filtered.filter(m => m.enabled);
                    if (enabled.length > 0) {
                        const first = enabled[0].id;
                        if (first === "wallet") setPaymentMethod("coin");
                        else if (first === "promptpay") setPaymentMethod("qr");
                        else setPaymentMethod(first);
                    }
                }
            } catch (e) {
                console.error("Failed to load active methods", e);
            }
        };
        loadMethods();
    }, []);

    const [vatRate, setVatRate] = useState<number>(7);
    useEffect(() => {
        api.getPaymentVatRate()
            .then(d => {
                if (d && typeof d.vatRate === "number") setVatRate(d.vatRate);
            })
            .catch(() => {});
    }, []);

    const priceAfterDiscount = useMemo(() => selectedPackage ? selectedPackagePrice * (1 - (appliedCoupon?.discount ?? 0) / 100) : 0, [selectedPackage, selectedPackagePrice, appliedCoupon]);
    const vatAmount = useMemo(() => selectedPackage ? priceAfterDiscount * (vatRate / 100) : 0, [selectedPackage, priceAfterDiscount, vatRate]);
    const totalAmount = useMemo(() => selectedPackage ? priceAfterDiscount + vatAmount : 0, [selectedPackage, priceAfterDiscount, vatAmount]);

    // Auto select paymentMethod to free if totalAmount is 0
    useEffect(() => {
        if (selectedPackage && totalAmount <= 0) {
            setPaymentMethod("free");
        } else if (paymentMethod === "free") {
            const first = activeMethods.find(m => m.enabled);
            if (first) {
                const mCode = GATEWAY_TO_METHOD[first.id] ?? first.id;
                setPaymentMethod(mCode);
            }
        }
    }, [totalAmount, selectedPackage, activeMethods]);

    // Ensure selected paymentMethod is always enabled
    useEffect(() => {
        if (activeMethods.length === 0 || paymentMethod === "free") return;
        
        const currentGatewayId = METHOD_TO_GATEWAY[paymentMethod] ?? paymentMethod;
            
        const currentMethod = activeMethods.find(m => m.id === currentGatewayId);
        if (currentMethod && !currentMethod.enabled) {
            const firstEnabled = activeMethods.find(m => m.enabled);
            if (firstEnabled) {
                const defaultMethod = GATEWAY_TO_METHOD[firstEnabled.id] ?? firstEnabled.id;
                setPaymentMethod(defaultMethod);
            }
        }
    }, [paymentMethod, activeMethods]);

    const [walletBalance, setWalletBalance] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [showQrPaymentModal, setShowQrPaymentModal] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [paymentRef, setPaymentRef] = useState("");
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
    const [paymentChecking, setPaymentChecking] = useState(false);

    const fetchBalance = useCallback(() => {
        if (user) {
            api.getWalletBalance()
                .then((resData) => {
                    const newBalance = Number.parseFloat(resData?.amount ?? "0");
                    setWalletBalance(newBalance);
                    updateUser({ balance: newBalance });
                })
                .catch(() => {
                    setWalletBalance(user.balance ?? 0);
                });
        }
    }, [user?.id, updateUser]);

    useEffect(() => {
        fetchBalance();
        window.addEventListener("balance-changed", fetchBalance);
        return () => {
            window.removeEventListener("balance-changed", fetchBalance);
        };
    }, [fetchBalance]);

    useEffect(() => {
        if (user && typeof user.balance === "number") {
            setWalletBalance(user.balance);
        }
    }, [user?.balance]);

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
        if (hydrated && !isLoggedIn) {
            setPaymentMethod("qr");
        }
    }, [hydrated, isLoggedIn]);

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

    // Polling status for QR code payment
    useEffect(() => {
        if (!showQrPaymentModal || !currentOrderId) return;

        let active = true;
        const intervalId = setInterval(async () => {
            try {
                const res = await api.checkPaymentStatus(currentOrderId);
                if (res && res.success && res.status === "completed" && active) {
                    clearInterval(intervalId);
                    setShowQrPaymentModal(false);
                    setSuccess(true);
                    setOrderId(currentOrderId);
                    window.dispatchEvent(new Event("balance-changed"));
                    if (isLoggedIn) {
                        setTimeout(() => {
                            router.push(`/history`);
                        }, 2000);
                    }
                }
            } catch (err) {
                console.error("Checking status fail:", err);
            }
        }, 3000);

        return () => {
            active = false;
            clearInterval(intervalId);
        };
    }, [showQrPaymentModal, currentOrderId, router]);

    const handleSubmit = async () => {
        // Validation
        if (!game) return;

        if (!isLoggedIn) {
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        // Check all required fields
        for (const field of game.fields) {
            if (field.required && !formData[field.name]?.trim()) {
                setWarningText(`กรุณากรอกข้อมูลช่อง ${field.label} ให้เรียบร้อย`);
                setShowWarningModal(true);
                return;
            }
        }

        if (!selectedPackage) {
            setWarningText("กรุณาเลือกแพ็กเกจที่ต้องการเติมเงิน");
            setShowWarningModal(true);
            return;
        }

        // Check email for guest checkout
        if (!isLoggedIn && !formData.email.trim()) {
            setWarningText("กรุณากรอกอีเมลสำหรับรับใบเสร็จ");
            setShowWarningModal(true);
            return;
        }

        // Basic email validation
        if (!isLoggedIn && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setWarningText("กรุณากรอกอีเมลให้ถูกต้องตามรูปแบบ");
            setShowWarningModal(true);
            return;
        }

        // Extract UID from form data - find the field with highest priority/first required field
        const uidValue = game.fields && game.fields.length > 0 
            ? formData[game.fields[0].name] || formData.uid || formData.id || ""
            : "";

        if (!uidValue.trim()) {
            setWarningText("กรุณากรอกข้อมูล UID ของเกม");
            setShowWarningModal(true);
            return;
        }

        if (!selectedPackage) {
            setWarningText("กรุณาเลือกแพ็กเกจที่ต้องการเติม");
            setShowWarningModal(true);
            return;
        }

        // totalAmount is already memoized above

        // Check balance for Coin payment (skip for free checkout)
        if (paymentMethod === "coin" && totalAmount > 0) {
            if (!isLoggedIn) {
                setWarningText("กรุณาเข้าสู่ระบบเพื่อสั่งซื้อด้วยคอยน์สะสม");
                setShowWarningModal(true);
                return;
            }
            if (walletBalance < totalAmount) {
                setWarningText(`ยอดเงินคอยน์สะสมไม่เพียงพอ\n(ต้องการ ฿${totalAmount.toFixed(2)} แต่คุณมี ฿${walletBalance.toFixed(2)})\n\nกรุณาเติมเงินคอยน์ก่อนทำรายการ`);
                setShowWarningModal(true);
                return;
            }
        }

        try {
            setSubmitting(true);
            setError(null);

            // Map internal payment method code to backend payment method name
            const resolvedPaymentMethod = paymentMethod === "coin" ? "gacha_wallet"
                : paymentMethod === "qr" ? "promptpay"
                : paymentMethod === "free" ? "free"
                : paymentMethod; // truemoney, credit, etc.

            // Create order via backend API with correct structure
            const orderData = {
                gameId: game.slug || String(game.id),
                gameName: game.name,
                packageId: selectedPackage.id,
                packageName: selectedPackage.name,
                packagePrice: selectedPackagePrice,
                uid: uidValue,
                email: isLoggedIn ? user?.email : formData.email,
                couponCode: appliedCoupon?.code,
                paymentMethod: resolvedPaymentMethod,
            };

            const response = await api.createOrder(orderData);
            
            if (response && response.id) {
                const createdOrderId = String(response.id);
                setCurrentOrderId(createdOrderId);

                if (response.status === "completed") {
                    setSuccess(true);
                    setOrderId(createdOrderId);
                    window.dispatchEvent(new Event("balance-changed"));
                    toast.success("สั่งซื้อสำเร็จ!");
                    setTimeout(() => {
                        router.push(`/history`);
                    }, 2000);
                    return;
                }

                if (paymentMethod === "coin") {
                    // Pay with wallet balance
                    const payResult = await api.processWalletPayment({
                        orderId: Number(createdOrderId),
                        amount: totalAmount,
                        paymentMethod: "gacha_wallet"
                    });

                    if (payResult && payResult.success) {
                        setSuccess(true);
                        setOrderId(createdOrderId);
                        window.dispatchEvent(new Event("balance-changed"));

                        setTimeout(() => {
                            router.push(`/history`);
                        }, 2000);
                    } else {
                        throw new Error(payResult.message || "การชำระเงินด้วยคอยน์สะสมล้มเหลว");
                    }
                } else if (paymentMethod === "qr") {
                    // Pay with QR Code
                    const qrResult = await api.generateQRCode({
                        orderId: Number(createdOrderId),
                        amount: totalAmount,
                        method: "promptpay"
                    });

                    if (qrResult && qrResult.success) {
                        setQrCodeUrl(qrResult.data.qrCode);
                        setPaymentRef(qrResult.data.referenceNumber);
                        setShowQrPaymentModal(true);
                    } else {
                        throw new Error(qrResult.message || "ไม่สามารถสร้าง QR Code สแกนจ่ายได้");
                    }
                } else if (paymentMethod === "truemoney") {
                    // Pay with TrueMoney Wallet (QR promptpay with method 'truemoney')
                    const qrResult = await api.generateQRCode({
                        orderId: Number(createdOrderId),
                        amount: totalAmount,
                        method: "truemoney"
                    });

                    if (qrResult && qrResult.success) {
                        setQrCodeUrl(qrResult.data.qrCode);
                        setPaymentRef(qrResult.data.referenceNumber);
                        setShowQrPaymentModal(true);
                    } else {
                        throw new Error(qrResult.message || "ไม่สามารถสร้าง QR Code สแกนจ่ายได้");
                    }
                } else if (paymentMethod === "bank_transfer") {
                    // Bank Transfer
                    const qrResult = await api.generateQRCode({
                        orderId: Number(createdOrderId),
                        amount: totalAmount,
                        method: "bank_transfer"
                    });

                    if (qrResult && qrResult.success) {
                        setQrCodeUrl(qrResult.data.qrCode);
                        setPaymentRef(qrResult.data.referenceNumber);
                        setShowQrPaymentModal(true);
                    } else {
                        throw new Error(qrResult.message || "ไม่สามารถสร้างรายการโอนเงินได้");
                    }
                } else if (paymentMethod === "free") {
                    // Free Checkout fallback
                    setSuccess(true);
                    setOrderId(createdOrderId);
                    window.dispatchEvent(new Event("balance-changed"));
                    toast.success("สั่งซื้อสำเร็จ!");
                    setTimeout(() => {
                        router.push(`/history`);
                    }, 2000);
                    return;
                } else {
                    throw new Error("ยังไม่เปิดระบบชำระเงินทางเลือกอื่น");
                }
            } else {
                console.error("Unexpected response structure:", response);
                throw new Error("Invalid response from server");
            }
        } catch (err: any) {
            toast.error(err.message || "เกิดข้อผิดพลาดในการสั่งซื้อ");
            console.error("Order payment execution error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleApplyCoupon = async () => {
        const code = couponCode.trim();
        if (!code) {
            toast.error(t.enterCouponError || "กรุณากรอกรหัสคูปอง");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            
            const res = await api.validateCoupon({
                code: code,
                gameId: game?.id,
                packageId: selectedPackage ? Number(selectedPackage.id) : undefined,
                amount: selectedPackagePrice
            }, user?.id || "1");

            if (res && res.success && res.data) {
                let percentage = 0;
                if (res.data.discountType === 'PERCENTAGE') {
                    percentage = res.data.discountValue;
                } else {
                    percentage = Math.round((res.data.discountAmount / selectedPackagePrice) * 100);
                }

                setAppliedCoupon({
                    code: res.data.code,
                    discount: percentage
                });
                setCouponCode("");
                toast.success(`ใช้คูปอง "${res.data.code}" สำเร็จ! ได้รับส่วนลด ฿${res.data.discountAmount}`);
            } else {
                toast.error(res?.message || "คูปองไม่ถูกต้อง");
                setAppliedCoupon(null);
            }
        } catch (err: any) {
            toast.error(err.message || "เกิดข้อผิดพลาดในการตรวจสอบคูปอง");
            setAppliedCoupon(null);
        } finally {
            setSubmitting(false);
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



    return (
        <div className="min-h-screen pb-20 bg-background text-foreground animate-in fade-in duration-300">
            {/* Main Content */}
            <div className="container mx-auto px-6 max-w-5xl pt-8">
                {/* Back Button & Title */}
                <div className="flex items-center justify-between gap-3 mb-6 w-full">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => router.back()}
                            className="flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-sm shrink-0"
                            aria-label="Back"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-black text-foreground">{game.name}</h1>
                    </div>
                    <button
                        onClick={isLoggedIn ? handleBookmarkToggle : undefined}
                        className={cn(
                            "flex items-center justify-center w-9 h-9 rounded-xl border transition-all shrink-0 sm:hidden",
                            !isLoggedIn
                                ? "bg-card border-border/50 text-muted-foreground/30 opacity-60 cursor-not-allowed"
                                : isBookmarked 
                                    ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20 cursor-pointer hover:scale-105 active:scale-95" 
                                    : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer hover:scale-105 active:scale-95"
                        )}
                        title={!isLoggedIn ? "กรุณาเข้าสู่ระบบเพื่อปักหมุด" : isBookmarked ? "ยกเลิกปักหมุด" : "ปักหมุดเกมนี้"}
                        disabled={!isLoggedIn}
                    >
                        <Bookmark className={cn("w-4.5 h-4.5", isLoggedIn && isBookmarked && "fill-red-500 text-red-500")} />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="glass-card rounded-2xl p-4 mb-6 border border-red-500/30 bg-red-500/5">
                        <div className="flex gap-3 items-start">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    </div>
                )}

                {/* Full-width Game Header Banner */}
                <div className="glass-card rounded-2xl overflow-hidden mb-6">
                    <div className="relative h-64 md:h-80 w-full overflow-hidden bg-muted">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                        
                        {/* Bookmark Button on Top-Right of Banner */}
                        <button
                            onClick={isLoggedIn ? handleBookmarkToggle : undefined}
                            className={cn(
                                "absolute top-4 right-4 z-10 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border shadow-lg transition-all duration-300",
                                !isLoggedIn
                                    ? "bg-black/40 border-white/10 text-white/40 cursor-not-allowed"
                                    : isBookmarked
                                        ? "bg-red-500/20 border-red-500/40 text-red-500 hover:bg-red-500/30 cursor-pointer hover:scale-110 active:scale-95"
                                        : "bg-black/40 border-white/20 text-white hover:bg-black/60 cursor-pointer hover:scale-110 active:scale-95"
                            )}
                            title={!isLoggedIn ? "กรุณาเข้าสู่ระบบเพื่อปักหมุด" : isBookmarked ? "ยกเลิกปักหมุด" : "ปักหมุดเกมนี้"}
                            disabled={!isLoggedIn}
                        >
                            <Bookmark className={cn("w-5 h-5 transition-transform duration-300", isLoggedIn && isBookmarked ? "fill-red-500 text-red-500 scale-110" : "hover:scale-105")} />
                        </button>
                    </div>
                    <div className="p-6">
                        <h1 className="text-3xl font-bold mb-2">{game.name}</h1>
                        <p className="text-muted-foreground">{game.description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Left Column - Game Info */}
                    <div className="lg:col-span-2">
                        {/* User Inputs Section */}
                        <div className="glass-card rounded-2xl p-6 mb-6">
                            <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 mb-4 select-none">
                                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold shrink-0">1</span>
                                {t.Topupinfo}
                            </p>
                            {game.fields && game.fields.length > 0 ? (
                                <div className={`grid gap-4 ${game.fields.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    {game.fields.map((field) => (
                                        <div key={field.name}>
                                            <label className="block text-sm font-medium mb-2">
                                                {field.label}
                                                {field.required && <span className="text-red-500">*</span>}
                                            </label>
                                            <div className="relative">
                                                {field.options && field.options.length > 0 ? (
                                                    <select
                                                        value={formData[field.name] || ""}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, [field.name]: e.target.value });
                                                            if (error) setError(null);
                                                        }}
                                                        className={cn(
                                                            "w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground focus:border-primary/60 focus:ring-primary/20 bg-background/20 backdrop-blur-sm cursor-pointer h-10 transition-all",
                                                            !isLoggedIn && "opacity-50 border-border/20 cursor-not-allowed"
                                                        )}
                                                        disabled={submitting || !isLoggedIn}
                                                    >
                                                        <option value="" disabled className="bg-background text-foreground">
                                                            {field.placeholder || `เลือก ${field.label}`}
                                                        </option>
                                                        {field.options.map((opt) => (
                                                            <option 
                                                                key={opt.value} 
                                                                value={opt.value}
                                                                className="bg-background text-foreground"
                                                            >
                                                                {opt.label || opt.value}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <Input
                                                        type={field.type || "text"}
                                                        placeholder={field.placeholder}
                                                        value={formData[field.name] || ""}
                                                        onChange={(e) => {
                                                            const cleanValue = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                                                            setFormData({ ...formData, [field.name]: cleanValue });
                                                            if (error) setError(null);
                                                        }}
                                                        className={cn(
                                                            "bg-muted/30 border-border/50 text-foreground focus:border-primary/60 focus:ring-primary/20",
                                                            !isLoggedIn && "opacity-50 border-border/20 cursor-not-allowed"
                                                        )}
                                                        disabled={submitting || !isLoggedIn}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">{t.noFieldsRequired || "No additional information required"}</p>
                            )}
                        </div>

                        {/* Packages Grid */}
                        <div className="glass-card rounded-2xl p-6 mb-6">
                            <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 mb-4 select-none">
                                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold shrink-0">2</span>
                                {t.Choosepackage}
                            </p>
                            {game.packages && game.packages.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {game.packages.map((pkg) => {
                                        const selected = selectedPackage?.id === pkg.id;
                                        return (
                                            <div
                                                key={pkg.id}
                                                onClick={() => {
                                                    if (!isLoggedIn) {
                                                        toast.error("ต้องเข้าสู่ระบบก่อนทำรายการ");
                                                        return;
                                                    }
                                                    setSelectedPackage(pkg);
                                                    if (error) setError(null);
                                                }}
                                                className={cn(
                                                    "h-full p-3 rounded-2xl transition-all duration-300 border select-none",
                                                    !isLoggedIn
                                                        ? "border-border/20 bg-muted/10 opacity-50 cursor-not-allowed"
                                                        : selected 
                                                            ? "border-primary/70 bg-primary/10 shadow-[0_0_25px_rgba(56,189,248,0.16)] cursor-pointer" 
                                                            : "border-border/30 bg-muted/30 hover:border-primary/50 hover:bg-muted/40 cursor-pointer"
                                                )}
                                            >
                                                <div className="mb-3">
                                                    <p className="text-xs text-muted-foreground font-medium">{pkg.name}</p>
                                                    <p className="text-sm font-bold text-foreground line-clamp-2">
                                                        {pkg.count}
                                                    </p>
                                                </div>
                                                <div className="pt-3 border-t border-border/20">
                                                    {pkg.flashSale?.isActive ? (
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-baseline gap-1.5">
                                                                <span className="text-lg font-black text-red-500">
                                                                    ฿ {Number(pkg.effectivePrice).toFixed(2)}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground line-through">
                                                                    ฿ {Number(pkg.price).toFixed(2)}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] w-fit font-bold text-white px-1.5 py-0.5 rounded bg-gradient-to-r from-red-600 to-orange-500 animate-pulse">
                                                                Flash Sale
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-lg font-bold text-primary">
                                                            ฿ {Number(pkg.price).toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">{t.noPackages || "No packages available"}</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Order Form (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="glass-card rounded-2xl p-6 sticky top-24">


                            {/* Payment Method Selection */}
                            <div className="mb-6 pb-6 border-b border-border/50">
                                <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 mb-4 select-none">
                                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold shrink-0">3</span>
                                    วิธีการชำระเงิน (Payment Method)
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedPackage && totalAmount <= 0 ? (
                                        <button
                                            type="button"
                                            disabled={!isLoggedIn}
                                            onClick={() => setPaymentMethod("free")}
                                            className={cn(
                                                "col-span-2 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all select-none border-primary bg-primary/10 text-primary font-bold cursor-pointer"
                                            )}
                                        >
                                            <Gift className="w-5 h-5 mb-1 text-emerald-500 fill-current" />
                                            <span className="text-[11px]">ชำระฟรี (Free Checkout)</span>
                                        </button>
                                    ) : (
                                        <>
                                            {activeMethods.filter(m => m.enabled).map(m => {
                                                const mCode = GATEWAY_TO_METHOD[m.id] ?? m.id;
                                                const isSel = paymentMethod === mCode;
                                                let iconEl = <Coins className="w-5 h-5 mb-1 text-amber-500 fill-current" />;
                                                if (m.id === "promptpay") {
                                                    iconEl = <QrCode className={cn("w-5 h-5 mb-1", !isLoggedIn ? "text-muted-foreground/60" : "text-primary")} />;
                                                } else if (m.id === "truemoney") {
                                                    iconEl = <Wallet className="w-5 h-5 mb-1 text-orange-500 fill-current" />;
                                                } else if (m.id === "bank_transfer") {
                                                    iconEl = <Landmark className="w-5 h-5 mb-1 text-purple-500" />;
                                                }

                                                let label = m.name;
                                                if (m.id === "wallet") {
                                                    label = `Coin (฿${walletBalance.toFixed(2)})`;
                                                }

                                                return (
                                                    <button
                                                        key={m.id}
                                                        type="button"
                                                        disabled={!isLoggedIn}
                                                        onClick={() => {
                                                            if (!isLoggedIn) {
                                                                toast.error("ต้องเข้าสู่ระบบก่อนทำรายการ");
                                                                return;
                                                            }
                                                            setPaymentMethod(mCode);
                                                        }}
                                                        className={cn(
                                                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all select-none",
                                                            !isLoggedIn
                                                                ? "opacity-50 cursor-not-allowed border-border/20 bg-muted/10 text-muted-foreground"
                                                                : isSel
                                                                    ? "border-primary bg-primary/10 text-primary font-bold cursor-pointer"
                                                                    : "border-border/30 hover:border-primary/50 text-muted-foreground cursor-pointer"
                                                        )}
                                                    >
                                                        {iconEl}
                                                        <span className="text-[11px] whitespace-nowrap">{label}</span>
                                                    </button>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
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
                                        variant="outline"
                                        className="px-4 border border-primary/30 hover:bg-primary/10 text-primary text-sm font-semibold rounded-xl transition-all cursor-pointer"
                                    >
                                        {t.useCoupon}
                                    </Button>
                                </div>
                                {appliedCoupon && (
                                    <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded-md">
                                        <p className="text-xs text-green-500">{`✓ ใช้คูปอง ${appliedCoupon.code} ประหยัด ${appliedCoupon.discount}%`}</p>
                                    </div>
                                )}
                            </div>

                            <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 mb-4 select-none">
                                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold shrink-0">4</span>
                                {t.orderSummary}
                            </p>
                            <div className="bg-muted/20 rounded-2xl p-4 mb-6 border border-border/30">
                                <p className="text-xs text-muted-foreground mb-1">{t.selectedPackage}</p>
                                <p className="font-bold text-foreground">
                                    {selectedPackage ? selectedPackage.count : t.noSelection}
                                </p>
                                <div className="space-y-2 mt-4 pt-4 border-t border-primary/20">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t.priceLabel}</span>
                                        <span className="font-semibold">฿ {selectedPackage ? selectedPackagePrice.toFixed(2) : "0.00"}</span>
                                    </div>
                                    {appliedCoupon && selectedPackage && (
                                        <div className="flex justify-between text-sm text-green-500">
                                            <span>{`ส่วนลด (${appliedCoupon.discount}%):`}</span>
                                            <span>-฿ {(selectedPackagePrice * appliedCoupon.discount / 100).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {selectedPackage && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">ภาษีมูลค่าเพิ่ม (VAT {vatRate}%)</span>
                                            <span className="font-semibold">฿ {vatAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-primary/20">
                                        <span>{t.totalLabel}</span>
                                        <span className="text-primary">
                                            ฿ {totalAmount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>



                            {/* Submit Button */}
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting || (isLoggedIn && !selectedPackage)}
                                className={cn(
                                    "w-full h-12 font-bold rounded-xl transition-all shadow-md active:scale-[0.98]",
                                    !isLoggedIn
                                        ? "bg-muted border border-border/50 text-muted-foreground/60 cursor-pointer"
                                        : "bg-primary hover:bg-primary/95 text-white cursor-pointer hover:shadow-lg"
                                )}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        {t.processing}
                                    </>
                                ) : !isLoggedIn ? (
                                    <>
                                        <LockIcon className="w-4.5 h-4.5 mr-2 text-muted-foreground/60" />
                                        สั่งซื้อ
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        สั่งซื้อ
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground mt-4">
                                {t.selectPackageHint}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning Modal */}
            {showWarningModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-background rounded-2xl w-full max-w-sm shadow-2xl border border-border/40 p-6 flex flex-col items-center text-center relative">
                        <button
                            onClick={() => setShowWarningModal(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <X className="w-4.5 h-4.5" />
                        </button>

                        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 text-amber-500">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">แจ้งเตือน (Warning)</h3>
                        <p className="text-sm text-muted-foreground mb-6 whitespace-pre-line leading-relaxed">{warningText}</p>
                        {/* Removed OK button per UX request; close via X in top-right */}
                    </div>
                </div>
            )}

            {/* QR Code Payment Modal */}
            {showQrPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-background rounded-2xl w-full max-w-sm shadow-2xl border border-border/40 overflow-hidden relative">
                        {/* Status bar */}
                        <div className="h-1 w-full bg-amber-500 animate-pulse" />
                        
                        <button
                            disabled={paymentChecking}
                            onClick={() => setShowQrPaymentModal(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            <X className="w-4.5 h-4.5" />
                        </button>

                        <div className="p-6 flex flex-col items-center text-center">
                            <h3 className="text-base font-bold text-foreground mb-1">สแกนชำระเงินเพื่อเติมเกม</h3>
                            <p className="text-xs text-muted-foreground mb-6">กรุณาสแกน QR Code ด้วยแอปธนาคารของคุณ</p>

                            {/* QR Code Container */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/20 mb-4 flex items-center justify-center w-48 h-48 relative">
                                {qrCodeUrl ? (
                                    <img src={qrCodeUrl} alt="PromptPay QR Code" className="w-full h-full object-contain" />
                                ) : (
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground font-mono bg-muted/40 px-3 py-1 rounded-full mb-6">
                                Ref: {paymentRef || "-"}
                            </p>

                            <div className="w-full space-y-3">
                                <div className="flex justify-between text-xs text-muted-foreground border-b border-border/20 pb-2">
                                    <span>ยอดชำระ:</span>
                                    <span className="font-bold text-primary">
                                        ฿ {totalAmount.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>สถานะ:</span>
                                    <span className="flex items-center gap-1.5 font-semibold text-amber-500 animate-pulse">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        รอการชำระเงิน...
                                    </span>
                                </div>
                            </div>

                            {/* Dev simulate button */}
                            <Button
                                onClick={async () => {
                                    if (!paymentRef || !currentOrderId) return;
                                    try {
                                        setPaymentChecking(true);
                                        await api.simulateTopupComplete(paymentRef);
                                    } catch (err) {
                                        console.error("Simulation error:", err);
                                    } finally {
                                        setPaymentChecking(false);
                                    }
                                }}
                                disabled={paymentChecking}
                                variant="outline"
                                className="w-full mt-6 text-xs border-dashed border-primary/30 text-primary hover:bg-primary/5 cursor-pointer font-bold rounded-xl"
                            >
                                {paymentChecking ? "กำลังตรวจสอบ..." : "จำลองการชำระเงินสำเร็จ (Simulate Success)"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Popup Modal */}
            {success && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-background rounded-2xl w-full max-w-sm shadow-2xl border border-border/40 p-6 flex flex-col items-center text-center relative">
                        <button
                            onClick={() => setSuccess(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <X className="w-4.5 h-4.5" />
                        </button>

                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-500">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">ทำรายการเสร็จสิ้น</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            ทำรายการสำเร็จ ระบบได้ทำการบันทึกและจัดเก็บประวัติการสั่งซื้อของท่านเรียบร้อยแล้ว
                        </p>
                        <div className="bg-muted/40 rounded-xl px-4 py-2 w-full mb-6 text-xs text-muted-foreground text-left font-mono border border-border/30">
                            <span className="font-semibold text-foreground">Order ID:</span> {orderId}
                        </div>
                        {isLoggedIn ? (
                            <Button 
                                onClick={() => {
                                    router.push(`/history`);
                                }}
                                className="w-full font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors cursor-pointer"
                            >
                                ดูประวัติการสั่งซื้อ (View History)
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => {
                                    router.push(`/`);
                                }}
                                className="w-full font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors cursor-pointer"
                            >
                                กลับหน้าแรก (Go Home)
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
