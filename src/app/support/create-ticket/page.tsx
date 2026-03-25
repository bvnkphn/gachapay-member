"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Upload,
    ArrowLeft,
    Ticket,
    AlertCircle,
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

export default function CreateTicketPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        problemType: "",
        userId: "",
        paymentMethod: "",
        email: "",
        description: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const validTypes = ["image/png", "image/jpeg", "image/jpg"];
            if (validTypes.includes(file.type)) {
                setSelectedFile(file);
            } else {
                alert(t.invalidFileType);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.problemType || !formData.userId || !formData.email || !formData.description) {
            alert(t.fillAllFields);
            return;
        }

        setShowSuccess(true);
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        router.push("/support/tickets");
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
                    <h2 className="text-2xl font-bold mb-3">{t.successTitle}</h2>
                    <p className="text-muted-foreground mb-2">
                        {t.successMessage}
                    </p>
                    <p className="text-muted-foreground text-sm mb-8">
                        {t.successSubMessage}
                    </p>
                    <div className="flex gap-3">
                        <Button
                            onClick={handleSuccessClose}
                            className="flex-1 bg-gradient-cyber"
                        >
                            {t.viewTicket}
                        </Button>
                        <Button
                            onClick={() => router.push("/support")}
                            variant="outline"
                            className="flex-1"
                        >
                            {t.backToSupport}
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="container mx-auto px-4 max-w-2xl">
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
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-cyber mb-4">
                            <Ticket className="w-8 h-8 text-foreground" />
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

                        {/* Payment Method - Only show for payment-related issues */}
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
                                        className="mt-2"
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

                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <p className="text-sm text-muted-foreground">
                                {t.infoText}
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-cyber text-base font-semibold"
                        >
                            {t.submit}
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
