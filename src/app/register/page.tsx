"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Gamepad2, Loader2, Check, X, Facebook, Sun, Moon } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/language-context";

const termsContent = (
    <div className="space-y-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">
            ข้อตกลงการให้บริการฉบับนี้ ("ข้อตกลง") จัดทำขึ้นระหว่างผู้ให้บริการภายใต้ชื่อโครงการ Top-up Game by UID (ต่อไปนี้เรียกว่า "บริษัท") กับผู้ใช้บริการ
        </p>
        <p>
            การเข้าถึงหรือใช้บริการ ไม่ว่าทั้งหมดหรือบางส่วน ให้ถือว่าผู้ใช้บริการได้อ่าน ทำความเข้าใจ และตกลงผูกพันตามข้อตกลงฉบับนี้ รวมถึงนโยบายความเป็นส่วนตัว
        </p>
        
        <h3 className="font-bold text-foreground mt-4 text-base">1. ข้อกำหนดการใช้บริการทั่วไป</h3>
        <p>1.1 บริษัทให้บริการเป็นตัวกลางสำหรับการเติมเงินเกมหรือบริการดิจิทัลอื่นใดผ่านข้อมูลระเบียบตัวตน เช่น UID หรือข้อมูลบัญชีที่ผู้ใช้บริการระบุ</p>
        <p>1.2 ผู้ใช้บริการตกลงใช้บริการโดยสุจริต ไม่ขัดต่อกฎหมาย ไม่ละเมิดสิทธิในทรัพย์สินทางปัญญา สิทธิส่วนบุคคล หรือสิทธิอื่นใดของบุคคลภายนอก</p>
        <p>1.3 บริษัทมีสิทธิ์ระงับ เปลี่ยนแปลง แก้ไข หรือยุติการให้บริการทั้งหมดหรือบางส่วนได้ตามดุลยพินิจ</p>

        <h3 className="font-bold text-foreground mt-4 text-base">2. ความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคล (PDPA / GDPR Compliance)</h3>
        <p>2.1 บริษัทดำเนินการเก็บรวบรวม ใช้ เปิดเผย และโอนข้อมูลส่วนบุคคลตามหลักการของ พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) และ GDPR</p>
        <p>2.2 ผู้ใช้บริการยินยอมให้ประมวลผลข้อมูลเพื่อการดำเนินธุรกรรม ป้องกันการฉ้อโกง และปฏิบัติตามกฎหมายที่เกี่ยวข้อง</p>
        
        <h3 className="font-bold text-foreground mt-4 text-base">3. บัญชีและความปลอดภัย</h3>
        <p>3.1 ผู้ใช้บริการต้องให้ข้อมูลที่ถูกต้อง ครบถ้วน และเป็นปัจจุบัน และต้องรับผิดชอบต่อความปลอดภัยของบัญชีตนเอง</p>
        <p>3.2 หากพบความปลอดภัยถูกละเมิดหรือธุรกรรมที่ผิดปกติ ต้องแจ้งผู้ให้บริการโดยทันที</p>

        <h3 className="font-bold text-foreground mt-4 text-base">4. เงื่อนไขการเติมเงิน</h3>
        <p>4.1 การระบุข้อมูลหรือ UID ผิดพลาดถือเป็นความรับผิดชอบของผู้ใช้บริการเอง</p>
        <p>4.2 คำสั่งซื้อจะสมบูรณ์และจัดส่งเมื่อได้รับการยืนยันการชำระเงินที่ถูกต้อง</p>

        <h3 className="font-bold text-foreground mt-4 text-base">5. นโยบายการคืนเงิน</h3>
        <p>5.1 ธุรกรรมที่เสร็จสมบูรณ์แล้วจะไม่สามารถขอคืนเงินหรือยกเลิกได้ทุกกรณี เนื่องจากเป็นสินค้าดิจิทัลสำเร็จรูป</p>
        <p>5.2 หากเกิดข้อผิดพลาดจากระบบของบริษัท บริษัทจะดำเนินการตรวจสอบและพิจารณาคืนตามความเหมาะสม</p>
    </div>
);

const privacyContent = (
    <div className="space-y-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">
            นโยบายความเป็นส่วนตัวฉบับนี้ชี้แจงถึงหลักเกณฑ์ วิธีการ และมาตรการในการเก็บรวบรวม ใช้ เปิดเผย โอน และเก็บรักษาข้อมูลส่วนบุคคลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) และ GDPR
        </p>
        
        <h3 className="font-bold text-foreground mt-4 text-base">1. การเก็บรวบรวมข้อมูลส่วนบุคคล</h3>
        <p>บริษัทเก็บรวบรวมข้อมูลเมื่อท่านสมัครสมาชิก ทำรายการเติมเงิน หรือติดต่อทีมงาน เช่น ชื่อ นามสกุล อีเมล เบอร์โทรศัพท์ หมายเลขระบุตัวตน (UID) และที่อยู่ IP ของท่าน</p>

        <h3 className="font-bold text-foreground mt-4 text-base">2. วัตถุประสงค์ในการเก็บรวบรวมข้อมูล</h3>
        <p>2.1 เพื่อการดำเนินการชำระเงินและจัดส่งสินค้าเติมเงินเกมให้เสร็จสมบูรณ์</p>
        <p>2.2 เพื่อประโยชน์ในการยืนยันตัวตน ตรวจสอบ และป้องกันการทุจริตหรือทำรายการฉ้อโกงในระบบ</p>
        <p>2.3 เพื่อวิเคราะห์ข้อมูล ปรับปรุงประสิทธิภาพการใช้งาน และพัฒนาบริการให้ดียิ่งขึ้น</p>

        <h3 className="font-bold text-foreground mt-4 text-base">3. ระยะเวลาการจัดเก็บข้อมูลส่วนบุคคล</h3>
        <p>บริษัทจะจัดเก็บรักษาข้อมูลของท่านไว้เป็นระยะเวลาตราบเท่าที่จำเป็นตามวัตถุประสงค์ของการให้บริการ หรือตามกฎหมายกำหนด (เช่น กฎหมายบัญชีและภาษี 5-10 ปี)</p>

        <h3 className="font-bold text-foreground mt-4 text-base">4. สิทธิของเจ้าของข้อมูล</h3>
        <p>ท่านมีสิทธิ์ในการเข้าถึง แก้ไข ลบ คัดค้านการประมวลผลข้อมูลส่วนบุคคล หรือเพิกถอนความยินยอมได้ตลอดเวลาโดยส่งคำขอผ่านฝ่ายบริการลูกค้า</p>
    </div>
);

export default function RegisterPage() {
    const router = useRouter();
    const { setAuth } = useAuth();
    const { setTheme, resolvedTheme } = useTheme();
    const { translateError } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Modal state logic
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);
    const [scrolledToBottom, setScrolledToBottom] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleOpenModal = (type: "terms" | "privacy") => {
        setModalType(type);
        setScrolledToBottom(false);
        setModalOpen(true);
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 15;
        if (isNearBottom) {
            setScrolledToBottom(true);
        }
    };

    const handleAccept = () => {
        setAcceptedTerms(true);
        setModalOpen(false);
        setModalType(null);
    };

    useEffect(() => {
        if (modalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [modalOpen]);

    useEffect(() => { setMounted(true); }, []);
    const currentTheme = mounted ? (resolvedTheme ?? "dark") : "dark";
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
            toast.error(translateError(error.message));
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
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
            {/* Theme Toggle Button */}
            <div className="fixed top-4 right-4 z-50">
                <button
                    type="button"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-foreground text-background hover:opacity-90 transition-all duration-300 shadow-lg"
                    onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                >
                    {currentTheme === "dark" ? <Sun className="w-4 h-4 text-background" /> : <Moon className="w-4 h-4 text-background" />}
                </button>
            </div>

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

                <Card className="glass-card border-border/50">
                    <CardHeader className="pt-5 pb-2 px-6 space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">สมัครสมาชิก</CardTitle>
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
                                <div className="mt-4 space-y-2 p-3 rounded-lg bg-muted/30 border border-border/50">
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
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            handleOpenModal("terms");
                                        } else {
                                            setAcceptedTerms(false);
                                        }
                                    }}
                                    className="mt-1"
                                />
                                <label
                                    className="text-sm text-muted-foreground leading-relaxed select-none cursor-pointer"
                                >
                                    ฉันยอมรับ{" "}
                                    <span 
                                        role="button"
                                        onClick={() => handleOpenModal("terms")} 
                                        className="text-primary hover:underline font-medium inline"
                                    >
                                        ข้อกำหนดในการให้บริการ
                                    </span>{" "}
                                    และ{" "}
                                    <span 
                                        role="button"
                                        onClick={() => handleOpenModal("privacy")} 
                                        className="text-primary hover:underline font-medium inline"
                                    >
                                        นโยบายความเป็นส่วนตัว
                                    </span>
                                </label>
                            </div>

                            {/* Register Button */}
                            <Button
                                type="submit"
                                className="w-full bg-foreground hover:bg-foreground/90 text-background font-semibold h-11 transition-all"
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
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full bg-background/40 hover:bg-muted/50 border-border/50 text-foreground transition-all"
                                onClick={handleGoogleSignUp}
                                disabled={isLoading}
                            >
                                <FcGoogle className="mr-2 h-5 w-5 shrink-0" />
                                <span className="truncate">Google</span>
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full bg-background/40 hover:bg-muted/50 border-border/50 text-foreground transition-all"
                                onClick={handleFacebookSignUp}
                                disabled={isLoading}
                            >
                                <Facebook className="mr-2 h-5 w-5 fill-[#1877F2] text-[#1877F2] shrink-0" />
                                <span className="truncate">Facebook</span>
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

            {/* Terms and Privacy Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg flex flex-col max-h-[80vh] bg-card border border-border/50 rounded-xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border/30 bg-muted/20">
                            <span className="font-semibold text-lg text-foreground">
                                {modalType === "terms" ? "ข้อตกลงการให้บริการ (Terms of Service)" : "นโยบายความเป็นส่วนตัว (Privacy Policy)"}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setModalOpen(false);
                                    setModalType(null);
                                }}
                                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div 
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-6 bg-muted/5 border-b border-border/30 scrollbar-thin"
                        >
                            {modalType === "terms" ? termsContent : privacyContent}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-muted/10 flex flex-col items-center gap-2">
                            {scrolledToBottom ? (
                                <Button
                                    onClick={handleAccept}
                                    className="w-full bg-foreground hover:bg-foreground/90 text-background font-semibold h-11 transition-all"
                                >
                                    ฉันอ่านและยอมรับข้อตกลง
                                </Button>
                            ) : (
                                <div className="w-full flex flex-col gap-2">
                                    <Button
                                        disabled
                                        className="w-full bg-muted text-muted-foreground cursor-not-allowed font-semibold h-11"
                                    >
                                        กรุณาเลื่อนลงมาล่างสุดเพื่อยอมรับ
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground animate-pulse">
                                        ↓ โปรดเลื่อนอ่านรายละเอียดให้ครบถ้วนเพื่อเปิดใช้งานปุ่มยอมรับ
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function PasswordCheck({ checked, text }: { checked: boolean; text: string }) {
    return (
        <div
            className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                checked 
                    ? "text-green-600 dark:text-green-400 font-medium opacity-100" 
                    : "text-muted-foreground opacity-70"
            }`}
        >
            {checked ? (
                <Check className="w-3.5 h-3.5 drop-shadow-[0_0_2px_rgba(22,163,74,0.3)] dark:drop-shadow-[0_0_4px_rgba(74,222,128,0.5)]" />
            ) : (
                <X className="w-3.5 h-3.5 opacity-50" />
            )}
            <span>
                {text}
            </span>
        </div>
    );
}
