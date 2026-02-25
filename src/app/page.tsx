"use client";

import Link from "next/link";
import { Zap, ArrowRight, Shield, Clock, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { GameCard } from "@/components/game-card";

const features = [
    {
        icon: Zap,
        title: "เติมไว",
        description: "รับไอเทมภายใน 1-5 นาที",
    },
    {
        icon: Shield,
        title: "ปลอดภัย 100%",
        description: "ระบบความปลอดภัยระดับสูง",
    },
    {
        icon: Clock,
        title: "24/7",
        description: "บริการตลอด 24 ชั่วโมง",
    },
    {
        icon: Headphones,
        title: "ซัพพอร์ต",
        description: "ทีมงานพร้อมช่วยเหลือ",
    },
];

const games = [
    { id: 1, name: "Free Fire", slug: "free-fire", image: "/placeholder.svg" },
    { id: 2, name: "Mobile Legends", slug: "mobile-legends", image: "/placeholder.svg" },
    { id: 3, name: "PUBG Mobile", slug: "pubg-mobile", image: "/placeholder.svg" },
    { id: 4, name: "Genshin Impact", slug: "genshin-impact", image: "/placeholder.svg" },
    { id: 5, name: "Roblox", slug: "roblox", image: "/placeholder.svg" },
    { id: 6, name: "Valorant", slug: "valorant", image: "/placeholder.svg" },
    { id: 7, name: "Garena RoV", slug: "rov", image: "/placeholder.svg" },
    { id: 8, name: "Honkai Star Rail", slug: "honkai", image: "/placeholder.svg" },
];

export default function Home() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-12 md:pt-28 md:pb-20">
                {/* Gradient Orbs */}
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "-1.5s" }} />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm text-primary font-medium">
                                แพลตฟอร์มเติมเกมอันดับ 1
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            <span className="text-foreground">เติมเกม</span>
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                {" "}ง่าย รวดเร็ว{" "}
                            </span>
                            <span className="text-foreground">ปลอดภัย</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                            บริการเติมเกมออนไลน์ที่ไว้วางใจได้ รองรับทุกเกมยอดนิยม
                            พร้อมโปรโมชันพิเศษสำหรับสมาชิก VIP
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-md mx-auto mb-8">
                            <SearchBar />
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="bg-gradient-cyber hover:opacity-90 text-primary-foreground font-semibold px-8 pulse-glow"
                                asChild
                            >
                                <Link href="/topup">
                                    เริ่มเติมเกมเลย
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-primary/50 text-primary hover:bg-primary/10"
                                asChild
                            >
                                <Link href="/vip">
                                    สมัครสมาชิก VIP
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 border-t border-border/30">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="glass-card rounded-xl p-4 md:p-6 text-center hover-lift"
                            >
                                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-cyber flex items-center justify-center">
                                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">
                                    {feature.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Games Section */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                                เกมยอดนิยม
                            </h2>
                            <p className="text-muted-foreground mt-1">
                                เลือกเกมที่ต้องการเติมได้เลย
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                            ดูทั้งหมด
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Games Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {games.map((game) => (
                            <GameCard
                                key={game.id}
                                name={game.name}
                                image={game.image}
                                slug={game.slug}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Promo Banner */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-cyber p-8 md:p-12">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

                        <div className="relative z-10 max-w-lg">
                            <span className="inline-block px-3 py-1 text-xs font-bold bg-white/20 rounded-full text-white mb-4">
                                🎉 โปรโมชันพิเศษ
                            </span>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                สมัครสมาชิก VIP วันนี้ รับส่วนลดสูงสุด 15%
                            </h3>
                            <p className="text-white/80 mb-6">
                                พร้อมรับแต้มสะสมทุกการเติม และสิทธิพิเศษมากมาย
                            </p>
                            <Button
                                size="lg"
                                className="bg-white text-primary hover:bg-white/90 font-semibold"
                                asChild
                            >
                                <Link href="/vip">
                                    สมัครเลย
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom padding for mobile nav */}
            <div className="h-20 md:h-0" />
        </div>
    );
}
