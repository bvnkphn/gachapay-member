"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ChevronRight,
    Ticket,
    SortAsc,
    SortDesc,
    Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-context";

export type TicketStatus = "queue" | "active" | "closed";

export interface SupportTicket {
    id: string;
    subject: string;
    createdAt: Date;
    status: TicketStatus;
    messages: ChatMessage[];
    attachments: string[];
}

export interface ChatMessage {
    id: string;
    sender: "user" | "staff";
    senderName?: string;
    content: string;
    timestamp: Date;
    attachmentUrl?: string;
}

// Mock data — replace with real API call
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
    queue: { label: "รอดำเนินการ", labelEn: "In Support Queue", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    active: { label: "กำลังดำเนินการ", labelEn: "Active", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    closed: { label: "ปิดแล้ว", labelEn: "Closed", color: "bg-muted text-muted-foreground border-border" },
};

const SIDEBAR_ITEMS = [
    { key: "account", labelTh: "บัญชีของฉัน", labelEn: "My Account", href: "/profile" },
    // { key: "balance", labelTh: "ยอดคงเหลือ", labelEn: "Balance", href: "/balance" },
    // { key: "orders", labelTh: "คำสั่งซื้อ", labelEn: "Orders", href: "/history" },
    { key: "tickets", labelTh: "ตั๋ว", labelEn: "Tickets", href: "/support/tickets" },
    { key: "settings", labelTh: "การตั้งค่า", labelEn: "Settings", href: "/settings" },
];

export default function TicketsPage() {
    const router = useRouter();
    const { lang } = useLanguage();
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const sorted = [...MOCK_TICKETS].sort((a, b) => {
        const diff = a.createdAt.getTime() - b.createdAt.getTime();
        return sortOrder === "newest" ? -diff : diff;
    });

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(lang === "th" ? "th-TH" : "en-GB", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen pt-20 pb-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex">
            {/* Sidebar — fixed to left edge */}
            <aside
                className={cn(
                    "hidden md:flex flex-col shrink-0 fixed left-0 top-16 bottom-0 z-40 border-r border-border/50 bg-background/80 backdrop-blur-md transition-all duration-300",
                    sidebarOpen ? "w-56" : "w-10"
                )}
            >
                {/* Toggle button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="w-full text-left px-3 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors border-b border-border/40 select-none"
                >
                    {sidebarOpen ? "◀" : "▶"}
                </button>

                {sidebarOpen && (
                    <div className="p-3 pt-3">
                        {SIDEBAR_ITEMS.map((item) => (
                            <button
                                key={item.key}
                                onClick={() => router.push(item.href)}
                                className={cn(
                                    "w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                                    item.key === "tickets"
                                        ? "bg-primary/15 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {lang === "th" ? item.labelTh : item.labelEn}
                            </button>
                        ))}
                    </div>
                )}
            </aside>

            {/* Main Content — offset by sidebar width on md+ */}
            <div className={cn("flex-1 transition-all duration-300", sidebarOpen ? "md:ml-56" : "md:ml-10")}>
                <div className="container mx-auto px-4 max-w-3xl">
                    <main className="min-w-0">
                        {/* Mobile back */}
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/support")}
                            className="mb-4 -ml-2 md:hidden"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {lang === "th" ? "กลับ" : "Back"}
                        </Button>

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-cyber flex items-center justify-center">
                                    <Ticket className="w-5 h-5 text-foreground" />
                                </div>
                                <h1 className="text-xl font-bold tracking-wide">
                                    {lang === "th" ? "ตั๋วความช่วยเหลือ" : "TICKETS"}
                                </h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                                    className="gap-1.5 text-xs"
                                >
                                    {sortOrder === "newest" ? (
                                        <SortDesc className="w-3.5 h-3.5" />
                                    ) : (
                                        <SortAsc className="w-3.5 h-3.5" />
                                    )}
                                    {lang === "th"
                                        ? sortOrder === "newest" ? "ใหม่สุด" : "เก่าสุด"
                                        : sortOrder === "newest" ? "Newest" : "Oldest"}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => router.push("/support/create-ticket")}
                                    className="bg-gradient-cyber gap-1.5 text-xs"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    {lang === "th" ? "สร้างตั๋ว" : "New Ticket"}
                                </Button>
                            </div>
                        </div>

                        {/* Ticket List */}
                        {sorted.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card rounded-2xl p-12 text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-4">
                                    <Ticket className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="font-medium text-foreground mb-1">
                                    {lang === "th" ? "ยังไม่มีตั๋วความช่วยเหลือ" : "No support tickets yet"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {lang === "th" ? "เมื่อคุณสร้างตั๋ว จะแสดงที่นี่" : "When you create a ticket, it will appear here"}
                                </p>
                            </motion.div>
                        ) : (
                            <div className="space-y-3">
                                {sorted.map((ticket, i) => {
                                    const status = STATUS_CONFIG[ticket.status];
                                    return (
                                        <motion.div
                                            key={ticket.id}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                        >
                                            <button
                                                onClick={() => router.push(`/support/tickets/${ticket.id}`)}
                                                className="w-full glass-card rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors text-left group"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm tracking-wide truncate">
                                                        {ticket.subject}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {lang === "th" ? "สร้างเมื่อ" : "Created on"}{" "}
                                                        {formatDate(ticket.createdAt)}
                                                    </p>
                                                </div>
                                                <span
                                                    className={cn(
                                                        "shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border",
                                                        status.color
                                                    )}
                                                >
                                                    {lang === "th" ? status.label : status.labelEn}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
