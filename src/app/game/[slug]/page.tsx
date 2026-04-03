"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/components/language-context";
import { api } from "@/lib/api";
import { ArrowLeft, Zap, Shield, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GamePackage {
    id: number;
    gameId: number;
    name: string;
    description?: string;
    price: number;
    discount?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Game {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    categoryId?: number;
    label: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    packages?: GamePackage[];
}

export default function GameDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { t, lang } = useLanguage();
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<GamePackage | null>(null);

    useEffect(() => {
        const fetchGame = async () => {
            try {
                setLoading(true);
                const data = await api.getGame(params.slug as string);
                setGame(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load game");
                console.error("Error fetching game:", err);
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) {
            fetchGame();
        }
    }, [params.slug]);

    const handlePayment = (pkg: GamePackage) => {
        // Navigate to topup page with game and package data
        const queryParams = new URLSearchParams({
            gameId: game?.id.toString() || "",
            gameName: game?.name || "",
            packageId: pkg.id.toString(),
            packageName: pkg.name,
            packagePrice: pkg.price.toString(),
        });
        router.push(`/topup?${queryParams.toString()}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !game) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || "Game not found"}</p>
                    <Button asChild>
                        <Link href="/">{t.backToHome || "Back to Home"}</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="hover:bg-primary/10"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-lg font-semibold truncate flex-1 text-center">{game.name}</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 pt-24">
                {/* Game Header */}
                <div className="mb-8">
                    <div className="relative h-64 mb-6 rounded-xl overflow-hidden bg-muted">
                        {game.image ? (
                            <Image
                                src={game.image}
                                alt={game.name}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                No Image Available
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                        {/* Label Badge */}
                        {game.label !== "NONE" && (
                            <div className="absolute top-4 right-4">
                                <Badge
                                    className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                                    variant="default"
                                >
                                    {game.label}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Game Info */}
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{game.name}</h1>
                        <p className="text-muted-foreground mb-4">{game.description}</p>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-primary/10 rounded-lg p-3 text-center">
                                <Zap className="w-5 h-5 mx-auto text-primary mb-1" />
                                <p className="text-xs text-muted-foreground">Quick</p>
                            </div>
                            <div className="bg-primary/10 rounded-lg p-3 text-center">
                                <Shield className="w-5 h-5 mx-auto text-primary mb-1" />
                                <p className="text-xs text-muted-foreground">Safe</p>
                            </div>
                            <div className="bg-primary/10 rounded-lg p-3 text-center">
                                <Clock className="w-5 h-5 mx-auto text-primary mb-1" />
                                <p className="text-xs text-muted-foreground">24/7</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Packages Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">เลือกแพคเกจ</h2>

                    {game.packages && game.packages.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {game.packages.map((pkg) => (
                                <Card
                                    key={pkg.id}
                                    className="glass-card p-4 cursor-pointer transition-all duration-300 hover:glow-primary border-2"
                                    style={{
                                        borderColor:
                                            selectedPackage?.id === pkg.id
                                                ? "hsl(var(--primary))"
                                                : "transparent",
                                    }}
                                    onClick={() => setSelectedPackage(pkg)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-lg">{pkg.name}</h3>
                                            <p className="text-sm text-muted-foreground">{pkg.description}</p>
                                        </div>
                                        {pkg.discount && pkg.discount > 0 && (
                                            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                                                -{pkg.discount}%
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-2xl font-bold text-primary">
                                            ฿{pkg.price.toFixed(2)}
                                        </span>
                                        {pkg.discount && pkg.discount > 0 && (
                                            <span className="text-sm line-through text-muted-foreground">
                                                ฿{(pkg.price / (1 - pkg.discount / 100)).toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    <Button
                                        className="w-full bg-gradient-cyber hover:opacity-90"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePayment(pkg);
                                        }}
                                    >
                                        เติมเลย
                                        <Zap className="w-4 h-4 ml-2" />
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">ไม่มีแพคเกจสำหรับเกมนี้</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
