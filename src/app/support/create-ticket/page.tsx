"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Upload,
    ArrowLeft,
    Ticket,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/components/language-context";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function CreateTicketPage() {
    const router = useRouter();
    const { lang, t } = useLanguage();
    const { user, token } = useAuth();
    const [formData, setFormData] = useState({
        problemType: "",
        userId: "",
        paymentMethod: "",
        email: "",
        description: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user?.email) {
            setFormData(prev => ({
                ...prev,
                email: user.email
            }));
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const validTypes = ["image/png", "image/jpeg", "image/jpg"];
            if (validTypes.includes(file.type)) {
                setSelectedFile(file);
            } else {
                toast.error(t.invalidFileType || "รองรับเฉพาะไฟล์รูปภาพเท่านั้น");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const needsOrderId = ["missing-payment", "incorrect-amount", "wrong-user-id", "payment-gateway"]
            .includes(formData.problemType);

        if (!formData.problemType || (needsOrderId && !formData.userId) || !formData.email || !formData.description) {
            toast.error(lang === "th" ? "กรุณากรอกข้อมูลให้ครบถ้วนก่อนส่ง" : "Please fill in all required fields.");
            return;
        }

        setSubmitting(true);
        try {
            let uploadedImageUrl = "";

            // 1. Upload file if selected
            if (selectedFile) {
                if (!token) {
                    toast.error(lang === "th" ? "กรุณาเข้าสู่ระบบก่อนแนบรูปภาพ" : "Please log in to attach an image.");
                    setSubmitting(false);
                    return;
                }
                const fData = new FormData();
                fData.append("file", selectedFile);
                const uploadRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/upload/slip`,
                    {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                        body: fData,
                    }
                );
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    uploadedImageUrl = uploadData.url;
                } else {
                    toast.error(lang === "th" ? "อัปโหลดรูปภาพไม่สำเร็จ" : "Image upload failed.");
                }
            }

            // 2. Map problem category and subject
            const categoryMap: Record<string, string> = {
                "missing-payment": "payment",
                "incorrect-amount": "payment",
                "wrong-user-id": "topup",
                "payment-gateway": "payment",
                "vip-privileges": "vip",
                "general-question": "general",
                "other": "general"
            };

            const category = categoryMap[formData.problemType] || "general";
            const subject = t.problemTypes[formData.problemType as keyof typeof t.problemTypes] || formData.problemType;

            // 3. Post to backend
            const createRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/support/tickets`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: user?.name || user?.email?.split("@")[0] || "Anonymous",
                        email: formData.email,
                        subject,
                        category,
                        orderId: needsOrderId ? formData.userId : undefined,
                        message: formData.description,
                        imageUrl: uploadedImageUrl || undefined,
                        userId: user?.id || undefined,
                    }),
                }
            );

            if (!createRes.ok) {
                const errData = await createRes.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to create ticket");
            }

            setShowSuccess(true);
        } catch (err: any) {
            console.error("Ticket submission error:", err);
            toast.error(lang === "th" ? `ส่งข้อมูลไม่สำเร็จ: ${err.message}` : `Failed to submit: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-background to-secondary/20">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card rounded-2xl p-8 max-w-md w-full text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
                    >
                        <svg
                            className="w-10 h-10 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-3">
                        {lang === "th" ? "แจ้งปัญหาสำเร็จ" : "Report Submitted"}
                    </h2>
                    <p className="text-muted-foreground mb-2 text-sm leading-relaxed">
                        {lang === "th" 
                            ? "ทางเราได้รับรายละเอียดปัญหาของท่านเรียบร้อยแล้ว" 
                            : "We have received your issue details."}
                    </p>
                    <p className="text-muted-foreground text-sm font-semibold mb-8">
                        {lang === "th" 
                            ? "ทีมงานจะตรวจสอบและส่งข้อมูลการตอบกลับไปยังอีเมลของท่านโดยเร็วที่สุด" 
                            : "Our team will review this and send a reply to your email as soon as possible."}
                    </p>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => router.push("/support")}
                            className="w-full bg-foreground text-background hover:bg-foreground/90 font-bold transition-all duration-200"
                        >
                            {lang === "th" ? "ตกลง" : "OK"}
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="container mx-auto px-6 max-w-5xl">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4 -ml-2"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t.back}
                    </Button>

                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 mb-4">
                            <Ticket className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold">{t.createTicketTitle}</h1>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card rounded-2xl p-6"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">
                                {t.selectProblem}
                            </Label>
                            <Select
                                value={formData.problemType}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, problemType: value })
                                }
                            >
                                <SelectTrigger className="w-full h-12">
                                    <SelectValue placeholder={t.selectProblemPlaceholder} />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(t.problemTypes).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Order ID - show for order/payment related issues */}
                        {(formData.problemType === "missing-payment" ||
                            formData.problemType === "incorrect-amount" ||
                            formData.problemType === "wrong-user-id" ||
                            formData.problemType === "payment-gateway") && (
                                <div className="space-y-2">
                                    <Label htmlFor="userId" className="text-sm">
                                        {t.userId} *
                                    </Label>
                                    <Input
                                        id="userId"
                                        placeholder={t.userIdPlaceholder}
                                        value={formData.userId}
                                        onChange={(e) =>
                                            setFormData({ ...formData, userId: e.target.value })
                                        }
                                        className="h-11"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {t.userIdHelper}
                                    </p>
                                </div>
                            )}
                        {(formData.problemType === "missing-payment" ||
                            formData.problemType === "payment-gateway") && (
                                <div className="space-y-2">
                                    <Label htmlFor="paymentMethod" className="text-sm">
                                        {t.paymentMethod}
                                    </Label>
                                    <Input
                                        id="paymentMethod"
                                        placeholder={t.paymentMethodPlaceholder}
                                        value={formData.paymentMethod}
                                        onChange={(e) =>
                                            setFormData({ ...formData, paymentMethod: e.target.value })
                                        }
                                        className="h-11"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {t.paymentMethodHelper}
                                    </p>
                                </div>
                            )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm">
                                {t.email} *
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t.emailPlaceholder}
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                className="h-11"
                            />
                            <p className="text-xs text-muted-foreground">
                                {t.emailHelper}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm">
                                {t.description} *
                            </Label>
                            <Textarea
                                id="description"
                                placeholder={t.descriptionPlaceholder}
                                rows={5}
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                {t.descriptionHelper}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">
                                {t.imageUpload} <span className="text-muted-foreground">{t.optional}</span>
                            </Label>
                            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={handleFileChange}
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                        <Upload className="w-6 h-6 text-primary" />
                                    </div>
                                    <p className="font-medium mb-1">
                                        {t.dragDrop}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 border-border text-foreground hover:bg-muted transition-all duration-200"
                                    >
                                        {t.selectImage}
                                    </Button>
                                    {selectedFile && (
                                        <p className="text-sm text-primary mt-3">
                                            ✓ {selectedFile.name}
                                        </p>
                                    )}
                                </label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t.supportedFormats}
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {submitting && <RefreshCw size={15} className="animate-spin" />}
                            {t.submit}
                        </Button>
                    </form>
                </motion.div>
                </div>
            </div>
        </div>
    );
}
