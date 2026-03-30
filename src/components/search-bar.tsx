"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/language-context";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
    const { t } = useLanguage();
    const router = useRouter();
    const [query, setQuery] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    };

    return (
        <form className="relative flex items-center gap-2" onSubmit={handleSubmit} role="search">
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder={t.search}
                    className="pl-10"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    aria-label={t.search}
                />
            </div>
        </form>
    );
}
