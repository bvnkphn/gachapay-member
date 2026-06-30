"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    MessageCircle,
    Phone,
    Mail,
    HelpCircle,
    ExternalLink,
    PlayCircle,
    Ticket,
    ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { faqCategories, faqItems } from "@/data/supportFaqs";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-context";

const contactChannels = [
    {
        name: "อีเมล",
        icon: Mail,
        url: "mailto:support@gachapay.com",
        description: "support@gachapay.com",
        gradient: "from-primary to-primary/70",
    },
    {
        name: "โทรศัพท์",
        icon: Phone,
        url: "tel:+6621234567",
        description: "02-123-4567 (9:00-21:00)",
        gradient: "from-secondary to-secondary/70",
    },
];

function getYoutubeEmbedUrl(url: string): string | null {
    if (!url) return null;
    const patterns = [/youtube\.com\/watch\?v=([^&]+)/, /youtu\.be\/([^?]+)/, /youtube\.com\/embed\/([^?]+)/];
    for (const p of patterns) { const m = url.match(p); if (m) return `https://www.youtube.com/embed/${m[1]}`; }
    return null;
}

export default function SupportPage() {
    const router = useRouter();
    const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
    const { lang, t } = useLanguage();
    const [dbFaqs, setDbFaqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/faq`);
                if (res.data && Array.isArray(res.data)) {
                    const mapped = res.data.map(item => {
                        let categoryId = item.category;
                        if (categoryId === 'refund') categoryId = 'problem';
                        if (categoryId === 'account') categoryId = 'general';
                        return {
                            categoryId,
                            question: item.question,
                            answer: item.answer,
                            videoUrl: item.videoUrl,
                        };
                    });
                    setDbFaqs(mapped);
                }
            } catch (err) {
                console.error("Failed to load backend FAQs, using static fallback:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    const activeFaqList = dbFaqs.length > 0 ? dbFaqs : faqItems;

    const filteredFaqs =
        activeCategoryId === "all"
            ? activeFaqList
            : activeFaqList.filter((f) => f.categoryId === activeCategoryId);

    const videoTutorials = activeFaqList.filter(f => f.videoUrl && getYoutubeEmbedUrl(f.videoUrl));

    return (
        <div className="min-h-screen pt-20 pb-24">
            <div className="container mx-auto px-6 max-w-5xl">
                {/* Header with Back Button and Title */}
                <div className="flex items-center gap-3 mb-6">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.back()}
                        className="w-9 h-9 rounded-xl border border-border/50 hover:bg-muted flex items-center justify-center cursor-pointer transition-colors shrink-0"
                    >
                        <ChevronLeft className="w-5 h-5 text-foreground" />
                    </Button>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-foreground">{t.supportTitle}</h1>
                </div>

                {/* Subtitle Info Banner */}
                <div className="glass-card rounded-2xl border border-border/40 p-5 mb-8 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">{t.supportTitle}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {t.supportSubtitle}
                        </p>
                    </div>
                </div>

                {/* FAQ Section with Categories */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        {t.faqTitle}
                    </h2>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2 mb-5">
                        <button
                            onClick={() => setActiveCategoryId("all")}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                                activeCategoryId === "all"
                                    ? "bg-primary/20 text-primary border-primary/40"
                                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                            )}
                        >
                            {t.allCategories}
                        </button>
                        {faqCategories.map((cat) => {
                            const Icon = cat.icon;
                            const label = t.faqCategories[cat.id as keyof typeof t.faqCategories];
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategoryId(cat.id)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5",
                                        activeCategoryId === cat.id
                                            ? "bg-primary/20 text-primary border-primary/40"
                                            : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {/* FAQ Accordion */}
                    <div className="glass-card rounded-xl p-5">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCategoryId}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Accordion type="single" collapsible className="w-full">
                                    {filteredFaqs.map((faq, index) => {
                                        const question = typeof faq.question === 'string' ? faq.question : faq.question[lang];
                                        const answer = typeof faq.answer === 'string' ? faq.answer : faq.answer[lang];
                                        return (
                                            <AccordionItem key={index} value={`faq-${index}`}>
                                                <AccordionTrigger className="text-left hover:text-primary text-sm">
                                                    {question}
                                                </AccordionTrigger>
                                                <AccordionContent className="text-muted-foreground text-sm whitespace-pre-line">
                                                    <div className="space-y-4">
                                                        <p>{answer}</p>
                                                        {faq.videoUrl && getYoutubeEmbedUrl(faq.videoUrl) && (
                                                            <div className="my-3 rounded-xl overflow-hidden border border-border max-w-lg mx-auto">
                                                                <iframe 
                                                                    src={getYoutubeEmbedUrl(faq.videoUrl)!} 
                                                                    width="100%" 
                                                                    height="260"
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen 
                                                                    className="block" 
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="pt-2 border-t border-border/50 text-center">
                                                            <p className="text-sm text-foreground mb-3">
                                                                {t.stillHaveQuestion}
                                                            </p>
                                                            <Button
                                                                onClick={() => router.push("/support/create-ticket")}
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full sm:w-auto border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                                                            >
                                                                <Ticket className="w-4 h-4 mr-2" />
                                                                {t.createTicket}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                                {filteredFaqs.length === 0 && (
                                    <p className="text-center text-muted-foreground py-6 text-sm">
                                        {t.noFaqFound}
                                    </p>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.section>

                {/* Video Tutorials */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-secondary" />
                        {t.videoTitle}
                    </h2>
                    {videoTutorials.length === 0 ? (
                        <div className="glass-card rounded-xl p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                                <PlayCircle className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground text-sm">
                                {t.videoPlaceholder}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {videoTutorials.map((v, idx) => {
                                const q = typeof v.question === 'string' ? v.question : v.question[lang];
                                const embed = getYoutubeEmbedUrl(v.videoUrl);
                                return (
                                    <div key={idx} className="glass-card rounded-xl overflow-hidden border border-border/40 p-4 space-y-3">
                                        <div className="rounded-lg overflow-hidden border border-border shadow-sm">
                                            <iframe 
                                                src={embed!} 
                                                width="100%" 
                                                height="200"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen 
                                                className="block" 
                                            />
                                        </div>
                                        <p className="text-sm font-bold text-foreground line-clamp-1">{q}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.section>

                {/* Contact Channels */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-primary" />
                        {t.contactTitle}
                    </h2>
                    <p className="text-muted-foreground text-sm mb-4">
                        {t.contactSubtitle}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {contactChannels.map((ch, i) => (
                            <motion.a
                                key={ch.name}
                                href={ch.url}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + i * 0.08 }}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="glass-card rounded-xl p-4 flex items-center gap-4 group hover:border-primary/30 transition-colors"
                            >
                                <div
                                    className={cn(
                                        "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
                                        ch.gradient
                                    )}
                                >
                                    <ch.icon className="w-5 h-5 text-foreground" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-sm flex items-center gap-1">
                                        {ch.name}
                                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </p>
                                    <p className="text-muted-foreground text-xs truncate">
                                        {ch.description}
                                    </p>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
