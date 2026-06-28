"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { GameCard } from "@/components/game-card";
import { useLanguage } from "@/components/language-context";
import { ChevronLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Game {
    id: string;
    name: string;
    slug: string;
    image: string;
    category: string;
    label: 'NONE' | 'HOT' | 'NEW' | 'SALE';
    description?: string;
    items?: any[];
    inputs?: any[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function SearchContent() {
    const router = useRouter();
    const { lang, t } = useLanguage();
    const searchParams = useSearchParams();
    const urlQuery = searchParams?.get("q") || "";
    const [query, setQuery] = useState(urlQuery);
    const [allGames, setAllGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Fetch games from API
    useEffect(() => {
        const fetchGames = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE_URL}/games/list`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch games: ${response.statusText}`);
                }

                const data = await response.json();
                setAllGames(data.data || []);
            } catch (err) {
                console.error('Error fetching games:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch games');
                setAllGames([]);
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    // Update query from URL
    useEffect(() => {
        setQuery(urlQuery);
    }, [urlQuery]);

    // Filter and sort games based on search query alphabetically by checking if game name starts with query
    const filteredGames = allGames
        .filter(game => {
            const queryClean = query.trim().toLowerCase();
            if (!queryClean) return true;
            return game.name.toLowerCase().startsWith(queryClean);
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'th'));

    return (
        <div className="min-h-screen pt-20 pb-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="container mx-auto px-6 max-w-5xl">
                {/* Header with Back Button and Title */}
                <div className="flex items-center gap-3 mb-8">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push("/")}
                        className="w-9 h-9 rounded-xl border border-border/50 hover:bg-muted flex items-center justify-center cursor-pointer transition-colors shrink-0"
                    >
                        <ChevronLeft className="w-5 h-5 text-foreground" />
                    </Button>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">{t.search || "ค้นหาเกม"}</h1>
                </div>

                {/* Styled Search Box */}
                <div className="relative max-w-md mx-auto mb-10 z-30">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground pointer-events-none" />
                    <Input
                        type="search"
                        placeholder={t.searchPlaceholder || "ค้นหาชื่อเกมที่คุณต้องการ..."}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="w-full h-12 pl-11 pr-4 rounded-2xl bg-muted/20 border border-border/60 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm"
                    />

                    {/* Suggestions Dropdown */}
                    {showSuggestions && query.trim().length > 0 && filteredGames.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden z-40 animate-in fade-in duration-200">
                            <div className="py-1">
                                {filteredGames.slice(0, 5).map((game) => (
                                    <button
                                        key={game.slug}
                                        type="button"
                                        onClick={() => {
                                            setQuery(game.name);
                                            setShowSuggestions(false);
                                            router.push(`/game/${game.slug}`);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted/50 text-foreground font-medium flex items-center gap-3 transition-colors cursor-pointer"
                                    >
                                        <img src={game.image} alt={game.name} className="w-8 h-8 rounded-lg object-cover" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">{game.name}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase">{game.category}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="col-span-full text-center text-muted-foreground py-16">
                        Loading games...
                    </div>
                )}

                {error && !loading && (
                    <div className="col-span-full text-center text-destructive py-16">
                        Error loading games: {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {filteredGames.length > 0 ? (
                            filteredGames.map(game => (
                                <GameCard
                                    key={game.slug}
                                    name={game.name}
                                    image={game.image}
                                    slug={game.slug}
                                    category={game.category}
                                    label={game.label}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16 glass-card rounded-3xl border border-border/50">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-muted/50 text-muted-foreground mb-4">
                                    <Search className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-semibold text-foreground mb-1">
                                    {lang === "th" ? "ไม่พบเกมที่คุณค้นหา" : "No games found"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {lang === "th" 
                                        ? "ลองตรวจสอบตัวสะกดหรือค้นหาคำสำคัญอื่นๆ แทน" 
                                        : "Try checking the spelling or searching for another keyword"}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">กำลังโหลด...</p>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}

