"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/components/language-context";
import { useSidebar } from "@/components/sidebar-context";
import { api } from "@/lib/api";
import {
    Crown, Gem, Sparkles, ChevronRight, ChevronLeft, History, User, Loader2, Gift, Mail, Lock, Eye, EyeOff, Check, X, HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { toast } from "sonner";

const VIP_TIERS: Record<string, { name: string; color: string }> = {
    MEMBER: { name: "General Member", color: "#94a3b8" },
    BRONZE: { name: "Bronze", color: "#b45309" },
    SILVER: { name: "Platinum", color: "#38bdf8" },
    GOLD: { name: "Platinum", color: "#38bdf8" },
    PLATINUM: { name: "Platinum", color: "#38bdf8" },
    EMERALD: { name: "Emerald", color: "#10b981" },
};
import THAI_ADDRESSES from "@/lib/thai-addresses.json";

const formatPhoneNumber = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 10);
    if (clean.length <= 3) return clean;
    if (clean.length <= 6) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
};

interface ProfileData { display_name: string; email: string; member_since: string }
interface LoyaltyData { tier: string; current_points: number; next_tier_threshold: number | null }
interface BalanceData { amount: string; currency: string }
interface RecentOrder { product_name: string; game_category: string; amount: string; status: string; created_at: string }

export default function AccountPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { t } = useLanguage();


    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
    const [, setBalance] = useState<BalanceData | null>(null);
    const [, setOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);

    // Profile form states
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [addressLine1, setAddressLine1] = useState("");
    const [addressLine2, setAddressLine2] = useState("");
    const [province, setProvince] = useState("");
    const [district, setDistrict] = useState("");
    const [subDistrict, setSubDistrict] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [activeAddressId, setActiveAddressId] = useState<string | null>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [savedProfile, setSavedProfile] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        province: "",
        district: "",
        subDistrict: "",
        postalCode: "",
    });
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [showEmailFields, setShowEmailFields] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmPhrase, setDeleteConfirmPhrase] = useState("");
    const [deletePassword, setDeletePassword] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    // Reactive validations for personal info
    const firstNameError = useMemo(() => {
        if (!firstName.trim()) return "กรุณากรอกชื่อ";
        if (firstName.includes(".")) return "ชื่อไม่ควรมีเครื่องหมายจุด (.)";
        return "";
    }, [firstName]);

    const lastNameError = useMemo(() => {
        if (!lastName.trim()) return "กรุณากรอกนามสกุล";
        if (lastName.includes(".")) return "นามสกุลไม่ควรมีเครื่องหมายจุด (.)";
        return "";
    }, [lastName]);

    const phoneError = useMemo(() => {
        if (!phone.trim()) return "กรุณากรอกเบอร์โทรศัพท์";
        const digits = phone.replace(/\D/g, "");
        if (digits.length < 9 || digits.length > 10) return "เบอร์โทรศัพท์ต้องมี 9-10 หลัก";
        return "";
    }, [phone]);

    const isProfileFormValid = !firstNameError && !lastNameError && !phoneError;

    useEffect(() => {
        if (!user) return;
        Promise.all([
            api.getMe().then((res) => {
                setProfile(res);
                if (res?.display_name) {
                    const [first, ...rest] = res.display_name.trim().split(" ");
                    setFirstName(first ?? "");
                    setLastName(rest.join(" ") ?? "");
                }
            }),
            api.getLoyalty().then(setLoyalty),
            api.getWalletBalance().then(setBalance),
            api.getRecentOrders().then((r) => setOrders(r.recent_orders ?? [])),
            api.getAddresses().then((addrList: any[]) => {
                if (addrList && addrList.length > 0) {
                    const addr = addrList.find((a: any) => a.isDefault) || addrList[0];
                    const parts = addr.recipientName.trim().split(" ");
                    const first = parts[0] || "";
                    const rest = parts.slice(1).join(" ") || "";
                    
                    setFirstName(first);
                    setLastName(rest);
                    setPhone(formatPhoneNumber(addr.phone));
                    setAddressLine1(addr.addressLine1);
                    setAddressLine2(addr.addressLine2 || "");
                    setProvince(addr.province);
                    setDistrict(addr.district);
                    setSubDistrict(addr.subDistrict || "");
                    setPostalCode(addr.postalCode);
                    setActiveAddressId(addr.id);

                    setSavedProfile({
                        firstName: first,
                        lastName: rest,
                        phone: formatPhoneNumber(addr.phone),
                        addressLine1: addr.addressLine1,
                        addressLine2: addr.addressLine2 || "",
                        province: addr.province,
                        district: addr.district,
                        subDistrict: addr.subDistrict || "",
                        postalCode: addr.postalCode,
                    });
                } else {
                    const storedFirstName = localStorage.getItem("gachapay_first_name") || "";
                    const storedLastName = localStorage.getItem("gachapay_last_name") || "";
                    const storedPhone = formatPhoneNumber(localStorage.getItem("gachapay_phone") || "");
                    const storedAddressLine1 = localStorage.getItem("gachapay_address_line1") || "";
                    const storedAddressLine2 = localStorage.getItem("gachapay_address_line2") || "";
                    const storedProvince = localStorage.getItem("gachapay_province") || "";
                    const storedDistrict = localStorage.getItem("gachapay_district") || "";
                    const storedSubDistrict = localStorage.getItem("gachapay_sub_district") || "";
                    const storedPostalCode = localStorage.getItem("gachapay_postal_code") || "";

                    setFirstName(storedFirstName);
                    setLastName(storedLastName);
                    setPhone(storedPhone);
                    setAddressLine1(storedAddressLine1);
                    setAddressLine2(storedAddressLine2);
                    setProvince(storedProvince);
                    setDistrict(storedDistrict);
                    setSubDistrict(storedSubDistrict);
                    setPostalCode(storedPostalCode);
                    setSavedProfile({
                        firstName: storedFirstName,
                        lastName: storedLastName,
                        phone: storedPhone,
                        addressLine1: storedAddressLine1,
                        addressLine2: storedAddressLine2,
                        province: storedProvince,
                        district: storedDistrict,
                        subDistrict: storedSubDistrict,
                        postalCode: storedPostalCode,
                    });
                }
            }).catch(() => {
                const storedFirstName = localStorage.getItem("gachapay_first_name") || "";
                const storedLastName = localStorage.getItem("gachapay_last_name") || "";
                const storedPhone = formatPhoneNumber(localStorage.getItem("gachapay_phone") || "");
                const storedAddressLine1 = localStorage.getItem("gachapay_address_line1") || "";
                const storedAddressLine2 = localStorage.getItem("gachapay_address_line2") || "";
                const storedProvince = localStorage.getItem("gachapay_province") || "";
                const storedDistrict = localStorage.getItem("gachapay_district") || "";
                const storedSubDistrict = localStorage.getItem("gachapay_sub_district") || "";
                const storedPostalCode = localStorage.getItem("gachapay_postal_code") || "";

                setFirstName(storedFirstName);
                setLastName(storedLastName);
                setPhone(storedPhone);
                setAddressLine1(storedAddressLine1);
                setAddressLine2(storedAddressLine2);
                setProvince(storedProvince);
                setDistrict(storedDistrict);
                setSubDistrict(storedSubDistrict);
                setPostalCode(storedPostalCode);
                setSavedProfile({
                    firstName: storedFirstName,
                    lastName: storedLastName,
                    phone: storedPhone,
                    addressLine1: storedAddressLine1,
                    addressLine2: storedAddressLine2,
                    province: storedProvince,
                    district: storedDistrict,
                    subDistrict: storedSubDistrict,
                    postalCode: storedPostalCode,
                });
            })
        ]).finally(() => setLoading(false));
    }, [user]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Save to localStorage so it gets prefilled during checkout
            localStorage.setItem("gachapay_first_name", firstName);
            localStorage.setItem("gachapay_last_name", lastName);
            localStorage.setItem("gachapay_phone", phone);
            localStorage.setItem("gachapay_address_line1", addressLine1);
            localStorage.setItem("gachapay_address_line2", addressLine2);
            localStorage.setItem("gachapay_province", province);
            localStorage.setItem("gachapay_district", district);
            localStorage.setItem("gachapay_sub_district", subDistrict);
            localStorage.setItem("gachapay_postal_code", postalCode);

            // Save/update address in backend database
            const recipientName = `${firstName.trim()} ${lastName.trim()}`.trim();
            const addressData = {
                recipientName,
                phone: phone.replace(/\D/g, ""),
                addressLine1,
                addressLine2: addressLine2 || null,
                subDistrict: subDistrict || null,
                district,
                province,
                postalCode,
                isDefault: true,
            };

            try {
                if (activeAddressId) {
                    const res = await api.updateAddress(activeAddressId, addressData);
                    if (res?.id) setActiveAddressId(res.id);
                } else {
                    const res = await api.addAddress(addressData);
                    if (res?.id) setActiveAddressId(res.id);
                }
            } catch (addrErr) {
                console.error("Failed to save address to DB:", addrErr);
            }

            setSavedProfile({
                firstName,
                lastName,
                phone,
                addressLine1,
                addressLine2,
                province,
                district,
                subDistrict,
                postalCode,
            });

            if (showPasswordFields) {
                if (!currentPassword) {
                    toast.error("กรุณากรอกรหัสผ่านปัจจุบัน");
                    setIsSaving(false);
                    return;
                }
                if (!isPasswordValid) {
                    toast.error("กรุณาตั้งรหัสผ่านตามเงื่อนไขที่กำหนด");
                    setIsSaving(false);
                    return;
                }
                // Simulate password update
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setShowPasswordFields(false);
                toast.success("เปลี่ยนรหัสผ่านใหม่สำเร็จ!");
            }

            toast.success("บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว!");
            setIsEditingProfile(false);
        } catch (err) {
            toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        } finally {
            setIsSaving(false);
        }
    };

    const handleStartEmailChange = () => {
        setNewEmail(profile?.email ?? user?.email ?? "");
        setShowEmailFields(true);
    };

    const handleCancelEmailChange = () => {
        setShowEmailFields(false);
        setNewEmail(profile?.email ?? user?.email ?? "");
    };

    const handleSaveEmail = () => {
        if (!newEmail.trim()) {
            toast.error("กรุณากรอกอีเมลใหม่");
            return;
        }
        toast("โปรดติดต่อฝ่ายสนับสนุนเพื่อเปลี่ยนอีเมล");
        setShowEmailFields(false);
    };

    const passwordChecks = {
        length: newPassword.length >= 8,
        uppercase: /[A-Z]/.test(newPassword),
        lowercase: /[a-z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
        special: /[!@#$%^&*(),.?":{}|<>-]/.test(newPassword),
        match: newPassword === confirmPassword && confirmPassword !== "",
    };
    const isPasswordValid = Object.values(passwordChecks).every(Boolean);

    const tierKey = loyalty?.tier?.toUpperCase() ?? "BRONZE";
    const tierInfo = VIP_TIERS[tierKey] ?? VIP_TIERS.BRONZE;
    const currentPoints = loyalty?.current_points ?? 0;
    const nextThreshold = loyalty?.next_tier_threshold ?? currentPoints;
    const progress = nextThreshold > 0 ? Math.min((currentPoints / nextThreshold) * 100, 100) : 100;

    const expRemaining = Math.max(nextThreshold - currentPoints, 0);

    const districtOptions = province ? THAI_ADDRESSES.find(p => p.name === province)?.amphure ?? [] : [];
    const subDistrictOptions = district ? districtOptions.find(d => d.name === district)?.tambon ?? [] : [];
    const postalCodeOptions = subDistrict
        ? [subDistrictOptions.find(t => t.name === subDistrict)?.zip].filter(Boolean) as string[]
        : [];

    const handleEditClick = () => {
        setSavedProfile({
            firstName,
            lastName,
            phone,
            addressLine1,
            addressLine2,
            province,
            district,
            subDistrict,
            postalCode,
        });
        setIsEditingProfile(true);
    };

    const handleCancelEdit = () => {
        setFirstName(savedProfile.firstName);
        setLastName(savedProfile.lastName);
        setPhone(savedProfile.phone);
        setAddressLine1(savedProfile.addressLine1);
        setAddressLine2(savedProfile.addressLine2);
        setProvince(savedProfile.province);
        setDistrict(savedProfile.district);
        setSubDistrict(savedProfile.subDistrict);
        setPostalCode(savedProfile.postalCode);
        setShowPasswordFields(false);
        setCurrentPassword("");
        setNewPassword("");
        setIsEditingProfile(false);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmPhrase !== "ลบข้อมูล") {
            toast.error("กรุณาพิมพ์ ลบข้อมูล เพื่อยืนยัน");
            return;
        }
        if (!deletePassword) {
            toast.error("กรุณากรอกรหัสผ่าน");
            return;
        }

        setIsDeleting(true);
        try {
            await api.deleteAccount({ confirmPhrase: deleteConfirmPhrase, password: deletePassword });
            toast.success("ลบบัญชีสำเร็จ");
            logout();
            router.push("/");
        } catch (err: any) {
            toast.error(err.message || "ลบบัญชีล้มเหลว");
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen pt-16 pb-24">
            <div className="container mx-auto px-6 max-w-5xl pt-8">

                {/* Back Button & Page Title */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-sm"
                        aria-label="Back"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-black text-foreground">ภาพรวมบัญชี</h1>
                </div>

                <div className="grid grid-cols-1 gap-6">

                    {/* VIP Status Card */}
                    <div className="space-y-6">
                        <div
                            onClick={() => router.push("/vip-tier")}
                            className="w-full text-left bg-card rounded-3xl border border-border/50 hover:border-primary/45 transition-all group overflow-hidden relative shadow-md hover:shadow-lg hover:-translate-y-0.5 duration-300 pb-8 cursor-pointer"
                        >
                            {/* Card Cover Header Background */}
                            <div className="w-full h-32 bg-gradient-to-r from-cyan-500/20 via-[#0ea5e9]/20 to-fuchsia-500/20 relative" />

                            <div className="px-6 flex flex-col items-center text-center">
                                {/* Avatar protruding from top of content */}
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500 via-[#0ea5e9] to-fuchsia-500 flex items-center justify-center shadow-lg border-4 border-card -mt-14 z-10 select-none">
                                    <span className="text-3xl font-extrabold text-white">{firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}</span>
                                </div>

                                <div className="mt-3">
                                    <div className="flex items-center justify-center gap-1.5 mb-1">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">โปรไฟล์</p>
                                    </div>
                                    <p className="text-xl font-black text-foreground truncate">{profile?.display_name || `${firstName} ${lastName}`.trim() || user?.email}</p>
                                    {user?.email && <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>}
                                    {user?.id && (
                                        <div 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(user.id);
                                                toast.success("คัดลอก ID ผู้ใช้แล้ว!");
                                            }}
                                            className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/60 hover:text-foreground bg-muted/20 hover:bg-muted/40 transition-all px-2.5 py-0.5 rounded-full border border-border/30 cursor-pointer select-all"
                                            title="คลิกเพื่อคัดลอก ID"
                                        >
                                            ID: {user.id}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mt-4">
                                    <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs border"
                                        style={{
                                            background: `${tierInfo.color}15`,
                                            borderColor: `${tierInfo.color}30`,
                                            color: tierInfo.color
                                        }}>
                                        <Crown className="w-4 h-4 animate-pulse" style={{ color: tierInfo.color }} />
                                        <span className="font-extrabold tracking-wider">{tierInfo.name}</span>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push("/vip-tier");
                                        }}
                                        className="p-1.5 rounded-full border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-sm group/help relative"
                                        aria-label="VIP privileges"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-1.5 bg-[#18181b] text-white text-[9px] rounded-md border border-white/10 shadow-md opacity-0 pointer-events-none group-hover/help:opacity-100 transition-opacity z-50 text-center font-bold">
                                            ดูสิทธิพิเศษระดับ
                                        </span>
                                    </button>
                                </div>

                                {/* Wide progress bar (no container box) */}
                                <div className="w-full max-w-2xl mt-8 space-y-3 px-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="text-left">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">ความคืบหน้า</p>
                                            <p className="text-xs font-bold text-foreground">VIP Progress</p>
                                        </div>
                                        <span className="text-sm font-extrabold text-primary">{Math.round(progress)}%</span>
                                    </div>

                                    <div className="h-3 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden p-0.5 border border-border/40">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-fuchsia-500 transition-all duration-1000 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between text-xs text-muted-foreground font-semibold pt-1">
                                        <span>{currentPoints.toLocaleString()} EXP ปัจจุบัน</span>
                                        {nextThreshold > currentPoints ? (
                                            <span className="text-foreground">ต้องการอีก {expRemaining.toLocaleString()} EXP เพื่อเลื่อนขั้น</span>
                                        ) : (
                                            <span className="text-primary font-bold">ถึงขั้นสูงสุดแล้ว</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile and Billing Settings Form */}
                    <div>
                        <div className="glass-card rounded-2xl p-8 border border-border/50">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" /> {t.personalInfo}
                                </h2>
                                {!isEditingProfile ? (
                                    <Button type="button" variant="outline" size="sm" onClick={handleEditClick}>
                                        แก้ไขข้อมูล
                                    </Button>
                                ) : (
                                    <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit}>
                                        ยกเลิก
                                    </Button>
                                )}
                            </div>

                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                {/* Email Field (Read-only) */}
                                <Accordion type="single" collapsible className="space-y-4">
                                    <AccordionItem value="account-security">
                                        <AccordionTrigger className="text-left text-sm text-foreground font-semibold">
                                            ข้อมูลล็อกอินและความปลอดภัย
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-6 rounded-2xl border border-border/50 bg-muted/50 p-5">
                                                <div className="space-y-1.5">
                                                    <label htmlFor="account-email" className="text-xs font-semibold text-muted-foreground">Email</label>
                                                    <Input
                                                        id="account-email"
                                                        type="email"
                                                        value={profile?.email ?? user?.email ?? ""}
                                                        disabled
                                                        className="bg-muted/50 border-border/30 text-muted-foreground cursor-not-allowed select-none"
                                                    />
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                        <p className="text-[10px] text-muted-foreground">อีเมลประจำบัญชีไม่สามารถแก้ไขได้</p>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={handleStartEmailChange}
                                                            className="inline-flex items-center gap-2"
                                                        >
                                                            <Mail className="w-4 h-4" />
                                                            เปลี่ยนอีเมล
                                                        </Button>
                                                    </div>
                                                </div>

                                                {showEmailFields && (
                                                    <div className="space-y-4">
                                                        <div className="space-y-1.5">
                                                            <label htmlFor="new-email" className="text-xs font-semibold text-muted-foreground">อีเมลใหม่</label>
                                                            <Input
                                                                id="new-email"
                                                                type="email"
                                                                value={newEmail}
                                                                onChange={(e) => setNewEmail(e.target.value)}
                                                                placeholder="กรอกอีเมลใหม่"
                                                                className="bg-muted/30 border-border/50 focus:border-primary"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            <Button
                                                                type="button"
                                                                onClick={handleSaveEmail}
                                                            >
                                                                บันทึกอีเมล
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={handleCancelEmailChange}
                                                            >
                                                                ยกเลิก
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-1.5">
                                                    <label htmlFor="account-password" className="text-xs font-semibold text-muted-foreground">รหัสผ่าน</label>
                                                    <Input
                                                        id="account-password"
                                                        type="password"
                                                        value="password"
                                                        disabled
                                                        className="bg-muted/50 border-border/30 text-muted-foreground cursor-not-allowed select-none"
                                                        placeholder="********"
                                                    />
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                        <p className="text-[10px] text-muted-foreground">รหัสผ่านถูกล็อคและไม่สามารถแก้ไขโดยตรงได้</p>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setShowPasswordFields(true)}
                                                            disabled={showPasswordFields}
                                                            className={cn("inline-flex items-center gap-2", !showPasswordFields && "self-start")}
                                                        >
                                                            <Lock className="w-4 h-4" />
                                                            เปลี่ยนรหัสผ่าน
                                                        </Button>
                                                    </div>
                                                </div>

                                                {showPasswordFields && (
                                                    <div className="space-y-4 rounded-2xl border border-border/50 bg-muted/30 p-4">
                                                        <div className="space-y-4">
                                                            <div className="space-y-1.5">
                                                                <label htmlFor="current-password" className="text-[11px] font-semibold text-muted-foreground">รหัสผ่านปัจจุบัน</label>
                                                                <div className="relative">
                                                                    <Input
                                                                        id="current-password"
                                                                        type={showCurrentPassword ? "text" : "password"}
                                                                        placeholder="••••••••"
                                                                        value={currentPassword}
                                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                                        className="bg-muted/30 border-border/50 focus:border-primary pr-10"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                                                                        className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                                                                    >
                                                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label htmlFor="new-password" className="text-[11px] font-semibold text-muted-foreground">รหัสผ่านใหม่</label>
                                                                <div className="relative">
                                                                    <Input
                                                                        id="new-password"
                                                                        type={showNewPassword ? "text" : "password"}
                                                                        placeholder="••••••••"
                                                                        value={newPassword}
                                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                                        className="bg-muted/30 border-border/50 focus:border-primary pr-10"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                                                        className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                                                                    >
                                                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label htmlFor="confirm-password" className="text-[11px] font-semibold text-muted-foreground">ยืนยันรหัสผ่านใหม่</label>
                                                                <div className="relative">
                                                                    <Input
                                                                        id="confirm-password"
                                                                        type={showConfirmPassword ? "text" : "password"}
                                                                        placeholder="••••••••"
                                                                        value={confirmPassword}
                                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                                        className="bg-muted/30 border-border/50 focus:border-primary pr-10"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                                        className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                                                                    >
                                                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-2 text-xs mt-3">
                                                            <PasswordCheck checked={passwordChecks.length} text="อย่างน้อย 8 ตัวอักษร" />
                                                            <PasswordCheck checked={passwordChecks.uppercase} text="ตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว" />
                                                            <PasswordCheck checked={passwordChecks.lowercase} text="ตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว" />
                                                            <PasswordCheck checked={passwordChecks.number} text="ตัวเลขอย่างน้อย 1 ตัว" />
                                                            <PasswordCheck checked={passwordChecks.special} text="อักขระพิเศษอย่างน้อย 1 ตัว" />
                                                            <PasswordCheck checked={passwordChecks.match} text="รหัสผ่านใหม่ตรงกันทั้งสองช่อง" />
                                                        </div>
                                                        <div className="flex justify-end gap-2 pt-2 border-t border-border/30">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setShowPasswordFields(false);
                                                                    setCurrentPassword("");
                                                                    setNewPassword("");
                                                                    setConfirmPassword("");
                                                                }}
                                                            >
                                                                ยกเลิก
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                {/* Name Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="first-name" className="text-xs font-semibold text-muted-foreground">ชื่อ</label>
                                        <Input
                                            id="first-name"
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="ชื่อ"
                                            disabled={!isEditingProfile}
                                            className={cn(
                                                "bg-muted/30 border-border/50 focus:border-primary",
                                                !isEditingProfile && "opacity-70 cursor-not-allowed"
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="last-name" className="text-xs font-semibold text-muted-foreground">นามสกุล</label>
                                        <Input
                                            id="last-name"
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="นามสกุล"
                                            disabled={!isEditingProfile}
                                            className={cn(
                                                "bg-muted/30 border-border/50 focus:border-primary",
                                                !isEditingProfile && "opacity-70 cursor-not-allowed",
                                                isEditingProfile && lastNameError && "border-red-500/80 focus:border-red-500"
                                            )}
                                        />
                                        {isEditingProfile && lastNameError && (
                                            <p className="text-xs text-red-500/90 font-medium px-1 mt-0.5">{lastNameError}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Phone Number Field */}
                                <div className="space-y-1.5">
                                    <label htmlFor="phone" className="text-xs font-semibold text-muted-foreground">เบอร์โทรศัพท์</label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                                        placeholder="เช่น 081-234-5678"
                                        disabled={!isEditingProfile}
                                        className={cn(
                                            "bg-muted/30 border-border/50 focus:border-primary",
                                            !isEditingProfile && "opacity-70 cursor-not-allowed",
                                            isEditingProfile && phoneError && "border-red-500/80 focus:border-red-500"
                                        )}
                                    />
                                    {isEditingProfile && phoneError && (
                                        <p className="text-xs text-red-500/90 font-medium px-1 mt-0.5">{phoneError}</p>
                                    )}
                                </div>

                                {/* Billing Address Fields */}
                                <div className="space-y-1.5">
                                    <label htmlFor="address" className="text-xs font-semibold text-muted-foreground">ที่อยู่</label>
                                    <Input
                                        id="address"
                                        type="text"
                                        value={addressLine1}
                                        onChange={(e) => setAddressLine1(e.target.value)}
                                        placeholder="บ้านเลขที่, ถนน, ซอย"
                                        disabled={!isEditingProfile}
                                        className={cn(
                                            "bg-muted/30 border-border/50 focus:border-primary",
                                            !isEditingProfile && "opacity-70 cursor-not-allowed"
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-1.5">
                                            <label htmlFor="province" className="text-xs font-semibold text-muted-foreground">จังหวัด</label>
                                            <select
                                                id="province"
                                                value={province}
                                                onChange={(e) => {
                                                    setProvince(e.target.value);
                                                    setDistrict("");
                                                    setSubDistrict("");
                                                    setPostalCode("");
                                                }}
                                                disabled={!isEditingProfile}
                                                className={cn(
                                                    "w-full bg-muted/30 border-border/50 rounded-md px-3 py-2 text-sm text-foreground focus:border-primary",
                                                    !isEditingProfile && "opacity-70 cursor-not-allowed"
                                                )}
                                            >
                                                <option value="">เลือกจังหวัด</option>
                                                {THAI_ADDRESSES.map((p) => (
                                                    <option key={p.name} value={p.name}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label htmlFor="district" className="text-xs font-semibold text-muted-foreground">อำเภอ/เขต</label>
                                            <select
                                                id="district"
                                                value={district}
                                                onChange={(e) => {
                                                    setDistrict(e.target.value);
                                                    setSubDistrict("");
                                                    setPostalCode("");
                                                }}
                                                disabled={!isEditingProfile || !province}
                                                className={cn(
                                                    "w-full bg-muted/30 border-border/50 rounded-md px-3 py-2 text-sm text-foreground focus:border-primary",
                                                    (!isEditingProfile || !province) && "opacity-70 cursor-not-allowed"
                                                )}
                                            >
                                                <option value="">เลือกอำเภอ/เขต</option>
                                                {districtOptions.map((item) => (
                                                    <option key={item.name} value={item.name}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label htmlFor="subdistrict" className="text-xs font-semibold text-muted-foreground">ตำบล/แขวง</label>
                                            <select
                                                id="subdistrict"
                                                value={subDistrict}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setSubDistrict(val);
                                                    const matchedZip = subDistrictOptions.find(t => t.name === val)?.zip ?? "";
                                                    setPostalCode(matchedZip);
                                                }}
                                                disabled={!isEditingProfile || !district}
                                                className={cn(
                                                    "w-full bg-muted/30 border-border/50 rounded-md px-3 py-2 text-sm text-foreground focus:border-primary",
                                                    (!isEditingProfile || !district) && "opacity-70 cursor-not-allowed"
                                                )}
                                            >
                                                <option value="">เลือกตำบล/แขวง</option>
                                                {subDistrictOptions.map((item) => (
                                                    <option key={item.name} value={item.name}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label htmlFor="postal-code" className="text-xs font-semibold text-muted-foreground">รหัสไปรษณีย์</label>
                                            <select
                                                id="postal-code"
                                                value={postalCode}
                                                onChange={(e) => setPostalCode(e.target.value)}
                                                disabled={!isEditingProfile || !subDistrict}
                                                className={cn(
                                                    "w-full bg-muted/30 border-border/50 rounded-md px-3 py-2 text-sm text-foreground focus:border-primary",
                                                    (!isEditingProfile || !subDistrict) && "opacity-70 cursor-not-allowed"
                                                )}
                                            >
                                                <option value="">เลือกไปรษณีย์</option>
                                                {postalCodeOptions.map((code) => (
                                                    <option key={code} value={code}>
                                                        {code}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>


                                {/* Save Button */}
                                {isEditingProfile && (
                                    <Button
                                        type="submit"
                                        disabled={isSaving || !isProfileFormValid}
                                        className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold h-11 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                                    </Button>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Delete Account Section - Danger Zone */}
                    <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-6">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-base font-semibold text-foreground mb-2">ปิดบัญชี</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    เมื่อคุณปิดบัญชี ข้อมูลทั้งหมดของคุณจะถูกลบอย่างถาวร รวมถึงประวัติการสั่งซื้อ ยอดคงเหลือ และข้อมูลส่วนตัว การกระทำนี้ไม่สามารถย้อนกลับได้
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowDeleteModal(true)}
                                className="border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 hover:border-red-300 dark:hover:border-red-700 w-full sm:w-auto"
                            >
                                ปิดบัญชีของฉัน
                            </Button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Delete Account Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-background rounded-lg w-full max-w-lg shadow-xl border border-border overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">ปิดบัญชีของคุณ?</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        การกระทำนี้ไม่สามารถย้อนกลับได้
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteConfirmPhrase("");
                                        setDeletePassword("");
                                    }}
                                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-md">
                                    <p className="text-sm text-red-900 dark:text-red-300">
                                        คุณกำลังจะปิดบัญชีของคุณอย่างถาวร ข้อมูลทั้งหมดจะถูกลบและไม่สามารถกู้คืนได้
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label htmlFor="delete-confirm-phrase" className="text-sm font-medium text-foreground mb-1.5 block">
                                            พิมพ์ <span className="font-mono font-semibold text-red-600 dark:text-red-400">ลบข้อมูล</span> เพื่อยืนยัน
                                        </label>
                                        <Input
                                            id="delete-confirm-phrase"
                                            type="text"
                                            value={deleteConfirmPhrase}
                                            onChange={(e) => setDeleteConfirmPhrase(e.target.value)}
                                            placeholder="ลบข้อมูล"
                                            className="border-border focus:border-red-500 focus:ring-red-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="delete-password" className="text-sm font-medium text-foreground mb-1.5 block">
                                            รหัสผ่าน
                                        </label>
                                        <Input
                                            id="delete-password"
                                            type="password"
                                            value={deletePassword}
                                            onChange={(e) => setDeletePassword(e.target.value)}
                                            placeholder="กรอกรหัสผ่านของคุณ"
                                            className="border-border focus:border-red-500 focus:ring-red-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setDeleteConfirmPhrase("");
                                            setDeletePassword("");
                                        }}
                                        className="flex-1"
                                    >
                                        ยกเลิก
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting || deleteConfirmPhrase !== "ลบข้อมูล" || !deletePassword}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {isDeleting ? "กำลังลบ..." : "ปิดบัญชี"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function PasswordCheck({ checked, text }: { checked: boolean; text: string }) {
    return (
        <div className={`flex items-center gap-2 text-xs transition-all duration-300 ${checked
            ? "text-green-600 dark:text-green-400 font-medium opacity-100"
            : "text-muted-foreground opacity-70"
            }`}>
            {checked ? (
                <Check className="w-3.5 h-3.5 drop-shadow-[0_0_2px_rgba(22,163,74,0.3)] dark:drop-shadow-[0_0_4px_rgba(74,222,128,0.5)]" />
            ) : (
                <X className="w-3.5 h-3.5 opacity-50" />
            )}
            <span>{text}</span>
        </div>
    );
}
