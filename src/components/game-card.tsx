"use client";


import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useState } from "react";


export const games = [
    { id: 1, name: "Free Fire", slug: "free-fire", image: "/placeholder.svg" },
    { id: 2, name: "Mobile Legends", slug: "mobile-legends", image: "/placeholder.svg" },
    { id: 3, name: "PUBG Mobile", slug: "pubg-mobile", image: "/placeholder.svg" },
    { id: 4, name: "Genshin Impact", slug: "genshin-impact", image: "/placeholder.svg" },
    { id: 5, name: "Roblox", slug: "roblox", image: "/placeholder.svg" },
    { id: 6, name: "Valorant", slug: "valorant", image: "/placeholder.svg" },
    { id: 7, name: "Garena RoV", slug: "rov", image: "/placeholder.svg" },
    { id: 8, name: "Honkai Star Rail", slug: "honkai", image: "/placeholder.svg" },
    { id: 9, name: "League of Legends", slug: "lol", image: "/placeholder.svg" },
    { id: 10, name: "Minecraft", slug: "minecraft", image: "/placeholder.svg" },
    { id: 11, name: "Apex Legends", slug: "apex-legends", image: "/placeholder.svg" },
    { id: 12, name: "Call of Duty Mobile", slug: "cod-mobile", image: "/placeholder.svg" },
    
];

interface GameCardProps {
    name: string;
    image: string;
    slug: string;
}

export function GameCard({ name, image, slug }: GameCardProps) {
    return (
        <Link href={`/game/${slug}`} className="group">
            <div className="glass-card rounded-xl overflow-hidden hover:glow-primary transition-all duration-300 hover:-translate-y-2">
                {/* Game Image */}
                <div className="relative h-40 overflow-hidden">
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full border border-primary/30">
                            ยอดนิยม
                        </span>
                    </div>
                </div>

                {/* Game Info */}
                <div className="p-4">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {name}
                    </h3>

                    {/* Price hint */}
                    <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                            เริ่มต้น{" "}
                            <span className="text-primary font-semibold">
                                ฿35
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// GamesSection moved from page.tsx
interface GamesSectionProps {
    games: { id: number; name: string; slug: string; image: string }[];
}

export function GamesSection({ games }: GamesSectionProps) {
    // Show more state for each section
    const [showMore, setShowMore] = useState({
        trending: 8,
        action: 8,
        rpg: 8,
        moba: 8,
        sports: 8,
        social: 8,
        other: 8,
    });

    // Helper to show more items for a section
    const handleShowMore = (section: keyof typeof showMore) => {
        setShowMore((prev) => ({ ...prev, [section]: prev[section] + 8 }));
    };

    return (
        <section className="py-12">
            <div className="container mx-auto px-4 space-y-12">
                {/* Trending games */}
                <div>
                    <div className="flex items-center mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-foreground">Trending games <span className="text-xs">(เกมยอดนิยม)</span></h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {games.slice(0, showMore.trending).map((game) => (
                            <GameCard
                                key={game.id}
                                name={game.name}
                                image={game.image}
                                slug={game.slug}
                            />
                        ))}
                    </div>
                    {showMore.trending < games.length && (
                        <div className="flex justify-center mt-4">
                            <button
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                                onClick={() => handleShowMore('trending')}
                            >
                                Show more
                                <span className="w-4 h-4 inline-block"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></span>
                            </button>
                        </div>
                    )}
                </div>
                {/* Action / Shooter */}
                <div>
                    <div className="flex items-center mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-foreground">Action / Shooter <span className="text-xs">(ยิงปืน/ต่อสู้)</span></h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {games.slice(0, showMore.action).map((game) => (
                            <GameCard
                                key={game.id}
                                name={game.name}
                                image={game.image}
                                slug={game.slug}
                            />
                        ))}
                    </div>
                    {showMore.action < games.length && (
                        <div className="flex justify-center mt-4">
                            <button
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                                onClick={() => handleShowMore('action')}
                            >
                                Show more
                                <span className="w-4 h-4 inline-block"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></span>
                            </button>
                        </div>
                    )}
                </div>

                {/* RPG / Open World / MMO */}
                <div>
                    <div className="flex items-center mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-foreground">RPG / Open World / MMO <span className="text-xs">(ผจญภัย/เก็บเลเวล)</span></h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {games.slice(0, showMore.rpg).map((game) => (
                            <GameCard
                                key={game.id}
                                name={game.name}
                                image={game.image}
                                slug={game.slug}
                            />
                        ))}
                    </div>
                    {showMore.rpg < games.length && (
                        <div className="flex justify-center mt-4">
                            <button
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                                onClick={() => handleShowMore('rpg')}
                            >
                                Show more
                                <span className="w-4 h-4 inline-block"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></span>
                            </button>
                        </div>
                    )}
                </div>

                {/* MOBA / Strategy */}
                <div>
                    <div className="flex items-center mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-foreground">MOBA / Strategy <span className="text-xs">(วางแผน/ทำลายฐาน)</span></h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {games.slice(0, showMore.moba).map((game) => (
                            <GameCard
                                key={game.id}
                                name={game.name}
                                image={game.image}
                                slug={game.slug}
                            />
                        ))}
                    </div>
                    {showMore.moba < games.length && (
                        <div className="flex justify-center mt-4">
                            <button
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                                onClick={() => handleShowMore('moba')}
                            >
                                Show more
                                <span className="w-4 h-4 inline-block"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Sports / Racing */}
                <div>
                    <div className="flex items-center mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-foreground">Sports / Racing <span className="text-xs">(กีฬา/แข่งรถ)</span></h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {games.slice(0, showMore.sports).map((game) => (
                            <GameCard
                                key={game.id}
                                name={game.name}
                                image={game.image}
                                slug={game.slug}
                            />
                        ))}
                    </div>
                    {showMore.sports < games.length && (
                        <div className="flex justify-center mt-4">
                            <button
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                                onClick={() => handleShowMore('sports')}
                            >
                                Show more
                                <span className="w-4 h-4 inline-block"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Social / Casual / Simulation */}
                <div>
                    <div className="flex items-center mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-foreground">Social / Casual / Simulation <span className="text-xs">(จำลองชีวิต/จีบหนุ่ม/น่ารัก)</span></h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {games.slice(0, showMore.social).map((game) => (
                            <GameCard
                                key={game.id}
                                name={game.name}
                                image={game.image}
                                slug={game.slug}
                            />
                        ))}
                    </div>
                    {showMore.social < games.length && (
                        <div className="flex justify-center mt-4">
                            <button
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                                onClick={() => handleShowMore('social')}
                            >
                                Show more
                                <span className="w-4 h-4 inline-block"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Other genres and platforms */}
                <div>
                    <div className="flex items-center mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-foreground">แนวอื่นๆ และแพลตฟอร์ม</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {games.slice(0, showMore.other).map((game) => (
                            <GameCard
                                key={game.id}
                                name={game.name}
                                image={game.image}
                                slug={game.slug}
                            />
                        ))}
                    </div>
                    {showMore.other < games.length && (
                        <div className="flex justify-center mt-4">
                            <button
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                                onClick={() => handleShowMore('other')}
                            >
                                Show more
                                <span className="w-4 h-4 inline-block"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
