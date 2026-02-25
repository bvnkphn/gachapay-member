"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";

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
