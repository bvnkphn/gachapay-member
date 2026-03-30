"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { GameCard } from "@/components/game-card";
import { useLanguage } from "@/components/language-context";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


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

export default function SearchPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const urlQuery = searchParams?.get("q") || "";
  const [query, setQuery] = useState(urlQuery);
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);
  const filteredGames = games.filter(game =>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredGames.length > 0 ? (
            filteredGames.map(game => (
              <GameCard
                key={game.id}
                name={game.name}
                image={game.image}
                slug={game.slug}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground">
              {t.noGamesFound || "ไม่พบเกมที่ค้นหา"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
