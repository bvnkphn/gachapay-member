"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Paperclip,
    Send,
    X,
    ImageIcon,
    FileText,
    AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-context";
import { useSidebar } from "@/components/sidebar-context";
import type { SupportTicket, TicketStatus, ChatMessage } from "../page";

// ---- Mock data (same as listing, replace with API) ----
const MOCK_TICKETS: SupportTicket[] = [
    {
        id: "TK-001",
        subject: "DIGITAL - PAYMENT ISSUES",
        createdAt: new Date("2026-03-09"),
        status: "queue",
        messages: [
            {
                id: "m1",
                sender: "user",
                content: "ชำระเงินแล้วแต่ไม่ได้รับไอเทม",
                timestamp: new Date("2026-03-09T10:00:00"),
            },
        ],
        attachments: [],
    },
    {
        id: "TK-002",
        subject: "ACCOUNT - LOGIN PROBLEM",
        createdAt: new Date("2026-03-05"),
        status: "active",
        messages: [
            {
                id: "m1",
                sender: "user",
                content: "ไม่สามารถเข้าสู่ระบบได้",
                timestamp: new Date("2026-03-05T09:00:00"),
            },
            {
                id: "m2",
                sender: "staff",
                senderName: "Support Team",
                content: "สวัสดีครับ ขอทราบอีเมลที่ใช้ลงทะเบียนได้เลยครับ",
                timestamp: new Date("2026-03-05T09:30:00"),
            },
        ],
        attachments: [],
    },
    {
        id: "TK-003",
        subject: "TOPUP - WRONG AMOUNT",
        createdAt: new Date("2026-02-20"),
        status: "closed",
        messages: [
            {
                id: "m1",
                sender: "user",
                content: "ได้รับไอเทมไม่ครบ",
                timestamp: new Date("2026-02-20T14:00:00"),
            },
            {
                id: "m2",
                sender: "staff",
                senderName: "Support Team",
                content: "ดำเนินการแก้ไขเรียบร้อยแล้วครับ",
                timestamp: new Date("2026-02-21T10:00:00"),
            },
        ],
        attachments: [],
    },
];

const STATUS_CONFIG: Record<TicketStatus, { label: string; labelEn: string; color: string }> = {
    queue: { label: "รอดำเนินการ", labelEn: "IN SUPPORT QUEUE", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    active: { label: "กำลังดำเนินการ", labelEn: "ACTIVE", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    closed: { label: "ปิดแล้ว", labelEn: "CLOSED", color: "bg-muted text-muted-foreground border-border" },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

// ---- Lightbox ----
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.85 }}
                className="relative max-w-3xl w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute -top-10 right-0 text-white/70 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="attachment" className="w-full rounded-xl object-contain max-h-[80vh]" />
            </motion.div>
        </motion.div>
    );
}

// ---- Confirm Modal ----
function ConfirmModal({
    lang,
    onConfirm,
    onCancel,
}: {
    lang: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card rounded-2xl p-6 max-w-sm w-full"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <h3 className="font-semibold">
                        {lang === "th" ? "ยืนยันการปิดตั๋ว" : "Confirm Close Ticket"}
                    </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                    {lang === "th"
                        ? "คุณแน่ใจหรือไม่ว่าต้องการปิดตั๋วนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้"
                        : "Are you sure you want to close this ticket? This action cannot be undone."}
                </p>
                <div className="flex gap-3">
                     <Button
                        variant="outline"
                        className="flex-1 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                        onClick={onCancel}
                    >
                        {lang === "th" ? "ยกเลิก" : "Cancel"}
                    </Button>
                    <Button className="flex-1 bg-destructive hover:bg-destructive/90" onClick={onConfirm}>
                        {lang === "th" ? "ยืนยัน" : "Confirm"}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function TicketDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { lang } = useLanguage();
    

    const ticketId = params?.id as string;
    const [ticket, setTicket] = useState<SupportTicket | null>(
        () => MOCK_TICKETS.find((t) => t.id === ticketId) ?? null
    );

    const [message, setMessage] = useState("");
    const [attachFile, setAttachFile] = useState<File | null>(null);
    const [attachPreview, setAttachPreview] = useState<string | null>(null);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [ticket?.messages]);

    if (!ticket) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <p className="text-muted-foreground">Ticket not found</p>
            </div>
        );
    }

    const isClosed = ticket.status === "closed";
    const status = STATUS_CONFIG[ticket.status];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError(null);
        const file = e.target.files?.[0];
        if (!file) return;
        if (!ALLOWED_TYPES.includes(file.type)) {
            setFileError(lang === "th" ? "รองรับเฉพาะไฟล์ .jpg, .png, .pdf เท่านั้น" : "Only .jpg, .png, .pdf files are supported");
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setFileError(lang === "th" ? "ไฟล์ต้องมีขนาดไม่เกิน 5MB" : "File must be less than 5MB");
            return;
        }
        setAttachFile(file);
        if (file.type !== "application/pdf") {
            setAttachPreview(URL.createObjectURL(file));
        } else {
            setAttachPreview(null);
        }
    };

    const handleSend = () => {
        if (!message.trim() && !attachFile) return;
        const newMsg: ChatMessage = {
            id: `m${Date.now()}`,
            sender: "user",
            content: message.trim(),
            timestamp: new Date(),
            attachmentUrl: attachPreview ?? undefined,
        };
        setTicket((prev) =>
            prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev
        );
        setMessage("");
        setAttachFile(null);
        setAttachPreview(null);
    };

    const handleCloseTicket = () => {
        const closedMsg: ChatMessage = {
            id: `m${Date.now()}`,
            sender: "staff",
            senderName: "System",
            content:
                lang === "th"
                    ? `ตั๋วถูกปิดแล้ว — ${new Date().toLocaleString("th-TH")}`
                    : `Ticket closed — ${new Date().toLocaleString("en-GB")}`,
            timestamp: new Date(),
        };
        setTicket((prev) =>
            prev
                ? { ...prev, status: "closed", messages: [...prev.messages, closedMsg] }
                : prev
        );
        setShowConfirm(false);
    };

    const formatTime = (date: Date) =>
        date.toLocaleTimeString(lang === "th" ? "th-TH" : "en-GB", {
            hour: "2-digit",
            minute: "2-digit",
        });

    // Collect image attachments from messages for sidebar
    const imageAttachments = ticket.messages
        .filter((m) => m.attachmentUrl && !m.attachmentUrl.endsWith(".pdf"))
        .map((m) => m.attachmentUrl as string);

    return (
        <>
            <AnimatePresence>
                {lightboxSrc && (
                    <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
                )}
                {showConfirm && (
                    <ConfirmModal
                        lang={lang}
                        onConfirm={handleCloseTicket}
                        onCancel={() => setShowConfirm(false)}
                    />
                )}
            </AnimatePresence>

            <div className="min-h-screen pt-20 pb-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                <div className="container mx-auto px-4 max-w-5xl">
                        {/* Back */}
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/support/tickets")}
                            className="mb-4 -ml-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {lang === "th" ? "กลับ" : "Back"}
                        </Button>

                        <div className="flex gap-6">
                            {/* Chat Panel */}
                            <div className="flex-1 min-w-0 flex flex-col">
                                {/* Ticket Header */}
                                <div className="glass-card rounded-2xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground mb-0.5">
                                            {ticket.id}
                                        </p>
                                        <h1 className="font-bold text-base tracking-wide truncate">
                                            {ticket.subject}
                                        </h1>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs text-muted-foreground font-medium">
                                            {lang === "th" ? "สถานะ:" : "STATUS:"}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-xs font-semibold px-2.5 py-1 rounded-full border",
                                                status.color
                                            )}
                                        >
                                            {lang === "th" ? status.label : status.labelEn}
                                        </span>
                                    </div>
                                </div>

                                {/* Chat Window */}
                                <div className="glass-card rounded-2xl flex-1 flex flex-col overflow-hidden">
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[360px] max-h-[480px]">
                                        {ticket.messages.map((msg) => {
                                            const isUser = msg.sender === "user";
                                            const isSystem = msg.senderName === "System";
                                            if (isSystem) {
                                                return (
                                                    <div key={msg.id} className="flex justify-center">
                                                        <div className="bg-muted/60 rounded-xl px-4 py-2 text-xs text-muted-foreground text-center max-w-xs">
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <motion.div
                                                    key={msg.id}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}
                                                >
                                                    {!isUser && (
                                                        <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center shrink-0 text-xs font-bold text-background">
                                                            S
                                                        </div>
                                                    )}
                                                    <div className={cn("max-w-[70%] space-y-1", isUser ? "items-end" : "items-start")}>
                                                        {!isUser && (
                                                            <p className="text-xs text-muted-foreground px-1">
                                                                {msg.senderName ?? "Staff"}
                                                            </p>
                                                        )}
                                                        <div
                                                            className={cn(
                                                                "rounded-2xl px-4 py-2.5 text-sm",
                                                                isUser
                                                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                                    : "bg-muted text-foreground rounded-tl-sm"
                                                            )}
                                                        >
                                                            {msg.content && <p>{msg.content}</p>}
                                                            {msg.attachmentUrl && (
                                                                <button
                                                                    onClick={() => setLightboxSrc(msg.attachmentUrl!)}
                                                                    className="mt-2 block"
                                                                >
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src={msg.attachmentUrl}
                                                                        alt="attachment"
                                                                        className="rounded-lg max-w-[200px] max-h-[150px] object-cover hover:opacity-80 transition-opacity"
                                                                    />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className={cn("text-[10px] text-muted-foreground px-1", isUser ? "text-right" : "text-left")}>
                                                            {formatTime(msg.timestamp)}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Closed Banner */}
                                    {isClosed && (
                                        <div className="border-t border-border/50 p-4 text-center bg-muted/30">
                                            <p className="text-sm font-medium text-muted-foreground">
                                                {lang === "th" ? "ตั๋วนี้ถูกปิดแล้ว" : "This ticket has been closed"}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {lang === "th"
                                                    ? "หากต้องการสอบถามเพิ่มเติม กรุณาสร้างตั๋วใหม่"
                                                    : "If you need further assistance, please create a new ticket"}
                                            </p>
                                             <Button
                                                size="sm"
                                                variant="outline"
                                                className="mt-3 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                                                onClick={() => router.push("/support/create-ticket")}
                                            >
                                                {lang === "th" ? "สร้างตั๋วใหม่" : "Create New Ticket"}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Input Area */}
                                    {!isClosed && (
                                        <div className="border-t border-border/50 p-3">
                                            {/* Attach preview */}
                                            {attachFile && (
                                                <div className="flex items-center gap-2 mb-2 px-1">
                                                    {attachPreview ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={attachPreview} alt="preview" className="w-10 h-10 rounded-lg object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                                            <FileText className="w-5 h-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <span className="text-xs text-muted-foreground flex-1 truncate">{attachFile.name}</span>
                                                    <button onClick={() => { setAttachFile(null); setAttachPreview(null); }}>
                                                        <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                                    </button>
                                                </div>
                                            )}
                                            {fileError && (
                                                <p className="text-xs text-destructive mb-2 px-1">{fileError}</p>
                                            )}
                                            <div className="flex items-end gap-2">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="hidden"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    onChange={handleFileChange}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => { setFileError(null); fileInputRef.current?.click(); }}
                                                    className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
                                                    title={lang === "th" ? "แนบไฟล์" : "Attach file"}
                                                >
                                                    <Paperclip className="w-5 h-5" />
                                                </button>
                                                <textarea
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSend();
                                                        }
                                                    }}
                                                    placeholder={lang === "th" ? "พิมพ์ข้อความ..." : "Type a message..."}
                                                    rows={1}
                                                    className="flex-1 bg-muted/50 rounded-xl px-3 py-2 text-sm resize-none outline-none focus:ring-1 focus:ring-primary/50 min-h-[40px] max-h-[120px]"
                                                />
                                                <Button
                                                    size="icon"
                                                    onClick={handleSend}
                                                    disabled={!message.trim() && !attachFile}
                                                    className="bg-gradient-cyber shrink-0 rounded-xl w-10 h-10"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Sidebar (Desktop) */}
                            <aside className="hidden lg:flex flex-col w-56 shrink-0 gap-4">
                                {/* Actions */}
                                {!isClosed && (
                                    <div className="glass-card rounded-2xl p-4">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                            {lang === "th" ? "การดำเนินการ" : "Actions"}
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                                            onClick={() => setShowConfirm(true)}
                                        >
                                            {lang === "th" ? "ปิดตั๋ว (แก้ไขแล้ว)" : "Close Ticket (Solve)"}
                                        </Button>
                                    </div>
                                )}

                                {/* Attachments */}
                                <div className="glass-card rounded-2xl p-4">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        {lang === "th" ? "ไฟล์แนบ" : "Attachments"}
                                    </p>
                                    {imageAttachments.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">
                                            {lang === "th" ? "ไม่มีไฟล์แนบ" : "No attachments"}
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            {imageAttachments.map((src, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setLightboxSrc(src)}
                                                    className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={src} alt={`attachment-${i}`} className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </aside>
                    </div>
                </div>
            </div>
        </>
    );
}
