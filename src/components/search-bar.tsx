"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/language-context";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
    const { t } = useLanguage();
    const router = useRouter();
    const [value, setValue] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && value.trim()) {
            router.push(`/search?q=${encodeURIComponent(value.trim())}`);
        }
    };

    return (
        <div className="relative flex items-center gap-2">
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder={t.search}
                    className="pl-10"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            {/* Language Toggle */}
        </div>
    );
}
