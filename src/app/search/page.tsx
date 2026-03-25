"use client";

import { useSearchParams } from "next/navigation";
import { GameCard, games } from "@/components/game-card";
import { useMemo } from "react";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const q = searchParams.get("q") || "";
    const filteredGames = useMemo(() => {
        if (!q.trim()) return [];
        return games.filter(g => g.name.toLowerCase().includes(q.toLowerCase()));
    }, [q]);

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">ผลการค้นหา: {q}</h1>
            {filteredGames.length === 0 ? (
                <p className="text-muted-foreground">ไม่พบเกมที่ตรงกับ "{q}"</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredGames.map(game => (
                        <GameCard key={game.id} {...game} />
                    ))}
                </div>
            )}
        </div>
    );
}
