"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { GameCard } from "@/components/game-card";
import { useLanguage } from "@/components/language-context";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const urlQuery = searchParams?.get("q") || "";
    const [query, setQuery] = useState(urlQuery);
    const [allGames, setAllGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    // Filter games based on search query
    const filteredGames = allGames.filter(game =>
        game.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-2 mb-6">
                    <Link href="/">
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <h1 className="text-xl font-bold text-foreground">{t.search || "ค้นหาเกม"}</h1>
                </div>
                <div className="mb-8">
                    <Input
                        type="search"
                        placeholder={t.search || "ค้นหาเกม..."}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full max-w-md mx-auto"
                    />
                </div>

                {loading && (
                    <div className="col-span-full text-center text-muted-foreground py-8">
                        Loading games...
                    </div>
                )}

                {error && !loading && (
                    <div className="col-span-full text-center text-destructive py-8">
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
                            <div className="col-span-full text-center text-muted-foreground">
                                {t.noGamesFound || "ไม่พบเกมที่ค้นหา"}
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

