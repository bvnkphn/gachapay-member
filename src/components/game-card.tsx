"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useLanguage } from "./language-context";

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

interface GameCardProps {
    name: string;
    image: string;
    slug: string;
    category?: string;
    label?: 'NONE' | 'HOT' | 'NEW' | 'SALE';
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Label color mapping
const labelColors: Record<string, { bg: string; text: string }> = {
    HOT: { bg: 'bg-red-500/20', text: 'text-red-500' },
    NEW: { bg: 'bg-blue-500/20', text: 'text-blue-500' },
    SALE: { bg: 'bg-green-500/20', text: 'text-green-500' },
    NONE: { bg: 'bg-primary/20', text: 'text-primary' },
};

const labelTranslations: Record<string, Record<string, string>> = {
    en: { HOT: 'Hot', NEW: 'New', SALE: 'Sale' },
    th: { HOT: 'ยอดนิยม', NEW: 'ใหม่', SALE: 'ลดราคา' },
};

export function GameCard({ name, image, slug, category, label = 'NONE' }: GameCardProps) {
    const { t, lang } = useLanguage();
    const labelColor = labelColors[label] || labelColors.NONE;
    const labelText = labelTranslations[lang || 'en'][label] || label;

    return (
        <Link href={`/game/${slug}`} className="group">
            <div className="glass-card rounded-xl overflow-hidden hover:glow-primary transition-all duration-300 hover:-translate-y-2">
                {/* Game Image */}
                <div className="relative h-40 overflow-hidden bg-muted">
                    {image ? (
                        <Image
                            src={image}
                            alt={name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No Image
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                    {/* Label Badge */}
                    {label !== 'NONE' && (
                        <div className="absolute top-3 right-3">
                            <span className={`px-2 py-1 text-xs font-bold ${labelColor.bg} ${labelColor.text} rounded-full border border-current/30`}>
                                {labelText}
                            </span>
                        </div>
                    )}

                    {/* Category Badge */}
                    {category && (
                        <div className="absolute top-2 left-2">
                            <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-primary/80 uppercase tracking-wide">
                                {category}
                            </span>
                        </div>
                    )}
                </div>

                {/* Game Info */}
                <div className="p-4">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {name}
                    </h3>

                    {/* Price hint */}
                    <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                            {t.startFrom}{" "}
                            <span className="text-primary font-semibold">
                                ฿27.50
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// GamesSection - Fetches from API
interface GamesSectionProps {
    initialGames?: Game[];
}

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

export function GamesSection({ initialGames }: GamesSectionProps) {
    const [allGames, setAllGames] = useState<Game[]>(initialGames || []);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(!initialGames);
    const [error, setError] = useState<string | null>(null);
    const [showMore, setShowMore] = useState<Record<string, number>>({});

    const { t } = useLanguage();

    // Fetch games and categories from API
    useEffect(() => {
        if (initialGames) {
            // Initialize showMore state with all categories
            const initialShowMore: Record<string, number> = {};
            initialShowMore['trending'] = 8;
            setShowMore(initialShowMore);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch games
                const gamesResponse = await fetch(`${API_BASE_URL}/games/list`);
                if (!gamesResponse.ok) {
                    throw new Error(`Failed to fetch games: ${gamesResponse.statusText}`);
                }
                const gamesData = await gamesResponse.json();
                setAllGames(gamesData.data || []);

                // Fetch categories
                const categoriesResponse = await fetch(`${API_BASE_URL}/games/categories`);
                if (!categoriesResponse.ok) {
                    throw new Error(`Failed to fetch categories: ${categoriesResponse.statusText}`);
                }
                const categoriesData = await categoriesResponse.json();
                const categoryList = categoriesData.data || [];
                setCategories(categoryList);

                // Initialize showMore state for trending and each category
                const initialShowMore: Record<string, number> = { trending: 8 };
                categoryList.forEach((cat: Category) => {
                    initialShowMore[cat.slug] = 8;
                });
                setShowMore(initialShowMore);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
                setAllGames([]);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [initialGames]);

    // Helper to show more items for a section
    const handleShowMore = (section: string) => {
        setShowMore((prev) => ({ ...prev, [section]: (prev[section] || 8) + 12 }));
    };

    // Filter games by category
    const gamesByCategory = (categoryFilter: string) => {
        if (categoryFilter === 'trending') {
            return allGames.sort((a, b) => {
                const labelOrder = { HOT: 0, NEW: 1, SALE: 2, NONE: 3 };
                return labelOrder[a.label] - labelOrder[b.label];
            });
        }
        return allGames.filter((game) =>
            categoryFilter === 'all' ||
            game.category.toLowerCase().includes(categoryFilter.toLowerCase())
        );
    };

    // Get category display name with Thai translation
    const getCategoryDisplay = (category: Category): { en: string; th: string } => {
        const displayNames: Record<string, { en: string; th: string }> = {
            'action-shooter': { en: 'Action / Shooter', th: 'ยิงปืน/ต่อสู้' },
            'rpg-open-world-mmo': { en: 'RPG / Open World / MMO', th: 'ผจญภัย/เก็บเลเวล' },
            'moba-strategy': { en: 'MOBA / Strategy', th: 'วางแผน/ทำลายฐาน' },
            'sports-racing': { en: 'Sports / Racing', th: 'กีฬา/แข่งรถ' },
            'social-casual-simulation': { en: 'Social / Casual / Simulation', th: 'จำลองชีวิต/จีบหนุ่ม/น่ารัก' },
            'other': { en: 'Other', th: 'แนวอื่นๆ' },
        };
        return displayNames[category.slug] || { en: category.name, th: category.description || category.name };
    };

    if (error && allGames.length === 0) {
        return (
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center text-destructive">
                        <p>Error loading games: {error}</p>
                    </div>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center text-muted-foreground">
                        <p>Loading games...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12">
            <div className="container mx-auto px-4 space-y-12">
                {/* Trending games */}
                {gamesByCategory('trending').length > 0 && (
                    <div>
                        <div className="flex items-center mb-4">
                            <h2 className="text-xl md:text-2xl font-bold text-foreground">
                                Trending games <span className="text-xs">(เกมยอดนิยม)</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {gamesByCategory('trending')
                                .slice(0, showMore['trending'] || 8)
                                .map((game) => (
                                    <GameCard
                                        key={game.slug}
                                        name={game.name}
                                        image={game.image}
                                        slug={game.slug}
                                        category={game.category}
                                        label={game.label}
                                    />
                                ))}
                        </div>
                        {(showMore['trending'] || 8) < gamesByCategory('trending').length && (
                            <div className="flex justify-center mt-4">
                                <button
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                    onClick={() => handleShowMore('trending')}
                                >
                                    {t.showMore || 'Show More'}
                                    <span className="w-4 h-4 inline-block">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Dynamic category sections */}
                {categories.map((category) => {
                    const categoryGames = gamesByCategory(category.name).slice(
                        0,
                        showMore[category.slug] || 8
                    );
                    const display = getCategoryDisplay(category);

                    if (categoryGames.length === 0) return null;

                    return (
                        <div key={category.slug}>
                            <div className="flex items-center mb-4">
                                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                                    {display.en} <span className="text-xs">({display.th})</span>
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {categoryGames.map((game) => (
                                    <GameCard
                                        key={game.slug}
                                        name={game.name}
                                        image={game.image}
                                        slug={game.slug}
                                        category={game.category}
                                        label={game.label}
                                    />
                                ))}
                            </div>
                            {(showMore[category.slug] || 8) <
                                gamesByCategory(category.name).length && (
                                <div className="flex justify-center mt-4">
                                    <button
                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                        onClick={() => handleShowMore(category.slug)}
                                    >
                                        {t.showMore || 'Show More'}
                                        <span className="w-4 h-4 inline-block">
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                <polyline points="12 5 19 12 12 19" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
              